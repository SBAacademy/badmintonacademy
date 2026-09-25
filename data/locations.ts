import { ACADEMY_DATA } from "./academy";

export interface LocationOpeningHours {
  days: string;
  morning: string;
  evening: string;
}

export interface LocationProgramInfo {
  name: string;
  slug: string;
  targetAge: string;
  level: string;
  schedule: string;
  description: string;
}

export interface LocationCoachInfo {
  name: string;
  role: string;
  specialization: string;
  bio: string;
}

export interface LocationCourtInfo {
  courtCount: number | null;
  surfaceType: string;
  subfloor: string;
  lightingStandard: string;
  ceilingClearance: string;
}

export interface LocationFAQ {
  question: string;
  answer: string;
}

export interface LocationSEO {
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  relatedKeywords: string[];
}

export interface LocationData {
  slug: string;
  name: string;
  shortName: string;
  city: string;
  district: string;
  state: string;
  country: string;
  address: string;
  postalCode: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappDisplay: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  googleBusinessProfileUrl: string | null;
  openingHours: LocationOpeningHours;
  intro: {
    heading: string;
    subheading: string;
    description: string;
    neighbourhoodsServed: string[];
    connectivity: string;
  };
  courtInformation: LocationCourtInfo;
  facilities: string[];
  programs: LocationProgramInfo[];
  coaches: LocationCoachInfo[];
  gallery: {
    url: string;
    caption: string;
  }[];
  testimonials: {
    quote: string;
    author: string;
    role: string;
    rating: number;
  }[];
  achievements: string[];
  localFAQs: LocationFAQ[];
  seo: LocationSEO;
  image?: string;
  isPlaceholder?: boolean;
}

/**
 * Physical centres are 100% database-driven (Neon PostgreSQL `centres` table).
 * Static hardcoded location dictionaries are deprecated and removed to prevent
 * data duplication or resurrection of deleted centres.
 */
export const LOCATIONS: Record<string, LocationData> = {};

export const LOCATION_SLUGS: string[] = [];

export function getLocationBySlug(slug: string): LocationData | undefined {
  if (!slug) return undefined;
  return LOCATIONS[slug.toLowerCase().trim()];
}

export function getAllLocations(): LocationData[] {
  return [];
}

export function getAllLocationSlugs(): string[] {
  return [];
}
