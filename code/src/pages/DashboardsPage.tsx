import { DashboardCard } from '../components/DashboardCard';

export default function DashboardsPage() {
  const dashboards = [
    { title: "Crime Trends", desc: "Homicides and violent crimes over time by province and precinct.", link: "https://app.powerbi.com" },
    { title: "Eskom Load Shedding", desc: "Historical load shedding stages, energy availability factor (EAF), and grid stability metrics.", link: "https://app.powerbi.com" },
    { title: "Water Access", desc: "Visualizing Blue Drop and Green Drop data across South African municipalities.", link: "https://app.powerbi.com" },
    { title: "Housing Insights", desc: "Demographic breakdowns of housing demand and delivery progress dashboards.", link: "https://app.powerbi.com" }
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 bg-meridian-beige min-h-[80vh]">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-6">
            <div className="h-[1px] w-8 bg-slate-300"></div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Visualization Engine</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 mb-4">Power BI Dashboards</h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
          View analyzed data and longitudinal trends in our curated suite of interactive dashboards.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {dashboards.map((dash) => (
          <DashboardCard 
            key={dash.title} 
            title={dash.title}
            desc={dash.desc}
            link={dash.link}
          />
        ))}
      </div>
      
      <div className="mt-24 p-12 border border-slate-100 bg-[#F9F9F9] flex flex-col items-center text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-950 mb-4">Institutional Integration</h2>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed mb-8">
                Are you looking to embed Meridian data into your own enterprise intelligence tools? We provide custom direct-query connections for government departments.
            </p>
            <button className="text-[10px] font-black uppercase tracking-widest px-6 py-3 border border-slate-950 transition-colors hover:bg-slate-950 hover:text-white">
                Request API Key
            </button>
      </div>
    </div>
  );
}
