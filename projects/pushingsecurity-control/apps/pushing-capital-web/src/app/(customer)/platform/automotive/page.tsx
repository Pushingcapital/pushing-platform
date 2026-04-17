"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UploadCloud, CheckCircle, ArrowRight, LoaderCircle, Car, FileText, Gauge, Building } from 'lucide-react';

// --- TYPE DEFINITIONS ---
type VehicleData = {
  make: string;
  model: string;
  year: number;
  trim: string;
  color: string;
};

type ValuationData = {
  wholesale: number;
  retail: number;
  tradeIn: number;
  marketDaySupply: number;
};

// --- API SIMULATION ---
const api = {
  lookupVin: async (vin: string): Promise<VehicleData> => {
    console.log(`[API] Looking up VIN: ${vin}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (vin && vin.length > 10) {
          resolve({
            make: "Porsche",
            model: "911",
            year: 2023,
            trim: "GT3 RS",
            color: "Voodoo Blue",
          });
        } else {
          reject(new Error("Invalid VIN provided."));
        }
      }, 1500);
    });
  },
  submitForValuation: async (vin: string, report: File): Promise<ValuationData> => {
    console.log(`[API] Submitting for valuation VIN: ${vin} with report: ${report.name}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          wholesale: 285000,
          retail: 315000,
          tradeIn: 270000,
          marketDaySupply: 18,
        });
      }, 2000);
    });
  },
  activateServiceLine: async (payload: { vin: string; valuation: ValuationData }): Promise<{ success: boolean; serviceId: string }> => {
    console.log(`[API] Activating service line with payload:`, payload);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          serviceId: `AUTO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        });
      }, 1000);
    });
  },
};

// --- UI COMPONENTS ---
const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-4 py-3 text-gray-200 font-mono tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FFAA] focus:border-[#00FFAA] transition-all duration-300"
    {...props}
  />
);

const Button = ({ children, onClick, isLoading, disabled }: { children: React.ReactNode; onClick: () => void; isLoading?: boolean; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={isLoading || disabled}
    className="w-full flex items-center justify-center gap-2 bg-[#00FFAA] text-black font-bold py-3 px-6 rounded-md transition-all duration-300 ease-in-out hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#00FFAA] disabled:bg-gray-600 disabled:cursor-not-allowed"
  >
    {isLoading ? <LoaderCircle className="animate-spin" /> : children}
  </button>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full max-w-lg bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl shadow-2xl shadow-cyan-950/20 p-8">
    {children}
  </div>
);

const StepHeader = ({ step, title, subtitle }: { step: number; title: string; subtitle: string }) => (
  <div className="text-center mb-8">
    <p className="font-mono text-sm text-[#00FFAA] mb-2">STEP 0{step}</p>
    <h2 className="text-3xl font-bold text-gray-100 mb-2">{title}</h2>
    <p className="text-gray-400">{subtitle}</p>
  </div>
);

// --- STEP COMPONENTS ---

const VINStep = ({ onComplete }: { onComplete: (vin: string, vehicleData: VehicleData) => void }) => {
  const [vin, setVin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.lookupVin(vin);
      onComplete(vin, data);
    } catch (e: any) {
      setError(e.message || "Failed to lookup VIN.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StepHeader step={1} title="Vehicle Identification" subtitle="Enter the 17-digit VIN to begin." />
      <div className="space-y-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="XXXXXXXXXXXXXXXXX"
            value={vin}
            onChange={(e: any) => setVin(e.target.value.toUpperCase())}
            maxLength={17}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        </div>
        <Button onClick={handleLookup} isLoading={isLoading} disabled={vin.length < 11}>
          Lookup VIN
          <ArrowRight size={20} />
        </Button>
        {error && <p className="text-red-500 text-sm text-center font-mono">{error}</p>}
      </div>
    </>
  );
};

const ConditionReportStep = ({ vehicleData, vin, onComplete }: { vehicleData: VehicleData; vin: string; onComplete: (valuation: ValuationData) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload a condition report.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const valuation = await api.submitForValuation(vin, file);
      onComplete(valuation);
    } catch (e: any) {
      setError(e.message || "Failed to process valuation.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
     <>
      <StepHeader step={2} title="Condition & Valuation" subtitle="Upload the vehicle's condition report." />
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6 text-sm">
        <div className="flex items-center gap-4">
            <Car className="text-[#00FFAA]" size={24}/>
            <div>
                <p className="font-bold text-gray-200">{vehicleData.year} {vehicleData.make} {vehicleData.model}</p>
                <p className="font-mono text-gray-400">{vehicleData.trim} / {vehicleData.color}</p>
            </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="relative border-2 border-dashed border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-[#00FFAA] transition-colors duration-300">
          <UploadCloud className="text-gray-500 mb-2" size={32} />
          <p className="text-gray-300">
            {file ? <span className="text-[#00FFAA] font-mono">{file.name}</span> : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-gray-500 mt-1">PDF, PNG, or JPG (Max 10MB)</p>
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
          />
        </div>
        <Button onClick={handleSubmit} isLoading={isLoading} disabled={!file}>
          Submit for Valuation
          <ArrowRight size={20} />
        </Button>
        {error && <p className="text-red-500 text-sm text-center font-mono">{error}</p>}
      </div>
    </>
  );
};

const ValuationDisplayStep = ({ valuationData, onComplete }: { valuationData: ValuationData; onComplete: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const formatted = useMemo(() => ({
        wholesale: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valuationData.wholesale),
        retail: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valuationData.retail),
        tradeIn: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valuationData.tradeIn),
    }), [valuationData]);

    const handleActivation = async () => {
        setIsLoading(true);
        // This is where you would call the final onboarding API
        await onComplete();
        // No need to set isLoading to false as we transition away
    };

    return (
        <>
            <StepHeader step={3} title="Valuation Complete" subtitle="Review the market data and activate the service." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-center">
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                    <p className="font-mono text-xs text-gray-400 uppercase">Wholesale</p>
                    <p className="text-2xl font-bold text-[#00FFAA]">{formatted.wholesale}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                    <p className="font-mono text-xs text-gray-400 uppercase">Est. Retail</p>
                    <p className="text-2xl font-bold text-gray-200">{formatted.retail}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                    <p className="font-mono text-xs text-gray-400 uppercase">Trade-In</p>
                    <p className="text-2xl font-bold text-gray-200">{formatted.tradeIn}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                    <p className="font-mono text-xs text-gray-400 uppercase">Market Day Supply</p>
                    <p className="text-2xl font-bold text-gray-200">{valuationData.marketDaySupply}</p>
                </div>
            </div>
            <Button onClick={handleActivation} isLoading={isLoading}>
                Activate Automotive Service
                <ArrowRight size={20} />
            </Button>
        </>
    );
};

const CompletionStep = () => (
    <>
        <div className="text-center">
            <CheckCircle className="mx-auto text-[#00FFAA] mb-4" size={64} />
            <h2 className="text-3xl font-bold text-gray-100 mb-2">Service Activated</h2>
            <p className="text-gray-400 mb-8">The automotive service line is now active for this asset.</p>
            <button className="text-[#00FFAA] font-mono hover:underline">
                Return to Dashboard
            </button>
        </div>
    </>
);

// --- MAIN PAGE ---

export default function AutomotiveActivationPage() {
  const [step, setStep] = useState(1);
  const [vin, setVin] = useState('');
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [valuationData, setValuationData] = useState<ValuationData | null>(null);

  const handleVinComplete = useCallback((vin: string, data: VehicleData) => {
    setVin(vin);
    setVehicleData(data);
    setStep(2);
  }, []);

  const handleReportComplete = useCallback((valuation: ValuationData) => {
    setValuationData(valuation);
    setStep(3);
  }, []);
  
  const handleActivationComplete = useCallback(async () => {
    if (!vin || !valuationData) return;
    try {
        await api.activateServiceLine({ vin, valuation: valuationData });
        setStep(4);
    } catch (e) {
        // Handle activation error, maybe go back a step with a message
        console.error("Activation failed", e);
    }
  }, [vin, valuationData]);

  const motionVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen w-full bg-black text-gray-300 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-950/[.15] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-950/[.10] rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={motionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {step === 1 && <VINStep onComplete={handleVinComplete as any} />}
            {step === 2 && vehicleData && <ConditionReportStep vehicleData={vehicleData} vin={vin} onComplete={handleReportComplete as any} />}
            {step === 3 && valuationData && <ValuationDisplayStep valuationData={valuationData} onComplete={handleActivationComplete as any}/>}
            {step === 4 && <CompletionStep />}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}