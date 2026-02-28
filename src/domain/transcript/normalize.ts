const PT_BR = "pt-BR";

const WORD_CLOUD_STOP_WORDS = [
  "a",
  "à",
  "agora",
  "ainda",
  "alguem",
  "alguém",
  "algum",
  "alguma",
  "algumas",
  "alguns",
  "ali",
  "ante",
  "antes",
  "ao",
  "aos",
  "apenas",
  "apos",
  "após",
  "aquela",
  "aquele",
  "aqueles",
  "aquilo",
  "as",
  "às",
  "assim",
  "ate",
  "até",
  "atrás",
  "atraves",
  "através",
  "cada",
  "com",
  "como",
  "contra",
  "da",
  "das",
  "de",
  "dela",
  "dele",
  "deles",
  "demais",
  "depois",
  "desde",
  "dessa",
  "desse",
  "desta",
  "deste",
  "dia",
  "disso",
  "disto",
  "do",
  "dois",
  "dos",
  "duas",
  "e",
  "é",
  "ela",
  "elas",
  "ele",
  "eles",
  "em",
  "enquanto",
  "entre",
  "era",
  "eram",
  "essa",
  "essas",
  "esse",
  "esses",
  "esta",
  "está",
  "estao",
  "estão",
  "estas",
  "este",
  "estes",
  "estou",
  "etc",
  "eu",
  "faz",
  "fazer",
  "foi",
  "foram",
  "ha",
  "há",
  "hoje",
  "isso",
  "isto",
  "ja",
  "já",
  "la",
  "lá",
  "lhe",
  "lhes",
  "mais",
  "mas",
  "me",
  "mesma",
  "mesmo",
  "meu",
  "meus",
  "minha",
  "minhas",
  "muito",
  "na",
  "nada",
  "nao",
  "não",
  "nas",
  "nem",
  "nessa",
  "nesse",
  "nesta",
  "neste",
  "ninguem",
  "ninguém",
  "no",
  "nos",
  "nós",
  "nossa",
  "nosso",
  "num",
  "numa",
  "nunca",
  "o",
  "onde",
  "ontem",
  "os",
  "ou",
  "outra",
  "outro",
  "para",
  "pela",
  "pelas",
  "pelo",
  "pelos",
  "por",
  "porque",
  "porém",
  "pra",
  "pro",
  "qual",
  "quando",
  "que",
  "quem",
  "se",
  "sem",
  "sempre",
  "sendo",
  "ser",
  "seu",
  "seus",
  "sim",
  "so",
  "só",
  "sob",
  "sobre",
  "somos",
  "sou",
  "sua",
  "suas",
  "tal",
  "tambem",
  "também",
  "te",
  "tem",
  "têm",
  "tenho",
  "ter",
  "teu",
  "teus",
  "teve",
  "tinha",
  "tive",
  "todo",
  "todos",
  "tu",
  "tua",
  "tuas",
  "tudo",
  "um",
  "uma",
  "umas",
  "uns",
  "vai",
  "vão",
  "vem",
  "você",
  "vocês",
  "vos",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "mhm",
];

export const wordCloudStopWords = new Set(WORD_CLOUD_STOP_WORDS);

export function stripAllTags(value: string): string {
  return value.replace(/<[^>]+>/g, "");
}

export function normalizeSpaces(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSpeakerName(name: string): string {
  const clean = normalizeSpaces(String(name).replace(/[:：]\s*$/, ""));
  if (!clean) {
    return "";
  }
  const lower = clean.toLocaleLowerCase(PT_BR);
  return lower.replace(/(^|[\s\-_'’`])(\p{L})/gu, (full, lead, char) => {
    return `${lead}${char.toLocaleUpperCase(PT_BR)}`;
  });
}

export function isTimestampLine(line: string): boolean {
  return /\d{2}:\d{2}:\d{2}(?:\.\d+)?\s*-->\s*\d{2}:\d{2}:\d{2}(?:\.\d+)?/.test(line);
}

export function parseTimeToSeconds(timestamp: string): number | null {
  const match = String(timestamp)
    .trim()
    .match(/^(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/);
  if (!match) {
    return null;
  }
  const [, hh, mm, ss, millis = "0"] = match;
  return Number(hh) * 3600 + Number(mm) * 60 + Number(ss) + Number(millis.padEnd(3, "0")) / 1000;
}

export function parseDocxTimeToSeconds(timestamp: string): number | null {
  const parts = String(timestamp)
    .trim()
    .split(":")
    .map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) {
    return null;
  }
  if (parts.length === 2) {
    const [minutes = 0, seconds = 0] = parts;
    return minutes * 60 + seconds;
  }
  if (parts.length === 3) {
    const [hours = 0, minutes = 0, seconds = 0] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  return null;
}

export function countSpeechChars(text: string): number {
  return String(text).replace(/\s+/g, "").length;
}

export function tokenizeWords(text: string): string[] {
  return String(text)
    .toLocaleLowerCase(PT_BR)
    .replace(/[\u2019']/g, "")
    .replace(/[^\d\p{L}]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function tokenizeLexical(text: string): string[] {
  return tokenizeWords(text);
}

export function tokenizeNgram(text: string): string[] {
  return tokenizeWords(text);
}

export function isNumericToken(token: string): boolean {
  return /^\d+$/.test(token);
}

export function isWordCloudToken(token: string): boolean {
  return (
    Boolean(token) && token.length >= 3 && !isNumericToken(token) && !wordCloudStopWords.has(token)
  );
}
