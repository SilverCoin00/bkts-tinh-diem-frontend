export interface THPTScores {
  toan?: number;
  van?: number;
  ly?: number;
  hoa?: number;
  tin?: number;
  sinh?: number;
  anh?: number;
  nhat?: number;
  phap?: number;
  trung?: number;
  duc?: number;
  han?: number;
}

export interface LanguageCertificate {
  type: string;
  score: string;
  bonusScore?: number;
}

export interface AdmissionScores {
  diem13?: number;
  diemTSA?: number;
  diemXTTN12?: number;
  thptScores: THPTScores;
  languageCertificates?: LanguageCertificate[];
  khuvuc?: string;
  doituongUT?: string;
}

// export interface SubjectCombination {
//   code: string;
//   name: string;
//   subjects: string[];
//   mainSubject?: string;
//   formula: (scores: THPTScores) => number;
// }

export interface Program {
  code: string;
  name: string;
  admissionScore2023: number;
  tsaScore2023?: number;
  xttn3Score2023?: number;
  admissionScore2024: number;
  tsaScore2024?: number;
  xttn3Score2024?: number;
  admissionPredict?: number;
  tsaPredict?: number;
  xttn3Predict?: number;
  xttn2Predict?: number;
  quota: number;
  combinations: string[];
  link: string;
  isElectrical?: boolean;
  tsaRange?: string
  xttn3Range?: string
  xttn2Range?: string
  admissionRange?: string
}

export interface ScoreResult {
  xetTuyenTN?: number;
  diemTSA?: number;
  diemXTTN12?: number;
  combinations: {
    code: string;
    score: number;
  }[];
}

export interface LanguageConversion {
  certificate: string;
  scoreRanges: {
    value: string; // ép kiểu thành string
    convertedScore: number;
    bonusScore: number;
  }[];
}
