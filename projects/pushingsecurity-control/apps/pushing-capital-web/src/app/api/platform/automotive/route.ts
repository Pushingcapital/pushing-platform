
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// ARCHITECT: Gemini 2.5 Pro
// PLATFORM:  Pushing Capital
// API:       Automotive API
// OBJECTIVE: Handle VIN lookups and automotive asset storage.
// ============================================================================


// ============================================================================
// SCHEMAS & TYPES
// ============================================================================

/**
 * Zod schema for validating a 17-character Vehicle Identification Number (VIN).
 * Excludes I, O, and Q as per the standard.
 */
const VinSchema = z.string()
  .length(17, { message: "VIN must be exactly 17 characters long." })
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/, { message: "Invalid VIN format. Contains illegal characters (I, O, Q) or is not alphanumeric." });

/**
 * Zod schema for a complete automotive asset record.
 * This defines the shape of data stored in the pc_automotive_core database.
 */
const AutomotiveAssetSchema = z.object({
  vin: VinSchema,
  make: z.string().min(2, "Make must be at least 2 characters."),
  model: z.string().min(1, "Model is required."),
  year: z.number().int().min(1886, "Year is invalid.").max(new Date().getFullYear() + 2, "Year is invalid."),
  trim: z.string().optional(),
  color: z.string().optional(),
  mileage: z.number().int().nonnegative("Mileage cannot be negative.").optional(),
  // Additional fields for a comprehensive asset record
  engine: z.string().optional(),
  transmission: z.string().optional(),
  body_type: z.string().optional(),
});

// Infer the TypeScript type from the Zod schema for strong typing
type AutomotiveAsset = z.infer<typeof AutomotiveAssetSchema>;


// ============================================================================
// DATABASE & EXTERNAL SERVICE INTERFACE (PLACEHOLDERS)
// ============================================================================

/**
 * Placeholder for querying the pc_automotive_core database (e.g., Postgres or BigQuery).
 * @param vin The Vehicle Identification Number to look up.
 * @returns A promise that resolves to the automotive asset or null if not found.
 */
async function getVehicleFromDb(vin: string): Promise<AutomotiveAsset | null> {
  console.log(`[DB INTERFACE] Querying pc_automotive_core for VIN: ${vin}`);
  // --- PRODUCTION DATABASE LOGIC (POSTGRES/BIGQUERY) WOULD GO HERE ---
  // Example (Postgres with 'pg' library):
  // const { Pool } = require('pg');
  // const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // const result = await pool.query('SELECT * FROM automotive_assets WHERE vin = $1', [vin]);
  // if (result.rows.length > 0) {
  //   return AutomotiveAssetSchema.parse(result.rows[0]);
  // }
  // return null;

  // Mock implementation for demonstration:
  if (vin === "1PCAP5B92RF123456") {
    return {
      vin: "1PCAP5B92RF123456",
      make: "Pushing Capital",
      model: "FundRunner",
      year: 2025,
      trim: "Performance",
      color: "Cyber Silver",
      mileage: 1337,
    };
  }
  return null;
}

/**
 * Placeholder for saving an automotive asset to the pc_automotive_core database.
 * @param asset The automotive asset data to save (insert or update).
 * @returns A promise that resolves to the saved/created asset.
 */
async function saveVehicleToDb(asset: AutomotiveAsset): Promise<AutomotiveAsset> {
  console.log(`[DB INTERFACE] Saving asset to pc_automotive_core for VIN: ${asset.vin}`);
  // --- PRODUCTION DATABASE LOGIC (POSTGRES/BIGQUERY) WOULD GO HERE ---
  // Example (Postgres UPSERT):
  // const { Pool } = require('pg');
  // const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // const result = await pool.query(
  //   'INSERT INTO automotive_assets (...) VALUES (...) ON CONFLICT (vin) DO UPDATE SET ... RETURNING *',
  //   [...]
  // );
  // return AutomotiveAssetSchema.parse(result.rows[0]);
  
  // Mock implementation simply returns the input data as if saved successfully
  return asset;
}

