'use client';

import React, { useState } from 'react';
import { LayoutDashboard, Film, FileText, Camera, Download, ChevronRight, Search, Bot, UserCircle } from 'lucide-react';
import { NextPage } from 'next';
import Image from 'next/image';

const PushingAssetsPage: NextPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const assetsData: any[] = [
    { id: 'PA001', title: 'Cybertruck_Front_Angle.png', type: 'Image', vin: '7SAKDE928P', thumbnailUrl: '/placeholder-image-1.jpg', url: '#' },
    { id: 'PA002', title: 'ModelS_Interior_Walkthrough.mp4', type: 'Video', vin: '5YJSA1E5XLF', thumbnailUrl: '/placeholder-image-2.jpg', url: '#' },
    { id: 'PA003', title: 'Q4_Performance_Report.pdf', type: 'Report', vin: 'JN1AZ08V3AW', thumbnailUrl: '/placeholder-report.svg', url: '#' },
    { id: 'PA004', title: 'Rivian_R1T_Side_Profile.png', type: 'Image', vin: '7FCTGAAA9N', thumbnailUrl: '/placeholder-image-4.jpg', url: '#' },
    { id: 'PA005', title: 'VIN_7SAKDE928P_Inspection.pdf', type: 'Report', vin: '7SAKDE928P', thumbnailUrl: '/placeholder-report.svg', url: '#' },
    { id: 'PA006', title: 'Lucid_Air_Promo_B-Roll.mov', type: 'Video', vin: 'LP1S8D6EXN', thumbnailUrl: '/placeholder-image-6.jpg', url: '#' },
    { id: 'PA007', title: 'ModelS_Rear_Quarter.png', type: 'Image', vin: '5YJSA1E5XLF', thumbnailUrl: '/placeholder-image-3.jpg', url: '#' },
    { id: 'PA008', title: 'R1T_Offroad_Footage.mp4', type: 'Video', vin: '7FCTGAAA9N', thumbnailUrl: '/placeholder-image-5.jpg', url: '#' },
  ];

  const filteredAssets = assetsData.filter(asset => {
    const matchesFilter = activeFilter === 'All' || asset.type === activeFilter;
    const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase()) || asset.vin.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Image': return <Camera className="h-4 w-4 text-gray-500" />;
      case 'Video': return <Film className="h-4 w-4 text-gray-500" />;
      case 'Report': return <FileText className="h-4 w-4 text-gray-500" />;
      default: return null;
    }
  };

  const NavItem = ({ icon, label, active }: any) => (
    <a href="#" className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${active ? 'bg-cyan-950/20 text-[#00FFAA]' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}>
      {icon}
      <span className="ml-4">{label}</span>
    </a>
  );

  return (
    <div className="bg-black text-gray-300 min-h-screen flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#0A0A0A] border-r border-gray-900 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-900">
          <Bot className="h-7 w-7 text-[#00FFAA]" />
          <h1 className="ml-3 text-lg font-bold text-gray-100 tracking-wider">Pushing<span className="font-light">Assets</span></h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
          <NavItem icon={<Camera className="h-5 w-5" />} label="Asset Pipeline" active={true} />
          <NavItem icon={<Film className="h-5 w-5" />} label="Render Queue" />
          <NavItem icon={<FileText className="h-5 w-5" />} label="Reports" />
        </nav>
        <div className="px-4 py-4 border-t border-gray-900">
           <div className="flex items-center p-2 rounded-md hover:bg-gray-800/50">
            <UserCircle className="w-9 h-9 text-gray-500"/>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-200">Operator</p>
              <p className="text-xs text-gray-500">_session-ax14</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Cinematic Hero */}
        <section className="relative h-[40vh] min-h-[300px] w-full flex items-center justify-center text-center p-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-background-abstract.jpg"
              alt="Abstract background"
              layout="fill"
              objectFit="cover"
              quality={80}
              className="opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-50 tracking-tight">Asset Delivery Pipeline</h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-400 font-mono">
              [UI:14] Automated generation and distribution of vehicle media, marketing collateral, and reports.
            </p>
            <button className="mt-8 flex items-center justify-center bg-[#00FFAA] text-black font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-all duration-200">
              Initiate New Batch
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </section>

        {/* Asset Grid Section */}
        <section className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div className="flex items-center p-1 rounded-lg bg-gray-900/50 border border-gray-800">
                {['All', 'Image', 'Video', 'Report'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${activeFilter === filter ? 'bg-cyan-900/40 text-[#00FFAA]' : 'text-gray-400 hover:bg-gray-800/60'}`}
                  >
                    {filter}s
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by Title or VIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-72 bg-gray-900/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:ring-2 focus:ring-[#00FFAA]/50 focus:border-[#00FFAA] outline-none transition-all duration-200 font-mono text-sm"
                />
              </div>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAssets.map(asset => (
                <div key={asset.id} className="group relative overflow-hidden rounded-lg bg-cyan-950/15 backdrop-blur-sm border border-cyan-900/20 transition-all duration-300 hover:border-cyan-800/60 hover:shadow-2xl hover:shadow-cyan-950/50">
                  <div className="aspect-w-16 aspect-h-9 w-full bg-gray-900">
                     <Image
                        src={asset.thumbnailUrl}
                        alt={asset.title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-200 truncate group-hover:text-[#00FFAA]">{asset.title}</h3>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500 font-mono">
                      <div className="flex items-center gap-2">
                        {getIconForType(asset.type)}
                        <span>{asset.type}</span>
                      </div>
                      <span>VIN: {asset.vin}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href={asset.url} download className="flex items-center gap-2 bg-[#00FFAA] text-black font-bold py-2 px-5 rounded-md text-sm scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
               {filteredAssets.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-600 font-mono">
                    <p>// No assets found matching criteria</p>
                    <p>// Adjust search or filters</p>
                </div>
                )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PushingAssetsPage;