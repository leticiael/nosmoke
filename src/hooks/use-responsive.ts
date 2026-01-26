"use client";

import { useState, useEffect } from "react";

export default function useResponsive() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateSizes = () => {
        const width = window.innerWidth;
        setIsDesktop(width >= 768);
        setIsMobile(width < 768);
        setIsSmallMobile(width < 360);
      };

      updateSizes();
      window.addEventListener("resize", updateSizes);
      return () => window.removeEventListener("resize", updateSizes);
    }
  }, []);

  return { isDesktop, isMobile, isSmallMobile };
}
