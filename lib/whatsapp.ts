import { ACADEMY_DATA } from "@/data/academy";

interface WhatsAppOptions {
  locationSlug?: string;
  locationName?: string;
  branchSlug?: string;
  branchName?: string;
  programName?: string;
  customMessage?: string;
  phone?: string;
}

export function buildWhatsAppUrl(options: WhatsAppOptions = {}): string {
  const targetPhone = options.phone || ACADEMY_DATA.whatsappNumber;

  let text = "Hello S & A Badminton Academy! I would like to enquire about badminton coaching.";

  const activeCentre = options.locationName || options.branchName;

  if (options.customMessage) {
    text = options.customMessage;
  } else if (activeCentre && options.programName) {
    text = `Hello S & A Badminton Academy! I would like to book a trial for "${options.programName}" at the ${activeCentre} centre.`;
  } else if (activeCentre) {
    text = `Hi, I'm interested in badminton coaching at the ${activeCentre} centre.`;
  } else if (options.programName) {
    text = `Hello S & A Badminton Academy! I would like to enquire about the "${options.programName}" program.`;
  }

  const encoded = encodeURIComponent(text);
  return `https://wa.me/${targetPhone}?text=${encoded}`;
}

export interface FormSubmissionData {
  name: string;
  phone: string;
  email?: string | null | undefined;
  ageCategory?: string | null | undefined;
  preferredBranchName: string;
  preferredProgramName: string;
  preferredSlot?: string | null | undefined;
  slot?: string | null | undefined;
  message?: string | null | undefined;
}

export function buildEnquiryWhatsAppUrl(data: FormSubmissionData): string {
  const lines = [
    "🏸 *S&A BADMINTON ACADEMY — FREE TRIAL BOOKING*",
    "--------------------------------------------------",
    `👤 *Name:* ${data.name}`,
    `📞 *Phone:* ${data.phone}`,
    data.email ? `✉️ *Email:* ${data.email}` : null,
    data.ageCategory ? `🎯 *Age Group:* ${data.ageCategory}` : null,
    `📍 *Preferred Centre:* ${data.preferredBranchName}`,
    `🏆 *Training Track:* ${data.preferredProgramName}`,
    (data.preferredSlot || data.slot) ? `⏰ *Preferred Slot:* ${data.preferredSlot || data.slot}` : null,
    data.message ? `💬 *Goal/Level:* ${data.message}` : null,
    "--------------------------------------------------",
    "_Please confirm available trial slots for this week._",
  ].filter(Boolean);

  const text = lines.join("\n");
  return `https://wa.me/${ACADEMY_DATA.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
