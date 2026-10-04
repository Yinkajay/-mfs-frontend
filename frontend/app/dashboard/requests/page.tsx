import type { Metadata } from "next";
import { DashboardEmptyPage } from "@/app/components/dashboard/dashboard-pages";

export const metadata: Metadata = { title: "Requests" };

export default function RequestsPage() {
  return <DashboardEmptyPage section="requests" />;
}
