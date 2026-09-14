export interface CentreOpeningHours {
  days: string;
  morning: string;
  evening: string;
}

export interface CentreCourtInfo {
  courtCount: number | null;
  surfaceType: string;
  subfloor?: string;
  lightingStandard?: string;
  ceilingClearance?: string;
}

export interface CentreFAQ {
  question: string;
  answer: string;
}

export interface CentreSEO {
  title: string;
  description: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  relatedKeywords?: string[];
}

export interface Centre {
  id: string; // matches slug
  slug: string;
  name: string;
  shortName: string;
  cityArea?: string;
  area?: string;
  city: string;
  district?: string;
  state?: string;
  pincode?: string;
  postalCode?: string;
  address: string;
  phone: string;
  phoneDisplay?: string;
  whatsapp: string;
  whatsappDisplay?: string;
  email: string;
  courtCount: number;
  surfaceType: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  displayOrder: number;
  status: "ACTIVE" | "INACTIVE";
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  image?: string;
  courtImage?: string;
  isPlaceholder?: boolean;
  facilities?: string[];
  openingHours?: CentreOpeningHours;
  intro?: {
    heading: string;
    subheading: string;
    description: string;
    neighbourhoodsServed: string[];
    connectivity: string;
  };
  courtInformation?: CentreCourtInfo;
  programs?: unknown[];
  coaches?: unknown[];
  gallery?: { url: string; caption: string }[];
  testimonials?: unknown[];
  achievements?: string[];
  localFAQs?: CentreFAQ[];
  seo?: CentreSEO;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_CENTRE_IMAGE = "/images/badminton-arena.jpg";
