import type { Metadata } from "next";
import { DashboardOverview } from "@/app/components/dashboard/dashboard-pages";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage() {
  return <DashboardOverview />;
}
