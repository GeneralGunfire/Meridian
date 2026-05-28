"use client";

import { cn } from "@/lib/utils";
import { GitBranch, Database, BarChart2, Share2 } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";

interface StepCardProps {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
  benefits: string[];
}

const StepCard: React.FC<StepCardProps> = ({ icon, title, description, benefits }) => (
  <div
    className={cn(
      "relative rounded-2xl border border-black/10 bg-white/80 p-6 text-[#0a0a0a] backdrop-blur-sm",
      "transition-all duration-300 ease-in-out",
      "hover:scale-[1.03] hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:border-black/20 hover:bg-white"
    )}
  >
    {/* Icon */}
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-black/6 text-[#0a0a0a]">
      {icon}
    </div>
    <h3 className="mb-2 text-lg font-bold">{title}</h3>
    <p className="mb-5 text-sm text-neutral-600 leading-relaxed">{description}</p>
    <ul className="space-y-2.5">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-start gap-2.5">
          <div className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#0a0a0a]" />
          </div>
          <span className="text-xs text-neutral-600 leading-relaxed">{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
);

const stepsData = [
  {
    number: "01",
    icon: <GitBranch className="h-5 w-5" />,
    title: "Scrape",
    description:
      "GitHub Actions fires weekly scrapers against SAPS, Eskom and StatsSA. No manual intervention — if the source is up, the data lands.",
    benefits: [
      "Automated weekly cadence via GitHub Actions",
      "Handles PDFs, Excel, JSON APIs and web scraping",
      "Failures logged to status.json — never crashes the batch",
    ],
  },
  {
    number: "02",
    icon: <Database className="h-5 w-5" />,
    title: "Store",
    description:
      "Every run appends a new dated CSV. Nothing is overwritten. Pull last week's numbers or the full 15-year history — it's all there.",
    benefits: [
      "ISO week naming: crime_stats_2026-W21.csv",
      "Consistent, sortable, predictable schema",
      "Git-versioned — full audit trail",
    ],
  },
  {
    number: "03",
    icon: <BarChart2 className="h-5 w-5" />,
    title: "Connect",
    description:
      "Point Power BI at the CSV URL. Column names stay stable between runs — your DAX measures and relationships don't break on refresh.",
    benefits: [
      "Same schema every week — no surprises",
      "Province, category, count, date in every file",
      "Excel auto-generated on download",
    ],
  },
  {
    number: "04",
    icon: <Share2 className="h-5 w-5" />,
    title: "Publish",
    description:
      "Embed your dashboard or export a video explainer. The data is credible — official sources, cited and versioned.",
    benefits: [
      "Share a link or embed in a report",
      "Official sources — credible for portfolio use",
      "Render animated trend summaries",
    ],
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
          className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end"
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

        {/* Step indicators with connecting line */}
        <div className="relative mx-auto mb-8 w-full">
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] top-4 h-0.5 w-[75%] bg-black/10"
          />
          <div className="relative grid grid-cols-4">
            {stepsData.map((step, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a] font-bold text-xs text-[#f5f0e8] ring-4 ring-[#f5f0e8] z-10">
                  {index + 1}
                </div>
                <span className="hidden text-[10px] font-bold uppercase tracking-widest text-neutral-400 sm:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stepsData.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
            >
              <StepCard
                number={step.number}
                icon={step.icon}
                title={step.title}
                description={step.description}
                benefits={step.benefits}
              />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
