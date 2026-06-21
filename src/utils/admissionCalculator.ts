import { AdmissionScores, ScoreResult } from "@/types/admission";
import { API_URL } from "@/Api"


export async function calculateAdmissionScores(scores: AdmissionScores): Promise<ScoreResult> {
  // Thay port 8000 bằng domain backend của bạn
  const response = await fetch(`${API_URL}/calculate-admission`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scores),
  });

  if (!response.ok) {
    throw new Error("Lỗi khi tính điểm từ server");
  }

  return response.json();
}
