import { ACADEMY_DATA } from "./academy";

export interface FooterSettings {
  // Admissions Desk
  headquartersAddress: string;
  phone: string;
  phoneDisplay: string;
  email: string;
  operatingHoursDays: string;
  operatingHoursMorning: string;
  operatingHoursEvening: string;
  whatsappNumber: string;
  whatsappButtonText: string;
  trialNote: string;

  // Social Media Handles
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  twitterUrl?: string;
  linkedinUrl?: string;

  // Brand & Highlights
  description: string;
  badge1: string;
  badge2: string;
  brandTagline: string;
  academyName?: string;
}

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  headquartersAddress:
    ACADEMY_DATA.headquartersAddress ||
    "SBA Sports Arena, Near Rajiv Gandhi Indoor Stadium, Kadavanthra, Kochi, Kerala 682020",
  phone: ACADEMY_DATA.phone || "+917907655513",
  phoneDisplay: ACADEMY_DATA.phoneDisplay || "+91 79076 55513",
  email: ACADEMY_DATA.email || "admissions@sabadminton.com",
  operatingHoursDays:
    ACADEMY_DATA.operatingHours?.days || "Monday – Sunday (7 Days Open)",
  operatingHoursMorning:
    ACADEMY_DATA.operatingHours?.morning || "05:30 AM – 10:30 AM",
  operatingHoursEvening:
    ACADEMY_DATA.operatingHours?.evening || "04:00 PM – 10:00 PM",
  whatsappNumber: ACADEMY_DATA.whatsappNumber || "917907655513",
  whatsappButtonText: "WHATSAPP DESK",
  trialNote: "Shoes & racket required for free trial.",
  instagramUrl:
    ACADEMY_DATA.socialLinks?.instagram ||
    "https://instagram.com/sabadmintonacademy",
  facebookUrl:
    ACADEMY_DATA.socialLinks?.facebook ||
    "https://facebook.com/sabadmintonacademy",
  youtubeUrl:
    ACADEMY_DATA.socialLinks?.youtube ||
    "https://youtube.com/@sabadmintonacademy",
  twitterUrl: "",
  linkedinUrl: "",
  description:
    ACADEMY_DATA.description ||
    "SBA Badminton Academy is a premier athletic badminton training institution in Kochi, offering dedicated synthetic court infrastructure, certified coaching faculty, video stroke analysis, and age-specific developmental pathways.",
  badge1: "BWF & NIS CERTIFIED FACULTY",
  badge2: "SPRUNG WOODEN SUBFLOORS",
  brandTagline: "REBEL PERFORMANCE // ATHLETIC TRAINING",
  academyName: ACADEMY_DATA.name || "SBA BADMINTON ACADEMY",
};
