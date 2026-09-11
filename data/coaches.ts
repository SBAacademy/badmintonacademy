export interface Coach {
  id: string;
  slug?: string;
  name: string;
  role: string;
  certifications: string[];
  experienceYears: number;
  specialization: string;
  bio: string;
  primaryBranch: string;
  primaryCentre?: string;
  achievements: string[];
  image: string;
  whatsappNumber?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  isPublished?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Normalizes phone/WhatsApp numbers to standard international format without +, spaces, or dashes.
 * e.g., "+91 98460 12345" -> "919846012345"
 * e.g., "9846012345" (10 digits) -> "919846012345"
 */
export function normalizeWhatsAppNumber(input?: string | null): string {
  if (!input || typeof input !== "string") return "";
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Formats a normalized international number for human-friendly display.
 * e.g., "919846012345" -> "+91 98460 12345"
 */
export function formatWhatsAppDisplay(number?: string | null): string {
  if (!number || typeof number !== "string") return "";
  const cleaned = number.replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return number;
}

export const COACHES: Coach[] = [
  {
    id: "sooraj-m-s",
    name: "Sooraj M S",
    role: "Senior Badminton Coach",
    certifications: [
      "BWF Level 1 Certified Coach",
      "NIS CERTIFIED",
      "Bachelors of physical education (BPed)"
    ],
    experienceYears: 10,
    specialization: "Singles Tactical Footwork & Match Conditioning",
    bio: "Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.",
    primaryBranch: "Kadavanthra (Headquarters)",
    primaryCentre: "kadavanthra",
    achievements: [
      "Asia Book & India Book of records Holder for 40 multi shuttle feeds in 27 seconds 2 milli seconds",
      "Ernakulam District Team Head Coach for the years 2022,2023,2024"
    ],
    image: "/images/training-coach.jpg",
    status: "ACTIVE",
    isPublished: true,
    displayOrder: 10
  },
  {
    id: "saniya-george-maijo",
    name: "Saniya George Maijo",
    role: "Sports Nutritionist & Assistant Coach",
    certifications: [],
    experienceYears: 4,
    specialization: "Singles Tactical Footwork & Match Conditioning",
    bio: "Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.",
    primaryBranch: "Kadavanthra (Headquarters)",
    primaryCentre: "kadavanthra",
    achievements: [
      "All India National Championship Kerala Team representative"
    ],
    image: "/images/training-coach.jpg",
    status: "ACTIVE",
    isPublished: true,
    displayOrder: 11
  },
  {
    id: "fayis",
    name: "Fayis",
    role: "Assistant Coach",
    certifications: ["BWF Level 1 Certified Coach"],
    experienceYears: 5,
    specialization: "Singles Tactical Footwork & Match Conditioning",
    bio: "Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.",
    primaryBranch: "Kadavanthra (Headquarters)",
    primaryCentre: "kadavanthra",
    achievements: [],
    image: "/images/training-coach.jpg",
    status: "ACTIVE",
    isPublished: true,
    displayOrder: 12
  },
  {
    id: "robin-biju",
    name: "Robin Biju",
    role: "Assistant Coach",
    certifications: [],
    experienceYears: 4,
    specialization: "Singles Tactical Footwork & Match Conditioning",
    bio: "Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.",
    primaryBranch: "Kadavanthra (Headquarters)",
    primaryCentre: "kadavanthra",
    achievements: [],
    image: "/images/training-coach.jpg",
    status: "ACTIVE",
    isPublished: true,
    displayOrder: 13
  },
  {
    id: "adithyan-s",
    name: "Adithyan S",
    role: "Assistant Coach",
    certifications: [],
    experienceYears: 3,
    specialization: "Singles Tactical Footwork & Match Conditioning",
    bio: "Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.",
    primaryBranch: "Kadavanthra (Headquarters)",
    primaryCentre: "kadavanthra",
    achievements: [
      "Former State Senior Medalist",
      "Coached Ernakulam District Squad"
    ],
    image: "/images/training-coach.jpg",
    status: "ACTIVE",
    isPublished: true,
    displayOrder: 14
  }
];
