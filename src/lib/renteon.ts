
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

// Search Booking
async function findBookingInRenteon(booking: any): Promise<string | null> {
  const token = await getRenteonToken();
  if (!token) return null;

  try {
    // We try to search by dates.
    // Assuming the search endpoint filters by DateOut range.
    // We'll broaden the search a bit to ensure we catch it (e.g. +/- 1 day or exact)
    // Actually, let's try exact date match as Renteon likely expects that or a range.
    
    // Search Endpoint: POST /api/bookings/search
    // Payload guess based on common Renteon patterns (DateFrom/DateTo)
    const payload = {
      DateFrom: booking.startDate.toISOString(), // Start of the booking
      DateTo: booking.endDate.toISOString()      // End of the booking
    };

    const response = await fetch(`${RENTEON_API_URL}/bookings/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Renteon Search Failed:', await response.text());
      return null;
    }

    const results = await response.json();
    
    if (Array.isArray(results)) {
      // Client-side filtering to find the exact booking
      // Match by Client Name AND Email
      const match = results.find((b: any) => {
        const clientMatch = 
             (b.Client?.Email?.toLowerCase() === booking.email.toLowerCase()) ||
             (b.Client?.FirstName?.toLowerCase() === booking.firstName.toLowerCase() && b.Client?.LastName?.toLowerCase() === booking.lastName.toLowerCase());
        
        // Also check if dates match roughly (string comparison of ISO date part)
        // b.DateOut might be "2026-03-05T12:00:00"
        const dateMatch = b.DateOut.startsWith(booking.startDate.toISOString().split('T')[0]);

        return clientMatch && dateMatch;
      });

      return match ? match.ReservationNumber : null;
    }
    
    return null;
  } catch (error) {
    console.error('Renteon Search Exception:', error);
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

    // Step 2: Create Booking Model
    const createPayload = {
      CarCategoryId: categoryId,
      OfficeOutId: officeOutId,
      OfficeInId: officeInId,
      DateOut: dateOut,
      DateIn: dateIn,
      Currency: "EUR", 
    };

    // 1. Availability Check (Optional but recommended to get PricelistId if needed)
    // We'll skip explicitly using the result for now unless errors occur.
    
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
    };
    
    bookingModel.FlightNumber = booking.flightNumber;
    bookingModel.Note = booking.comments;

    if (booking.isCompany) {
        bookingModel.Client.CompanyName = booking.companyName;
        bookingModel.Client.TaxId = booking.companyTaxId;
        bookingModel.Client.Address1 = booking.companyAddress;
    }

    // 4. Handle Extras
    if (booking.fullInsurance) {
        const fullIns = bookingModel.Services.find((s: any) => s.Name.includes('Full Insurance') || s.Id === 3215 || s.Id === 3213 || s.Id === 3214);
        if (fullIns) {
            fullIns.IsSelected = true;
            fullIns.Quantity = 1;
        }
    }

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

// Cancel Booking
export async function cancelBookingInRenteon(booking: any) {
  console.log(`Attempting to cancel Renteon booking for ${booking.id}`);
  
  const token = await getRenteonToken();
  if (!token) return { success: false, error: 'Auth failed' };

  try {
    // 1. Find Reservation Number
    // If we had renteonId in DB, we'd use it. Since we might not, we search.
    const reservationNumber = booking.renteonId || await findBookingInRenteon(booking);
    
    if (!reservationNumber) {
        console.warn('Could not find corresponding Renteon booking to cancel');
        return { success: false, error: 'Booking not found in Renteon' };
    }

    // 2. Cancel
    // DELETE {culture}/api/bookings/cancel/{number}
    const response = await fetch(`${RENTEON_API_URL}/bookings/cancel/${reservationNumber}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('Renteon Cancel Failed:', err);
        return { success: false, error: err };
    }

    console.log(`Renteon booking ${reservationNumber} cancelled successfully`);
    return { success: true };

  } catch (error) {
    console.error('Renteon Cancel Exception:', error);
    return { success: false, error };
  }
}

// Update Booking
// Note: Renteon updates typically involve "Open" -> Modify -> "Save"
export async function updateBookingInRenteon(booking: any) {
  console.log(`Attempting to update Renteon booking for ${booking.id}`);
  
  const token = await getRenteonToken();
  if (!token) return { success: false, error: 'Auth failed' };

  try {
    const reservationNumber = booking.renteonId || await findBookingInRenteon(booking);
    
    if (!reservationNumber) {
        // If not found, maybe create it? For now, we error.
        console.warn('Could not find Renteon booking to update');
        return { success: false, error: 'Booking not found' };
    }

    // 1. Open Booking
    const openResponse = await fetch(`${RENTEON_API_URL}/bookings/open/${reservationNumber}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!openResponse.ok) return { success: false, error: 'Failed to open booking' };
    const bookingModel = await openResponse.json();

    // 2. Apply Changes
    // Update basic fields that might have changed
    bookingModel.Client.FirstName = booking.firstName;
    bookingModel.Client.LastName = booking.lastName;
    bookingModel.Client.Email = booking.email;
    bookingModel.Client.Tel = booking.phone;
    bookingModel.Note = booking.comments;
    bookingModel.FlightNumber = booking.flightNumber;
    
    // Update Dates/Car if needed? 
    // Usually modifying dates requires "Calculate" again.
    // Let's assume for now we just update contact info or status details. 
    // Deep modification (dates/car) is complex via API as it changes pricing.
    // If dates changed:
    if (new Date(bookingModel.DateOut).toISOString() !== booking.startDate.toISOString() || 
        new Date(bookingModel.DateIn).toISOString() !== booking.endDate.toISOString()) {
            
        bookingModel.DateOut = booking.startDate.toISOString();
        bookingModel.DateIn = booking.endDate.toISOString();
        
        // We must calculate to update prices
        const calcResponse = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingModel)
        });
        
        if (calcResponse.ok) {
            // Update model with calculated values
            const calculatedModel = await calcResponse.json();
            Object.assign(bookingModel, calculatedModel);
        }
    }

    // 3. Save
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
        console.error('Renteon Update Failed:', err);
        return { success: false, error: err };
    }

    console.log(`Renteon booking ${reservationNumber} updated successfully`);
    return { success: true };

  } catch (error) {
    console.error('Renteon Update Exception:', error);
    return { success: false, error };
  }
}
