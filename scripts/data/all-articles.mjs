import { basicsArticles } from "./basics.mjs";
import { techniquesArticles } from "./techniques.mjs";
import { drillsArticles } from "./drills.mjs";
import { childrenArticles } from "./children.mjs";
import { adultsArticles } from "./adults.mjs";
import { fitnessArticles } from "./fitness.mjs";
import { equipmentArticles } from "./equipment.mjs";
import { progressionArticles } from "./progression.mjs";
import { localArticles } from "./local.mjs";

// The 3 existing original articles
export const existingArticles = [
  {
    slug: "badminton-coaching-in-kochi-beginners-guide",
    title: "Badminton Coaching in Kochi: The Complete Beginner’s Guide to Courts, Gear & Training",
    excerpt: "Everything parents and adult beginners in Kochi need to know about choosing the right badminton academy, court flooring types, non-marking shoes, and foundational coaching habits.",
    category: "Beginner's Guide",
    readTime: "6 min read",
    publishDate: "October 14, 2024",
    updatedAt: "2024-10-14T08:00:00.000Z",
    author: "Coach Anand Varma",
    authorRole: "Head Coach, SBA Badminton Academy",
    tags: ["Badminton Coaching Kochi", "Beginners Guide", "Court Shoes", "Kids Badminton"],
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop",
    status: "PUBLISHED",
    content: [
      "Badminton in Kochi has transformed from a seasonal recreational hobby into one of the city's most passionately pursued competitive sports. With modern indoor stadiums operating across Kadavanthra, Kumbalanghi, Maradu, Palluruthy, and Chullikal, players of all ages can now train year-round regardless of Kerala's heavy monsoons.",
      "### Why Court Flooring Matters More Than You Think",
      "One of the biggest mistakes beginners make is playing on bare concrete or thin linoleum mats. Badminton involves sudden decelerations, lunges, and vertical jumps that exert up to 4x your body weight on your knees. Certified BWF Grade-1 synthetic courts laid over sprung wooden timber provide crucial shock absorption, reducing impact strain by over 50%.",
      "### The Importance of Genuine Non-Marking Court Shoes",
      "Standard running sneakers have thick heel wedges and soft outer foam that encourage ankle rolls during lateral lunges. True badminton shoes feature flat, gum-rubber outsoles with radial pivot points, providing maximum grip on synthetic court mats while leaving zero scuff marks.",
      "### What to Look for in a Coaching Academy in Ernakulam",
      "When evaluating academies for yourself or your child, check three critical factors: Coach-to-student ratio (never exceed 1:8), coach certification credentials (look for BWF or NIS credentials), and structured progression ladders that evaluate technical strokes systematically."
    ]
  },
  {
    slug: "essential-badminton-footwork-drills-for-juniors",
    title: "Mastering 6-Point Court Footwork: Drills Every Junior Badminton Player Must Practice",
    excerpt: "Stroke power means nothing if you can't reach the shuttle in balance. Discover the step-by-step 6-corner shadow footwork system used by elite junior coaches.",
    category: "Training & Technique",
    readTime: "7 min read",
    publishDate: "November 01, 2024",
    updatedAt: "2024-11-01T09:00:00.000Z",
    author: "Coach Anand Varma",
    authorRole: "Head Coach, SBA Badminton Academy",
    tags: ["Badminton Footwork", "Junior Coaching", "Agility Drills", "Shadow Practice"],
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop",
    status: "PUBLISHED",
    content: [
      "Ask any international badminton coach to name the single most decisive factor separating amateur club players from tournament champions, and the answer is always the same: **Footwork speed, balance, and recovery.**",
      "### The Split-Step: The Engine of Fast Reflexes",
      "Before moving toward any corner, a player must execute a micro-hop called the split-step. By unweighting your body the exact millisecond your opponent strikes the shuttle, you load elastic energy into your calves and Achilles tendons, allowing instantaneous explosive direction changes.",
      "### 6-Corner Shadow Footwork Routine",
      "Dedicate 15 minutes of every training session to shadow footwork without a shuttlecock. Move sequentially from your central base position to: Forehand net, Backhand net, Forehand mid-court, Backhand mid-court, Forehand rear corner, and Round-the-head rear corner.",
      "### The Heel-to-Toe Lunge Recovery",
      "When lunging to retrieve a tight net drop, always plant your dominant heel first and roll through the ball of your foot with knee bent at 90 degrees. Never let your knee collapse inward, which puts dangerous shear stress on your ACL and meniscus."
    ]
  },
  {
    slug: "why-badminton-is-the-best-sport-for-kids-fitness",
    title: "Why Badminton Is the Ultimate Sport for Children’s Physical & Mental Development",
    excerpt: "From rapid eye tracking to core agility and emotional resilience. Why pediatricians and sports scientists recommend badminton as an ideal sport for growing kids.",
    category: "Youth Development",
    readTime: "5 min read",
    publishDate: "November 20, 2024",
    updatedAt: "2024-11-20T10:00:00.000Z",
    author: "Coach Saniya George",
    authorRole: "Lead Coach, SBA Badminton Academy",
    tags: ["Kids Fitness", "Child Development", "Badminton for Children", "Youth Sports Kochi"],
    image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200&auto=format&fit=crop",
    status: "PUBLISHED",
    content: [
      "In a world where children spend an average of 6+ hours daily staring at digital screens, finding an engaging, injury-safe, and intellectually stimulating physical activity is one of the most important decisions a parent can make.",
      "### Rapid Neurological & Hand-Eye Wiring",
      "Badminton is the fastest racket sport on earth, with shuttle speeds routinely surpassing 300 km/h. Tracking the high-speed flight of a shuttlecock and coordinating split-second limb movement stimulates the visual-motor cortex of a child's brain far more intensely than linear sports like running.",
      "### Non-Contact, Low-Injury Athleticism",
      "Unlike football, basketball, or martial arts where concussions, collisions, and fractures are persistent risks, badminton is a non-contact net sport. Players develop peak cardiovascular endurance, explosive leaping power, and 360-degree agility without physical collisions.",
      "### Academic Focus and Emotional Resilience",
      "Numerous pediatric studies show that structured aerobic racket training triggers brain-derived neurotrophic factor (BDNF), enhancing classroom focus, memory retention, and stress regulation during school exam cycles."
    ]
  }
];

export const allArticles = [
  ...existingArticles,
  ...basicsArticles,
  ...techniquesArticles,
  ...drillsArticles,
  ...childrenArticles,
  ...adultsArticles,
  ...fitnessArticles,
  ...equipmentArticles,
  ...progressionArticles,
  ...localArticles,
];
