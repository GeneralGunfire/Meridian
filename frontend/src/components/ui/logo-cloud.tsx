import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Logo = { src: string; alt: string; width?: number; height?: number };
type LogoCloudProps = React.ComponentProps<"div">;

export function LogoCloud({ className, ...props }: LogoCloudProps) {
  return (
    <div className={cn("relative grid grid-cols-2 border-x border-black/10 md:grid-cols-4", className)} {...props}>
      <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t border-black/10" />

      <LogoCard className="relative border-r border-b border-black/10 bg-black/3" logo={{ src: "https://svgl.app/library/github_wordmark_light.svg", alt: "GitHub" }}>
        <PlusIcon className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6 text-black/20" strokeWidth={1} />
      </LogoCard>

      <LogoCard className="border-b border-black/10" logo={{ src: "https://svgl.app/library/vercel_wordmark.svg", alt: "Vercel" }} />

      <LogoCard className="relative border-r border-b border-black/10 bg-black/3" logo={{ src: "https://svgl.app/library/supabase_wordmark_light.svg", alt: "Supabase" }}>
        <PlusIcon className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6 text-black/20 hidden md:block" strokeWidth={1} />
        <PlusIcon className="-bottom-[12.5px] -left-[12.5px] absolute z-10 size-6 text-black/20 hidden md:block" strokeWidth={1} />
      </LogoCard>

      <LogoCard className="border-b border-black/10" logo={{ src: "https://svgl.app/library/microsoft_power_bi.svg", alt: "Power BI" }} />

      <LogoCard className="border-r border-black/10" logo={{ src: "https://svgl.app/library/python-wordmark.svg", alt: "Python" }} />

      <LogoCard className="bg-black/3" logo={{ src: "https://svgl.app/library/notion_wordmark.svg", alt: "Notion" }} />

      <LogoCard className="border-r border-black/10" logo={{ src: "https://svgl.app/library/nextjs_wordmark_light.svg", alt: "Next.js" }} />

      <LogoCard className="bg-black/3" logo={{ src: "https://svgl.app/library/tailwindcss_wordmark.svg", alt: "Tailwind CSS" }} />

      <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b border-black/10" />
    </div>
  );
}

type LogoCardProps = React.ComponentProps<"div"> & { logo: Logo };

function LogoCard({ logo, className, children, ...props }: LogoCardProps) {
  return (
    <div className={cn("flex items-center justify-center bg-[#f5f0e8] px-4 py-8 md:p-8", className)} {...props}>
      <img
        alt={logo.alt}
        className="pointer-events-none h-5 select-none opacity-40 grayscale md:h-6"
        src={logo.src}
        width="auto"
        height="auto"
      />
      {children}
    </div>
  );
}
