import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-5K4ELT6DT0", {
        page_path: location.pathname,
      });
    }
  }, [location]);
}
