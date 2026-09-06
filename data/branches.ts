export interface Branch {
  slug: string;
  name: string;
  shortName: string;
  cityArea: string;
  tagline: string;
  description: string;
  isHeadquarters: boolean;
  courtsCount: number;
  courtType: string;
  lightingStandard: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  phoneDisplay: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  timings: {
    morning: string;
    evening: string;
    days: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  googleMapEmbedUrl: string;
  googleMapDirectionsUrl: string;
  facilities: string[];
  headCoachName: string;
  programsAvailable: string[];
  image: string;
  courtImage: string;
  localSeoContent: {
    heading: string;
    intro: string;
    whyThisBranch: string;
    connectivity: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const BRANCHES: Branch[] = [
  {
    slug: "kadavanthra",
    name: "S & A Badminton Academy — Kadavanthra (Central Kochi HQ)",
    shortName: "Kadavanthra Branch",
    cityArea: "Kadavanthra, Central Kochi",
    tagline: "Our Flagship 6-Court High-Performance Training Facility",
    description: "Located in the heart of Central Kochi minutes from Rajiv Gandhi Indoor Stadium and South Metro Station, our Kadavanthra headquarters features 6 international BWF-standard synthetic courts laid over sprung teakwood, overhead anti-glare sports lighting, pro shop, and dedicated video analysis rigs.",
    isHeadquarters: true,
    courtsCount: 6,
    courtType: "BWF Grade-1 Certified Yonex Synthetic Mats on Sprung Teakwood Subfloor",
    lightingStandard: "750 Lux Anti-Glare Diffused LED Sports Luminescence",
    address: "S&A Sports Arena, Near Rajiv Gandhi Indoor Stadium, Kadavanthra Junction, Kochi, Kerala 682020",
    landmark: "Near Rajiv Gandhi Indoor Stadium, Kadavanthra",
    city: "Kochi",
    state: "Kerala",
    pincode: "682020",
    phone: "+919400635548",
    phoneDisplay: "+91 94006 35548",
    whatsappNumber: "919400635548",
    whatsappDisplay: "+91 94006 35548",
    email: "kadavanthra@sabadminton.com",
    timings: {
      morning: "05:30 AM – 10:30 AM",
      evening: "04:00 PM – 10:00 PM",
      days: "Open 7 Days a Week",
    },
    geo: {
      latitude: 9.9674,
      longitude: 76.2996,
    },
    googleMapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15718.324151740924!2d76.2934!3d9.9674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0872c918a38a7d%3A0x892fb6f3dddc8a84!2sKadavanthra%2C%20Kochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000",
    googleMapDirectionsUrl: "https://maps.google.com/?q=Kadavanthra+Kochi+Kerala",
    facilities: [
      "6 BWF Grade-1 Synthetic Courts on Sprung Wooden Flooring",
      "Overhead 750 Lux Glare-Free LED Floodlighting",
      "HD Overhead 4-Angle Video Stroke Analysis Rig",
      "Air-Conditioned Parent Viewing Lounge with Free Wi-Fi",
      "Dedicated Strength & Agility Conditioning Zone",
      "Pro Shop with Yonex/Victor Racket Stringing & Gear",
      "Separate Men & Women Dressing Rooms with Hot Showers",
      "Secure Car & Two-Wheeler Parking (35+ vehicles)"
    ],
    headCoachName: "Coach Anand Varma (NIS Certified & Ex-National Player)",
    programsAvailable: [
      "Kids Foundation Program",
      "Junior Development Program",
      "Elite Competitive Squad",
      "Adult Morning & Evening Coaching",
      "Summer & Vacation Camps"
    ],
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop",
    courtImage: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop",
    localSeoContent: {
      heading: "Premier Badminton Coaching in Kadavanthra, Panampilly Nagar & Girinagar",
      intro: "S & A Badminton Academy at Kadavanthra serves families, school students, and working professionals across Central Kochi, including Kadavanthra, Panampilly Nagar, Girinagar, Ravipuram, Elamkulam, and Gandhinagar.",
      whyThisBranch: "As our central headquarters, Kadavanthra accommodates our largest coaching staff and our signature Elite Competitive Squad. With 6 shock-absorbing wooden courts, players experience 60% less joint impact than cement or plain tiled floors.",
      connectivity: "Easily accessible from Sahodaran Ayyappan (SA) Road, 3 minutes from Kadavanthra Metro Station and 5 minutes from Ernakulam South Railway Station."
    },
    faqs: [
      {
        question: "How do I book a court or trial session at Kadavanthra?",
        answer: "You can book directly by sending a WhatsApp message to our Kadavanthra desk at +91 94006 35548 or submitting our online trial booking form."
      },
      {
        question: "What are the coaching batch timings at Kadavanthra?",
        answer: "We run early morning batches (05:30 AM – 08:30 AM), afternoon junior sessions (04:00 PM – 06:30 PM), and prime corporate evening batches (07:00 PM – 10:00 PM)."
      },
      {
        question: "Is car parking available at the Kadavanthra academy?",
        answer: "Yes, our dedicated on-site parking facility accommodates up to 35 cars and 50 two-wheelers with security surveillance."
      }
    ]
  },
  {
    slug: "edappally",
    name: "S & A Badminton Academy — Edappally (North Kochi Hub)",
    shortName: "Edappally Branch",
    cityArea: "Edappally, North Kochi",
    tagline: "4 International Grade Courts Near Lulu Mall & Metro Station",
    description: "Serving North Kochi, Palarivattom, Kalamassery, and Aluva, our Edappally branch is situated right near Edappally Toll and Metro Station. Built with premium shock-absorbent vinyl-wood subfloors, this academy offers prime morning and evening batches for kids and adults.",
    isHeadquarters: false,
    courtsCount: 4,
    courtType: "BWF Grade-1 Approved Multi-Layer Synthetic Cushion Surface",
    lightingStandard: "600 Lux High-Uniformity Glare-Free LED Fixtures",
    address: "S&A Sports Complex, Behind Lulu Mall, NH 66 Bypass, Edappally, Kochi, Kerala 682024",
    landmark: "Behind Lulu Mall, near Edappally Metro Station",
    city: "Kochi",
    state: "Kerala",
    pincode: "682024",
    phone: "+919400635548",
    phoneDisplay: "+91 94006 35548",
    whatsappNumber: "919400635548",
    whatsappDisplay: "+91 94006 35548",
    email: "edappally@sabadminton.com",
    timings: {
      morning: "05:30 AM – 10:00 AM",
      evening: "04:00 PM – 09:30 PM",
      days: "Open 7 Days a Week",
    },
    geo: {
      latitude: 10.0261,
      longitude: 76.3087,
    },
    googleMapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15716.425881028712!2d76.3025!3d10.0261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d85023924f3%3A0x6335a9d1844bdf9f!2sEdappally%2C%20Kochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000",
    googleMapDirectionsUrl: "https://maps.google.com/?q=Edappally+Kochi+Kerala",
    facilities: [
      "4 International-Standard Synthetic Badminton Courts",
      "High-Ceiling Ventilation & Anti-Glare LED System",
      "Fitness & Plyometric Conditioning Floor",
      "Racket Restringing & Sports Nutrition Kiosk",
      "Shower & Locker Rooms",
      "Viewing Balcony for Parents and Spectators",
      "Dedicated Shuttle van pickup for neighboring schools",
      "Spacious Parking Area"
    ],
    headCoachName: "Coach Shalini Menon (BWF Level 1 Certified & State Medalist)",
    programsAvailable: [
      "Kids Foundation Program",
      "Junior Development Program",
      "Adult Weekend & Evening Coaching",
      "Holiday Intensive Camps"
    ],
    image: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=1200&auto=format&fit=crop",
    courtImage: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=1200&auto=format&fit=crop",
    localSeoContent: {
      heading: "Badminton Coaching in Edappally, Palarivattom & Kalamassery",
      intro: "Looking for verified badminton training near Edappally, Palarivattom, Mamangalam, or Kalamassery? S&A Edappally provides children and adults with systematic coaching under certified badminton mentors.",
      whyThisBranch: "Located within 500 meters of Edappally Metro Station and NH 66, our academy allows commuters from Kalamassery, Cheranallur, and Aluva to fit high-energy training into their daily schedule.",
      connectivity: "Direct connectivity via Kochi Metro (Edappally Station), Bypass Junction, and Container Road."
    },
    faqs: [
      {
        question: "Is the Edappally branch walking distance from the Metro?",
        answer: "Yes, our facility is located just a 4-minute walk from Edappally Metro Station and right behind Lulu Mall."
      },
      {
        question: "Do you have weekend-only batches at Edappally?",
        answer: "Yes, we run intensive Saturday and Sunday batches specifically for busy school students and working professionals."
      }
    ]
  },
  {
    slug: "kakkanad",
    name: "S & A Badminton Academy — Kakkanad (Infopark IT Corridor)",
    shortName: "Kakkanad Branch",
    cityArea: "Kakkanad & Infopark, Kochi",
    tagline: "4 BWF Standard Courts Dedicated to IT Professionals & Youth",
    description: "Strategically located at Kakkanad near Infopark and SmartCity Kochi, our Kakkanad branch offers flexible early morning and late night coaching batches suited for tech professionals, as well as afternoon academy batches for children in Kakkanad, Thrikkakara, and Vazhakkala.",
    isHeadquarters: false,
    courtsCount: 4,
    courtType: "BWF Grade-1 Certified Olympic Green PVC on Resilient Wood",
    lightingStandard: "700 Lux Shadow-Eliminating Commercial Sports LED",
    address: "S&A Badminton Center, Seaport-Airport Road, Near Infopark Expressway, Kakkanad, Kochi, Kerala 682030",
    landmark: "Seaport-Airport Road, 3 min from Infopark Main Gate",
    city: "Kochi",
    state: "Kerala",
    pincode: "682030",
    phone: "+919400635548",
    phoneDisplay: "+91 94006 35548",
    whatsappNumber: "919400635548",
    whatsappDisplay: "+91 94006 35548",
    email: "kakkanad@sabadminton.com",
    timings: {
      morning: "05:00 AM – 10:30 AM",
      evening: "04:00 PM – 11:00 PM",
      days: "Open 7 Days a Week (Extended IT Hours)",
    },
    geo: {
      latitude: 10.0159,
      longitude: 76.3419,
    },
    googleMapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15717.025812903822!2d76.3359!3d10.0159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080c8e93a20729%3A0x6b77c385b4104043!2sKakkanad%2C%20Kochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000",
    googleMapDirectionsUrl: "https://maps.google.com/?q=Kakkanad+Kochi+Kerala",
    facilities: [
      "4 International Standard Synthetic Courts",
      "Late-Night Extended Hours until 11:00 PM for Tech Professionals",
      "High-Pressure Hot Showers & Executive Changing Rooms",
      "Corporate Corporate Membership & Inter-Company Tournaments",
      "Locker Rentals & Premium Towel Service",
      "Beverage Bar & Sports Hydration Station",
      "Wi-Fi Enabled Work-From-Court Co-working Nook",
      "Covered Four-Wheeler Parking"
    ],
    headCoachName: "Coach Rohan Mathew (Former Kerala University Captain & NIS Certified)",
    programsAvailable: [
      "Adult Corporate Coaching & Fitness Batches",
      "Kids Foundation Program",
      "Junior Development Program",
      "Corporate League Matchplay"
    ],
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop",
    courtImage: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop",
    localSeoContent: {
      heading: "Badminton Coaching in Kakkanad, Infopark & Thrikkakara",
      intro: "Conveniently situated along the Seaport-Airport Road minutes from Infopark Kochi, S&A Kakkanad is the go-to badminton training center for software engineers, IT executives, and families living across Kakkanad, Thrikkakara, and Padamugal.",
      whyThisBranch: "Designed with corporate schedules in mind, our Kakkanad branch opens at 05:00 AM and remains active until 11:00 PM. Whether you want to sweat out stress before your sprint standup or train after your late-night shift, our courts and coaches are ready.",
      connectivity: "Direct access along Seaport-Airport Road, 3 minutes from Infopark Phase 1 & 2, and 5 minutes from Collectorate Junction."
    },
    faqs: [
      {
        question: "Can IT employees book corporate batches or group coaching?",
        answer: "Yes, we offer tailored corporate team packages with customized batch timings, private court blockouts, and monthly inter-company tournaments."
      },
      {
        question: "Is the Kakkanad branch open late at night?",
        answer: "Yes, our Kakkanad branch stays open until 11:00 PM on weekdays to accommodate evening software shift schedules."
      }
    ]
  }
];
