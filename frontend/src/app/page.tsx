import Navbar from "@/components/ui/navbar";
import Hero from "@/components/sections/hero";
import MacBook from "@/components/sections/macbook";
import StatsBar from "@/components/sections/stats-bar";
import Features from "@/components/sections/features";
import HowItWorks from "@/components/sections/how-it-works";
import Footer from "@/components/sections/footer";
import { ScrollReveal3D } from "@/components/ui/scroll-reveal-3d";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <Navbar />

      {/* Hero — no wrapper, it's the entry point */}
      <Hero />

      {/* MacBook — already has its own scroll-driven animation */}
      <MacBook />

      {/* StatsBar — 3D depth pop-up from below */}
      <ScrollReveal3D direction="up">
        <StatsBar />
      </ScrollReveal3D>

      {/* Features — 3D pop-up from below */}
      <ScrollReveal3D direction="up">
        <Features />
      </ScrollReveal3D>

      {/* How It Works — slight tilt from above for variety */}
      <ScrollReveal3D direction="down">
        <HowItWorks />
      </ScrollReveal3D>

      {/* Footer — rises up */}
      <ScrollReveal3D direction="up">
        <Footer />
      </ScrollReveal3D>
    </main>
  );
}