/**
 * Placeholder for an external VIN decoding service (e.g., NHTSA, Edmunds API).
 * @param vin The Vehicle Identification Number to decode.
 * @returns A promise that resolves to the decoded vehicle data or null if not found.
 */
async function lookupVinExternally(vin: string): Promise<AutomotiveAsset | null> {
  console.log(`[EXTERNAL API] Looking up VIN externally: ${vin}`);
  // In a real application, this would use fetch() with an API key from process.env
  // const apiKey = process.env.VIN_LOOKUP_API_KEY;
  // const response = await fetch(`https://api.thirdparty.com/v1/vin/${vin}?apiKey=${apiKey}`);
  // if (!response.ok) return null;
  // const data = await response.json();
  // ... logic to transform external data to our AutomotiveAsset schema ...
  
  // Mock implementation for demonstration:
  if (vin === "2EXTN4A68PF987654") {
    return {
      vin: "2EXTN4A68PF987654",
      make: "Toyota",
      model: "Camry",
      year: 2023,
      trim: "XSE",
      color: "Celestial Silver Metallic",
    };
  }
  return null;
}


// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

/**
 * GET handler for VIN lookup.
 * Retrieves vehicle information. It first checks the internal pc_automotive_core 
 * database, and if not found, falls back to an external decoding service.
 * @route GET /api/automotive?vin={vin}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get('vin');

    // 1. Input Validation
    const validationResult = VinSchema.safeParse(vin);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Invalid VIN provided.",
        details: validationResult.error.flatten().formErrors,
      }, { status: 400 });
    }
    const validatedVin = validationResult.data;

    // 2. Check internal database (cache) first for efficiency
    let vehicle = await getVehicleFromDb(validatedVin);
    if (vehicle) {
      return NextResponse.json({ success: true, data: vehicle, source: 'database' });
    }

    // 3. If not in DB, query external service
    vehicle = await lookupVinExternally(validatedVin);
    if (vehicle) {
      // Asynchronously save the newly found vehicle to our DB for future lookups
      saveVehicleToDb(vehicle).catch(err => {
        console.error(`[ASYNC CACHE FAILED] Could not save VIN ${vehicle?.vin} to DB:`, err);
      });
      return NextResponse.json({ success: true, data: vehicle, source: 'external_api' });
    }

    // 4. If not found in any source
    return NextResponse.json({
      success: false,
      error: `Vehicle with VIN ${validatedVin} not found.`
    }, { status: 404 });

  } catch (error) {
    console.error("[AUTOMOTIVE API GET-ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "An internal server error occurred during VIN lookup."
    }, { status: 500 });
  }
}

/**
 * POST handler for creating and storing a new automotive asset.
 * Validates the incoming asset data and saves it to the pc_automotive_core database.
 * @route POST /api/automotive
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Input Validation
    const validationResult = AutomotiveAssetSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Invalid asset data provided.",
        details: validationResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const newAsset = validationResult.data;

    // 2. Prevent Duplicates
    const existingVehicle = await getVehicleFromDb(newAsset.vin);
    if (existingVehicle) {
        return NextResponse.json({
            success: false,
            error: `An asset with VIN ${newAsset.vin} already exists. Use a PUT request to update.`,
        }, { status: 409 }); // 409 Conflict
    }

    // 3. Save to Database
    const savedAsset = await saveVehicleToDb(newAsset);

    // 4. Return Success Response
    return NextResponse.json({
      success: true,
      message: "Automotive asset created successfully.",
      data: savedAsset
    }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error("[AUTOMOTIVE API POST-ERROR]", error);

    // Handle specific error for malformed JSON
    if (error instanceof SyntaxError) {
        return NextResponse.json({
            success: false,
            error: "Invalid JSON format in request body.",
        }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: "An internal server error occurred while creating the asset."
    }, { status: 500 });
  }
}
