export interface Achievement {
  id: string;
  year: string;
  title: string;
  category: "State Championship" | "District Title" | "National Qualification" | "Academy Milestone";
  athleteOrTeam: string;
  description: string;
  badge: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-1",
    year: "2024",
    title: "Kerala State Junior Championship — Gold & Silver Double",
    category: "State Championship",
    athleteOrTeam: "Arjun K. & Neha Menon (Under-17 Singles)",
    description: "S&A athletes captured both the Boys U-17 Singles Gold and Girls U-17 Singles Silver at the 2024 Kerala State Junior Ranking Tournament held in Thrissur.",
    badge: "Gold & Silver Medals"
  },
  {
    id: "ach-2",
    year: "2024",
    title: "Ernakulam District Overall Champions Trophy",
    category: "District Title",
    athleteOrTeam: "S & A Badminton Academy Squad",
    description: "Secured 14 podium finishes across Under-13, Under-15, and Under-19 categories at the Ernakulam District Badminton Championships, winning the prestigious Best Academy Trophy.",
    badge: "Best Academy Trophy"
  },
  {
    id: "ach-3",
    year: "2023",
    title: "All-India Sub-Junior Ranking Tournament Selection",
    category: "National Qualification",
    athleteOrTeam: "Rishi Rajesh (Under-15 Boys)",
    description: "Ranked among the top 16 seeds in the country after stellar performances across South Zone regional qualifiers.",
    badge: "National Ranking"
  },
  {
    id: "ach-4",
    year: "2023",
    title: "Kochi Corporate Badminton League — 1st Place",
    category: "Academy Milestone",
    athleteOrTeam: "S&A Adult Corporate Team",
    description: "Dominated the 32-team corporate championship featuring top IT and MNC clubs from Infopark and SmartCity Kochi.",
    badge: "Champions 2023"
  },
  {
    id: "ach-5",
    year: "2022",
    title: "South Zone Inter-State Badminton Medals",
    category: "State Championship",
    athleteOrTeam: "Devika Pillai (Girls Under-13)",
    description: "Clinched Bronze in Girls Doubles representing Kerala at the South Zone Badminton Championship in Hyderabad.",
    badge: "Inter-State Bronze"
  }
];
