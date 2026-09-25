export interface FAQItem {
  id: string;
  category: "Admissions" | "Training & Coaching" | "Courts & Infrastructure" | "Equipment & Attire";
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "Admissions",
    question: "What age can children start badminton coaching at S&A Academy?",
    answer: "Children can start in our Kids Foundation Program as young as 5 years old. The curriculum at this age focuses on fun hand-eye coordination games, agility, and natural racket handling before progressing to formal strokes."
  },
  {
    id: "faq-2",
    category: "Admissions",
    question: "Is a free trial assessment session available?",
    answer: "Yes, we provide a complimentary 45-minute baseline assessment for both children and adults. Our coach evaluates your current movement, grip, and stamina to recommend the ideal batch and development track. Shoes & racket required for free trial."
  },
  {
    id: "faq-3",
    category: "Admissions",
    question: "How do I enroll or book a trial session?",
    answer: "You can book directly by sending a WhatsApp message to +91 79076 55513 or filling out our quick online enquiry form on the Contact page. Our admissions counselor will confirm your preferred training centre and slot within 2 hours."
  },
  {
    id: "faq-4",
    category: "Training & Coaching",
    question: "What is the student-to-coach ratio in your regular batches?",
    answer: "We maintain a strict maximum ratio of 1 coach for every 6 to 8 students depending on the program level. This guarantees individual attention, correct repetition, and rapid stroke correction during every session."
  },
  {
    id: "faq-5",
    category: "Training & Coaching",
    question: "Do you offer badminton coaching for complete adult beginners?",
    answer: "Yes! A significant portion of our adult students begin with zero prior coaching experience. We run dedicated adult beginner cohorts focusing on safe biomechanics, low-impact footwork, and basic rallies without feeling self-conscious."
  },
  {
    id: "faq-6",
    category: "Courts & Infrastructure",
    question: "What type of court flooring does S&A Badminton Academy use?",
    answer: "All our centres use BWF Grade-1 certified multi-layer synthetic court mats laid over shock-absorbing sprung wooden subflooring. This dual-cushion design absorbs up to 60% of joint impact, safeguarding players' knees and ankles."
  },
  {
    id: "faq-7",
    category: "Courts & Infrastructure",
    question: "Where are your training centres located in Kochi?",
    answer: "We operate dedicated training facilities across strategic hubs in Kochi, including our central arena at Kadavanthra (near Rajiv Gandhi Indoor Stadium) and centres across Ernakulam. Visit our Centres section to view all operational locations, amenities, and directions."
  },
  {
    id: "faq-8",
    category: "Equipment & Attire",
    question: "What gear do I need to bring for my first training session?",
    answer: "Please bring your badminton shoes and racket for the free trial session. Clean non-marking indoor court shoes and comfortable athletic wear are required on our BWF synthetic courts."
  },
  {
    id: "faq-9",
    category: "Equipment & Attire",
    question: "Are non-marking shoes mandatory?",
    answer: "Yes, non-marking gum-rubber or specialist indoor court shoes are mandatory to preserve the specialized traction and cleanliness of the BWF synthetic mats. Shoes worn outside must not be used on the courts."
  }
];
