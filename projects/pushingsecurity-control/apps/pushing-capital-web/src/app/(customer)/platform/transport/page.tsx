"use client";
import React, { useState, useMemo } from 'react';
import { Search, Bell, UserCircle, Package, Truck, MapPin, MoreHorizontal, FileUp, X, UploadCloud, CheckCircle2, ChevronDown, MoveRight, Dot } from 'lucide-react';

const PushingTransportPage = () => {
    const initialShipments: any[] = [
        { id: 'PT78-K2M9', origin: 'Long Beach, CA', destination: 'Chicago, IL', carrier: 'Knight-Swift', status: 'In Transit', progress: 60, bol_uploaded: true, details: { weight: '42,500 lbs', cargo: 'Consumer Electronics', type: 'FTL' }, timeline: [{ status: 'Booked', date: '2023-10-25' }, { status: 'Pickup', date: '2023-10-26' }, { status: 'In Transit', date: '2023-10-27' }] },
        { id: 'PT91-J4F2', origin: 'Newark, NJ', destination: 'Miami, FL', carrier: 'J.B. Hunt', status: 'Delivered', progress: 100, bol_uploaded: true, details: { weight: '18,000 lbs', cargo: 'Apparel', type: 'LTL' }, timeline: [{ status: 'Booked', date: '2023-10-22' }, { status: 'Pickup', date: '2023-10-23' }, { status: 'In Transit', date: '2023-10-24' }, { status: 'Delivered', date: '2023-10-26' }] },
        { id: 'PT45-G8H1', origin: 'Houston, TX', destination: 'Denver, CO', carrier: 'Unassigned', status: 'Pending', progress: 0, bol_uploaded: false, details: { weight: '35,000 lbs', cargo: 'Industrial Machinery', type: 'FTL' }, timeline: [{ status: 'Booked', date: '2023-10-28' }] },
        { id: 'PT63-L5P7', origin: 'Seattle, WA', destination: 'Phoenix, AZ', carrier: 'Schneider', status: 'At Pickup', progress: 10, bol_uploaded: false, details: { weight: '44,000 lbs', cargo: 'Perishables', type: 'Reefer' }, timeline: [{ status: 'Booked', date: '2023-10-27' }, { status: 'At Pickup', date: '2023-10-28' }] },
        { id: 'PT22-C3B6', origin: 'Atlanta, GA', destination: 'Dallas, TX', carrier: 'Werner', status: 'Delayed', progress: 45, bol_uploaded: true, details: { weight: '22,100 lbs', cargo: 'Pharmaceuticals', type: 'LTL' }, timeline: [{ status: 'Booked', date: '2023-10-24' }, { status: 'Pickup', date: '2023-10-25' }, { status: 'Delayed', date: '2023-10-27' }] },
    ];
    
    const carriers = ['Knight-Swift', 'J.B. Hunt', 'Schneider', 'Werner', 'XPO Logistics', 'Old Dominion'];

    const [shipments, setShipments] = useState<any[]>(initialShipments);
    const [selectedShipment, setSelectedShipment] = useState<any>(initialShipments[0]);

    const handleSelectShipment = (shipment: any) => {
        setSelectedShipment(shipment);
    };
    
    const handleUpdateShipment = (updatedData: any) => {
        if (!selectedShipment) return;
        const updatedShipment = { ...selectedShipment, ...updatedData };
        setSelectedShipment(updatedShipment);
        setShipments(prevShipments => prevShipments.map(s => s.id === updatedShipment.id ? updatedShipment : s));
    };

    return (
        <div className="bg-black min-h-screen text-neutral-300 font-sans flex flex-col">
            {/* Background Aurora */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-cyan-950/20 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-teal-900/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
            </div>

            <main className="flex-grow flex flex-col p-4 sm:p-6 lg:p-8 z-10">
                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-neutral-100">Pushing<span className="text-[#00FFAA]">Transport</span></h1>
                        <p className="text-neutral-500 text-sm font-mono">UI 15 // Logistics Pipeline</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Search shipments..."
                                className="bg-neutral-900/50 border border-neutral-800 rounded-md pl-9 pr-4 py-2 text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#00FFAA]"
                            />
                        </div>
                        <button className="p-2 rounded-full hover:bg-neutral-800 transition-colors">
                            <Bell className="h-5 w-5 text-neutral-400" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-neutral-800 transition-colors">
                            <UserCircle className="h-6 w-6 text-neutral-400" />
                        </button>
                    </div>
                </header>

                {/* Main Content Grid */}
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Shipments Table */}
                    <div className="lg:col-span-2">
                        <ShipmentsTable shipments={shipments} onSelectShipment={handleSelectShipment} selectedShipmentId={selectedShipment?.id} />
                    </div>

                    {/* Right Column: Deal Structuring / Details */}
                    <div className="lg:col-span-1">
                        {selectedShipment ? (
                            <ShipmentDetailsPanel 
                                key={selectedShipment.id} 
                                shipment={selectedShipment} 
                                carriers={carriers}
                                onUpdate={handleUpdateShipment} 
                            />
                        ) : (
                            <div className="h-full bg-cyan-950/10 border border-neutral-800 rounded-lg flex items-center justify-center p-8 backdrop-blur-sm">
                                <div className="text-center">
                                    <Package className="mx-auto h-12 w-12 text-neutral-600" />
                                    <p className="mt-4 text-neutral-500">Select a shipment to view details</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const baseClasses = "px-2.5 py-1 text-xs font-mono font-semibold rounded-full inline-block";
    const statusStyles: any = {
        'In Transit': 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
        'Delivered': 'bg-green-500/10 text-green-400 border border-green-500/30',
        'Pending': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
        'At Pickup': 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
        'Delayed': 'bg-red-500/10 text-red-400 border border-red-500/30',
    };
    return <span className={`${baseClasses} ${statusStyles[status] || 'bg-neutral-700 text-neutral-300'}`}>{status}</span>;
};

const ShipmentsTable = ({ shipments, onSelectShipment, selectedShipmentId }: any) => {
    return (
        <div className="bg-cyan-950/10 border border-neutral-800 rounded-lg backdrop-blur-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-neutral-800">
                <h2 className="text-lg font-semibold text-neutral-100">Active Shipments</h2>
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-neutral-400 uppercase bg-neutral-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Shipment ID</th>
                            <th scope="col" className="px-6 py-3">Route</th>
                            <th scope="col" className="px-6 py-3">Carrier</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {shipments.map((shipment: any) => (
                            <tr
                                key={shipment.id}
                                className={`border-b border-neutral-800 hover:bg-neutral-800/40 transition-colors cursor-pointer ${selectedShipmentId === shipment.id ? 'bg-[#00FFAA]/5' : ''}`}
                                onClick={() => onSelectShipment(shipment)}
                            >
                                <td className="px-6 py-4 font-mono text-[#00FFAA]">{shipment.id}</td>
                                <td className="px-6 py-4 text-neutral-200">
                                    <div className="flex items-center gap-2">
                                        <span>{shipment.origin}</span>
                                        <MoveRight className="w-4 h-4 text-neutral-500" />
                                        <span>{shipment.destination}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{shipment.carrier}</td>
                                <td className="px-6 py-4"><StatusBadge status={shipment.status} /></td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-1 rounded-full hover:bg-neutral-700">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ShipmentDetailsPanel = ({ shipment, carriers, onUpdate }: any) => {
    const [assignedCarrier, setAssignedCarrier] = useState(shipment.carrier);
    const [isBolUploading, setIsBolUploading] = useState(false);
    const [bolFile, setBolFile] = useState<any>(null);

    const handleCarrierChange = (e: any) => {
        setAssignedCarrier(e.target.value);
    };
    
    const handleSave = () => {
        onUpdate({ carrier: assignedCarrier });
    };

    const handleFileChange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            setBolFile(file);
            setIsBolUploading(true);
            setTimeout(() => { // Simulate upload
                setIsBolUploading(false);
                onUpdate({ bol_uploaded: true });
            }, 1500);
        }
    };

    return (
        <div className="bg-cyan-950/15 border border-neutral-800 rounded-lg backdrop-blur-sm p-6 flex flex-col gap-6 h-full overflow-y-auto">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-neutral-100 font-mono">{shipment.id}</h3>
                    <StatusBadge status={shipment.status} />
                </div>
                <div className="flex items-center gap-2 mt-1 text-neutral-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{shipment.origin}</span>
                    <MoveRight className="w-4 h-4 text-neutral-600" />
                    <span>{shipment.destination}</span>
                </div>
            </div>

            {/* Tracking Timeline */}
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-neutral-300">Tracking</h4>
                <div className="relative pl-4 border-l-2 border-neutral-700">
                    {shipment.timeline.map((item: any, index: number) => (
                        <div key={index} className="relative pb-6">
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${index === shipment.timeline.length - 1 ? 'bg-[#00FFAA]' : 'bg-neutral-600'}`}>
                                {index === shipment.timeline.length - 1 && <div className="w-4 h-4 rounded-full bg-[#00FFAA] animate-ping"></div>}
                            </div>
                            <p className="font-semibold text-neutral-200">{item.status}</p>
                            <p className="text-xs text-neutral-500 font-mono">{item.date}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Deal Structuring Form */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-neutral-300 border-t border-neutral-800 pt-4">Assignment & Documents</h4>
                
                {/* Carrier Assignment */}
                <div>
                    <label htmlFor="carrier" className="block text-xs text-neutral-400 mb-1">Assign Carrier</label>
                    <div className="relative">
                        <select
                            id="carrier"
                            value={assignedCarrier}
                            onChange={handleCarrierChange}
                            className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#00FFAA] appearance-none"
                        >
                            <option value="Unassigned">Unassigned</option>
                            {carriers.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                    </div>
                </div>

                {/* BOL Upload */}
                <div>
                    <label className="block text-xs text-neutral-400 mb-1">Bill of Lading (BOL)</label>
                    {shipment.bol_uploaded ? (
                        <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-md p-3">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>BOL Uploaded Successfully</span>
                        </div>
                    ) : (
                        <div className="relative border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center hover:border-[#00FFAA] transition-colors">
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} disabled={isBolUploading}/>
                            <div className="flex flex-col items-center justify-center">
                                <UploadCloud className="h-8 w-8 text-neutral-500 mb-2" />
                                <p className="text-sm text-neutral-400">
                                    {isBolUploading ? "Uploading..." : "Drag & drop or click to upload"}
                                </p>
                                <p className="text-xs text-neutral-600">PDF, JPG, PNG up to 10MB</p>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            <div className="mt-auto pt-6 border-t border-neutral-800">
                <button
                    onClick={handleSave}
                    disabled={assignedCarrier === shipment.carrier}
                    className="w-full bg-[#00FFAA] text-black font-bold py-2.5 rounded-md text-sm hover:bg-opacity-90 transition-all disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Truck className="w-4 h-4"/>
                    <span>Save Assignment</span>
                </button>
            </div>
        </div>
    );
};

export default PushingTransportPage;