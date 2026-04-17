"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, SlidersHorizontal, User, Car, Users, Link as LinkIcon, Fuel, Gauge, GitCommitHorizontal, Calendar, DollarSign, Percent, Calculator, Printer, FileDown } from 'lucide-react';

const mockInventory = [
  { id: 'V58022', make: 'Cyberdyne', model: 'T-800 Sedan', year: 2029, type: 'New', mileage: 15, fuel: 'Electric', transmission: 'Auto', price: 92500, status: 'Available' },
  { id: 'V58023', make: 'Weyland', model: 'Yutani Coupe', year: 2028, type: 'New', mileage: 22, fuel: 'Fusion', transmission: 'Auto', price: 145000, status: 'Available' },
  { id: 'V58019', make: 'Tyrell', model: 'Nexus-6 GT', year: 2027, type: 'CPO', mileage: 12500, fuel: 'Hybrid', transmission: 'Auto', price: 76000, status: 'Pending' },
  { id: 'V58015', make: 'Stark', model: 'Repulsor EV', year: 2029, type: 'New', mileage: 10, fuel: 'Electric', transmission: 'Auto', price: 112000, status: 'Available' },
  { id: 'V58008', make: 'Wayne Ent.', model: 'Nightfall SUV', year: 2026, type: 'Used', mileage: 32000, fuel: 'Gasoline', transmission: 'Auto', price: 61500, status: 'Sold' },
  { id: 'V58011', make: 'OmniCorp', model: 'Delta City Cruiser', year: 2028, type: 'New', mileage: 18, fuel: 'Electric', transmission: 'Auto', price: 88000, status: 'Available' },
  { id: 'V58017', make: 'Cyberdyne', model: 'Skynet Crossover', year: 2029, type: 'Demo', mileage: 1500, fuel: 'Electric', transmission: 'Auto', price: 81300, status: 'Hold' },
];

const mockCustomer = {
    name: 'John Connor',
    id: 'CUST-007',
    associatedEntities: [
        { name: 'Sarah Connor', relationship: 'Family' },
        { name: 'Cyber Research Systems', relationship: 'Employer' },
    ]
};

const Card = ({ children, className }: any) => (
  <div className={`bg-cyan-950/10 backdrop-blur-sm border border-cyan-800/20 rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className }: any) => (
  <div className={`flex items-center justify-between mb-4 pb-2 border-b border-cyan-800/20 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className }: any) => (
  <h2 className={`text-lg font-medium text-gray-200 tracking-wider ${className}`}>{children}</h2>
);

const Input = ({ icon, className, ...props }: any) => (
  <div className="relative">
    {icon && <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{icon}</div>}
    <input
      className={`w-full bg-black/30 border border-gray-700 rounded-md py-2 text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#00FFAA] focus:border-[#00FFAA] transition-colors duration-200 ${icon ? 'pl-10' : 'px-3'} ${className}`}
      {...props}
    />
  </div>
);

