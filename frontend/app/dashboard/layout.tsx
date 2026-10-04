import type { Metadata } from "next";
import { CustomerShell } from "@/app/components/dashboard/customer-shell";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your MFS vehicle services and account, in one place.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerShell>{children}</CustomerShell>;
}
