import { ACADEMY_DATA } from "@/data/academy";

interface WhatsAppOptions {
  branchSlug?: string;
  branchName?: string;
  programName?: string;
  customMessage?: string;
  phone?: string;
}

export function buildWhatsAppUrl(options: WhatsAppOptions = {}): string {
  const targetPhone = options.phone || ACADEMY_DATA.whatsappNumber;

  let text = "Hello S & A Badminton Academy! I would like to enquire about badminton coaching.";

  if (options.customMessage) {
    text = options.customMessage;
  } else if (options.branchName && options.programName) {
    text = `Hello S & A Badminton Academy! I would like to book a trial for "${options.programName}" at the ${options.branchName}.`;
  } else if (options.branchName) {
    text = `Hello S & A Badminton Academy! I would like to enquire about coaching timings, court availability, and batches at ${options.branchName}.`;
  } else if (options.programName) {
    text = `Hello S & A Badminton Academy! I would like to enquire about the "${options.programName}" program.`;
  }

  const encoded = encodeURIComponent(text);
  return `https://wa.me/${targetPhone}?text=${encoded}`;
}
