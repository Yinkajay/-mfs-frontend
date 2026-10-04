import type { Metadata } from "next";
import { AuthPage } from "@/app/components/auth-page";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your MFS Services account.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
