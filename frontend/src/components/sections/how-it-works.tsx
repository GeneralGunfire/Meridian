"use client";
import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Scrape",
    summary: "Automated. Every week.",
    body: "GitHub Actions fires weekly scrapers against SAPS, Eskom and StatsSA. No manual intervention — if the source is up, the data lands.",
    detail: "Crime stats, load-shedding stages, water access rates, housing survey figures.",
  },
  {
    number: "02",
    title: "Store",
    summary: "Git-versioned raw files.",
    body: "Every run appends a new dated CSV. Nothing is overwritten. Pull last week's numbers or the full two-year history — it's all there.",
    detail: "ISO week naming: crime_stats_2026-W21.csv — consistent, sortable, predictable.",
  },
  {
    number: "03",
    title: "Connect",
    summary: "Power BI in minutes.",
    body: "Point Power BI at the CSV URL. Column names stay stable between runs — your DAX measures and relationships don't break on refresh.",
    detail: "Same schema every week. Province, category, count, date. No surprises.",
  },
  {
    number: "04",
    title: "Publish",
    summary: "Tell the story.",
    body: "Embed your dashboard or export a Remotion video explainer. The data is credible — official sources, cited and versioned.",
    detail: "Share a link, embed in a report, or render an animated trend summary.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-28">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end"
        >
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">Process</p>
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-[#0a0a0a] sm:text-5xl leading-[1.05]">
              From government<br />portal to dashboard.
            </h2>
          </div>
          <p className="text-base text-neutral-600 leading-relaxed md:max-w-sm md:text-right md:ml-auto">
            Four steps. Fully automated after setup. You focus on the analysis — the pipeline handles the rest.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.06 }}
              className="group grid grid-cols-1 gap-6 border-t border-black/8 py-10 md:grid-cols-[80px_1fr_1fr] md:gap-12 md:items-start hover:bg-white/20 transition-colors duration-300 rounded-xl px-2 md:px-4"
            >
              {/* Number */}
              <div className="flex items-center gap-4 md:block">
                <span className="text-4xl font-bold tracking-tighter text-black/20 select-none leading-none">
                  {step.number}
                </span>
                <span className="text-lg font-bold tracking-tight text-[#0a0a0a] md:hidden">
                  {step.title}
                </span>
              </div>

              {/* Left col */}
              <div>
                <p className="hidden text-xl font-bold tracking-tight text-[#0a0a0a] md:block mb-2">
                  {step.title}
                </p>
                <p className="text-sm font-semibold text-neutral-600 mb-3">{step.summary}</p>
                <p className="text-sm leading-relaxed text-neutral-700">{step.body}</p>
              </div>

              {/* Right col — detail chip */}
              <div className="flex items-start md:justify-end">
                <div className="inline-block rounded-lg border border-black/8 bg-white/60 px-4 py-3 text-xs leading-relaxed text-neutral-700 backdrop-blur-sm max-w-xs">
                  <span className="block font-semibold text-[#0a0a0a] mb-1 uppercase tracking-wide text-[10px]">Example</span>
                  {step.detail}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Closing border */}
          <div className="border-t border-black/8" />
        </div>

      </div>
    </section>
  );
}
