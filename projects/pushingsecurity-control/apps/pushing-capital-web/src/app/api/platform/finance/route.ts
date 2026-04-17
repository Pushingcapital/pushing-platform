
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// --- ARCHITECT's NOTE: Input Validation Schema ---
// Using Zod for robust, schema-based validation. This ensures data integrity
// before it ever touches our core business logic or database.
const financialProfileSchema = z.object({
  userId: z.string().uuid({ message: "Invalid user identifier." }),
  annualRevenue: z.number().positive({ message: "Annual revenue must be a positive number." }).min(10000, "Annual revenue must be at least $10,000."),
  monthlyProfit: z.number().min(0, "Monthly profit cannot be negative."),
  creditScore: z.number().int().min(300, "Credit score must be at least 300.").max(850, "Credit score cannot exceed 850."),
  timeInBusiness: z.number().int().positive({ message: "Time in business (in months) must be a positive integer." }),
  industry: z.string().min(3, { message: "Industry must be at least 3 characters long." }).max(100),
  fundingAmountRequested: z.number().positive({ message: "Funding amount must be a positive number." }).min(5000, "Minimum funding request is $5,000."),
});

// --- ARCHITECT's NOTE: TypeScript Types ---
// Deriving types directly from our Zod schema ensures that our code's
// data structures always match our validation rules. This is a core principle
// of type-safe development.
type FinancialProfile = z.infer<typeof financialProfileSchema>;

interface Lender {
  lenderId: string;
  lenderName: string;
  maxLoanAmount: number;
  minCreditScore: number;
  interestRateRange: [number, number];
  industriesServed: string[];
}

// --- ARCHITECT's NOTE: Database Interaction Placeholders ---
// These functions are stubs representing interactions with the pc_finance_core database.
// In a production environment, they would contain the actual client logic for
// BigQuery, Postgres, or another database service.

/**
 * Updates a user's financial profile in the database.
 * @param profile - The validated financial profile data.
 * @returns The updated profile, potentially with a timestamp or new ID.
 */
const updateFinancialProfileInDB = async (profile: FinancialProfile): Promise<FinancialProfile & { lastUpdated: string }> => {
  console.log(`[DATABASE] Updating profile for userId: ${profile.userId}`);
  // --- PRODUCTION IMPLEMENTATION ---
  // Example for Postgres with 'pg' library:
  // const { Pool } = require('pg');
  // const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // const query = `
  //   INSERT INTO financial_profiles (user_id, annual_revenue, ...)
  //   VALUES ($1, $2, ...)
  //   ON CONFLICT (user_id) DO UPDATE SET ...
  //   RETURNING *;
  // `;
  // const result = await pool.query(query, Object.values(profile));
  // return result.rows[0];

  // --- PLACEHOLDER LOGIC ---
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedProfile = { ...profile, lastUpdated: new Date().toISOString() };
      console.log(`[DATABASE] Successfully updated profile for userId: ${profile.userId}`);
      resolve(updatedProfile);
    }, 50); // Simulate network latency
  });
};

/**
 * Finds potential lenders based on the user's financial profile.
 * @param profile - The user's financial profile.
 * @returns An array of matching lenders.
 */
const findMatchingLendersInDB = async (profile: FinancialProfile): Promise<Lender[]> => {
  console.log(`[DATABASE] Finding matching lenders for profile with revenue: ${profile.annualRevenue}`);
  // --- PRODUCTION IMPLEMENTATION ---
  // Example for BigQuery:
  // const { BigQuery } = require('@google-cloud/bigquery');
  // const bigquery = new BigQuery();
  // const query = `
  //   SELECT * FROM \`pushing-capital.pc_finance_core.lenders\`
  //   WHERE min_credit_score <= @creditScore
  //   AND @fundingAmount <= max_loan_amount
  //   AND industry IN UNNEST(industries_served)
  //   ORDER BY suitability_score DESC;
  // `;
  // const options = { query, params: { creditScore: profile.creditScore, ... } };
  // const [rows] = await bigquery.query(options);
  // return rows;
  
  // --- PLACEHOLDER LOGIC ---
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock lender matching logic
      const mockLenders: Lender[] = [
        { lenderId: 'lender-abc-123', lenderName: 'Capital Flow Inc.', maxLoanAmount: 250000, minCreditScore: 680, interestRateRange: [5.5, 12.0], industriesServed: ['Technology', 'Retail'] },
        { lenderId: 'lender-def-456', lenderName: 'NextGen Funding', maxLoanAmount: 500000, minCreditScore: 720, interestRateRange: [4.0, 9.5], industriesServed: ['Technology', 'Healthcare'] },
        { lenderId: 'lender-ghi-789', lenderName: 'Small Business Boost', maxLoanAmount: 100000, minCreditScore: 650, interestRateRange: [7.0, 15.5], industriesServed: ['Retail', 'Hospitality'] },
      ];

      const matches = mockLenders.filter(lender =>
        profile.creditScore >= lender.minCreditScore &&
        profile.fundingAmountRequested <= lender.maxLoanAmount &&
        (lender.industriesServed.includes(profile.industry) || lender.industriesServed.includes('All'))
      );
      console.log(`[DATABASE] Found ${matches.length} matching lenders.`);
      resolve(matches);
    }, 80); // Simulate network latency
  });
};


// --- ARCHITECT's NOTE: API Route Handler (POST) ---
// This is the primary entry point for the API. It follows a structured,
// predictable pattern: Parse -> Validate -> Process -> Respond.
// Consistent error handling ensures a reliable experience for the client.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. VALIDATE INPUT
    const validationResult = financialProfileSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn('[API VALIDATION] Invalid request body:', validationResult.error.flatten());
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input provided.',
          details: validationResult.error.flatten().fieldErrors,
        },
      }, { status: 400 });
    }

    const validatedProfile = validationResult.data;

    // 2. PROCESS DATA (DATABASE INTERACTIONS)
    // In a real application, these operations might be wrapped in a transaction.
    const updatedProfile = await updateFinancialProfileInDB(validatedProfile);
    const matchedLenders = await findMatchingLendersInDB(validatedProfile);

    // 3. RESPOND WITH SUCCESS
    return NextResponse.json({
      success: true,
      message: 'Financial profile updated and lenders matched successfully.',
      data: {
        updatedProfile,
        matchedLenders,
      },
    }, { status: 200 });

  } catch (error) {
    // --- ARCHITECT's NOTE: Global Error Catcher ---
    // This catch block handles unexpected errors, such as database connection
    // failures or malformed JSON, preventing the server from crashing.
    console.error('[API FATAL]', error);

    // Differentiate between JSON parsing error and other server errors
    if (error instanceof SyntaxError) {
         return NextResponse.json({
            success: false,
            error: {
                code: 'BAD_REQUEST',
                message: 'Failed to parse JSON body.',
            },
        }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred on the server.',
      },
    }, { status: 500 });
  }
}
