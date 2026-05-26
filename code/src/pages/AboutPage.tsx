import { FAQAccordion } from '../components/AboutComponents';

export default function AboutPage() {
  const faqs = [
    { 
      question: "What is Meridian?", 
      answer: "Meridian is a high-precision data aggregation platform designed to democratize access to South African government statistics. We build automated scrapers that fetch, clean, and normalize disparate datasets into analytical-ready formats." 
    },
    { 
      question: "How often is data updated?", 
      answer: "Most datasets follow a weekly refresh cycle. Our infrastructure checks official portals daily, but significant data releases typically occur on 7-day intervals for sanity and validation purposes." 
    },
    { 
      question: "Can I use this data commercially?", 
      answer: "Yes. All data provided through Meridian is sourced from public government releases. While the data itself is public domain, our normalized schemas are provided under an open-source license for transparency." 
    },
    { 
      question: "How do I report an issue?", 
      answer: "If you detect an anomaly in the data or if a specific dataset is failing to refresh, please contact our engineering team via the 'Institutional Contact' link in the footer." 
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 bg-meridian-beige min-h-[80vh]">
      <div className="grid grid-cols-1 gap-24 lg:grid-cols-12">
        <div className="lg:col-span-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-[1px] w-8 bg-slate-300"></div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">The Platform</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 mb-12 lg:text-6xl max-w-3xl leading-[1.1]">
                Bridging the Gap Between Raw Records and Actionable Insights.
            </h1>
        </div>

        <div className="lg:col-span-7">
          <section className="mb-24">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">About Meridian</h2>
            <div className="prose prose-slate prose-lg lg:prose-xl max-w-none">
              <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                South Africa produces a vast wealth of public interest data, but it is often trapped in inconsistent PDF reports, semi-structured HTML tables, or outdated proprietary spreadsheets.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Meridian serves as the national data infrastructure layer. We automate the arduous process of data collection, normalization, and validation, ensuring that researchers, journalists, and policy analysts can focus on the *interpretation* of data rather than the *extraction* of it.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Frequently Asked Questions</h2>
            <FAQAccordion items={faqs} />
          </section>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="p-12 bg-slate-950 text-white flex flex-col items-start">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-12">Our Stack</h3>
                <h4 className="text-2xl font-bold mb-4 tracking-tight leading-snug">
                    Resilient Engineering for Volatile Sources.
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-8">
                    Built with Next.js, Tailwind CSS, and Framer Motion. Powered by a robust Node.js backend managing a distributed fleet of headless scrapers.
                </p>
                <div className="h-[1px] w-full bg-white/10 mb-8"></div>
                <ul className="space-y-3 text-[10px] font-bold uppercase tracking-widest opacity-60">
                    <li>● REAL-TIME DISCOVERY</li>
                    <li>● SCHEMATIC NORMALIZATION</li>
                    <li>● STATISTICAL VALIDATION</li>
                    <li>● CLOUD NATIVE DELIVERY</li>
                </ul>
            </div>

            <div className="p-12 border border-slate-200 flex flex-col items-start bg-[#F9F9F9]">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Open Metrics</h3>
                <div className="space-y-8 w-full">
                    <div>
                        <span className="block text-4xl font-bold text-slate-950">128+</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Archived Datasets</span>
                    </div>
                    <div>
                        <span className="block text-4xl font-bold text-slate-950">1.2M+</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Rows Processed</span>
                    </div>
                    <div>
                        <span className="block text-4xl font-bold text-slate-950">99.8%</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Scraper Uptime</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
