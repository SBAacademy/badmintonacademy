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
  subheadline: "Structured badminton coaching for kids, juniors, adults and competitive players across our Kochi training centres.",
  description: "S & A Badminton Academy is a premier athletic badminton training institution in Kochi, offering dedicated synthetic court infrastructure, certified coaching faculty, video stroke analysis, and age-specific developmental pathways.",
  foundedYear: 2018,
  phone: "+917907655513",
  phoneDisplay: "+91 79076 55513",
  whatsappNumber: "917907655513",
  whatsappDisplay: "+91 79076 55513",
  email: "admissions@sabadminton.com",
  mainLocation: "Kochi, Kerala, India",
  headquartersAddress: "S&A Sports Arena, Near Rajiv Gandhi Indoor Stadium, Kadavanthra, Kochi, Kerala 682020",
  city: "Kochi",
  state: "Kerala",
  country: "India",
  postalCode: "682020",
  announcement: {
    enabled: false,
    badge: "ADMISSIONS OPEN",
    text: "New Training Batches Enrolling Across Kochi Centres",
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
      title: "World-Class Courts",
      subtitle: "BWF-standard training arenas across Kochi",
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
    coachingLocations: "5 Centres",
    trainingHoursWeekly: "60+ Hrs",
    branchesCount: "5",
  },
};
