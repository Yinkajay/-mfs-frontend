import type { Metadata } from "next";
import { VehiclesGarage } from "@/app/components/dashboard/vehicles-garage";

export const metadata: Metadata = { title: "Vehicles" };

export default function VehiclesPage() {
  return <VehiclesGarage />;
}
