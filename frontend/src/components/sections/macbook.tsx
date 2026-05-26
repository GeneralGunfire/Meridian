"use client";
import { MacbookScroll } from "@/components/ui/macbook-scroll";

export default function MacBookSection() {
  return (
    <div className="w-full overflow-hidden bg-[#f5f0e8]">
      <MacbookScroll
        title={
          <span className="text-[#0a0a0a]">
            Explore South Africa&apos;s data <br /> in your Power BI dashboard.
          </span>
        }
        src="https://ui.aceternity.com/linear.webp"
        showGradient={false}
      />
    </div>
  );
}
