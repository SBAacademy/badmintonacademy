export interface GalleryItem {
  id: string;
  title: string;
  category: "Courts & Arena" | "Training Drills" | "Tournaments" | "Juniors & Camps" | "Coaching Sessions";
  image: string;
  caption: string;
  branch: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g-1",
    title: "Central Arena 6-Court Layout",
    category: "Courts & Arena",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop",
    caption: "BWF Grade-1 certified courts with glare-free 750 Lux overhead LED illumination at Kadavanthra.",
    branch: "Kadavanthra"
  },
  {
    id: "g-2",
    title: "Junior Multi-Shuttle Footwork Drills",
    category: "Training Drills",
    image: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=1200&auto=format&fit=crop",
    caption: "High-cadence corner shadow movement and racquet speed drills under senior coaches.",
    branch: "Edappally"
  },
  {
    id: "g-3",
    title: "District Championship Gold Podium",
    category: "Tournaments",
    image: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=1200&auto=format&fit=crop",
    caption: "S&A athletes celebrating their Under-17 doubles championship triumph in Ernakulam.",
    branch: "Kadavanthra"
  },
  {
    id: "g-4",
    title: "Kids Foundation Agility Games",
    category: "Juniors & Camps",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop",
    caption: "Young beginners developing hand-eye coordination with specialized mini-rackets.",
    branch: "Edappally"
  },
  {
    id: "g-5",
    title: "Adult Prime Evening Corporate Session",
    category: "Coaching Sessions",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop",
    caption: "Corporate athletes training on doubles rotation and tactical smashing in Kakkanad.",
    branch: "Kakkanad"
  },
  {
    id: "g-6",
    title: "Biomechanical Video Analysis Room",
    category: "Coaching Sessions",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    caption: "Frame-by-frame racquet swing velocity and wrist pronation analysis.",
    branch: "Kadavanthra"
  },
  {
    id: "g-7",
    title: "Annual Summer Camp Grand Finals",
    category: "Juniors & Camps",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop",
    caption: "Over 120 summer camp graduates receiving their official certificates and medals.",
    branch: "Kadavanthra"
  },
  {
    id: "g-8",
    title: "North Kochi Training Facility",
    category: "Courts & Arena",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop",
    caption: "Spacious 4-court setup with shock-absorbing subflooring at Edappally.",
    branch: "Edappally"
  }
];
