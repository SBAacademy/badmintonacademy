export const AGE_CATEGORIES = [
  "5 to 10",
  "11 to 15",
  "15 to 25",
  "26+ above",
] as const;

export type AgeCategory = (typeof AGE_CATEGORIES)[number];

export function isValidAgeCategory(val: unknown): val is AgeCategory {
  return typeof val === "string" && (AGE_CATEGORIES as readonly string[]).includes(val);
}

export function resolveAutomaticNeighborhoods(locationOrAddress?: string, name?: string): string[] {
  const combined = `${name || ""} ${locationOrAddress || ""}`.toLowerCase();

  if (combined.includes("kadavanthra")) {
    return ["Panampilly Nagar", "Girinagar", "Elamkulam", "Vyttila", "Thevara", "MG Road", "Ravipuram", "Ernakulam South"];
  }
  if (combined.includes("edappally")) {
    return ["Palarivattom", "Kaloor", "Elamakkara", "Kalamassery", "Cheranallur", "Lulu Junction", "Aluva Bypass", "Ernakulam North"];
  }
  if (combined.includes("kakkanad")) {
    return ["Infopark Phase 1 & 2", "SmartCity Kochi", "Vazhakkala", "Padamughal", "Thrikkakara", "Edachira", "Kakkanad Expressway"];
  }
  if (combined.includes("kumbalang") || combined.includes("kumbalan")) {
    return ["Perumpadappu", "Palluruthy", "Aroor", "Edakochi", "Chellanam", "Thoppumpady"];
  }
  if (combined.includes("maradu")) {
    return ["Kundannoor", "Nettoor", "Thykoodam", "Petta", "Tripunithura", "Vyttila", "Madavana"];
  }
  if (combined.includes("palluruthy") || combined.includes("palluruthi")) {
    return ["Thoppumpady", "Edakochi", "Kumbalangi", "Perumpadappu", "Fort Kochi", "Mattancherry"];
  }
  if (combined.includes("chullikal") || combined.includes("chullical")) {
    return ["Fort Kochi", "Mattancherry", "Thoppumpady", "Rameswaram", "Mundamveli", "Willingdon Island"];
  }
  if (combined.includes("aluva")) {
    return ["Angamaly", "Choornikkara", "Companypady", "Kalamassery", "Desom", "UC College"];
  }
  if (combined.includes("tripunithura") || combined.includes("thripunithura")) {
    return ["Petta", "Maradu", "Kizhakkekotta", "Hill Palace", "Eroor", "Vyttila"];
  }
  if (combined.includes("kaloor") || combined.includes("palarivattom")) {
    return ["Stadium Link Road", "Thammanam", "Kaloor", "Kathrikadavu", "Elamakkara", "Jawaharlal Nehru Stadium"];
  }

  // Generic Kochi central/neighbourhood fallback
  return ["Central Kochi", "Panampilly Nagar", "Marine Drive", "Vyttila Hub", "Ernakulam Central", "Kaloor"];
}

