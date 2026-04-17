import { NextRequest, NextResponse } from 'next/server';

/**
 * 🧊 THE MELT RATE ALGORITHM
 * 
 * Objective: Calculate the daily loss of value for automotive assets.
 * Formula: (Current Value - Estimated Salvage Value) / (Estimated Days Remaining in Cycle)
 * 
 * This enables the swarm to prioritize sales velocity for rapidly depreciating assets.
 */

export const dynamic = 'force-dynamic';

interface VehicleDepreciationRequest {
  vin: string;
  purchasePrice: number;
  purchaseDate: string;
  mileage: number;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  marketAdjuster?: number; // External market factor (e.g., fuel prices, seasonal demand)
}

export async function POST(req: NextRequest) {
  try {
    const body: VehicleDepreciationRequest = await req.json();
    const { vin, purchasePrice, purchaseDate, mileage, condition, marketAdjuster = 1.0 } = body;

    if (!vin || !purchasePrice) {
      return NextResponse.json({ ok: false, error: 'Missing VIN or purchasePrice' }, { status: 400 });
    }

    // ── CONFIGURATION ──
    const BASE_ANNUAL_DEPRECIATION = 0.15; // 15% base
    const MILEAGE_PENALTY_PER_1000 = 0.002; // 0.2% per 1k miles
    const CONDITION_MULTIPLIER = {
      EXCELLENT: 0.8,
      GOOD: 1.0,
      FAIR: 1.3,
      POOR: 1.8
    };

    // ── CALCULATION ──
    const daysOwned = Math.max(1, Math.floor((Date.now() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24)));
    
    // Effective Annual Depreciation Rate
    const effectiveRate = (BASE_ANNUAL_DEPRECIATION + (mileage / 1000 * MILEAGE_PENALTY_PER_1000)) 
                          * CONDITION_MULTIPLIER[condition] 
                          * marketAdjuster;

    const dailyRate = effectiveRate / 365;
    const dailyMeltValue = purchasePrice * dailyRate;
    
    const totalDepreciation = dailyMeltValue * daysOwned;
    const currentEstimatedValue = Math.max(0, purchasePrice - totalDepreciation);

    // ── LOG TO TRUTH PIPELINE ──
    console.log(`[MELT_RATE] VIN: ${vin} | Daily Melt: $${dailyMeltValue.toFixed(2)} | Current Value: $${currentEstimatedValue.toFixed(2)}`);

    return NextResponse.json({
      ok: true,
      vin,
      intelligence: {
        daily_melt_rate: dailyMeltValue,
        total_depreciation_to_date: totalDepreciation,
        current_estimated_value: currentEstimatedValue,
        days_in_inventory: daysOwned,
        melt_index: (dailyMeltValue / purchasePrice) * 10000 // Normalized index for swarm prioritization
      },
      recommendation: dailyMeltValue > 50 ? 'PRIORITY_LIQUIDATION' : 'HOLD_STABLE'
    });

  } catch (error: any) {
    console.error('[MELT_RATE] Calculation error:', error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
