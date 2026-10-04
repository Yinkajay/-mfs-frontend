import type { Metadata } from "next";
import { DashboardAccount } from "@/app/components/dashboard/dashboard-pages";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return <DashboardAccount />;
}
