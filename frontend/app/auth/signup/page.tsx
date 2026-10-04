import type { Metadata } from "next";
import { AuthPage } from "@/app/components/auth-page";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your MFS Services account.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <AuthPage mode="signup" />;
}
