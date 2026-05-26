import Navbar from "@/components/ui/navbar";
import Hero from "@/components/sections/hero";
import MacBook from "@/components/sections/macbook";
import StatsBar from "@/components/sections/stats-bar";
import Features from "@/components/sections/features";
import HowItWorks from "@/components/sections/how-it-works";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <Hero />
      <MacBook />
      <StatsBar />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
}
