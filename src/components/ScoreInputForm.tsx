import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, RotateCcw, ExternalLink } from "lucide-react";
import { AdmissionScores, THPTScores, LanguageConversion } from "@/types/admission";
import { fetchLanguageDict, convertToeicAllSkills } from "@/data/languageConversion";

interface ScoreInputFormProps {
  onCalculate: (scores: AdmissionScores) => void;
}

export function ScoreInputForm({ onCalculate }: ScoreInputFormProps) {
  // --- STATE CHỨA TỪ ĐIỂN MAP KEY-VALUE ---
  const [languageDict, setLanguageDict] = useState<LanguageConversion[]>([]);

  // --- STATE DANH SÁCH CHỨNG CHỈ NGOẠI NGỮ ĐÃ THÊM ---
  interface AddedCert {
    id: string;
    type: string;
    score: string;
    toeic?: {
      nghe: string;
      noi: string;
      doc: string;
      viet: string;
    };
  }
  const [addedCerts, setAddedCerts] = useState<AddedCert[]>([]);

  // State tạm phục vụ cho form thêm chứng chỉ hiện tại
  const [currentCertType, setCurrentCertType] = useState<string>("");
  const [currentCertScore, setCurrentCertScore] = useState<string>("");
  const [currentToeicScores, setCurrentToeicScores] = useState({
    nghe: "",
    noi: "",
    doc: "",
    viet: ""
  });
  const [diem13, setDiem13] = useState<string>("");
  const [diemTSA, setDiemTSA] = useState<string>("");
  const [diemXTTN12, setDiemXTTN12] = useState<string>("");
  const [thptScores, setThptScores] = useState<THPTScores>({});
  const [khuvuc, setKhuvuc] = useState<string>("");
  const [doituongUT, setDoituongUT] = useState<string>("");

  // GỌI API ĐỂ LẤY DICT DATA MAP KEY-VALUE KHI COMPONENT MOUNT
  useEffect(() => {
    fetchLanguageDict().then(data => setLanguageDict(data)).catch(console.error);
  }, []);
  const updateTHPTScore = (subject: keyof THPTScores, value: string) => {
    const num = value ? parseFloat(value) : undefined;
    setThptScores(prev => ({
      ...prev,
      [subject]: num !== undefined && num >= 0 ? num : undefined
    }));
  };

  const handleAddCert = () => {
    if (!currentCertType || currentCertType === "00") return;
    if (currentCertType === "TOEIC") {
      if (!currentToeicScores.nghe || !currentToeicScores.noi || !currentToeicScores.doc || !currentToeicScores.viet) {
        alert("Vui lòng chọn đủ điểm cho cả 4 kỹ năng TOEIC.");
        return;
      }
    } else {
      if (!currentCertScore) {
        alert("Vui lòng chọn mức điểm chứng chỉ.");
        return;
      }
    }

    const newCert: AddedCert = {
      id: Date.now().toString(),
      type: currentCertType,
      score: currentCertType === "TOEIC" ? "" : currentCertScore,
      toeic: currentCertType === "TOEIC" ? { ...currentToeicScores } : undefined
    };

    setAddedCerts(prev => [...prev, newCert]);
    // Reset form nhập tạm
    setCurrentCertType("");
    setCurrentCertScore("");
    setCurrentToeicScores({ nghe: "", noi: "", doc: "", viet: "" });
  };

  const handleRemoveCert = (id: string) => {
    setAddedCerts(prev => prev.filter(c => c.id !== id));
  };

  const handleCalculate = async () => {
    // Prevent negative input values
    if (
      (diem13 && parseFloat(diem13) < 0) || (diem13 && parseFloat(diem13) > 100) ||
      (diemTSA && parseFloat(diemTSA) < 0) || (diemTSA && parseFloat(diemTSA) > 100) ||
      (diemXTTN12 && parseFloat(diemXTTN12) < 0) || (diemXTTN12 && parseFloat(diemXTTN12) > 100) ||
      Object.values(thptScores).some(v => v !== undefined && v < 0 || v !== undefined && v > 10)
    ) {
      alert("Điểm nhập vào không hợp lệ.");
      return;
    }

    // Xử lý quy đổi điểm cho từng chứng chỉ được add
    const finalCertsList = [];
    for (const cert of addedCerts) {
      if (cert.type === "TOEIC" && cert.toeic) {
        const toeicResult = await convertToeicAllSkills(
          cert.toeic.nghe,
          cert.toeic.doc,
          cert.toeic.noi,
          cert.toeic.viet
        );
        finalCertsList.push({
          type: "TOEIC",
          score: toeicResult.convertedScore.toString(),
          bonusScore: toeicResult.bonusScore
        });
      } else {
        finalCertsList.push({
          type: cert.type,
          score: cert.score
        });
      }
    }

    const scores: AdmissionScores = {
      diem13: diem13 ? parseFloat(diem13) : undefined,
      diemTSA: diemTSA ? parseFloat(diemTSA) : undefined,
      diemXTTN12: diemXTTN12 ? parseFloat(diemXTTN12) : undefined,
      thptScores,
      languageCertificates: finalCertsList.length > 0 ? finalCertsList : undefined,
      khuvuc: khuvuc || undefined,
      doituongUT: doituongUT || undefined
    };
    onCalculate(scores);
  };

  const handleReset = () => {
    setDiem13("");
    setDiemTSA("");
    setDiemXTTN12("");
    setThptScores({});
    setAddedCerts([]);
    setCurrentCertType("");
    setCurrentCertScore("");
    setCurrentToeicScores({
      nghe: "",
      noi: "",
      doc: "",
      viet: ""
    });
    setKhuvuc("");
    setDoituongUT("");
  };

  const getScoreOptions = (certType: string) => {
    const found = languageDict.find(c => c.certificate === certType);
    if (found) {
      return found.scoreRanges.map(r => r.value);
    }

    switch (certType) {
      case "IELTS":
        return ["5.0", "5.5", "6.0", "6.5", "7.0-9.0"];
      case "TOEFL iBT":
        return ["30-45", "46-61", "62-77", "78-93", "94-120"];
      case "VSTEP":
        return ["5.5", "6.0-6.5", "7.0-7.5", "8.0", "8.5-10"];
      case "Aptis ESOL":
        return ["80-120", "121-134", "135-148", "149-160", "161-180"];
      case "PTE Academic":
        return ["31-38", "39-46", "47-54", "55-62", "63-90"];
      case "Linguaskill":
        return ["140-159", "160-166", "167-173", "174-179", "180-210"];
      case "TOEFL ITP":
        return ["450-499", "500-541", "542-583", "584-626", "627-677"];
      case "Cambridge Assessment English":
        return [
          "B1 Preliminary / B1 Business Preliminary",
          "B2 First / B2 Business Vantage (160-172/Pass at Grade C)",
          "B2 First / B2 Business Vantage (173-179/Pass at Grade B)",
          "B2 First / B2 Business Vantage (180-190/Pass at Grade A)",
          "C1 Advanced / C1 Business Higher (180-210) / C2 Proficiency (200-230)"
        ];
      case "Cambridge English Tests":
        return [
          "PET (140-159)",
          "FCE (160-166)",
          "FCE (167-173)",
          "FCE (174-179)",
          "CAE (180-199) / CPE (200-230)"
        ];
      case "JLPT":
        return [
          "N4 (145-180)",
          "N3 (95-120)",
          "N3 (121-149)",
          "N3 (150-180)",
          "N2 (90-180) / N1 (100-180)"
        ];
      case "DELF/DALF":
        return [
          "DELF A2 (50-70)",
          "DELF A2 (71-100)",
          "DELF B1 (50-70)",
          "DELF B1 (71-100)",
          "DELF B2 (50-100) / DALF C1 (50-100) / DALF C2 (50-100)"
        ];
      case "TCF":
        return ["200-249", "250-299", "300-349", "350-399", "400-699"];
      case "HSK":
        return [
          "HSK3 (241-300)",
          "HSK4 (180-210)",
          "HSK4 (211-240)",
          "HSK4 (241-300)",
          "HSK5 (180-300) / HSK6 (180-300)"
        ];
      case "HSKK":
        return [
          "HSKK Sơ cấp (60-100)",
          "HSKK Trung cấp (60-100)",
          "HSKK Cao cấp (60-100)"
        ];
      case "PEIC":
        return [
          "Level 2",
          "Level 3 (Pass)",
          "Level 3 (Pass with Merit)",
          "Level 3 (Pass with Distinction)",
          "Level 4 - Level 5 (Pass)"
        ];
      case "TestDaF":
        return ["TDN3", "TDN4/TDN5"];
      case "Goethe/ÖSD/telc/ECL":
        return ["A2", "B1", "B2", "C1/C2"];
      case "DSH":
        return ["DSH1", "DSH2/DSH3"];
      case "DSD":
        return ["DSD1", "DSD2"];
      case "TOPIK":
        return [
          "TOPIK 3 (135-149)",
          "TOPIK 4 (150-162)",
          "TOPIK 4 (163-175)",
          "TOPIK 4 (176-189)",
          "TOPIK 5 (190-229) / TOPIK 6 (230-300)"
        ];
      default:
        return [];
    }
  };

  const getToeicSkillOptions = (skill: 'nghe' | 'noi' | 'doc' | 'viet') => {
    let cert = '';
    switch (skill) {
      case 'nghe': cert = 'TOEIC Listening'; break;
      case 'doc': cert = 'TOEIC Reading'; break;
      case 'noi': cert = 'TOEIC Speaking'; break;
      case 'viet': cert = 'TOEIC Writing'; break;
      default: return [];
    }
    const found = languageDict.find(c => c.certificate === cert);
    return found ? found.scoreRanges.map(r => r.value) : [];
  };

  const languageCertificates = [
    "IELTS", "VSTEP", "Aptis ESOL", "PEIC", "PTE Academic", "Linguaskill", 
    "Cambridge Assessment English", "Cambridge English Tests", "TOEIC",
    "TOEFL iBT", "TOEFL ITP", "JLPT", "DELF/DALF", "TCF", "HSK", "HSKK",
    "TestDaF", "Goethe/ÖSD/telc/ECL", "DSH", "DSD", "TOPIK"
  ];

  return (
    <div className="space-y-6">
      {/* 1. TALENT ADMISSION & TSA SCORES (Icons removed, links styled with HUST Crimson) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            ĐIỂM XÉT TUYỂN TÀI NĂNG & Đánh giá tư duy
          </h4>
          
          <a
            href="https://hust.edu.vn/uploads/sys/tuyen-sinh/2026_05/qd_thong-tin-tuyen-sinh-dhbk-ha-noi-2026_final_1.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-[#c02135] hover:text-[#b41d24] font-bold hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Đề án tuyển sinh
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-200 rounded-md">
            <Label htmlFor="diem13" className="text-[13px] font-semibold text-slate-700">XTTN 1.3</Label>
            <Input
              id="diem13"
              type="number"
              min="1"
              max="100"
              step="0.01"
              value={diem13}
              onChange={(e) => setDiem13(e.target.value)}
              placeholder="Nhập điểm"
              className="bg-white border-slate-300 focus:border-red-400 focus:ring-red-100 rounded shadow-sm text-sm h-10"
            />
          </div>
          <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-200 rounded-md">
            <Label htmlFor="diemXTTN12" className="text-[13px] font-semibold text-slate-700">XTTN 1.2</Label>
            <Input
              id="diemXTTN12"
              type="number"
              min="1"
              max="100"
              step="0.01"
              value={diemXTTN12}
              onChange={(e) => setDiemXTTN12(e.target.value)}
              placeholder="Nhập điểm"
              className="bg-white border-slate-300 focus:border-red-400 focus:ring-red-100 rounded shadow-sm text-sm h-10"
            />
          </div>
          <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-200 rounded-md">
            <Label htmlFor="diemTSA" className="text-[13px] font-semibold text-slate-700">Đánh giá tư duy</Label>
            <Input
              id="diemTSA"
              type="number"
              min="1"
              max="100"
              step="0.01"
              value={diemTSA}
              onChange={(e) => setDiemTSA(e.target.value)}
              placeholder="Nhập điểm"
              className="bg-white border-slate-300 focus:border-red-400 focus:ring-red-100 rounded shadow-sm text-sm h-10"
            />
          </div>
        </div>
      </div>

      {/* 2. HIGH SCHOOL GRADUATION GRADES (Icons removed) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            ĐIỂM THI THPT QUỐC GIA
          </h4>
        </div>

        {/* Grade Sheet Grid Table in Rows */}
        <div className="border border-slate-200 rounded-md bg-slate-50/50 p-4 space-y-5">
          
          {/* Core Subjects Row */}
          <div>
            <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider pb-1 mb-3 border-b border-slate-200">Môn thi chính</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'toan', label: 'Toán học' },
                { key: 'van', label: 'Ngữ văn' }
              ].map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1.5 p-3 bg-white border border-slate-200 rounded shadow-sm">
                  <Label htmlFor={`score-${key}`} className="text-[13px] font-bold text-slate-700 text-center">{label}</Label>
                  <Input
                    id={`score-${key}`}
                    type="number"
                    min="1"
                    max="10"
                    step="0.25"
                    value={thptScores[key as keyof THPTScores] || ""}
                    onChange={(e) => updateTHPTScore(key as keyof THPTScores, e.target.value)}
                    placeholder="—"
                    className="bg-white border-slate-300 text-center h-10 text-sm font-bold focus:border-red-400 focus:ring-red-100 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Elective & Other Languages Grid */}
          <div>
            <div className="text-[11px] font-black text-slate-650 uppercase tracking-wider pb-1 mb-3 border-b border-slate-200">Môn tự chọn</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { key: 'anh', label: 'Tiếng Anh' },
                { key: 'ly', label: 'Vật lý' },
                { key: 'hoa', label: 'Hóa học' },
                { key: 'tin', label: 'Tin học' },
                { key: 'sinh', label: 'Sinh học' },
                { key: 'nhat', label: 'Tiếng Nhật' },
                { key: 'phap', label: 'Tiếng Pháp' },
                { key: 'trung', label: 'Tiếng Trung' },
                { key: 'duc', label: 'Tiếng Đức' },
                { key: 'han', label: 'Tiếng Hàn' }
              ].map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1.5 p-3 bg-white border border-slate-200 rounded shadow-sm">
                  <Label htmlFor={`score-${key}`} className="text-[13px] font-semibold text-slate-600 text-center">{label}</Label>
                  <Input
                    id={`score-${key}`}
                    type="number"
                    min="1"
                    max="10"
                    step="0.25"
                    value={thptScores[key as keyof THPTScores] || ""}
                    onChange={(e) => updateTHPTScore(key as keyof THPTScores, e.target.value)}
                    placeholder="—"
                    className="bg-white border-slate-300 text-center h-10 text-sm focus:border-red-400 focus:ring-red-100 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. LANGUAGES & BONUSES (Icons removed, links styled with HUST Crimson) */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
          CHỨNG CHỈ NGOẠI NGỮ QUY ĐỔI
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cột 1: Form Thêm Chứng Chỉ */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-3">
            <div className="flex justify-between items-center h-5">
              <Label className="text-[13px] font-bold text-slate-700">Thêm chứng chỉ ngoại ngữ</Label>
              <a
                href="https://ts.hust.edu.vn/tin-tuc/thong-tin-tuyen-sinh-dai-hoc-chinh-quy-nam-2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[10px] text-[#c02135] hover:text-[#b41d24] font-bold hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Bảng quy đổi
              </a>
            </div>

            <Select value={currentCertType} onValueChange={(value) => {
              setCurrentCertType(value);
              setCurrentCertScore("");
              setCurrentToeicScores({ nghe: "", noi: "", doc: "", viet: "" });
            }}>
              <SelectTrigger className="bg-white border-slate-300 text-sm h-10 rounded">
                <SelectValue placeholder="Chọn loại chứng chỉ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="00">Không sử dụng</SelectItem>
                {languageCertificates.map((cert) => (
                  <SelectItem key={cert} value={cert}>{cert}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {currentCertType && currentCertType === "TOEIC" ? (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                {['nghe', 'noi', 'doc', 'viet'].map((skill) => (
                  <div key={skill} className="space-y-1">
                    <Label className="text-[9px] text-slate-500 uppercase font-black">{skill}</Label>
                    <Select 
                      value={currentToeicScores[skill as keyof typeof currentToeicScores]} 
                      onValueChange={(val) => setCurrentToeicScores(prev => ({ ...prev, [skill]: val }))}
                    >
                      <SelectTrigger className="bg-white border-slate-300 text-[10px] h-7 px-2 rounded">
                        <SelectValue placeholder="Điểm" />
                      </SelectTrigger>
                      <SelectContent>
                        {getToeicSkillOptions(skill as any).map((score) => (
                          <SelectItem key={score} value={score}>{score}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            ) : currentCertType && currentCertType !== "00" ? (
              <div className="space-y-1 pt-1">
                <Label className="text-[10px] text-slate-500 font-semibold">Mức điểm đạt được</Label>
                <Select value={currentCertScore} onValueChange={setCurrentCertScore}>
                  <SelectTrigger className="bg-white border-slate-300 text-sm h-10 rounded">
                    <SelectValue placeholder="Chọn mức điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    {getScoreOptions(currentCertType).map((score) => (
                      <SelectItem key={score} value={score}>{score}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {currentCertType && currentCertType !== "00" && (
              <Button 
                onClick={handleAddCert}
                className="mt-2 bg-[#c02135] hover:bg-[#b41d24] text-white font-bold h-9 text-xs rounded shadow transition-all duration-300"
              >
                + Thêm vào danh sách
              </Button>
            )}
          </div>

          {/* Cột 2: Danh sách Chứng Chỉ Đã Thêm */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-3 h-full">
            <div className="flex justify-between items-center h-5 border-b border-slate-200 pb-2">
              <Label className="text-[13px] font-bold text-slate-700">Danh sách đã thêm ({addedCerts.length})</Label>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[140px] space-y-2 pr-1">
              {addedCerts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                  Chưa có chứng chỉ nào được thêm
                </div>
              ) : (
                addedCerts.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-center bg-white border border-slate-200 p-2 rounded shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{cert.type}</span>
                      <span className="text-[10px] text-slate-500">
                        {cert.type === "TOEIC" && cert.toeic 
                          ? `L:${cert.toeic.nghe} R:${cert.toeic.doc} S:${cert.toeic.noi} W:${cert.toeic.viet}` 
                          : `Điểm: ${cert.score}`}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleRemoveCert(cert.id)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded"
                    >
                      <RotateCcw className="h-3.5 w-3.5 rotate-45" /> {/* Use rotate-45 RotateCcw as an "x" replacement */}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. POLICY PRIORITIES */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
          ĐIỂM ƯU TIÊN
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Area priority selection */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-3">
            <div className="flex justify-between items-center h-5">
              <Label className="text-[13px] font-semibold text-slate-700">Khu vực ưu tiên</Label>
            </div>
            <Select value={khuvuc} onValueChange={setKhuvuc}>
              <SelectTrigger className="bg-white border-slate-300 text-sm h-10 rounded">
                <SelectValue placeholder="Chọn khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="00">Chọn khu vực</SelectItem>
                <SelectItem value="KV1">KV1 - Khu vực 1 (+0.75 điểm)</SelectItem>
                <SelectItem value="KV2-NT">KV2-NT - Khu vực 2 nông thôn (+0.5 điểm)</SelectItem>
                <SelectItem value="KV2">KV2 - Khu vực 2 (+0.25 điểm)</SelectItem>
                <SelectItem value="KV3">KV3 - Khu vực 3 (không cộng điểm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Policy object selection */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-3">
            <div className="flex justify-between items-center h-5">
              <Label className="text-[13px] font-semibold text-slate-700">Đối tượng ưu tiên</Label>
            </div>
            <Select value={doituongUT} onValueChange={setDoituongUT}>
              <SelectTrigger className="bg-white border-slate-300 text-sm h-10 rounded">
                <SelectValue placeholder="Chọn đối tượng ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="00">Chọn đối tượng ưu tiên</SelectItem>
                <SelectItem value="01">01 - Dân tộc thiểu số KV1 (+2.0 điểm)</SelectItem>
                <SelectItem value="02">02 - Công nhân sản xuất (+2.0 điểm)</SelectItem>
                <SelectItem value="03">03 - Thương binh, quân nhân (+2.0 điểm)</SelectItem>
                <SelectItem value="04">04 - Thân nhân liệt sĩ (+2.0 điểm)</SelectItem>
                <SelectItem value="05">05 - Thanh niên xung phong (+1.0 điểm)</SelectItem>
                <SelectItem value="06">06 - Dân tộc thiểu số khác (+1.0 điểm)</SelectItem>
                <SelectItem value="07">07 - Người khuyết tật, giáo viên (+1.0 điểm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-[10.5px] text-slate-500 font-medium mt-2 px-1 leading-relaxed space-y-0.5">
          <p>* Lưu ý: Thí sinh chỉ được hưởng ưu tiên khu vực trong năm tốt nghiệp THPT (hoặc trung cấp) và một năm kế tiếp.</p>
          <p>* Điểm ưu tiên (khu vực & đối tượng) được áp dụng cơ chế giảm dần đối với thí sinh đạt tổng điểm từ 22.5 trở lên.</p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
        <Button 
          onClick={handleReset}
          variant="outline"
          className="group flex-1 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold py-6 text-sm md:text-base rounded shadow-sm transition-all duration-300 active:scale-[0.98]"
          size="lg"
        >
          <RotateCcw className="mr-2 h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" />
          RESET DỮ LIỆU
        </Button>
        
        <Button 
          onClick={handleCalculate}
          className="flex-1 bg-[#c02135] hover:bg-[#b41d24] text-white font-extrabold py-6 text-sm md:text-base rounded shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
          size="lg"
        >
          TÍNH ĐIỂM
        </Button>
      </div>
    </div>
  );
}
