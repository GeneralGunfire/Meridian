import { Hero } from '../components/Hero';
import { DatasetCard } from '../components/DatasetCard';
import { StatusIndicator } from '../components/StatusIndicator';
import { useFiles } from '../hooks/useFiles';
import { LoadingSpinner } from '../components/AboutComponents';
import { motion } from 'motion/react';

export default function LandingPage() {
  const { data, status, loading, error } = useFiles();

  const featured = [
    {
      category: "Security",
      title: "Crime Statistics",
      source: "SAPS Official Releases",
      description: "SAPS quarterly report data digitized and normalized for municipality-level analysis.",
      format: "CSV/XLSX",
      refreshRate: "2 Days Ago",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop"
    },
    {
      category: "Energy",
      title: "Eskom Infrastructure",
      source: "Eskom Data Portal",
      description: "Historical and predictive energy availability factor (EAF) metrics across the grid.",
      format: "API/JSON",
      refreshRate: "4 Hours Ago",
      imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop"
    },
    {
      category: "Utilities",
      title: "Water Access",
      source: "Dept. Water & Sanitation",
      description: "Blue Drop report metrics including purity levels and reservoir health across metros.",
      format: "CSV/PDF",
      refreshRate: "Weekly",
      imageUrl: "https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?q=80&w=800&auto=format&fit=crop"
    },
    {
      category: "Housing",
      title: "Housing Backlog",
      source: "Housing Dev Agency",
      description: "Social housing demand and construction permits across provincial capitals.",
      format: "XLSX/CSV",
      refreshRate: "Monthly",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Trust Bar - Simplified */}
      <section className="bg-meridian-paper py-24 px-6 lg:px-8 border-y border-slate-200/50">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-20">
            <div>
                <h4 className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-950 mb-6">Weekly Updates</h4>
                <p className="text-sm leading-relaxed text-slate-500 font-medium">Automated pipelines perform state-level index refreshes every 7 days. Consistency over volatility.</p>
            </div>
            <div>
                <h4 className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-950 mb-6">Research Ready</h4>
                <p className="text-sm leading-relaxed text-slate-500 font-medium">Normalized schemas designed for immediate high-throughput analysis. No tidying required.</p>
            </div>
            <div>
                <h4 className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-950 mb-6">Open Metrics</h4>
                <p className="text-sm leading-relaxed text-slate-500 font-medium">Public interest data delivered without entry barriers. Democratizing the national narrative.</p>
            </div>
        </div>
      </section>

      {/* CORE REPOSITORIES SECTION - More prominent */}
      <section className="py-32 px-6 lg:px-8 bg-meridian-beige">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-[1px] w-8 bg-slate-300"></div>
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-400">Strategic Curations</span>
              </div>
              <h2 className="text-5xl font-bold tracking-tight text-slate-950 leading-[0.95]">Core Repositories.</h2>
            </div>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="p-12 text-center text-red-500 border border-red-100 bg-red-50/50">
              <p className="text-xs uppercase font-bold tracking-widest">Error fetching repositories</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((item) => (
                <DatasetCard 
                  key={item.title} 
                  category={item.category}
                  title={item.title}
                  source={item.source}
                  description={item.description}
                  format={item.format}
                  refreshRate={item.refreshRate}
                  imageUrl={item.imageUrl}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Methodology Section - Simplified */}
      <section className="bg-meridian-paper py-32 px-6 lg:px-8 border-t border-slate-200/50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-24">
              <h2 className="text-4xl font-bold tracking-tight text-slate-950 mb-6">Our Methodology.</h2>
              <p className="text-base text-slate-500 font-medium max-w-xl leading-relaxed">How we transform raw government records into analytical assets.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: 'Scraping', desc: 'Monitoring over 40 portals to ingest raw PDF, HTML, and XLS daily.' },
              { title: 'Normalization', desc: 'Schema mapping to ensure longitudinal compatibility and data integrity.' },
              { title: 'Validation', desc: 'Statistical anomaly detection and verification for public metrics.' },
              { title: 'Storage', desc: 'Secure delivery via API, CSV, and Parquet for institutional use.' }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-start">
                <span className="text-[10px] font-black text-slate-300 mb-6 tracking-widest">0{idx + 1}</span>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-950 mb-4">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Refresh Status Section */}
      <section className="bg-meridian-paper py-32 px-6 lg:px-8 border-t border-slate-200/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-20 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Infrastructure Health Status</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {status ? (Object.entries(status) as [string, any][]).map(([datasetKey, datasetVal]) => (
              <StatusIndicator
                key={datasetKey}
                name={datasetKey.replace('_', ' ')}
                success={datasetVal.success}
                lastUpdated={datasetVal.last_updated}
                error={datasetVal.error}
              />
            )) : (
                <div className="col-span-full py-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading infrastructure status...</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
