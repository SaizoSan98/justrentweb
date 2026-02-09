
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
  return 54; // Vecsés, Airport (Only office available)
}

export function mapCarToCategoryId(car: any): number {
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
export async function getRenteonToken(): Promise<string> {
  // Return cached token if valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const clientId = process.env.RENTEON_CLIENT_ID || '';
    const clientSecret = process.env.RENTEON_CLIENT_SECRET || '';
    const username = process.env.RENTEON_USERNAME || '';
    const password = process.env.RENTEON_PASSWORD || '';
    
    // Generate Salt (8-50 chars)
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Generate Signature
    // Pattern: {username}{salt}{secret}{password}{salt}{secret}{client_id}
    const compositeKey = `${username}${salt}${clientSecret}${password}${salt}${clientSecret}${clientId}`;
    const signature = crypto.createHash('sha512').update(compositeKey, 'utf8').digest('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);
    params.append('client_id', clientId);
    params.append('signature', signature);
    params.append('salt', salt);
    
    // Authorization Header is NOT needed according to documentation when using signature
    // But some implementations might still expect Basic Auth or Bearer if specified otherwise.
    // The doc says: "Params format: BODY: application/x-www-form-urlencoded"
    // And does NOT mention Authorization header for token request, only parameters in body.
    
    const response = await fetch(RENTEON_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Renteon Token Error:', response.status, errorText);
      throw new Error(`Failed to get token: ${response.status}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    // Set expiry (safety margin 60s)
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
    
    return cachedToken as string;
  } catch (error) {
    console.error('Renteon Auth Exception:', error);
    throw error;
  }
}

export async function fetchCarCategories(): Promise<any[]> {
  const token = await getRenteonToken();
  if (!token) return [];

  try {
    // API endpoint based on documentation: GET /api/carCategories
    const response = await fetch(`${RENTEON_API_URL}/carCategories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch car categories:', await response.text());
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Renteon Car Category Fetch Exception:', error);
    return [];
  }
}

export async function fetchRenteonServices(): Promise<any[]> {
  const token = await getRenteonToken();
  if (!token) return [];

  // Aggregated fetch from multiple potential endpoints
  const endpoints = ['/services', '/extras', '/additionalEquipment', '/equipment', '/insurances', '/insuranceTypes'];
  let allServices: any[] = [];
  const seenIds = new Set();

  try {
    for (const ep of endpoints) {
        try {
            const response = await fetch(`${RENTEON_API_URL}${ep}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    // console.log(`Fetched ${data.length} items from ${ep}`);
                    data.forEach((item: any) => {
                        const id = item.Id || item.id || item.Code; // Unique ID check
                        if (id && !seenIds.has(id)) {
                            seenIds.add(id);
                            allServices.push(item);
                        } else if (!id) {
                             // If no ID, push anyway (rare)
                            allServices.push(item);
                        }
                    });
                }
            }
        } catch (innerError) {
            console.warn(`Failed to fetch from ${ep}:`, innerError);
        }
    }

    // FALLBACK: Calculation Strategy if standard endpoints return nothing
    if (allServices.length === 0) {
        console.log("Standard endpoints returned 0 services. Attempting Calculation Strategy...");
        try {
            const dOut = new Date(); dOut.setDate(dOut.getDate() + 35);
            const dIn = new Date(); dIn.setDate(dIn.getDate() + 38);
            
            const availPayload = {
                DateOut: dOut.toISOString(),
                DateIn: dIn.toISOString(),
                OfficeOutId: 54, 
                OfficeInId: 54,
                BookAsCommissioner: true,
                PricelistId: 306,
                Currency: "EUR"
            };
            
            const resAvail = await fetch(`${RENTEON_API_URL}/bookings/availability`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(availPayload)
            });
            
            if (resAvail.ok) {
                const cars = await resAvail.json();
                if (Array.isArray(cars) && cars.length > 0) {
                    const car = cars[0];
                    const calcPayload = {
                        ...availPayload,
                        CarCategoryId: car.CarCategoryId || car.CategoryId || car.Id
                    };
                    
                    const resCalc = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify(calcPayload)
                    });
                    
                    if (resCalc.ok) {
                        const calcData = await resCalc.json();
                        if (calcData.Services && Array.isArray(calcData.Services)) {
                            console.log(`Calculation Strategy found ${calcData.Services.length} services!`);
                            calcData.Services.forEach((s: any) => {
                                // Extract Price from nested ServicePrice if available
                                const price = s.ServicePrice?.AmountTotal || s.Price || 0;
                                const item = {
                                    ...s,
                                    Price: price,
                                    Title: s.Name,
                                    Id: s.ServiceId || s.Id
                                };
                                const id = item.Id;
                                if (id && !seenIds.has(id)) {
                                    seenIds.add(id);
                                    allServices.push(item);
                                }
                            });
                        }
                    }
                }
            }
        } catch (calcErr) {
            console.error("Calculation Strategy Failed:", calcErr);
        }
    }
    
    return allServices;

  } catch (error) {
    console.error('Renteon Services Fetch Exception:', error);
    return [];
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
      PricelistId: 306, // WEB Pricelist (ID 306)
      BookAsCommissioner: true // Required for Agency/Partner API users
    };

    // 1. Availability Check (Optional but recommended to get PricelistId if needed)
    // We'll skip explicitly using the result for now unless errors occur.
    // Actually, we can use /calculate to validate price first
    const calcResponse = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPayload)
    });

    if (!calcResponse.ok) {
        const err = await calcResponse.text();
        console.warn('Renteon Price Calc Warning (continuing anyway):', err);
        // Continue to create booking as create might handle it differently or give better error
    } else {
        const calcData = await calcResponse.json();
        // If we got a price, we could update our local record, but for now just use it to validate
        console.log('Renteon Price Validated:', calcData.Total);
    }
    
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
    // Check if services are valid before sending back
    if (bookingModel.Services) {
        bookingModel.Services = bookingModel.Services.map((s: any) => ({
            ...s,
            // Ensure numbers are numbers, etc. Renteon might be strict.
        }));
    }

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
