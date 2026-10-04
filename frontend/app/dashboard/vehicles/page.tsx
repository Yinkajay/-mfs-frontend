import type { Metadata } from "next";
import { DashboardEmptyPage } from "@/app/components/dashboard/dashboard-pages";

export const metadata: Metadata = { title: "Vehicles" };

export default function VehiclesPage() {
  return <DashboardEmptyPage section="vehicles" />;
}
