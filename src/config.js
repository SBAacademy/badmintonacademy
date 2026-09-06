/**
 * Central Configuration for S & A BADMINTON ACADEMY
 * Website Development + Local SEO Commercial Proposal & Service Agreement.
 * Service Provider: KREOVATE - Marketing Agency
 * Project Contact / Delivery Lead: Mohammed Nibrasul Haqq
 */
export const config = {
  // Service Provider & Brand
  providerBrand: "KREOVATE",
  providerTagline: "Marketing Agency",
  providerDescription: "KREOVATE is a digital marketing agency providing web development, SEO, and strategic growth solutions for businesses and organizations.",
  projectContact: "Mohammed Nibrasul Haqq",
  projectEmail: "nibrasulhaqqamini@gmail.com",
  projectRole: "Kreovate -Marketing Agency",
  providerLocation: "Kerala, India",

  // Client Details
  academyName: "S & A BADMINTON ACADEMY",
  clientName: "S & A BADMINTON ACADEMY",
  quotationId: "SAA-WEB-SEO-2026-001",

  // Core Commercial Pricing (Strict Consistency)
  websitePrice: 15000,
  seoPrice: 10000,
  totalPrice: 25000,

  advancePayment: 12500,
  finalPayment: 12500,

  // Optional Ongoing Maintenance
  monthlyMaintenance: 8000,

  // Timeline & Service SLAs
  websiteTimeline: "10–15 working days",
  seoTimeline: "30 days",
  revisionRounds: 2,
  supportDays: 7,

  // Utility Formatter
  formatINR(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};
