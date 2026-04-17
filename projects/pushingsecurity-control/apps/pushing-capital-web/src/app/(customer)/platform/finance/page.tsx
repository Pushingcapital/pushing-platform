"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CircleDollarSign, Target, CheckCircle2, ArrowRight, Loader2, Lock, Banknote, Flag } from 'lucide-react';

type Step = 'consent' | 'income' | 'goals' | 'success';
type Goal = 'BUILD_CREDIT' | 'SECURE_FUNDING' | 'CONSOLIDATE_DEBT';

interface FormData {
  hasConsented: boolean;
  annualIncome: string;
  selectedGoals: Goal[];
}

interface StepComponentProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  goToNextStep: () => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const MonospaceHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`font-mono text-2xl md:text-3xl text-neutral-100 tracking-tighter ${className || ''}`}>
    {children}
  </h2>
);

const Paragraph = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-neutral-400 text-sm md:text-base max-w-md ${className || ''}`}>
    {children}
  </p>
);

const StyledButton = ({ onClick, disabled, isLoading, children, className }: { onClick: () => void; disabled: boolean; isLoading: boolean; children: React.ReactNode; className?: string; }) => (
  <button
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-black transition-all duration-300 ease-in-out
      ${disabled ? 'bg-neutral-700 cursor-not-allowed' : 'bg-[#00FFAA] hover:bg-opacity-80 active:scale-95'}
      ${className || ''}`}
  >
    {isLoading ? <Loader2 className="animate-spin" size={20} /> : children}
  </button>
);

const Checkbox = ({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (checked: boolean) => void; label: React.ReactNode; }) => (
  <label htmlFor={id} className="flex items-start gap-3 cursor-pointer text-neutral-400 text-sm">
    <div className="relative flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="appearance-none h-5 w-5 border-2 border-neutral-600 rounded bg-transparent checked:bg-[#00FFAA] checked:border-[#00FFAA] transition-all"
      />
      {checked && (
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <span className="flex-1">{label}</span>
  </label>
);

const Input = ({ value, onChange, placeholder, type = 'text', icon: Icon }: { value: string; onChange: (value: string) => void; placeholder: string; type?: string; icon: React.ElementType }) => (
  <div className="relative w-full">
    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
      <Icon className="text-neutral-500" size={20} />
    </div>
    <input
      type={type}
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-black/30 border-2 border-neutral-800 rounded-md py-3 pl-12 pr-4 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#00FFAA] focus:border-[#00FFAA] transition-all"
    />
  </div>
);

const GoalCard = ({ icon: Icon, title, description, isSelected, onClick }: { icon: React.ElementType; title: string; description: string; isSelected: boolean; onClick: () => void; }) => (
  <button
    onClick={onClick}
    className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-300 ease-in-out
      ${isSelected ? 'bg-[#00ffaa]/10 border-[#00FFAA]' : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'}`}
  >
    <div className="flex items-center gap-4">
      <Icon size={24} className={isSelected ? 'text-[#00FFAA]' : 'text-neutral-400'} />
      <div>
        <h3 className="font-semibold text-neutral-100">{title}</h3>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  </button>
);

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0
  })
};

const StepConsent: React.FC<StepComponentProps> = ({ formData, updateFormData, goToNextStep }) => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <MonospaceHeader>Activate Credit Services</MonospaceHeader>
        <Paragraph>To personalize your credit strategy and match you with lenders, we need your consent for a soft credit inquiry. This will not affect your credit score.</Paragraph>
      </div>
      <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900/50 flex items-start gap-4">
        <Lock size={24} className="text-[#00FFAA] flex-shrink-0 mt-1" />
        <p className="text-sm text-neutral-400">
          Pushing Capital uses bank-level security to protect your data. Your consent is for a one-time soft pull only.
        </p>
      </div>
      <Checkbox
        id="consent"
        checked={formData.hasConsented}
        onChange={(checked) => updateFormData({ hasConsented: checked })}
        label={<>I authorize Pushing Capital to perform a soft credit inquiry to activate my Credit Strategy and Lender Match services.</>}
      />
      <StyledButton
        onClick={goToNextStep}
        disabled={!formData.hasConsented}
        isLoading={false}
      >
        <span>Agree & Continue</span>
        <ArrowRight size={20} />
      </StyledButton>
    </div>
  );
};

const StepIncome: React.FC<StepComponentProps> = ({ formData, updateFormData, goToNextStep, setLoading }) => {
  const [income, setIncome] = React.useState(formData.annualIncome);
  const isButtonDisabled = !/^\d+$/.test(income) || parseInt(income, 10) <= 0;

  const handleContinue = async () => {
    setLoading(true);
    updateFormData({ annualIncome: income });
    await new Promise(resolve => setTimeout(resolve, 1500)); // API Simulation
    setLoading(false);
    goToNextStep();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <MonospaceHeader>Verify Your Income</MonospaceHeader>
        <Paragraph>Please provide your estimated annual income. This helps us tailor financial products to your profile.</Paragraph>
      </div>
      <Input
        value={income}
        onChange={setIncome}
        placeholder="e.g., 85000"
        type="number"
        icon={Banknote}
      />
      <StyledButton
        onClick={handleContinue}
        disabled={isButtonDisabled}
        isLoading={false as any}
      >
        <span>Confirm Income</span>
        <ArrowRight size={20} />
      </StyledButton>
    </div>
  );
};

