"use client";

import { useEffect, useRef } from "react";
import { driver, type Driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

const COMPLETED_KEY = "temankas:tour:completed";
const ACTIVE_KEY = "temankas:tour:active";

interface TourElement extends HTMLElement {
  __tourClickListener?: (e: MouseEvent) => void;
}

interface UseTourOptions {
  tourId: "dashboard" | "wallets" | "calendar";
  steps: DriveStep[];
  onComplete?: () => void;
}

export function useTour({ tourId, steps, onComplete }: UseTourOptions) {
  const driverRef = useRef<Driver | null>(null);
  const isNavigatingRef = useRef<boolean>(false);

  const hasSeenTour = (): boolean => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(COMPLETED_KEY) === "true";
  };

  const getActiveTour = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACTIVE_KEY);
  };

  const startTour = (force = false) => {
    if (typeof window === "undefined") return;

    // Jika dipaksa (misal klik tombol bantuan), reset status selesai dan mulai dari dashboard
    if (force) {
      localStorage.removeItem(COMPLETED_KEY);
      localStorage.setItem(ACTIVE_KEY, "dashboard");
    }

    // Jika sudah selesai dan tidak dipaksa, jangan jalankan
    if (!force && hasSeenTour()) return;

    // Jika tour sedang aktif tapi bukan untuk halaman ini, jangan jalankan otomatis
    // (kecuali jika ini adalah halaman pertama/dashboard dan belum ada tour aktif)
    const activeTour = getActiveTour();
    if (!force && activeTour && activeTour !== tourId) {
      return;
    }

    // Jika belum ada tour aktif dan belum pernah selesai, set aktif ke dashboard
    if (!force && !activeTour && !hasSeenTour() && tourId === "dashboard") {
      localStorage.setItem(ACTIVE_KEY, "dashboard");
    } else if (!force && !activeTour) {
      // Jika tidak ada tour aktif dan bukan di dashboard, jangan jalankan otomatis
      return;
    }

    // Hancurkan instance sebelumnya jika ada
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    isNavigatingRef.current = false;

    const driverObj = driver({
      showProgress: true,
      steps,
      popoverClass: "driverjs-theme",
      nextBtnText: "Lanjut",
      prevBtnText: "Kembali",
      doneBtnText: "Selesai",
      progressText: "{{current}} dari {{total}}",
      allowClose: true,
      overlayClickBehavior: () => {},
      onHighlighted: (element, step, { driver }) => {
        if (element && step.popover?.onNextClick) {
          const htmlEl = element as TourElement;
          
          // Avoid duplicate listeners
          if (htmlEl.__tourClickListener) {
            htmlEl.removeEventListener("click", htmlEl.__tourClickListener);
          }
          
          const handleElementClick = (e: MouseEvent) => {
            e.preventDefault();
            htmlEl.removeEventListener("click", handleElementClick);
            delete htmlEl.__tourClickListener;
            
            if (step.popover?.onNextClick) {
              step.popover.onNextClick(element, step, {
                config: driver.getConfig(),
                state: driver.getState(),
                driver,
              });
            }
          };
          
          htmlEl.addEventListener("click", handleElementClick);
          htmlEl.__tourClickListener = handleElementClick;
        }
      },
      onDeselected: (element) => {
        if (element) {
          const htmlEl = element as TourElement;
          if (htmlEl.__tourClickListener) {
            htmlEl.removeEventListener("click", htmlEl.__tourClickListener);
            delete htmlEl.__tourClickListener;
          }
        }
      },
      onDestroyStarted: () => {
        // Jika dihancurkan karena navigasi halaman, jangan tandai selesai
        if (isNavigatingRef.current) {
          driverObj.destroy();
          return;
        }

        // Jika dihancurkan karena selesai atau di-skip oleh user
        localStorage.setItem(COMPLETED_KEY, "true");
        localStorage.removeItem(ACTIVE_KEY);
        
        if (onComplete) {
          onComplete();
        }
        
        driverObj.destroy();
      },
    });

    driverRef.current = driverObj;
    driverObj.drive();
  };

  const navigateToNextPage = (targetTourId: "wallets" | "calendar", targetUrl: string, routerPush: (url: string) => void) => {
    if (typeof window === "undefined") return;
    
    // Set flag navigasi agar onDestroyStarted tahu kita sedang berpindah halaman
    isNavigatingRef.current = true;
    
    // Set tour aktif berikutnya
    localStorage.setItem(ACTIVE_KEY, targetTourId);
    
    // Pindah halaman
    routerPush(targetUrl);
    
    // Hancurkan driver saat ini
    if (driverRef.current) {
      driverRef.current.destroy();
    }
  };

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  return {
    startTour,
    navigateToNextPage,
    hasSeenTour: hasSeenTour(),
    isActive: getActiveTour() === tourId,
  };
}
