"use client";
import { MacbookScroll } from "@/components/ui/macbook-scroll";

export default function MacBookSection() {
  return (
    <div className="overflow-hidden dark:bg-[#0B0B0F] bg-white w-full">
      <MacbookScroll
        title={
          <span>
            Explore South Africa&apos;s data <br /> in your Power BI dashboard.
          </span>
        }
        src="https://ui.aceternity.com/linear.webp"
        showGradient={false}
      />
    </div>
  );
}
