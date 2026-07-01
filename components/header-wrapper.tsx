"use client";

import { usePathname } from "next/navigation";

export function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide the global PeaPods header on checkout/payment screens to prevent blocking back buttons
  const isPaymentPage = pathname?.startsWith("/payments");

  if (isPaymentPage) {
    return null;
  }

  return <>{children}</>;
}
