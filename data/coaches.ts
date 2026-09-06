export interface Coach {
  id: string;
  name: string;
  role: string;
  certifications: string[];
  experienceYears: number;
  specialization: string;
  bio: string;
  primaryBranch: string;
  achievements: string[];
  image: string;
}

export const COACHES: Coach[] = [
  {
    id: "anand-varma",
    name: "Coach Anand Varma",
    role: "Head Coach & Technical Director",
    certifications: ["BWF Level 2 Certified Coach", "NIS Diploma in Sports Coaching (Badminton)", "Former Kerala State Senior Champion"],
    experienceYears: 14,
    specialization: "High-Performance Singles & Tactical Match Biomechanics",
    bio: "With over 14 years of professional coaching experience and a decorated state-level playing career, Coach Anand leads the academy's competitive curriculum. He has personally mentored over 25 state ranking medalists and several junior nationals participants.",
    primaryBranch: "Kadavanthra (Headquarters)",
    achievements: [
      "Former Kerala State Senior Men's Singles Champion",
      "Coached 18+ National Championship Qualifiers",
      "Official Coach for Ernakulam District Junior Squad (2021–2024)"
    ],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "shalini-menon",
    name: "Coach Shalini Menon",
    role: "Senior Coach — Junior & Girls Development",
    certifications: ["BWF Level 1 Certified Coach", "BA Physical Education", "South Zone Inter-University Gold Medalist"],
    experienceYears: 9,
    specialization: "Junior Foundation, 6-Point Footwork Agility & Mental Resilience",
    bio: "Coach Shalini specializes in child athletic psychology and early stroke mechanics. Her patient, systematic pedagogy builds rock-solid basics, preventing biomechanical faults and inspiring young athletes to love competitive sport.",
    primaryBranch: "Edappally Branch",
    achievements: [
      "South Zone Inter-University Badminton Gold Medalist",
      "Developed 40+ Girls Junior District Title Contenders",
      "Certified Child Sports Safety & Pedagogy Specialist"
    ],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "rohan-mathew",
    name: "Coach Rohan Mathew",
    role: "Lead Coach — Doubles Strategy & Adult Fitness",
    certifications: ["BWF Level 1 Certified Coach", "NSCA Certified Strength & Conditioning Specialist (CSCS)"],
    experienceYears: 11,
    specialization: "Doubles Fast-Rotations, Steep Smashing & Kinetic Chain Power",
    bio: "A former state doubles champion and CSCS-certified trainer, Coach Rohan coaches our adult batches and competitive doubles pairs. He combines high-tempo multi-shuttle drills with injury-prevention conditioning.",
    primaryBranch: "Kakkanad Branch",
    achievements: [
      "Kerala State Doubles Silver Medalist",
      "Trained 300+ Corporate Tech Athletes in Kochi",
      "Author of 'Kinetic Efficiency in Modern Badminton'"
    ],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "karthik-nair",
    name: "Coach Karthik Nair",
    role: "Assistant Coach & Video Analytics Specialist",
    certifications: ["BWF Level 1 Coach", "Dartfish Certified Video Analyst"],
    experienceYears: 6,
    specialization: "Stroke Biomechanics Video Analysis & Multi-Shuttle Feeds",
    bio: "Coach Karthik oversees our digital video review rooms across branches, breaking down students' racquet angle, court recovery time, and shuttle contact points frame-by-frame to fast-track technical breakthroughs.",
    primaryBranch: "Kadavanthra & Edappally",
    achievements: [
      "Analyzed 1,500+ student match videos",
      "Ernakulam Under-19 District Champion (2018)",
      "Specialist in Rapid Shuttle Machine Drill Programming"
    ],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop"
  }
];
