export interface Testimonial {
  id: string;
  name: string;
  role: string;
  branch: string;
  rating: number;
  content: string;
  highlight: string;
  avatarText: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Dr. Sandeep Kurup",
    role: "Parent of Junior Player (Aarav, 11 yrs)",
    branch: "Kadavanthra Branch",
    rating: 5,
    highlight: "Remarkable footwork progress and court discipline",
    content: "My son joined S&A Academy's junior batch two years ago with zero formal coaching. Under Coach Anand, his court footwork, stamina, and match composure improved drastically. He just reached the quarterfinals of the Ernakulam District U-13. The wooden-cushion courts give me complete peace of mind regarding knee health.",
    avatarText: "SK"
  },
  {
    id: "t-2",
    name: "Pooja Varghese",
    role: "Senior Software Architect, Infopark",
    branch: "Kakkanad Branch",
    rating: 5,
    highlight: "Perfect post-work fitness and stress buster",
    content: "I attend the 8:00 PM adult batch at Kakkanad after long hours at Infopark. Coach Rohan's doubles strategy sessions are brilliant. You burn 800 calories in 75 minutes, and the showers are spotlessly clean. It has transformed my energy levels completely.",
    avatarText: "PV"
  },
  {
    id: "t-3",
    name: "Anjana & Rajesh Nambiar",
    role: "Parents of Under-9 Twins",
    branch: "Edappally Branch",
    rating: 5,
    highlight: "Gentle, encouraging coaching for young kids",
    content: "We were worried our 6-year-old twins might find sports training too strict, but Coach Shalini is wonderful with kids. They eagerly pack their rackets every Tuesday and Thursday! The viewing gallery allows us to watch their smiles from above.",
    avatarText: "RN"
  },
  {
    id: "t-4",
    name: "Vivek Gopinath",
    role: "Club League Player & Entrepreneur",
    branch: "Kadavanthra Branch",
    rating: 5,
    highlight: "Video stroke analysis was an eye-opener",
    content: "I had played recreational badminton for 8 years with persistent shoulder ache. Coach Karthik analyzed my smash swing on video and showed how my forearm angle was stressing the rotator cuff. Within three weeks of technique correction, my smashes got steeper with zero pain.",
    avatarText: "VG"
  },
  {
    id: "t-5",
    name: "Meera Krishnakumar",
    role: "Mother of State Rank Player",
    branch: "Kadavanthra Branch",
    rating: 5,
    highlight: "Top-tier coaching and tournament support",
    content: "S&A Badminton Academy does not merely coach; they travel with students for ranking tournaments, provide courtside tactical advice, and manage hydration and warm-ups. A genuinely professional academy in Kerala.",
    avatarText: "MK"
  }
];
