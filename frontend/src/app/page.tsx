import Navbar from "@/components/ui/navbar";
import Hero from "@/components/sections/hero";
import DataTicker from "@/components/sections/data-ticker";
import StatsBar from "@/components/sections/stats-bar";
import MacBook from "@/components/sections/macbook";
import Features from "@/components/sections/features";
import HowItWorks from "@/components/sections/how-it-works";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <Hero />
      <DataTicker />
      <StatsBar />
      <MacBook />
      <Features />
      <HowItWorks />
    </main>
  );
}
