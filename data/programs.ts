export interface Program {
  slug: string;
  name: string;
  shortName: string;
  badge: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  targetAge: string;
  skillLevel: string;
  duration: string;
  batchRatio: string;
  schedule: string;
  image: string;
  benefits: string[];
  curriculum: {
    title: string;
    description: string;
  }[];
  trainingHighlights: string[];
  suitableFor: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const PROGRAMS: Program[] = [
  {
    slug: "kids-badminton-coaching",
    name: "Kids Foundation Badminton Program",
    shortName: "Kids Program",
    badge: "Ages 5 – 9",
    tagline: "Build Agility, Coordination & Love for the Game",
    shortDescription: "Playful yet structured coaching focused on motor skills, hand-eye coordination, racket handling, and foundational footwork for young beginners.",
    fullDescription: "Our Kids Foundation Program introduces children between 5 and 9 years to the exciting world of badminton through game-based learning and sports science principles. Under gentle, certified coaching supervision, children master basic racket grip, eye-tracking of the shuttle, court boundaries, and dynamic multi-directional movement while building lifelong cardiovascular fitness and discipline.",
    targetAge: "5 to 9 Years",
    skillLevel: "Absolute Beginner to Novice",
    duration: "60 Minutes / Session (3 to 5 days weekly)",
    batchRatio: "1 Coach : 6 Kids max",
    schedule: "Morning 06:00 AM – 07:00 AM | Evening 04:30 PM – 05:30 PM",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop",
    benefits: [
      "Rapidly develops sharp hand-eye coordination and spatial tracking",
      "Correct forehand and backhand grip habits from day one",
      "Low-impact aerobic conditioning on shock-absorbing wooden courts",
      "Fosters teamwork, sportsmanship, and mental focus",
      "Fun mini-games preventing physical burnout",
      "Regular coach evaluation reports shared with parents"
    ],
    curriculum: [
      {
        title: "Stage 1: Grip & Racket Familiarization",
        description: "Shuttle balancing, universal V-grip, thumb grip transitions, and relaxed forearm mechanics."
      },
      {
        title: "Stage 2: Footwork Fundamentals",
        description: "Chasse steps, split-step timing, basic 4-corner court recovery without shuttle stress."
      },
      {
        title: "Stage 3: Basic Overhead & Underarm Strokes",
        description: "High clear swing mechanics, net tap control, and underhand lifting precision."
      },
      {
        title: "Stage 4: Mini-Court Rally Play",
        description: "Modified rally games, basic serving rules, scoring literacy, and friendly mini-matches."
      }
    ],
    trainingHighlights: [
      "Kid-sized training equipment & low-tension lightweight rackets",
      "Fun multi-shuttle reaction drills",
      "BWF certified coaches trained specifically in child sports pedagogy",
      "Safe, climate-controlled indoor arena with injury prevention flooring"
    ],
    suitableFor: [
      "Young children starting sports for the first time",
      "Parents looking for active screen-free afterschool athletic routines",
      "Children preparing for school badminton team trials"
    ],
    faqs: [
      {
        question: "What equipment does my child need for the first day?",
        answer: "Please bring badminton shoes and a racket for the free trial session. Clean non-marking indoor court shoes and comfortable sports attire are required."
      },
      {
        question: "Can parents watch the coaching sessions?",
        answer: "Yes, all our branches (Kadavanthra, Edappally, Kakkanad) feature elevated glass viewing galleries with seating and Wi-Fi for parents."
      },
      {
        question: "Is there a free trial assessment available?",
        answer: "Absolutely! We offer a complimentary 45-minute skills and agility evaluation session for all kids. Shoes & racket required for free trial."
      }
    ]
  },
  {
    slug: "junior-badminton-coaching",
    name: "Junior Development Badminton Program",
    shortName: "Junior Program",
    badge: "Ages 10 – 16",
    tagline: "Stroke Precision, 6-Point Footwork & Tactical Acumen",
    shortDescription: "Comprehensive training for school and junior players aiming to master power strokes, defensive retrieval, court speed, and tactical match strategy.",
    fullDescription: "The Junior Development Program is designed for intermediate and aspiring competitive players aged 10 to 16. The curriculum combines intensive stroke repetition, 6-point corner court footwork, jump-smash mechanics, drop shots, deceptive wrist flicks, and tactical singles/doubles game plans. Athletes undergo high-tempo multi-shuttle drills and live point construction.",
    targetAge: "10 to 16 Years",
    skillLevel: "Intermediate / Aspiring Competitor",
    duration: "90 Minutes / Session (4 to 6 days weekly)",
    batchRatio: "1 Coach : 8 Athletes max",
    schedule: "Morning 06:00 AM – 07:30 AM | Evening 05:00 PM – 06:30 PM",
    image: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=1200&auto=format&fit=crop",
    benefits: [
      "Mastery of high-velocity jump smashes, slices, and cross drops",
      "6-point shadow footwork ensuring rapid zero-delay court recovery",
      "Video-based biomechanical stroke analysis to correct technique faults",
      "Strength, speed, and endurance conditioning tailored for badminton",
      "Competitive exposure through internal ranking ladders and inter-club meets"
    ],
    curriculum: [
      {
        title: "Technical Mastery & Power Generation",
        description: "Kinetic chain rotation, pronation/supination mechanics, steep smash angles, and deception."
      },
      {
        title: "Defensive Mastery & Counter-Attack",
        description: "Low defensive stance, drive blocks, counter-punch pushes, and net kill reactions."
      },
      {
        title: "Tactical Game Plan Execution",
        description: "Singles baseline pinning, doubles rotation, front-court interception, and shot selection under pressure."
      },
      {
        title: "Sports Conditioning & Mental Toughness",
        description: "Agility ladder work, plyometric jump drills, core stability, and high-pressure tiebreak psychology."
      }
    ],
    trainingHighlights: [
      "Automated multi-shuttle continuous feeding drills",
      "Quarterly biomechanical video review reports",
      "Strength & conditioning sessions led by certified sports trainers",
      "Direct pathway to district and state tournament squads"
    ],
    suitableFor: [
      "School team players seeking competitive tournament breakthrough",
      "Juniors looking to progress from casual play to structured excellence",
      "District championship aspirants"
    ],
    faqs: [
      {
        question: "How do you evaluate which batch a junior player belongs to?",
        answer: "Every student undergoes a comprehensive 4-parameter baseline assessment: Footwork mobility, stroke execution, cardiovascular stamina, and match-play situational awareness."
      },
      {
        question: "Do you help students register for District and State tournaments?",
        answer: "Yes, S&A Academy is affiliated with district badminton associations and directly manages tournament entries, rankings, and coach accompaniment for registered athletes."
      }
    ]
  },
  {
    slug: "adult-badminton-coaching",
    name: "Adult Coaching & Fitness Program",
    shortName: "Adult Program",
    badge: "Ages 18+",
    tagline: "Cardio Fitness, Correct Biomechanics & Social Match Play",
    shortDescription: "Structured morning and evening batches for working professionals and adult enthusiasts looking to refine technique, prevent injuries, and elevate fitness.",
    fullDescription: "Tailored specifically for corporate professionals, hobbyists, and weekend warriors, our Adult Coaching Program blends biomechanical stroke refinement with high-calorie-burning court drills. Learn how to generate effortless power from your core rather than straining your shoulder or elbow, master doubles rotation, and enjoy structured league matches in an energetic social atmosphere.",
    targetAge: "18 to 60+ Years",
    skillLevel: "All Levels (Beginner to Advanced)",
    duration: "75 Minutes / Session",
    batchRatio: "1 Coach : 8 Adults max",
    schedule: "Early Birds 05:30 AM – 07:00 AM | Evening 07:30 PM – 09:00 PM | Weekend Special",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop",
    benefits: [
      "Burn 600–900 calories per session while mastering an exhilarating lifetime sport",
      "Learn safe biomechanics to prevent tennis elbow, knee stress, and rotator cuff strains",
      "Flexible morning, evening, and weekend batch timings fitting busy work schedules",
      "Master doubles positioning, tactical serving, and net interception",
      "Premium locker rooms, hot showers, and vibrant adult community network"
    ],
    curriculum: [
      {
        title: "Stroke Correction & Effortless Power",
        description: "Eliminating improper arm swings and using hip rotation and wrist snap for fatigue-free clears and smashes."
      },
      {
        title: "Doubles Positioning & Tactical Play",
        description: "Front-and-back attack formations, side-by-side defense, attacking lifts, and partner communication."
      },
      {
        title: "Functional Court Fitness",
        description: "Cardio interval training, footwork deceleration, and flexibility routines designed for adult joints."
      },
      {
        title: "Guided Match Play & Club League",
        description: "Coach-officiated competitive matches with real-time feedback on court positioning and unforced error reduction."
      }
    ],
    trainingHighlights: [
      "Low impact on BWF-certified wooden spring cushion subflooring",
      "Specialized warm-up and cool-down protocols preventing next-day stiffness",
      "Corporate batch packages and inter-company weekend tournaments",
      "Shower & locker facilities across Kadavanthra, Edappally, and Kakkanad"
    ],
    suitableFor: [
      "IT and corporate executives seeking fun cardiovascular fitness",
      "Former players looking to revive their competitive game after years away",
      "Recreational players looking to stop losing to advanced club opponents"
    ],
    faqs: [
      {
        question: "I have never held a badminton racket before. Can I join as an adult beginner?",
        answer: "Yes! Over 40% of our adult joiners are complete beginners. We have dedicated adult beginner cohorts where coaches teach fundamental grip, footwork, and strokes from the ground up."
      },
      {
        question: "Can I switch between morning and evening batches if my work shift changes?",
        answer: "Yes, our adult flex-pass allows students to reschedule sessions between morning and evening batches with prior notice via our WhatsApp concierge."
      }
    ]
  },
  {
    slug: "competitive-training",
    name: "Elite Competitive & Tournament Squad",
    shortName: "Competitive Squad",
    badge: "Advanced & Ranking",
    tagline: "High-Intensity Pro Coaching for State & National Contenders",
    shortDescription: "Rigorous high-performance training program designed for state, national, and university tournament players seeking podium finishes.",
    fullDescription: "The S&A Elite Squad is our signature high-performance academy pathway. Led by former national medalists and BWF Level 2 certified head coaches, this program delivers 3 to 4 hours daily of exhaustive tactical drilling, high-velocity multi-shuttle feeds, sports nutrition planning, mental resilience coaching, and national ranking tournament preparation.",
    targetAge: "10 to 22 Years (Selection by Trial Only)",
    skillLevel: "Advanced / Tournament Ranking",
    duration: "180 Minutes / Day (Intensive 6-day training)",
    batchRatio: "1 Coach : 4 Players max",
    schedule: "Daily 05:30 AM – 08:30 AM & 04:30 PM – 07:30 PM",
    image: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=1200&auto=format&fit=crop",
    benefits: [
      "Direct guidance from BWF-certified master coaches and former national players",
      "Personalized tournament calendar and performance milestone tracking",
      "Bi-weekly match video breakdown and opponent strategy scouting",
      "Integrated sports physiotherapist and certified athletic trainer support",
      "Sponsorship advisory and professional equipment tuning assistance"
    ],
    curriculum: [
      {
        title: "High-Cadence Multi-Shuttle Drills",
        description: "30-shuttle rapid-fire sequences testing split-second reaction, anaerobic stamina, and shot precision under exhaustion."
      },
      {
        title: "Match Play Pressure Scenarios",
        description: "Handicap sets, 19-19 deuce simulations, tiebreak strategy, and managing unforced errors during crunch moments."
      },
      {
        title: "Advanced Stroke Deception & Angle Creation",
        description: "Reverse slice drops, delayed cross-court flicks, tumbling net shots, and steep angled jump smashes."
      },
      {
        title: "Periodized Strength & Conditioning",
        description: "Olympic lifting fundamentals, explosive vertical jump power, lateral change-of-direction speed, and injury mitigation."
      }
    ],
    trainingHighlights: [
      "Strict selection by trial only — court discipline is non-negotiable",
      "Exclusive access to dedicated center-courts during prime hours",
      "Regular sparring matches against Kerala state rank holders and guest veterans",
      "Full academy backing at District, State, and All-India ranking tournaments"
    ],
    suitableFor: [
      "Ranked district and state badminton players",
      "Athletes pursuing sports quota university admissions or professional careers",
      "Dedicated juniors committed to a minimum of 15 hours weekly training"
    ],
    faqs: [
      {
        question: "How do I gain admission into the Elite Competitive Squad?",
        answer: "Admission is strictly through a formal 2-day technical and physical trial conducted by our Head Coach. Athletes must demonstrate established stroke fluency, court movement, and high athletic stamina."
      },
      {
        question: "Does the academy provide transport between school and courts?",
        answer: "We offer coordinated shuttle van routes connecting major schools in Kochi to our Kadavanthra and Edappally academies for our evening competitive squad."
      }
    ]
  },
  {
    slug: "badminton-camp",
    name: "Summer & Vacation Intensive Coaching Camp",
    shortName: "Vacation Camp",
    badge: "Seasonal Special",
    tagline: "Accelerated 4-Week Skill Boost with Guest Master Coaches",
    shortDescription: "High-energy vacation and holiday camps combining technical skill masterclasses, fitness bootcamps, and exciting tournament matches for all ages.",
    fullDescription: "Our signature Vacation Intensive Camps run every Summer (April – May), Onam, and Christmas holidays across all three Kochi branches. The 4-week fast-track curriculum packs 3 months of technical learning into an exciting, intensive sports experience. Campers receive custom academy jerseys, participation certificates, and medals at our grand camp championship.",
    targetAge: "6 to 18 Years (Grouped by age and skill)",
    skillLevel: "Beginner, Intermediate & Advanced Tracks",
    duration: "2 Hours Daily (Monday through Saturday)",
    batchRatio: "1 Coach : 8 Campers",
    schedule: "Morning Batch: 07:00 AM – 09:00 AM | Evening Batch: 04:00 PM – 06:00 PM",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop",
    benefits: [
      "Rapid progress in 30 days — equivalent to a full quarter of regular weekend coaching",
      "Free S&A Academy pro jersey, water bottle, and camp training kit",
      "Intensive fitness conditioning and agility development",
      "Fun end-of-camp tournament with trophies, medals, and parent showcase",
      "Priority admission discount for students continuing into regular year-round batches"
    ],
    curriculum: [
      {
        title: "Week 1: Fundamentals & Reaction Agility",
        description: "Grip correction, shuttle tracking games, basic court stance, and aerobic fitness foundations."
      },
      {
        title: "Week 2: Stroke Mechanics & Serving Accuracy",
        description: "Forehand clears, backhand returns, tumbling drops, and high/low service consistency."
      },
      {
        title: "Week 3: 6-Corner Footwork & Smashing Dynamics",
        description: "Shadow footwork, scissor kicks, smash power generation, and defensive recovery."
      },
      {
        title: "Week 4: Camp Championship & Match Tactics",
        description: "Singles and doubles round-robin tournament, scoring masterclass, and awards ceremony."
      }
    ],
    trainingHighlights: [
      "Guest appearances and clinics by former Indian international players",
      "Fun obstacle courses and speed radar smash speed tracking",
      "Official S&A Camp Completion Certificate and detailed coach assessment card",
      "Nutritious sports hydration and fruit snack support"
    ],
    suitableFor: [
      "Students looking for an active, healthy vacation routine away from screens",
      "Beginners wanting to test their interest before committing to full-year training",
      "Athletes wanting an intense pre-season fitness and skill tune-up"
    ],
    faqs: [
      {
        question: "Can beginners join the summer camp without prior experience?",
        answer: "Yes! We run separate simultaneous courts for beginners, intermediate, and advanced campers. Every child trains strictly alongside peers of matching age and ability."
      },
      {
        question: "What happens if we travel for a few days during the camp?",
        answer: "We offer compensatory weekend makeup sessions or credit carryover to ensure your child completes their full 24 hours of training."
      }
    ]
  }
];