const Button = ({ children, variant = 'primary', className, ...props }: any) => {
  const baseClasses = "px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black";
  
  const variants: any = {
    primary: "bg-[#00FFAA] text-black hover:bg-opacity-80 focus:ring-[#00FFAA]",
    secondary: "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 border border-gray-700 focus:ring-gray-500",
    ghost: "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200",
  };
  
  return <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const DataTable = ({ columns, data, onRowClick }: any) => {
    const [sortConfig, setSortConfig] = useState<any>({ key: 'id', direction: 'ascending' });

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const requestSort = (key: string) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const StatusBadge = ({ status }: any) => {
      const statusStyles: any = {
          'Available': 'text-[#00FFAA] bg-[#00FFAA]/10 border border-[#00FFAA]/20',
          'Pending': 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
          'Hold': 'text-orange-400 bg-orange-400/10 border border-orange-400/20',
          'Sold': 'text-red-400 bg-red-400/10 border border-red-400/20',
      };
      return <span className={`px-2 py-1 text-xs font-mono rounded-full ${statusStyles[status] || 'text-gray-400 bg-gray-400/10'}`}>{status}</span>;
    };
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-400 uppercase bg-black/20">
                    <tr>
                        {columns.map((col: any) => (
                            <th key={col.key} scope="col" className="px-4 py-3 font-mono tracking-wider">
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => requestSort(col.key)}>
                                    {col.header}
                                    {sortConfig.key === col.key && (
                                        sortConfig.direction === 'ascending' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row) => (
                        <tr key={row.id} className="border-b border-gray-800/50 hover:bg-cyan-950/20 cursor-pointer" onClick={() => onRowClick(row)}>
                            {columns.map((col: any) => (
                                <td key={col.key} className="px-4 py-4">
                                    {col.key === 'status' ? <StatusBadge status={row[col.key]} /> : col.render ? col.render(row) : <span className={col.isMono ? 'font-mono' : ''}>{row[col.key]}</span>}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const RelationshipGraph = ({ customer }: any) => {
  return (
    <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Relationship Graph</CardTitle>
          <Button variant="ghost" size="sm"><LinkIcon size={16} /></Button>
        </CardHeader>
        <div className="flex-grow flex items-center justify-center relative w-full h-full min-h-[200px]">
            <svg className="absolute w-full h-full" preserveAspectRatio="xMidYMid meet">
              <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#00FFAA" strokeWidth="1" strokeDasharray="4 2" />
              <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#00FFAA" strokeWidth="1" strokeDasharray="4 2" />
            </svg>
            <div className="relative flex flex-col items-center">
                <div className="z-10 bg-cyan-900 border-2 border-[#00FFAA] rounded-full p-4 flex flex-col items-center shadow-[0_0_15px_rgba(0,255,170,0.4)]">
                    <User className="text-[#00FFAA]" size={24} />
                    <span className="font-mono text-sm text-white mt-1">{customer.name}</span>
                    <span className="font-mono text-xs text-gray-400">{customer.id}</span>
                </div>
            </div>
            <div className="absolute top-0 left-0 transform -translate-x-1/4 -translate-y-1/4">
                 <div className="z-10 bg-gray-900 border border-cyan-800/50 rounded-full p-3 flex flex-col items-center">
                    <Users className="text-cyan-400" size={20} />
                    <span className="font-mono text-xs text-gray-300 mt-1">{customer.associatedEntities[0].name}</span>
                    <span className="font-mono text-[10px] text-gray-500">{customer.associatedEntities[0].relationship}</span>
                </div>
            </div>
            <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
                 <div className="z-10 bg-gray-900 border border-cyan-800/50 rounded-full p-3 flex flex-col items-center">
                    <Users className="text-cyan-400" size={20} />
                    <span className="font-mono text-xs text-gray-300 mt-1">{customer.associatedEntities[1].name}</span>
                    <span className="font-mono text-[10px] text-gray-500">{customer.associatedEntities[1].relationship}</span>
                </div>
            </div>
        </div>
    </Card>
  );
};

const DealStructuringPanel = ({ vehicle }: any) => {
    const [deal, setDeal] = useState<any>({
        price: vehicle?.price || 0,
        downPayment: (vehicle?.price || 0) * 0.2,
        tradeIn: 0,
        term: 72,
        rate: 5.9,
    });
    
    const [monthlyPayment, setMonthlyPayment] = useState(0);

    useEffect(() => {
        if (vehicle) {
            setDeal({
                price: vehicle.price,
                downPayment: vehicle.price * 0.2,
                tradeIn: 0,
                term: 72,
                rate: 5.9,
            });
        }
    }, [vehicle]);

    useEffect(() => {
        const calculatePayment = () => {
            const principal = deal.price - deal.downPayment - deal.tradeIn;
            if (principal <= 0) {
                setMonthlyPayment(0);
                return;
            }
            const monthlyRate = deal.rate / 100 / 12;
            const numberOfPayments = deal.term;
            if (monthlyRate === 0) {
                setMonthlyPayment(principal / numberOfPayments);
                return;
            }
            const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
            setMonthlyPayment(payment);
        };
        calculatePayment();
    }, [deal]);

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setDeal((prev: any) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    if (!vehicle) {
        return (
             <Card className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <Car size={48} className="mx-auto mb-4" />
                    <p>Select a vehicle to structure a deal.</p>
                </div>
            </Card>
        );
    }
    
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div>
                    <CardTitle>Deal Pencil</CardTitle>
                    <p className="text-xs text-gray-400 font-mono mt-1">{vehicle.id} - {vehicle.year} {vehicle.make} {vehicle.model}</p>
                </div>
                 <Button variant="ghost" size="sm"><Calculator size={16} /></Button>
            </CardHeader>
            <div className="flex-grow space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Vehicle Price" icon={<DollarSign size={16} className="text-gray-500"/>} value={deal.price} name="price" onChange={handleInputChange} />
                    <FormGroup label="Down Payment" icon={<DollarSign size={16} className="text-gray-500"/>} value={deal.downPayment} name="downPayment" onChange={handleInputChange} />
                </div>
                <FormGroup label="Trade-In Value" icon={<DollarSign size={16} className="text-gray-500"/>} value={deal.tradeIn} name="tradeIn" onChange={handleInputChange} />
                 <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Term (Months)" icon={<Calendar size={16} className="text-gray-500"/>} value={deal.term} name="term" onChange={handleInputChange} />
                    <FormGroup label="APR" icon={<Percent size={16} className="text-gray-500"/>} value={deal.rate} name="rate" onChange={handleInputChange} step="0.1" />
                </div>
                <div className="pt-4 border-t border-cyan-800/20">
                    <div className="flex justify-between items-center text-gray-300">
                        <span>Amount Financed</span>
                        <span className="font-mono text-white">${(deal.price - deal.downPayment - deal.tradeIn).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                     <div className="flex justify-between items-center mt-4">
                        <span className="text-lg text-white">Monthly Payment</span>
                        <span className="font-mono text-2xl text-[#00FFAA] tracking-tighter">${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
             <div className="mt-6 pt-6 border-t border-cyan-800/20 flex gap-4">
                <Button variant="secondary" className="w-full"><Printer size={16}/> Print</Button>
                <Button variant="primary" className="w-full"><FileDown size={16}/> Save Deal</Button>
            </div>
        </Card>
    );
};

const FormGroup = ({ label, icon, ...props }: any) => (
    <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        <Input icon={icon} type="number" {...props} />
    </div>
);


export default function VehicleSalesWorkspacePage() {
    const [selectedVehicle, setSelectedVehicle] = useState<any>(mockInventory[0]);

    const inventoryColumns = [
        { key: 'id', header: 'Stock #', isMono: true },
        { key: 'make', header: 'Vehicle', render: (row: any) => `${row.year} ${row.make} ${row.model}` },
        { key: 'type', header: 'Type' },
        { key: 'mileage', header: 'Mileage', render: (row: any) => `${row.mileage.toLocaleString()} mi`, isMono: true },
        { key: 'price', header: 'Price', render: (row: any) => `$${row.price.toLocaleString()}`, isMono: true },
        { key: 'status', header: 'Status' },
    ];

    const VehicleQuickInfo = ({ vehicle }: any) => (
        <div className="flex space-x-6 text-sm text-gray-400">
            <div className="flex items-center gap-2"><Fuel size={16} className="text-[#00FFAA]" /><span>{vehicle.fuel}</span></div>
            <div className="flex items-center gap-2"><Gauge size={16} className="text-[#00FFAA]" /><span>{vehicle.mileage.toLocaleString()} mi</span></div>
            <div className="flex items-center gap-2"><GitCommitHorizontal size={16} className="text-[#00FFAA]" /><span>{vehicle.transmission}</span></div>
        </div>
    );

    return (
        <div className="bg-black min-h-screen text-gray-300 p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-white tracking-wide">Vehicle Sales Workspace</h1>
                    <p className="text-gray-500">UI 17: Inventory, Deal Structuring & Relationships</p>
                </div>
                 <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-gray-500">ARCHITECT: Gemini 2.5 Pro</span>
                    <div className="w-px h-6 bg-gray-700"></div>
                    <Button variant="secondary">Pushing Capital</Button>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 xl:col-span-3">
                    <RelationshipGraph customer={mockCustomer} />
                </div>

                <div className="lg:col-span-8 xl:col-span-9 grid grid-rows-3 gap-8">
                    <div className="row-span-2">
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>Inventory Master</CardTitle>
                                <div className="flex items-center gap-2">
                                    <div className="w-64">
                                        <Input 
                                            icon={<Search size={16} className="text-gray-500"/>}
                                            placeholder="Search VIN, Make, Model..."
                                        />
                                    </div>
                                    <Button variant="secondary"><SlidersHorizontal size={16} /> Filters</Button>
                                </div>
                            </CardHeader>
                            <div className="flex-grow -mx-6 -mb-6 overflow-hidden">
                                <DataTable columns={inventoryColumns} data={mockInventory} onRowClick={setSelectedVehicle} />
                            </div>
                        </Card>
                    </div>

                    <div className="row-span-1">
                        {selectedVehicle ? (
                             <Card>
                                <CardHeader>
                                    <CardTitle>Selected Vehicle Details</CardTitle>
                                    <span className="font-mono text-sm px-2 py-1 rounded bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/20">{selectedVehicle.id}</span>
                                </CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</h3>
                                        <div className="mt-2">
                                            <VehicleQuickInfo vehicle={selectedVehicle} />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Listed Price</p>
                                        <p className="text-2xl font-mono text-[#00FFAA]">${selectedVehicle.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            </Card>
                        ) : null}
                    </div>
                </div>

                <div className="lg:col-span-12 xl:col-span-12" style={{ gridColumn: 'span 12 / span 12', gridRowStart: 2 }}>
                     <DealStructuringPanel vehicle={selectedVehicle} />
                </div>
            </main>
        </div>
    );
}