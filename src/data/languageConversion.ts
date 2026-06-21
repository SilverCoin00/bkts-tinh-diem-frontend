import { LanguageConversion } from "@/types/admission";
import { API_URL } from "@/Api"


export async function fetchLanguageDict(): Promise<LanguageConversion[]> {
  const res = await fetch(`${API_URL}/language-dict`);
  return res.json();
}

export async function convertLanguageScore(
  certificate: string,
  score: string | number
): Promise<{ convertedScore: number; bonusScore: number }> {
  const res = await fetch(`${API_URL}/convert-score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ certificate, score: String(score) }),
  });
  return res.json();
}

export async function convertToeicAllSkills(
  listening: string,
  reading: string,
  speaking: string,
  writing: string
): Promise<{ convertedScore: number; bonusScore: number }> {
  const res = await fetch(`${API_URL}/convert-toeic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listening, reading, speaking, writing }),
  });
  return res.json();
}
