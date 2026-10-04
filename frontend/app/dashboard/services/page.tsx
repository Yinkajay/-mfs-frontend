import type { Metadata } from "next";
import { DashboardEmptyPage } from "@/app/components/dashboard/dashboard-pages";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return <DashboardEmptyPage section="services" />;
}
