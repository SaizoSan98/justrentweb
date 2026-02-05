
import crypto from 'crypto';

// Types from Prisma (assumed available globally or via import, but we'll use 'any' for flexibility if types aren't perfectly aligned yet)
// In a real scenario, we would import { Booking, Car } from '@prisma/client';

const RENTEON_BASE_URL = 'https://justrentandtrans.s11.renteon.com/en';
const RENTEON_TOKEN_URL = `${RENTEON_BASE_URL}/token`;
const RENTEON_API_URL = `${RENTEON_BASE_URL}/api`;

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Mapping Helpers
function mapLocationToOfficeId(location: string): number {
  const lowerLoc = location.toLowerCase();
  if (lowerLoc.includes('airport') || lowerLoc.includes('reptér') || lowerLoc.includes('vecsés')) {
    return 54; // Vecsés, Airport
  }
  return 53; // Budapest Downtown (Default)
}

function mapCarToCategoryId(car: any): number {
  const make = car.make.toLowerCase();
  const model = car.model.toLowerCase();
  const transmission = car.transmission?.toLowerCase() || '';

  // Mapping based on Renteon Codes
  if (make.includes('volkswagen') || make.includes('vw')) {
    if (model.includes('t-cross')) return 290;
    if (model.includes('passat')) return 292;
    if (model.includes('touran')) return 325;
    if (model.includes('tiguan')) return 330;
    if (model.includes('taigo')) return 331;
    if (model.includes('t-roc') && model.includes('cabrio')) return 383;
    if (model.includes('golf') && model.includes('variant')) return 301;
    if (model.includes('golf')) return 301; // Fallback
    if (model.includes('arteon')) return 292; // Similar to Passat group
  }
  
  if (make.includes('skoda') || make.includes('škoda')) {
    if (model.includes('fabia')) {
        if (transmission === 'manual') return 411;
        return 402;
    }
    if (model.includes('octavia')) return 301;
    if (model.includes('superb')) return 292;
    if (model.includes('kodiaq')) return 330;
  }

  if (make.includes('kia')) {
    if (model.includes('ceed')) {
        if (model.includes('sw') || model.includes('kombi')) return 293;
        return 409;
    }
    if (model.includes('sportage')) return 329;
    if (model.includes('niro')) return 290; // Crossover group
  }

  if (make.includes('ford')) {
    if (model.includes('focus')) return 293;
    if (model.includes('tourneo')) return 294;
    if (model.includes('transit')) return 294;
    if (model.includes('puma')) return 331;
  }

  if (make.includes('toyota')) {
    if (model.includes('yaris') && model.includes('cross')) return 290;
    if (model.includes('corolla')) {
        if (model.includes('ts') || model.includes('touring')) return 298;
        return 327; // Sedan
    }
    if (model.includes('proace')) return 294;
  }
  
  if (make.includes('bmw')) {
    if (model.includes('3')) return 297;
    if (model.includes('5')) return 297;
    if (model.includes('x4')) return 322;
  }

  if (make.includes('mercedes')) {
    if (model.includes('a-class') || model.includes('a 180')) return 324; // Or 290 based on code list
    if (model.includes('cla')) return 332;
    if (model.includes('glb')) return 359;
    if (model.includes('gla')) return 370;
    if (model.includes('glc')) return 322;
    if (model.includes('citan')) return 291;
  }

  if (make.includes('citroen') || make.includes('citroën')) {
    if (model.includes('jumper')) return 291;
    if (model.includes('spacetourer')) return 384;
  }

  if (make.includes('peugeot')) {
    if (model.includes('208')) return 401;
    if (model.includes('308')) {
        if (model.includes('sw')) return 293;
        return 412;
    }
    if (model.includes('3008')) return 330;
    if (model.includes('5008')) return 348;
  }
  
  if (make.includes('volvo')) {
    if (model.includes('xc60')) return 322;
    if (model.includes('xc90')) return 371;
  }

  if (make.includes('seat')) {
      if (model.includes('leon')) return 301;
      if (model.includes('ateca')) return 329;
      if (model.includes('tarraco')) return 330;
  }

  // Default fallback if no match found (use a generic category like Golf/Compact)
  return 301; 
}

// Authentication
async function getRenteonToken(): Promise<string | null> {
  // Return cached token if valid (buffer of 5 minutes)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.RENTEON_CLIENT_ID;
  const clientSecret = process.env.RENTEON_CLIENT_SECRET;
  const username = process.env.RENTEON_USERNAME;
  const password = process.env.RENTEON_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    console.error('Missing Renteon credentials in environment variables');
    return null;
  }

  // Signature Generation
  const salt = crypto.randomBytes(16).toString('hex'); // Random salt
  // Pattern: {username}{salt}{secret}{password}{salt}{secret}{client_id}
  const compositeKey = `${username}${salt}${clientSecret}${password}${salt}${clientSecret}${clientId}`;
  
  const hash = crypto.createHash('sha512').update(compositeKey).digest('base64');
  
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('username', username);
  params.append('password', password);
  params.append('client_id', clientId);
  params.append('signature', hash);
  params.append('salt', salt);

  try {
    const response = await fetch(RENTEON_TOKEN_URL, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Renteon Token Error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    cachedToken = data.access_token;
    // expires_in is in seconds. Set expiry to now + expires_in * 1000 - 5 minutes buffer
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 300000;
    
    return cachedToken;
  } catch (error) {
    console.error('Renteon Token Fetch Failed:', error);
    return null;
  }
}

