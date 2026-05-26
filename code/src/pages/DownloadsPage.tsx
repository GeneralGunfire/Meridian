import { useState } from 'react';
import { useFiles } from '../hooks/useFiles';
import { DownloadTable } from '../components/DownloadTable';
import { LoadingSpinner } from '../components/AboutComponents';
import { DatasetFiles } from '../types';
import { motion } from 'motion/react';

export default function DownloadsPage() {
  const { data, loading, error } = useFiles();
  const [activeTab, setActiveTab] = useState<keyof DatasetFiles>('crime_stats');

  const tabs: { id: keyof DatasetFiles; label: string }[] = [
    { id: 'crime_stats', label: 'Crime Stats' },
    { id: 'eskom', label: 'Eskom' },
    { id: 'water', label: 'Water' },
    { id: 'housing', label: 'Housing' },
  ];

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 bg-meridian-beige">
        <div className="max-w-md p-8 border border-red-200 bg-red-50 text-center">
            <h2 className="text-red-900 font-bold uppercase tracking-widest text-xs mb-2">Service Error</h2>
            <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 bg-meridian-beige min-h-[80vh]">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-6">
            <div className="h-[1px] w-8 bg-slate-300"></div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Asset Catalog</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 mb-4">Download Datasets</h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
          Access our complete archive of normalized government datasets. Select a category below to browse available releases.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-12 border-b border-slate-100 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-8 py-4 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === tab.id
                ? 'text-slate-950 translate-y-[1px]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950"
              />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {data && data[activeTab] ? (
              <DownloadTable files={data[activeTab]} />
            ) : (
              <div className="py-24 text-center border-2 border-dashed border-slate-100 italic text-slate-400 text-sm">
                No data available for this category.
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
