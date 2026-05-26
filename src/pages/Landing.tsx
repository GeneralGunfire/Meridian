import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const Landing = () => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-amber-50 text-black min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-black z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MERIDIAN</h1>
          <div className="space-x-8 hidden md:flex">
            <a href="#data" className="hover:underline">Data</a>
            <a href="#viz" className="hover:underline">Visualization</a>
            <a href="#cta" className="hover:underline">Start</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-white border-b-2 border-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Real-time South African Data
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl">
              Official government crime statistics, energy loadshedding updates, water metrics, and housing data—all in one place. Updated weekly. Always current.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              Explore Data
            </motion.button>
          </motion.div>

          {/* Video placeholder with actual dimensions */}
          <div
            ref={videoRef}
            className="mt-16 w-full bg-black aspect-video flex items-center justify-center text-white text-center"
          >
            <div>
              <div className="text-sm text-gray-400">Remotion Data Visualization</div>
              <div className="text-lg mt-2">30-second animated loop</div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section id="data" className="py-20 px-6 bg-amber-50 border-b-2 border-black">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold mb-16"
          >
            What We Collect
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Crime Statistics",
                source: "SAPS",
                description: "Weekly crime data by province and type from official SAPS database."
              },
              {
                title: "Loadshedding Status",
                source: "Eskom",
                description: "Real-time energy stage updates and load-shedding schedules."
              },
              {
                title: "Water Supply",
                source: "Stats SA",
                description: "Municipal water access and sanitation percentages across regions."
              },
              {
                title: "Housing Data",
                source: "General Household Survey",
                description: "National housing statistics, electrification, and formal dwellings."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white border-2 border-black"
              >
                <div className="text-sm font-semibold text-gray-600 mb-2">SOURCE: {item.source}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-700">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-white border-b-2 border-black">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold mb-16"
          >
            By The Numbers
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Datasets", value: "4" },
              { label: "Updated", value: "Weekly" },
              { label: "Years of Data", value: "5+" },
              { label: "Data Points", value: "10K+" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-amber-50 border-2 border-black text-center"
              >
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="viz" className="py-20 px-6 bg-amber-50 border-b-2 border-black">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold mb-16"
          >
            How It Works
          </motion.h2>

          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Scrape",
                description: "Every week, official SA government data is collected from SAPS, Eskom, Stats SA, and health departments."
              },
              {
                step: "2",
                title: "Store",
                description: "Raw CSV and Excel files are version-controlled in Git, keeping complete historical records."
              },
              {
                step: "3",
                title: "Visualize",
                description: "Data is rendered as animated charts and Power BI dashboards for portfolio and analysis."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="flex gap-6 items-start"
              >
                <div className="text-5xl font-bold text-black bg-white border-2 border-black w-16 h-16 flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-700 text-lg">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-32 px-6 bg-black text-white border-b-2 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-6"
          >
            Start Exploring
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            Access real-time data dashboards and download complete datasets for analysis. All updated weekly with official government sources.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-4 bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors"
          >
            Access Dashboard
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white border-t-2 border-black">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
          <p>MERIDIAN 2026 - Real-time South African Government Data Platform</p>
          <p className="mt-2">Crime Statistics | Energy Loadshedding | Water Supply | Housing Data</p>
        </div>
      </footer>
    </div>
  );
};