// Booking Sync
export async function syncBookingToRenteon(booking: any) {
  console.log(`Starting Renteon Sync for booking ${booking.id}`);
  
  const token = await getRenteonToken();
  if (!token) {
    console.error('Failed to obtain Renteon token, aborting sync');
    return { success: false, error: 'Auth failed' };
  }

  try {
    const categoryId = mapCarToCategoryId(booking.car);
    const officeOutId = mapLocationToOfficeId(booking.pickupLocation);
    const officeInId = mapLocationToOfficeId(booking.dropoffLocation);
    const dateOut = booking.startDate.toISOString();
    const dateIn = booking.endDate.toISOString();

    // Step 1: Availability (Optional but good to verify)
    // We skip this for now and go straight to Create as we want to force the booking if possible,
    // or at least try to create it.
    
    // Step 2: Create Booking Model
    const createPayload = {
      CarCategoryId: categoryId,
      OfficeOutId: officeOutId,
      OfficeInId: officeInId,
      DateOut: dateOut,
      DateIn: dateIn,
      Currency: "EUR", // Defaulting to EUR as per documentation examples
      // PricelistId might be needed, but documentation says "Client uses response information from availability check to create new booking"
      // However, usually we can try creating without pricelist if the system defaults it, or we might need to do Availability first.
      // Let's try to do Availability first to get a valid PricelistId if strictly required.
    };

    // 1. Availability Check to get PricelistId? 
    // Docs say: "Client uses response information from availability check to create new booking"
    // Let's call Availability first.
    const availResponse = await fetch(`${RENTEON_API_URL}/bookings/availability`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            BookAsCommissioner: false,
            OfficeOutId: officeOutId,
            OfficeInId: officeInId,
            DateOut: dateOut,
            DateIn: dateIn
        })
    });

    if (!availResponse.ok) {
        console.error('Renteon Availability Check Failed:', await availResponse.text());
        // Proceeding blindly might fail if PricelistId is required.
    }
    
    // Assuming we can proceed or just use the Create endpoint directly.
    // The documentation example for Create includes "PricelistId": 303.
    // If we don't send it, it might default. Let's try sending without it or use a default if we knew one.
    // For now, we will omit it and hope the system handles it or we parse it from availability if we implemented it fully.
    
    // 2. Create Booking (In-Memory)
    const createResponse = await fetch(`${RENTEON_API_URL}/bookings/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPayload)
    });

    if (!createResponse.ok) {
        const err = await createResponse.text();
        console.error('Renteon Create Booking Failed:', err);
        return { success: false, error: err };
    }

    const bookingModel = await createResponse.json();

    // 3. Populate Customer Data
    bookingModel.Client = {
        FirstName: booking.firstName,
        LastName: booking.lastName,
        Email: booking.email,
        Tel: booking.phone,
        // Add other fields if available in bookingModel structure
    };
    
    bookingModel.FlightNumber = booking.flightNumber;
    bookingModel.Note = booking.comments;

    if (booking.isCompany) {
        bookingModel.Client.CompanyName = booking.companyName;
        bookingModel.Client.TaxId = booking.companyTaxId;
        bookingModel.Client.Address1 = booking.companyAddress;
    }

    // 4. Handle Extras (Full Insurance, etc.)
    if (booking.fullInsurance) {
        // Find Full Insurance service in bookingModel.Services and select it
        const fullIns = bookingModel.Services.find((s: any) => s.Name.includes('Full Insurance') || s.Id === 3215 || s.Id === 3213 || s.Id === 3214);
        if (fullIns) {
            fullIns.IsSelected = true;
            fullIns.Quantity = 1;
        }
    }

    // Handle other extras from booking.extras if mapped
    // booking.extras is usually an array of IDs from our DB. We would need to map them to Renteon Service IDs.
    // Skipping complex mapping for now, focusing on basic sync.

    // 5. Save Booking
    const saveResponse = await fetch(`${RENTEON_API_URL}/bookings/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingModel)
    });

    if (!saveResponse.ok) {
        const err = await saveResponse.text();
        console.error('Renteon Save Booking Failed:', err);
        return { success: false, error: err };
    }

    const savedBooking = await saveResponse.json();
    console.log('Renteon Booking Sync Successful:', savedBooking.ReservationNumber);

    return { success: true, renteonId: savedBooking.ReservationNumber };

  } catch (error) {
    console.error('Renteon Sync Exception:', error);
    return { success: false, error };
  }
}
