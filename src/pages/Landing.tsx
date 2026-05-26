import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Player } from "@remotion/player";
import { DataVizComposition } from "../compositions/DataViz";
import { ParallaxSection } from "../components/ParallaxSection";
import { AnimatedText } from "../components/AnimatedText";
import { ScrollTrigger3D } from "../components/ScrollTrigger3D";

export const Landing = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scroll on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={scrollRef} className="bg-slate-950 text-slate-50 overflow-x-hidden">
      {/* Hero Section with Remotion Video */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Player
            component={DataVizComposition}
            durationInFrames={150}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            style={{
              width: "100%",
              height: "100%",
            }}
            controls={false}
            loop
            autoPlay
          />
        </div>

        {/* Overlay content */}
        <div className="relative z-10 text-center space-y-8 px-4">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-blue-500 bg-clip-text text-transparent">
              Meridian
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto"
          >
            Real-time South African data at your fingertips
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg font-semibold text-slate-950 hover:shadow-lg hover:shadow-cyan-500/50 transition-shadow"
          >
            Explore Data
          </motion.button>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 bg-cyan-400 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Section 2: What We Scrape */}
      <section className="min-h-screen py-20 px-4 md:px-8 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-6xl mx-auto space-y-20">
          <ParallaxSection offset={-100}>
            <AnimatedText
              text="Comprehensive SA Government Data Collection"
              className="text-5xl md:text-6xl font-bold leading-tight"
              delay={0}
            />
          </ParallaxSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: "Crime Statistics",
                desc: "Weekly crime data from SAPS",
                color: "from-red-500 to-orange-500",
              },
              {
                title: "Energy Loadshedding",
                desc: "Real-time Eskom stage updates",
                color: "from-yellow-500 to-orange-500",
              },
              {
                title: "Water & Sanitation",
                desc: "Municipal water supply metrics",
                color: "from-blue-500 to-cyan-500",
              },
              {
                title: "Housing & Electrification",
                desc: "National housing statistics",
                color: "from-green-500 to-emerald-500",
              },
            ].map((item, index) => (
              <ParallaxSection key={index} offset={-30 - index * 10}>
                <motion.div
                  whileHover={{ scale: 1.05, translateY: -10 }}
                  className={`bg-gradient-to-br ${item.color} p-px rounded-xl overflow-hidden`}
                >
                  <div className="bg-slate-900 rounded-xl p-8 space-y-4">
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <p className="text-slate-300">{item.desc}</p>
                  </div>
                </motion.div>
              </ParallaxSection>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: 3D Rotating Elements */}
      <section className="min-h-screen py-20 px-4 md:px-8 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <ParallaxSection offset={-80}>
            <h2 className="text-5xl md:text-6xl font-bold mb-20">
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                Advanced Visualization
              </span>
            </h2>
          </ParallaxSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              "3D Data Networks",
              "Animated Charts",
              "Real-time Updates",
            ].map((feature, index) => (
              <ScrollTrigger3D key={index}>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 transition-colors h-64 flex items-center justify-center text-center">
                  <div className="space-y-4">
                    <div className="text-4xl">
                      {index === 0 ? "🎯" : index === 1 ? "📊" : "⚡"}
                    </div>
                    <h3 className="text-xl font-bold">{feature}</h3>
                  </div>
                </div>
              </ScrollTrigger3D>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Stats with Counter Animation */}
      <section className="min-h-screen py-20 px-4 md:px-8 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <ParallaxSection offset={-60}>
            <h2 className="text-5xl md:text-6xl font-bold mb-20 text-center">
              By The Numbers
            </h2>
          </ParallaxSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: "Datasets", value: "4" },
              { label: "Updates Weekly", value: "52" },
              { label: "Years of Data", value: "5+" },
              { label: "Data Points", value: "10K+" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-cyan-900/20 to-green-900/20 border border-cyan-500/30 rounded-xl p-8 text-center"
              >
                <div className="text-4xl font-bold text-cyan-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: CTA */}
      <section className="min-h-screen py-20 px-4 md:px-8 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <ParallaxSection offset={-100} className="text-center max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold mb-8"
          >
            Ready to dive into{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              South African Data?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-slate-300 mb-12"
          >
            Explore real-time crime statistics, energy loadshedding updates,
            water metrics, and housing data—all in one immersive platform.
          </motion.p>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <button className="px-12 py-4 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg font-semibold text-slate-950 text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-shadow">
              Access Dashboard
            </button>
          </motion.div>
        </ParallaxSection>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>
            Meridian © 2026 — Real-time South African data visualization
            platform
          </p>
        </div>
      </footer>
    </div>
  );
};
