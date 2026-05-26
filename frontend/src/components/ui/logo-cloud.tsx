"use client";

import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Logo = { src: string; alt: string };
type LogoCloudProps = React.ComponentProps<"div">;

/**
 * Tool logos used in the Meridian stack.
 * Using CDN-stable SVG URLs — simple monochrome marks or wordmarks.
 */
const logos: (Logo & { wide?: boolean })[] = [
  {
    alt: "GitHub",
    src: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/github.svg",
  },
  {
    alt: "Vercel",
    src: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/vercel.svg",
  },
  {
    alt: "Python",
    src: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/python.svg",
  },
  {
    alt: "Power BI",
    src: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/powerbi.svg",
  },
  {
    alt: "Next.js",
    src: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nextdotjs.svg",
  },
  {
    alt: "Tailwind CSS",
    src: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tailwindcss.svg",
  },
  {
    alt: "GitHub Actions",
    src: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/githubactions.svg",
  },
  {
    alt: "PostgreSQL",
    src: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/postgresql.svg",
  },
];

export function LogoCloud({ className, ...props }: LogoCloudProps) {
  return (
    <div
      className={cn(
        "relative grid grid-cols-4 border border-black/12 rounded-xl overflow-hidden",
        className
      )}
      {...props}
    >
      {logos.map((logo, i) => {
        const isLastRow = i >= logos.length - 4;
        const isRightEdge = (i + 1) % 4 === 0;
        return (
          <LogoCard
            key={logo.alt}
            logo={logo}
            className={cn(
              !isRightEdge && "border-r border-black/10",
              !isLastRow && "border-b border-black/10",
              i % 2 === 0 ? "bg-black/2" : "bg-transparent"
            )}
          >
            {/* Plus corners on interior intersections */}
            {!isRightEdge && !isLastRow && (
              <PlusIcon
                className="absolute -right-3 -bottom-3 z-10 size-6 text-black/15"
                strokeWidth={1}
              />
            )}
          </LogoCard>
        );
      })}
    </div>
  );
}

type LogoCardProps = React.ComponentProps<"div"> & { logo: Logo };

function LogoCard({ logo, className, children, ...props }: LogoCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2.5 px-6 py-8",
        className
      )}
      {...props}
    >
      {/* Icon */}
      <img
        alt={logo.alt}
        src={logo.src}
        className="h-7 w-7 select-none opacity-60 grayscale"
        width={28}
        height={28}
      />
      {/* Label */}
      <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
        {logo.alt}
      </span>
      {children}
    </div>
  );
}
