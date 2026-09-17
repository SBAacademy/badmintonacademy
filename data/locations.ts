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

export const LOCATIONS: Record<string, LocationData> = {
  kadavanthra: {
    slug: "kadavanthra",
    name: "S & A Badminton Academy – Kadavanthra",
    shortName: "Kadavanthra Centre",
    city: "Kochi",
    district: "Ernakulam",
    state: "Kerala",
    country: "India",
    address: "S&A Sports Arena, Near Rajiv Gandhi Indoor Stadium, Kadavanthra, Kochi, Kerala 682020",
    postalCode: "682020",
    phone: ACADEMY_DATA.phone,
    phoneDisplay: ACADEMY_DATA.phoneDisplay,
    whatsapp: ACADEMY_DATA.whatsappNumber,
    whatsappDisplay: ACADEMY_DATA.whatsappDisplay,
    email: "kadavanthra@sabadminton.com",
    latitude: 9.9674,
    longitude: 76.2996,
    googleMapsUrl: "https://maps.google.com/?q=Kadavanthra+Kochi+Kerala",
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15718.324151740924!2d76.2934!3d9.9674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0872c918a38a7d%3A0x892fb6f3dddc8a84!2sKadavanthra%2C%20Kochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000",
    googleBusinessProfileUrl: null, // Client to confirm verified GBP URL
    openingHours: {
      days: "Monday – Sunday (7 Days Open)",
      morning: "05:30 AM – 10:30 AM",
      evening: "04:00 PM – 10:00 PM",
    },
    intro: {
      heading: "Premier Central Kochi Badminton Training Hub",
      subheading: "High-performance coaching infrastructure serving South & Central Ernakulam",
      description: "Located adjacent to SA Road in Kadavanthra, S & A Badminton Academy's central coaching facility offers dedicated multi-court training for players living across Panampilly Nagar, Girinagar, Ravipuram, Elamkulam, and Gandhinagar. Designed for both young foundational athletes and advanced district-level contenders.",
      neighbourhoodsServed: [
        "Kadavanthra",
        "Panampilly Nagar",
        "Girinagar",
        "Ravipuram",
        "Elamkulam",
        "Gandhinagar",
        "Kaloor",
        "Thevara"
      ],
      connectivity: "Directly connected via Sahodaran Ayyappan (SA) Road. Just 3 minutes from Kadavanthra Metro Station and 5 minutes from Ernakulam South Railway Station with dedicated on-site parking.",
    },
    courtInformation: {
      courtCount: 6,
      surfaceType: "BWF-Standard Synthetic Cushion Mat Surface",
      subfloor: "Sprung Wooden Subflooring with Anti-Fatigue Dampeners",
      lightingStandard: "750 Lux Glare-Free Commercial LED Floodlighting",
      ceilingClearance: "9.5 Metre Professional Tournament Clearance",
    },
    facilities: [
      "6 Synthetic Badminton Courts on Sprung Wooden Subflooring",
      "Overhead High-Uniformity Anti-Glare LED Fixtures",
      "Multi-Angle Overhead Video Stroke Correction Rig",
      "Dedicated Strength, Agility & Core Conditioning Area",
      "Pro Shop with Racket Stringing & Badminton Gear",
      "Air-Conditioned Parent Observation Lounge",
      "Separate Men & Women Changing Rooms with Hot Showers",
      "Spacious Secure On-Site Vehicle Parking"
    ],
    programs: [
      {
        name: "Kids Foundation Program",
        slug: "kids-badminton-coaching",
        targetAge: "Ages 5 – 9",
        level: "Beginner to Foundation",
        schedule: "Mon / Wed / Fri: 04:00 PM – 05:30 PM",
        description: "Motor skills, hand-eye coordination, racket grip fundamentals, and court movement games."
      },
      {
        name: "Junior Development Program",
        slug: "junior-badminton-coaching",
        targetAge: "Ages 10 – 16",
        level: "Intermediate",
        schedule: "Tue / Thu / Sat: 04:30 PM – 06:30 PM",
        description: "Stroke consistency, tactical shot selection, footwork split-steps, and match play awareness."
      },
      {
        name: "Elite Competitive Squad",
        slug: "competitive-badminton-training",
        targetAge: "Ages 12+",
        level: "Advanced & Tournament Level",
        schedule: "Mon – Sat: 06:00 AM – 08:30 AM & 05:00 PM – 07:30 PM",
        description: "High-intensity tournament preparation, video stroke analysis, and personalized tactical planning."
      },
      {
        name: "Adult Fitness & Corporate Coaching",
        slug: "adult-badminton-coaching",
        targetAge: "Ages 18+",
        level: "All Adult Levels",
        schedule: "Mon – Fri: 05:30 AM – 07:00 AM & 07:30 PM – 09:30 PM",
        description: "Stamina building, cardiovascular conditioning, injury-preventive biomechanics, and adult doubles strategy."
      }
    ],
    coaches: [
      {
        name: "Senior Coach Anand Varma",
        role: "Head Coach – Central Kochi Hub",
        specialization: "Technical Stroke Mechanics & Junior Competitive Pathways",
        bio: "Former state-ranked singles athlete with over 11 years of coaching development experience across Kerala junior circuits."
      },
      {
        name: "Coach Meera Joseph",
        role: "Lead Youth Coach",
        specialization: "Foundational Footwork & Young Athlete Coordination",
        bio: "Specializes in early childhood athletic literacy, agility training, and progressive hand-eye motor development."
      }
    ],
    gallery: [
      {
        url: "/images/hero-athlete.jpg",
        caption: "High-performance jump-smash training session at Kadavanthra Arena"
      },
      {
        url: "/images/training-coach.jpg",
        caption: "Structured technical footwork drills and multi-shuttle coaching on court"
      }
    ],
    testimonials: [
      {
        quote: "Our 9-year-old son started in the Kids Foundation batch at Kadavanthra. Within 6 months his agility, discipline, and backhand grip improved dramatically.",
        author: "Kavitha Menon",
        role: "Parent, Panampilly Nagar",
        rating: 5
      },
      {
        quote: "The wooden subflooring at Kadavanthra makes an immense difference to knee impact. As a working professional playing at 7 AM, it is the best court in central Kochi.",
        author: "Deepak Thomas",
        role: "Adult Batch Player, Kadavanthra",
        rating: 5
      }
    ],
    achievements: [
      "Over 12 district and state championship medals won by Kadavanthra junior squad members.",
      "Annual training destination for school teams across Ernakulam central district.",
      "100% structured attendance and video progress tracking across all competitive batches."
    ],
    localFAQs: [
      {
        question: "Where is S & A Badminton Academy located in Kadavanthra?",
        answer: "Our Kadavanthra centre is located at S&A Sports Arena near the Rajiv Gandhi Indoor Stadium area, easily accessible via SA Road and just 3 minutes from Kadavanthra Metro Station."
      },
      {
        question: "What badminton coaching programs are available at the Kadavanthra centre?",
        answer: "We offer the Kids Foundation Program (Ages 5–9), Junior Development Program (Ages 10–16), Elite Competitive Squad, Adult Coaching, and Seasonal Badminton Vacation Camps."
      },
      {
        question: "Do you offer badminton classes for beginners and kids in Kadavanthra?",
        answer: "Yes, our foundational batches welcome complete beginners. Coaches group players by age and physical readiness to ensure comfortable, pressure-free progression."
      },
      {
        question: "What are the morning and evening batch timings at Kadavanthra?",
        answer: "Morning training batches operate from 05:30 AM to 08:30 AM. Junior after-school batches run from 04:00 PM to 07:00 PM, followed by adult and corporate evening sessions until 10:00 PM."
      },
      {
        question: "How do I book a free assessment trial at the Kadavanthra centre?",
        answer: "You can book directly by sending a WhatsApp message to our Kadavanthra admissions desk at +91 94006 35548 or submitting the trial booking form on this page."
      }
    ],
    seo: {
      title: "Badminton Academy in Kadavanthra | S & A Badminton Academy Kochi",
      description: "Looking for badminton coaching in Kadavanthra? S & A Badminton Academy offers structured badminton training for kids, juniors, adults & competitive athletes in Kadavanthra, Kochi.",
      primaryKeyword: "badminton academy in Kadavanthra",
      secondaryKeywords: [
        "badminton coaching in Kadavanthra",
        "badminton classes in Kadavanthra",
        "badminton training in Kadavanthra",
        "badminton academy Kadavanthra",
        "badminton coaching Kadavanthra"
      ],
      relatedKeywords: [
        "kids badminton coaching Kadavanthra",
        "junior badminton coaching Kadavanthra",
        "adult badminton coaching Kadavanthra",
        "badminton training for beginners Kadavanthra",
        "competitive badminton coaching Kadavanthra",
        "badminton academy near Kadavanthra"
      ]
    }
  },

  edappally: {
    slug: "edappally",
    name: "S & A Badminton Academy – Edappally",
    shortName: "Edappally Centre",
    city: "Kochi",
    district: "Ernakulam",
    state: "Kerala",
    country: "India",
    address: "S&A Sports Complex, Behind Lulu Mall, NH 66 Bypass, Edappally, Kochi, Kerala 682024",
    postalCode: "682024",
    phone: ACADEMY_DATA.phone,
    phoneDisplay: ACADEMY_DATA.phoneDisplay,
    whatsapp: ACADEMY_DATA.whatsappNumber,
    whatsappDisplay: ACADEMY_DATA.whatsappDisplay,
    email: "edappally@sabadminton.com",
    latitude: 10.0261,
    longitude: 76.3125,
    googleMapsUrl: "https://maps.google.com/?q=Edappally+Kochi+Kerala",
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15715.421683416045!2d76.305!3d10.0261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d0d1e3d3c8d%3A0x6a05e2b02a9e1e3b!2sEdappally%2C%20Kochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000",
    googleBusinessProfileUrl: null, // Client to confirm verified GBP URL
    openingHours: {
      days: "Monday – Sunday (7 Days Open)",
      morning: "05:30 AM – 10:00 AM",
      evening: "04:00 PM – 09:30 PM",
    },
    intro: {
      heading: "North Kochi's Premier Badminton Coaching Centre",
      subheading: "Conveniently located near Lulu Mall, NH Bypass & Edappally Metro",
      description: "Serving North Kochi families, school students, and professionals across Edappally, Palarivattom, Kalamassery, Cheranallur, and Aluva. The Edappally centre combines international-grade synthetic cushion courts with disciplined age-specific coaching curriculums.",
      neighbourhoodsServed: [
        "Edappally",
        "Palarivattom",
        "Kalamassery",
        "Cheranallur",
        "Aluva",
        "Padivattom",
        "Mamangalam",
        "Vennala"
      ],
      connectivity: "Strategically located just off the NH 66 Bypass behind Lulu Mall. 4 minutes from Edappally Metro Station with hassle-free parking and rapid corridor access to Kalamassery and Palarivattom.",
    },
    courtInformation: {
      courtCount: 4,
      surfaceType: "BWF Grade-1 Approved Multi-Layer Synthetic Mat Surface",
      subfloor: "Shock-Absorbent Resilient Wood Subflooring",
      lightingStandard: "600 Lux Shadow-Free LED Sports Fixtures",
      ceilingClearance: "9.0 Metre Clear Vertical Height",
    },
    facilities: [
      "4 International-Standard Synthetic Badminton Courts",
      "Uniform Overhead Anti-Glare Sports LED Lighting",
      "Junior Physical Agility & Speed Training Zone",
      "Player Hydration & Recovery Station",
      "Clean Dressing Rooms and Restrooms",
      "Comfortable Parent Seating Gallery",
      "Dedicated On-Site Two-Wheeler & Car Parking"
    ],
    programs: [
      {
        name: "Kids Foundation Badminton",
        slug: "kids-badminton-coaching",
        targetAge: "Ages 5 – 9",
        level: "Beginner",
        schedule: "Mon / Wed / Fri: 04:30 PM – 05:45 PM",
        description: "Engaging drills developing natural racket sense, balance, court agility, and sports discipline."
      },
      {
        name: "Junior Competitive Coaching",
        slug: "junior-badminton-coaching",
        targetAge: "Ages 10 – 16",
        level: "Intermediate & Advanced",
        schedule: "Daily Afternoon Batches: 05:00 PM – 07:00 PM",
        description: "Comprehensive stroke rep, multi-shuttle speed drills, footwork recovery, and singles/doubles strategy."
      },
      {
        name: "Adult Morning & Evening Training",
        slug: "adult-badminton-coaching",
        targetAge: "Ages 18+",
        level: "Beginner to Advanced Adult",
        schedule: "06:00 AM – 08:00 AM & 07:30 PM – 09:30 PM",
        description: "Cardio conditioning, technical stroke correction, rally endurance, and friendly competitive match play."
      }
    ],
    coaches: [
      {
        name: "Coach Rahul Narayanan",
        role: "Head Coach – North Kochi Hub",
        specialization: "Advanced Singles Footwork & Junior Competitive Conditioning",
        bio: "Over 8 years of professional coaching experience preparing junior players for district and state ranking events."
      }
    ],
    gallery: [
      {
        url: "/images/training-coach.jpg",
        caption: "Junior coaching drill and rally precision at the Edappally centre"
      },
      {
        url: "/images/hero-athlete.jpg",
        caption: "Competitive smash practice on synthetic tournament courts"
      }
    ],
    testimonials: [
      {
        quote: "Finding high quality coaching near Edappally Metro was a game changer for our daughter. The structured coaching batches here transformed her serve and footwork.",
        author: "Sunil Kumar",
        role: "Parent, Kalamassery",
        rating: 5
      }
    ],
    achievements: [
      "Consistent podium finishes in North Ernakulam inter-school tournaments.",
      "Strong adult training community with morning fitness leagues."
    ],
    localFAQs: [
      {
        question: "Where is S & A Badminton Academy in Edappally?",
        answer: "Our Edappally academy is situated conveniently off the NH 66 Bypass behind Lulu Mall, just 4 minutes from the Edappally Metro Station."
      },
      {
        question: "Are badminton classes available for kids and school students in Edappally?",
        answer: "Yes, we run dedicated after-school batches for kids (ages 5–9) and juniors (ages 10–16) with coaches focused on technical foundations and agility."
      },
      {
        question: "How do I enroll in adult badminton classes at Edappally?",
        answer: "We offer early morning (06:00 AM) and late evening (07:30 PM) adult batches. Send a WhatsApp message to +91 94006 35548 to verify slot availability."
      },
      {
        question: "Is vehicle parking provided at the Edappally centre?",
        answer: "Yes, secure on-site parking for both cars and two-wheelers is provided for all registered students and parents."
      }
    ],
    seo: {
      title: "Badminton Academy in Edappally | S & A Badminton Academy Kochi",
      description: "Looking for badminton coaching in Edappally? S & A Badminton Academy near Lulu Mall provides premier badminton coaching for kids, juniors, and adults in Edappally, Kochi.",
      primaryKeyword: "badminton academy in Edappally",
      secondaryKeywords: [
        "badminton coaching in Edappally",
        "badminton classes in Edappally",
        "badminton training in Edappally",
        "badminton academy Edappally",
        "badminton coaching Edappally"
      ],
      relatedKeywords: [
        "kids badminton coaching Edappally",
        "junior badminton academy Edappally",
        "adult badminton classes Edappally",
        "competitive badminton coaching Edappally",
        "badminton academy near Edappally",
        "badminton classes for beginners Edappally"
      ]
    }
  },

  kakkanad: {
    slug: "kakkanad",
    name: "S & A Badminton Academy – Kakkanad",
    shortName: "Kakkanad Centre",
    city: "Kochi",
    district: "Ernakulam",
    state: "Kerala",
    country: "India",
    address: "S&A Badminton Center, Seaport-Airport Road, Near Infopark Expressway, Kakkanad, Kochi, Kerala 682030",
    postalCode: "682030",
    phone: ACADEMY_DATA.phone,
    phoneDisplay: ACADEMY_DATA.phoneDisplay,
    whatsapp: ACADEMY_DATA.whatsappNumber,
    whatsappDisplay: ACADEMY_DATA.whatsappDisplay,
    email: "kakkanad@sabadminton.com",
    latitude: 10.0159,
    longitude: 76.3419,
    googleMapsUrl: "https://maps.google.com/?q=Kakkanad+Kochi+Kerala",
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15716.42588371842!2d76.335!3d10.0159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080c8e54b6c33d%3A0x6bb83b0f5b1285cb!2sKakkanad%2C%20Kochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000",
    googleBusinessProfileUrl: null, // Client to confirm verified GBP URL
    openingHours: {
      days: "Monday – Sunday (7 Days Open)",
      morning: "05:00 AM – 10:30 AM",
      evening: "04:00 PM – 11:00 PM",
    },
    intro: {
      heading: "Kakkanad's High-Performance Badminton Hub Near Infopark",
      subheading: "Extended hours, corporate flexibility, and intensive youth development",
      description: "Situated on Seaport-Airport Road minutes from Infopark and SmartCity, our Kakkanad centre serves tech professionals, resident families, and young athletes across Kakkanad, Thrikkakara, Vazhakkala, and Rajagiri valley.",
      neighbourhoodsServed: [
        "Kakkanad",
        "Infopark & SmartCity",
        "Thrikkakara",
        "Vazhakkala",
        "Padamugal",
        "Kalamassery South",
        "Chittethukara"
      ],
      connectivity: "Conveniently accessible along Seaport-Airport Road, 3 minutes from Infopark Main Gate. Offers extended morning and late-evening batch schedules suited for IT working hours.",
    },
    courtInformation: {
      courtCount: 4,
      surfaceType: "BWF-Approved Olympic Green Vinyl Cushion Mats",
      subfloor: "Shock-Absorbing Engineered Hardwood Base",
      lightingStandard: "700 Lux Glare-Free Shadow-Eliminating LED Sports Illumination",
      ceilingClearance: "9.2 Metre Clear Height",
    },
    facilities: [
      "4 Synthetic Courts with Wooden Base Layer Protection",
      "700 Lux Commercial Sports Lighting Fixtures",
      "Speed, Agility & Core Strength Conditioning Area",
      "Changing Rooms and Hot Showers for Working Professionals",
      "Racket Restringing and Equipment Support Desk",
      "Spacious Vehicle Parking with 24/7 Security"
    ],
    programs: [
      {
        name: "Kids Foundation Badminton",
        slug: "kids-badminton-coaching",
        targetAge: "Ages 5 – 9",
        level: "Beginner",
        schedule: "Mon / Wed / Fri: 04:30 PM – 05:45 PM",
        description: "Coordination games, fundamental swing mechanics, and court safety basics."
      },
      {
        name: "Junior Competitive Program",
        slug: "junior-badminton-coaching",
        targetAge: "Ages 10 – 16",
        level: "Intermediate & Advanced",
        schedule: "Tue / Thu / Sat: 05:00 PM – 07:00 PM",
        description: "Footwork speed, deceptive drop shots, power smash generation, and match mental composure."
      },
      {
        name: "Corporate & Adult Coaching",
        slug: "adult-badminton-coaching",
        targetAge: "Ages 18+",
        level: "All Adult Levels",
        schedule: "Early Bird 05:00 AM – 07:00 AM & Night Owl 08:00 PM – 10:30 PM",
        description: "Flexible attendance model for tech professionals, stamina building, and match play coaching."
      }
    ],
    coaches: [
      {
        name: "Coach Sarath Chandran",
        role: "Head Coach – Kakkanad Hub",
        specialization: "Advanced Doubles Tactics & Athletic Conditioning",
        bio: "Former university championship team captain with 7+ years of coaching junior district athletes and corporate executives."
      }
    ],
    gallery: [
      {
        url: "/images/hero-athlete.jpg",
        caption: "Late evening competitive training match play at Kakkanad"
      },
      {
        url: "/images/training-coach.jpg",
        caption: "Multi-shuttle technical drill session with coach"
      }
    ],
    testimonials: [
      {
        quote: "Working at Infopark, having the 8:00 PM coaching batch at S&A Kakkanad is fantastic. Great wooden courts, coaching feedback, and professional environment.",
        author: "Arjun Radhakrishnan",
        role: "Software Architect, Infopark Kakkanad",
        rating: 5
      }
    ],
    achievements: [
      "Official training destination for corporate badminton teams across Infopark Kochi.",
      "Rapidly expanding junior squad with top-4 placements in Ernakulam district opens."
    ],
    localFAQs: [
      {
        question: "Where is the S & A Badminton Academy centre located in Kakkanad?",
        answer: "Our Kakkanad facility is on Seaport-Airport Road near the Infopark Expressway, only 3 minutes from the Infopark Main Gate."
      },
      {
        question: "Are late evening badminton batches available in Kakkanad for IT professionals?",
        answer: "Yes, we run dedicated corporate batches from 08:00 PM to 10:30 PM on weekdays with shower and locker facilities."
      },
      {
        question: "Can kids join badminton coaching at the Kakkanad centre?",
        answer: "Yes, our youth programs run from 04:30 PM to 07:00 PM with age-specific coaching batches for ages 5 to 16."
      },
      {
        question: "How can I book a trial session at Kakkanad?",
        answer: "Reach our Kakkanad desk via WhatsApp at +91 94006 35548 or submit the quick assessment form on this page."
      }
    ],
    seo: {
      title: "Badminton Academy in Kakkanad | S & A Badminton Academy Kochi",
      description: "Looking for badminton coaching in Kakkanad near Infopark? S & A Badminton Academy provides expert badminton training for kids, juniors, adults & IT professionals in Kakkanad.",
      primaryKeyword: "badminton academy in Kakkanad",
      secondaryKeywords: [
        "badminton coaching in Kakkanad",
        "badminton classes in Kakkanad",
        "badminton training in Kakkanad",
        "badminton academy Kakkanad",
        "badminton coaching Kakkanad"
      ],
      relatedKeywords: [
        "kids badminton coaching Kakkanad",
        "junior badminton coaching Kakkanad",
        "adult badminton classes Kakkanad",
        "competitive badminton coaching Kakkanad",
        "badminton academy near Kakkanad",
        "badminton coaching near Infopark Kakkanad"
      ]
    }
  },

  "fourth-centre": {
    slug: "fourth-centre",
    name: "S & A Badminton Academy – [FACILITY_NAME], [AREA]",
    shortName: "[AREA] Centre",
    city: "Kochi",
    district: "Ernakulam",
    state: "Kerala",
    country: "India",
    address: "[FACILITY_ADDRESS], [AREA], Kochi, Kerala [PINCODE]",
    postalCode: "[PINCODE]",
    phone: ACADEMY_DATA.phone,
    phoneDisplay: ACADEMY_DATA.phoneDisplay,
    whatsapp: ACADEMY_DATA.whatsappNumber,
    whatsappDisplay: ACADEMY_DATA.whatsappDisplay,
    email: "info@sabadminton.com",
    latitude: null, // Client to confirm exact GPS coordinates
    longitude: null,
    googleMapsUrl: "https://maps.google.com/?q=Kochi+Kerala",
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125745.74828770425!2d76.2239462!3d9.9826798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d514abec6bf%3A0xbd582caa5844192!2sKochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000",
    googleBusinessProfileUrl: null,
    isPlaceholder: true,
    openingHours: {
      days: "Monday – Sunday (Schedule to be confirmed upon launch)",
      morning: "05:30 AM – 10:00 AM",
      evening: "04:00 PM – 10:00 PM",
    },
    intro: {
      heading: "New S & A Badminton Academy Centre Coming Soon to [AREA]",
      subheading: "Expanding professional badminton coaching excellence across Greater Ernakulam",
      description: "S & A Badminton Academy is preparing to launch our fourth dedicated coaching arena at [AREA], Kochi. This upcoming facility will deliver international-standard synthetic court infrastructure, certified coaching faculty, and comprehensive age-specific developmental pathways.",
      neighbourhoodsServed: [
        "[AREA]",
        "Adjoining residential sectors",
        "Greater Kochi metropolitan area"
      ],
      connectivity: "Prime arterial road connectivity with dedicated parking. Exact address and landmark directions to be finalized upon official launch.",
    },
    courtInformation: {
      courtCount: null, // Client to confirm verified court count
      surfaceType: "BWF-Grade Multi-Layer Synthetic Cushion Surface",
      subfloor: "Shock-Absorbent Resilient Subflooring",
      lightingStandard: "Professional Anti-Glare Sports LED Lighting",
      ceilingClearance: "Tournament Standard Ceiling Height",
    },
    facilities: [
      "BWF-Standard Synthetic Badminton Courts",
      "Overhead Anti-Glare Sports LED Lighting",
      "Dedicated Agility and Fitness Zone",
      "Player Hydration and Rest Area",
      "Separate Men & Women Changing Facilities",
      "Secure On-Site Parking"
    ],
    programs: [
      {
        name: "Kids Foundation Badminton",
        slug: "kids-badminton-coaching",
        targetAge: "Ages 5 – 9",
        level: "Beginner",
        schedule: "Timings to be announced upon opening",
        description: "Fun, structured coaching developing fundamental hand-eye motor skills, racket handling, and movement."
      },
      {
        name: "Junior Player Development",
        slug: "junior-badminton-coaching",
        targetAge: "Ages 10 – 16",
        level: "Intermediate",
        schedule: "Timings to be announced upon opening",
        description: "Technical shot consistency, tactical match awareness, footwork split-steps, and competitive readiness."
      },
      {
        name: "Adult Fitness & Coaching",
        slug: "adult-badminton-coaching",
        targetAge: "Ages 18+",
        level: "All Adult Levels",
        schedule: "Morning and evening batches to be announced",
        description: "Cardiovascular stamina, correct biomechanics, injury prevention, and enjoyable doubles play."
      }
    ],
    coaches: [
      {
        name: "S & A Certified Coaching Faculty",
        role: "Coaching Team – [AREA]",
        specialization: "Structured Player Progression & Technical Mastery",
        bio: "Faculty details and coach appointments will be officially published prior to the launch of the [AREA] arena."
      }
    ],
    gallery: [
      {
        url: "/images/training-coach.jpg",
        caption: "S & A coaching drill demonstration and court mechanics"
      },
      {
        url: "/images/hero-athlete.jpg",
        caption: "Professional jump smash training"
      }
    ],
    testimonials: [
      {
        quote: "S & A Badminton Academy's coaching framework is second to none in Kochi. We are eagerly looking forward to their upcoming centre in [AREA].",
        author: "Parent Representative",
        role: "Kochi Badminton Community",
        rating: 5
      }
    ],
    achievements: [
      "Part of the S & A Badminton Academy training network across Ernakulam.",
      "Standardized multi-tier coaching curriculum overseen by senior academy mentors."
    ],
    localFAQs: [
      {
        question: "When will the S & A Badminton Academy centre in [AREA] open for admissions?",
        answer: "Admissions and trial registration will commence shortly. You can pre-register your interest via WhatsApp at +91 94006 35548 to secure early priority slot access."
      },
      {
        question: "Where will the new fourth centre be located?",
        answer: "The fourth centre is being set up in [AREA], Kochi. The verified address and map link will be published as soon as final facility preparations conclude."
      },
      {
        question: "What coaching programs will be available at this centre?",
        answer: "Like all S & A centres, it will host Kids Foundation (Ages 5–9), Junior Development (Ages 10–16), Adult Coaching, and Seasonal Badminton Camps."
      },
      {
        question: "How can I register my interest or inquire about the upcoming batch?",
        answer: "Send a message to our academy admissions line via WhatsApp at +91 94006 35548 with your name and preferred location to receive launch batch updates."
      }
    ],
    seo: {
      title: "Badminton Academy in [AREA] | S & A Badminton Academy Kochi",
      description: "Upcoming premier badminton academy in [AREA], Kochi by S & A Badminton Academy. Structured badminton coaching programs for kids, juniors, and adults.",
      primaryKeyword: "badminton academy in [AREA]",
      secondaryKeywords: [
        "badminton coaching in [AREA]",
        "badminton classes in [AREA]",
        "badminton training in [AREA]",
        "badminton academy [AREA]"
      ],
      relatedKeywords: [
        "kids badminton coaching [AREA]",
        "junior badminton coaching [AREA]",
        "adult badminton classes [AREA]",
        "competitive badminton coaching [AREA]",
        "badminton academy near [AREA]"
      ]
    }
  }
};

export const LOCATION_SLUGS = Object.keys(LOCATIONS);

export function getLocationBySlug(slug: string): LocationData | undefined {
  return LOCATIONS[slug];
}
