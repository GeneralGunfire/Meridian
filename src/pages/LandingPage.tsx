import { Hero } from '../components/Hero'
import { DatasetCard } from '../components/DatasetCard'
import { StatusIndicator } from '../components/StatusIndicator'
import { useFiles } from '../hooks/useFiles'
import { LoadingSpinner } from '../components/AboutComponents'
import { motion } from 'motion/react'

export default function LandingPage() {
  const { data, status, loading, error } = useFiles()

  const featured = [
    {
      category: 'Security',
      title: 'Crime Statistics',
      source: 'SAPS',
      description: 'Official quarterly crime data by province and crime type.',
      format: 'CSV/XLSX',
      refreshRate: 'Weekly',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop',
    },
    {
      category: 'Energy',
      title: 'Eskom Data',
      source: 'Eskom',
      description: 'Load shedding schedules and energy metrics.',
      format: 'CSV/XLSX',
      refreshRate: 'Daily',
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=400&auto=format&fit=crop',
    },
    {
      category: 'Utilities',
      title: 'Water Statistics',
      source: 'DWS',
      description: 'Water supply and sanitation access data.',
      format: 'CSV/XLSX',
      refreshRate: 'Annual',
      imageUrl: 'https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?q=80&w=400&auto=format&fit=crop',
    },
    {
      category: 'Housing',
      title: 'Housing Data',
      source: 'Stats SA',
      description: 'Household and housing statistics.',
      format: 'CSV/XLSX',
      refreshRate: 'Annual',
      imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400&auto=format&fit=crop',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Hero />

      {/* Datasets Section */}
      <section className="py-20 px-6 lg:px-8 bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-slate-50 mb-12">Featured Datasets</h2>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="p-8 text-center text-red-400 border border-red-900 bg-red-950/20 rounded">
              <p className="text-sm font-semibold">Error loading data</p>
              <p className="mt-2 text-xs text-red-300">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Status Section */}
      <section className="py-20 px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-slate-50 mb-8">Last Scrape Status</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {status ? (
              (Object.entries(status) as [string, any][]).map(([datasetKey, datasetVal]) => (
                <StatusIndicator
                  key={datasetKey}
                  name={datasetKey.replace('_', ' ')}
                  success={datasetVal.success}
                  lastUpdated={datasetVal.last_updated}
                  error={datasetVal.error}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-sm text-slate-400">
                Loading status...
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
