import Navbar from "@/components/ui/navbar";
import DownloadHero from "@/components/sections/download-hero";
import DatasetGrid from "@/components/sections/dataset-grid";
import Footer from "@/components/sections/footer";

export const metadata = {
  title: "Get Datasets — Meridian",
  description: "Download weekly South African government datasets — crime, Eskom, water, housing. Free CSVs ready for Power BI.",
};

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <DownloadHero />
      <DatasetGrid />
      <Footer />
    </main>
  );
}
