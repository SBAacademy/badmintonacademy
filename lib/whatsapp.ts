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
