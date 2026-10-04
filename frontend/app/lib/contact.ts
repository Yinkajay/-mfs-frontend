const phones = [
  {
    display: "02 291 5288",
    href: "tel:022915288",
    international: "+23422915288",
  },
  {
    display: "0906 000 4617",
    href: "tel:+2349060004617",
    international: "+2349060004617",
  },
  {
    display: "0906 000 8491",
    href: "tel:+2349060008491",
    international: "+2349060008491",
  },
  {
    display: "0812 902 4188",
    href: "tel:+2348129024188",
    international: "+2348129024188",
  },
  {
    display: "0706 235 3922",
    href: "tel:+2347062353922",
    international: "+2347062353922",
  },
] as const;

const locations = [
  {
    label: "Gbagada II office",
    address: "3C Omotayo Adewakun Street, Gbagada II, Lagos, Nigeria",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=3C%20Omotayo%20Adewakun%20Street%2C%20Gbagada%20II%2C%20Lagos%2C%20Nigeria",
  },
  {
    label: "Head office",
    address: "14 Lanre Awolokun Street, Gbagada, Lagos, Nigeria",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=14%20Lanre%20Awolokun%20Street%2C%20Gbagada%2C%20Lagos%2C%20Nigeria",
  },
] as const;

export const CONTACT = {
  phones,
  primaryPhone: phones[1],
  email: "clientservice@mfsservicesng.com",
  emailHref: "mailto:clientservice@mfsservicesng.com",
  locations,
  socials: {
    instagram: {
      label: "Instagram",
      handle: "@mfsservicesng",
      url: "https://www.instagram.com/mfsservicesng/",
    },
    tiktok: {
      label: "TikTok",
      handle: "@mfsservices",
      url: "https://www.tiktok.com/@mfsservices",
    },
  },
} as const;

const whatsappNumber = "2349060004617";

function createWhatsAppUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_REGISTRATION_URL = createWhatsAppUrl(
  "Hello MFS, I want to start my vehicle registration.",
);

export const WHATSAPP_HELP_URL = createWhatsAppUrl(
  "Hello MFS, I need help with my vehicle documents.",
);
