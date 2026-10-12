/** Formatting helpers shared by forms and PDF templates. */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-10-09" -> "October 9, 2026". Returns the input unchanged if it is not an ISO date. */
export function formatDate(iso: string | undefined | null) {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

/** Today's date as YYYY-MM-DD in India time, the default for every form. */
export function todayISO() {
  const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

/** Indian digit grouping: 130000 -> "1,30,000". */
export function groupIndian(n: number) {
  const neg = n < 0;
  const [int, dec] = Math.abs(n).toFixed(2).split(".");
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3);
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3 : last3;
  return (neg ? "-" : "") + grouped + (dec !== "00" ? "." + dec : "");
}

/** 130000 -> "Rs. 1,30,000" */
export function rupees(n: number) {
  return `Rs. ${groupIndian(n)}`;
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function belowHundred(n: number) {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
}

function belowThousand(n: number) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? ONES[h] + " Hundred" : "", r ? belowHundred(r) : ""].filter(Boolean).join(" ");
}

/** Indian system words: 130000 -> "One Lakh Thirty Thousand". */
export function numberToWordsIndian(value: number) {
  let n = Math.floor(Math.abs(value));
  if (n === 0) return "Zero";
  const parts: string[] = [];
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) parts.push(numberToWordsIndian(crore) + " Crore");
  if (lakh) parts.push(belowHundred(lakh) + " Lakh");
  if (thousand) parts.push(belowHundred(thousand) + " Thousand");
  if (n) parts.push(belowThousand(n));
  return parts.join(" ");
}

/** 130000 -> "Rs. 1,30,000 (Rupees One Lakh Thirty Thousand only)" */
export function rupeesWithWords(n: number) {
  return `${rupees(n)} (Rupees ${numberToWordsIndian(n)} only)`;
}

const SMALL_NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

/** 6 -> "6 (six)", used for durations and notice periods in legal text. */
export function numWithWord(n: number) {
  const word = n >= 0 && n <= 20 && Number.isInteger(n) ? SMALL_NUMBER_WORDS[n] : numberToWordsIndian(n).toLowerCase();
  return `${n} (${word})`;
}

/** Percent without trailing zeros: 15 -> "15%", 1.5 -> "1.5%". */
export function pct(n: number) {
  return `${Number(n.toFixed(2))}%`;
}

/**
 * House style: no em or en dashes anywhere in generated documents.
 * Applied to every string that goes into a PDF.
 */
export function clean(text: string) {
  return text.replace(/\s*[—]\s*/g, ": ").replace(/[–]/g, "-");
}

export type Salutation = "Mr." | "Ms." | "Mx.";
export function pronouns(s: Salutation) {
  if (s === "Mr.") return { subject: "he", object: "him", possessive: "his" };
  if (s === "Ms.") return { subject: "she", object: "her", possessive: "her" };
  return { subject: "they", object: "them", possessive: "their" };
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