const StepGoals: React.FC<StepComponentProps> = ({ formData, updateFormData, goToNextStep, setLoading }) => {
  const toggleGoal = (goal: Goal) => {
    const newGoals = [...formData.selectedGoals];
    const index = newGoals.indexOf(goal);
    if (index > -1) {
      newGoals.splice(index, 1);
    } else {
      newGoals.push(goal);
    }
    updateFormData({ selectedGoals: newGoals });
  };

  const handleActivation = async () => {
    setLoading(true);
    // API Call Placeholder: POST to /api/onboarding
    const payload = { ...formData, selectedGoals: Array.from(formData.selectedGoals) };
    console.log("Submitting to /api/onboarding:", payload);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    goToNextStep();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <MonospaceHeader>Set Your Financial Goals</MonospaceHeader>
        <Paragraph>What are you aiming to achieve? Select one or more goals to customize your Pushing Capital experience.</Paragraph>
      </div>
      <div className="flex flex-col gap-3">
        <GoalCard
          icon={ArrowRight}
          title="Build Credit"
          description="Improve my credit score and history."
          isSelected={formData.selectedGoals.includes('BUILD_CREDIT')}
          onClick={() => toggleGoal('BUILD_CREDIT')}
        />
        <GoalCard
          icon={Flag}
          title="Secure Funding"
          description="Access new lines of credit or loans."
          isSelected={formData.selectedGoals.includes('SECURE_FUNDING')}
          onClick={() => toggleGoal('SECURE_FUNDING')}
        />
        <GoalCard
          icon={CircleDollarSign}
          title="Consolidate Debt"
          description="Combine multiple debts into a single payment."
          isSelected={formData.selectedGoals.includes('CONSOLIDATE_DEBT')}
          onClick={() => toggleGoal('CONSOLIDATE_DEBT')}
        />
      </div>
      <StyledButton
        onClick={handleActivation}
        disabled={formData.selectedGoals.length === 0}
        isLoading={false as any}
      >
        <span>Complete Activation</span>
      </StyledButton>
    </div>
  );
};

const StepSuccess: React.FC<{}> = () => {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
      >
        <CheckCircle2 size={64} className="text-[#00FFAA]" />
      </motion.div>
      <div className="flex flex-col gap-2">
        <MonospaceHeader>Activation Complete</MonospaceHeader>
        <Paragraph>Your services are now active. We are analyzing your profile to build your personalized credit strategy.</Paragraph>
      </div>
      <StyledButton
        onClick={() => { /* In a real app, this would route to the dashboard */ alert("Redirecting to dashboard..."); }}
        disabled={false}
        isLoading={false}
        className="max-w-xs"
      >
        Go to Dashboard
      </StyledButton>
    </div>
  );
};

const StepIndicator = ({ current, total }: { current: number; total: number }) => (
    <div className="flex justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
            <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${i < current ? 'bg-[#00FFAA] w-8' : 'bg-neutral-800 w-4'}`}
            />
        ))}
    </div>
);

const ActivateServicesPage = () => {
  const [[page, direction], setPage] = React.useState([0, 0]);
  const [isLoading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
    hasConsented: false,
    annualIncome: '',
    selectedGoals: [],
  });

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const steps: React.ReactNode[] = [
    <StepConsent formData={formData} updateFormData={updateFormData} goToNextStep={() => paginate(1)} setLoading={setLoading} />,
    <StepIncome formData={formData} updateFormData={updateFormData} goToNextStep={() => paginate(1)} setLoading={setLoading} />,
    <StepGoals formData={formData} updateFormData={updateFormData} goToNextStep={() => paginate(1)} setLoading={setLoading} />,
    <StepSuccess />
  ];
  
  const CurrentStepComponent = steps[page];

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(8,51,68,0.3),rgba(255,255,255,0))]"></div>
      <div className="fixed inset-0 bg-cyan-950/15 backdrop-blur-3xl"></div>
      
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-black/60 border border-neutral-800 rounded-xl shadow-2xl shadow-cyan-950/20 backdrop-blur-lg overflow-hidden">
          <div className="p-8 md:p-10 relative">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={stepVariants as any}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className={isLoading ? 'opacity-50 pointer-events-none' : ''}
              >
                {CurrentStepComponent}
              </motion.div>
            </AnimatePresence>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="animate-spin text-[#00FFAA]" size={48} />
              </div>
            )}
          </div>
          {page < steps.length - 1 && (
            <div className="bg-black/50 border-t border-neutral-800 px-10 py-4">
              <StepIndicator current={page + 1} total={steps.length - 1} />
            </div>
          )}
        </div>
        <div className="text-center mt-6">
          <p className="text-xs text-neutral-600 font-mono">Pushing Capital / UI 7 / Secure Activation</p>
        </div>
      </div>
    </div>
  );
};

export default ActivateServicesPage;