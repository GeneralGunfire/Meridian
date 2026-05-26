import Navbar from "@/components/ui/navbar";
import Hero from "@/components/sections/hero";
import MacBook from "@/components/sections/macbook";
import Features from "@/components/sections/features";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <MacBook />
      <Features />
    </main>
  );
}
