import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollTrigger3DProps {
  children: ReactNode;
  className?: string;
}

export const ScrollTrigger3D = ({
  children,
  className = "",
}: ScrollTrigger3DProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        start: "top center",
        end: "bottom center",
        scrub: 1,
        markers: false,
      },
      rotationY: 360,
      rotationX: -20,
      z: 100,
      opacity: 0.8,
      ease: "none",
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
};
