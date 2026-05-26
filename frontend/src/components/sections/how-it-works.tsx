"use client";
import { motion } from "motion/react";
import { FlipCard } from "@/components/animate-ui/flip-card";
import { Download, Database, BarChart2, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Scrape",
    icon: Download,
    back: "GitHub Actions runs weekly scrapers pulling from SAPS, Eskom & StatsSA official sources.",
  },
  {
    number: "02",
    title: "Store",
    icon: Database,
    back: "Raw CSV & Excel files version-controlled in Git. Full history, always downloadable.",
  },
  {
    number: "03",
    title: "Analyse",
    icon: BarChart2,
    back: "Connect your Power BI to the CSV endpoints. Pre-structured columns ready for DAX.",
  },
  {
    number: "04",
    title: "Visualise",
    icon: Sparkles,
    back: "Animated Remotion video explainers of trends. Embed dashboards or share links.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay },
  }),
};

export default function HowItWorks() {
  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={0}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-[#0a0a0a] sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-base text-neutral-500">
            Four steps from raw government data to polished insights.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={0.1 + i * 0.1}
              >
                <FlipCard
                  front={
                    <div className="flex h-full flex-col justify-between">
                      <span className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
                        {step.number}
                      </span>
                      <div>
                        <Icon className="mb-3 h-7 w-7 text-neutral-700" strokeWidth={1.5} />
                        <p className="text-xl font-semibold text-[#0a0a0a]">{step.title}</p>
                        <p className="mt-1 text-xs text-neutral-400">Hover to learn more</p>
                      </div>
                    </div>
                  }
                  back={
                    <div className="flex h-full flex-col justify-between">
                      <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                        {step.number}
                      </span>
                      <p className="text-sm leading-relaxed text-neutral-300">{step.back}</p>
                    </div>
                  }
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
