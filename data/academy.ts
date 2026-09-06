export interface AcademyConfig {
  name: string;
  shortName: string;
  tagline: string;
  subheadline: string;
  description: string;
  foundedYear: number;
  phone: string;
  phoneDisplay: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  mainLocation: string;
  headquartersAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  announcement: {
    enabled: boolean;
    badge: string;
    text: string;
    ctaText: string;
    ctaLink: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
  operatingHours: {
    days: string;
    morning: string;
    evening: string;
  };
  // Configurable trust highlights — no exaggerated or unverified numbers
  trustPillars: {
    title: string;
    subtitle: string;
    verified: boolean;
  }[];
  stats: {
    studentsTrained: string;
    coachingLocations: string;
    trainingHoursWeekly: string;
    branchesCount: string;
  };
}

export const ACADEMY_DATA: AcademyConfig = {
  name: "S & A BADMINTON ACADEMY",
  shortName: "S & A Badminton",
  tagline: "Train Hard. Smash Harder. Master The Court.",
  subheadline: "Structured badminton coaching for kids, juniors, adults and competitive players across Kadavanthra, Edappally and Kakkanad.",
  description: "S & A Badminton Academy is a premier athletic badminton training institution in Kochi, offering dedicated synthetic court infrastructure, certified coaching faculty, video stroke analysis, and age-specific developmental pathways.",
  foundedYear: 2018,
  phone: "+919400635548",
  phoneDisplay: "+91 94006 35548",
  whatsappNumber: "919400635548",
  whatsappDisplay: "+91 94006 35548",
  email: "admissions@sabadminton.com",
  mainLocation: "Kochi, Kerala, India",
  headquartersAddress: "S&A Sports Arena, Near Rajiv Gandhi Indoor Stadium, Kadavanthra, Kochi, Kerala 682020",
  city: "Kochi",
  state: "Kerala",
  country: "India",
  postalCode: "682020",
  announcement: {
    enabled: true,
    badge: "2026–27 ADMISSIONS",
    text: "New Training Batches Enrolling Across Kochi • Kadavanthra, Edappally & Kakkanad",
    ctaText: "Book a Free Trial",
    ctaLink: "/contact",
  },
  geo: {
    latitude: 9.9674,
    longitude: 76.2996,
  },
  socialLinks: {
    instagram: "https://instagram.com/sabadmintonacademy",
    facebook: "https://facebook.com/sabadmintonacademy",
    youtube: "https://youtube.com/@sabadmintonacademy",
  },
  operatingHours: {
    days: "Monday – Sunday (7 Days Open)",
    morning: "05:30 AM – 10:30 AM",
    evening: "04:00 PM – 10:00 PM",
  },
  // Grounded, professional trust claims without invented hype
  trustPillars: [
    {
      title: "Professional Coaching",
      subtitle: "Certified coaches & structured drills",
      verified: true,
    },
    {
      title: "3 Training Arenas",
      subtitle: "Kadavanthra · Edappally · Kakkanad",
      verified: true,
    },
    {
      title: "Player Development",
      subtitle: "Stage-specific age & skill curriculums",
      verified: true,
    },
  ],
  stats: {
    studentsTrained: "500+",
    coachingLocations: "3 Arenas",
    trainingHoursWeekly: "60+ Hrs",
    branchesCount: "3",
  },
};
