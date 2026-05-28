"use client";

import { motion } from "motion/react";
import { DataCategoryCard } from "@/components/ui/card-7";
import { DollarSign, Zap, Users, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

const features = [
  {
    title: "Economy",
    subtitle: "5 datasets · SARS, Treasury, StatsSA, SARB",
    overview: "Tax revenue, national budget & spending, GDP macro indicators, monetary policy data, and municipal finances. Official sources, clean CSVs.",
    badge: "5 datasets",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    imageAlt: "Economy data — financial charts",
    logo: <DollarSign className="h-5 w-5 text-white/80" />,
  },
  {
    title: "Energy",
    subtitle: "4 datasets · Eskom Data Portal",
    overview: "Power supply & demand, load-shedding stages, generation infrastructure health (EAF), financial spending and revenue — national and provincial.",
    badge: "4 datasets",
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop",
    imageAlt: "Energy — power station",
    logo: <Zap className="h-5 w-5 text-white/80" />,
  },
  {
    title: "Social",
    subtitle: "3 datasets · StatsSA GHS & QLFS",
    overview: "Water & sanitation access, housing and formal dwellings, unemployment and labour force participation. Up to 15 years of history.",
    badge: "3 datasets",
    imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2244&auto=format&fit=crop",
    imageAlt: "Social — urban community",
    logo: <Users className="h-5 w-5 text-white/80" />,
  },
  {
    title: "Safety",
    subtitle: "3 datasets · SAPS",
    overview: "Crime statistics by province and police station — murder, assault, robbery, sexual offences. Quarterly updates from official SAPS publications.",
    badge: "3 datasets",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop",
    imageAlt: "Safety — law and order",
    logo: <Shield className="h-5 w-5 text-white/80" />,
  },
];

export default function Features() {
  const router = useRouter();

  return (
    <section id="datasets" className="px-4 py-24">
      <div className="mx-auto max-w-7xl">

        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
            15 Datasets · 4 Categories
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#0a0a0a] sm:text-4xl">
            The most comprehensive SA<br className="hidden sm:block" /> government data collection.
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Official sources. Clean CSVs. Up to 15 years of history. Ready for Power BI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
            >
              <DataCategoryCard
                imageUrl={feature.imageUrl}
                imageAlt={feature.imageAlt}
                logo={feature.logo}
                title={feature.title}
                subtitle={feature.subtitle}
                overview={feature.overview}
                badge={feature.badge}
                onExplore={() => router.push("/download")}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
