export interface Coach {
  id: string;
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
  status?: "ACTIVE" | "INACTIVE";
  isPublished?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
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
