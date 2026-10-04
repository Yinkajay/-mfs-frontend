import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/app/components/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mfsservicesng.com"),
  title: {
    default: "Vehicle Registration and Renewal in Lagos | MFS Services",
    template: "%s | MFS Services",
  },
  description:
    "Get genuine vehicle registration, licence renewal, insurance, permits and roadworthiness documents in Lagos with pickup and delivery.",
  openGraph: {
    title: "Vehicle documents without losing your day",
    description:
      "Genuine vehicle registration, renewals, insurance and permits for Lagos vehicle owners and fleets.",
    url: "/",
    siteName: "MFS Services",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vehicle documents without losing your day",
    description:
      "Genuine vehicle registration, renewals, insurance and permits in Lagos.",
  },
  icons: {
    icon: "/icon",
    shortcut: "/icon",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ff4f3d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
