import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { ScoreResult, Program } from "@/types/admission";
import { API_URL } from "@/Api";

interface ScoreResultsProps {
  results: ScoreResult;
}

// Mở rộng interface Program để nhận thêm calculatedScore từ Backend
interface SuitableProgram extends Program {
  calculatedScore: number;
}

const formatScore = (val: any) => {
  if (val === null || val === undefined || val === 0 || val === 0.0 || val === "0" || val === "") {
    return "—";
  }
  return val;
};

export function ScoreResults({ results }: ScoreResultsProps) {
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set());
  const [showScoreGuide, setShowScoreGuide] = useState(false);
  
  // STATE MỚI: Dành cho gọi API
  const [suitablePrograms, setSuitablePrograms] = useState<SuitableProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleProgram = (programCode: string) => {
    const newExpanded = new Set(expandedPrograms);
    if (newExpanded.has(programCode)) {
      newExpanded.delete(programCode);
    } else {
      newExpanded.add(programCode);
    }
    setExpandedPrograms(newExpanded);
  };

  // EFFECT MỚI: Gửi request lên Python Backend khi results thay đổi
  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/suggest-programs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(results),
        });
        
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        setSuitablePrograms(data);
      } catch (error) {
        console.error("Lỗi khi tải kết quả gợi ý ngành:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (results) {
      fetchPrograms();
    }
  }, [results]);

  // Tìm điểm cao nhất trong 3 phương thức để highlight đỏ
  const cardScores = [
    results.xetTuyenTN !== undefined ? results.xetTuyenTN : -1,
    results.diemTSA !== undefined ? results.diemTSA : -1,
    results.diemXTTN12 !== undefined ? results.diemXTTN12 : -1,
  ];
  const maxCardScore = Math.max(...cardScores);
  const isXetTuyenTNMax = results.xetTuyenTN !== undefined && results.xetTuyenTN === maxCardScore && maxCardScore > 0;
  const isDiemTSAMax = results.diemTSA !== undefined && results.diemTSA === maxCardScore && maxCardScore > 0;
  const isDiemXTTN12Max = results.diemXTTN12 !== undefined && results.diemXTTN12 === maxCardScore && maxCardScore > 0;

  return (
    <div className="space-y-8">
      {/* 1. SECTION: DISPLAY OVERALL CALCULATED SCORES (no colorful borders/backgrounds) */}
      <div className="space-y-4">
        <div className="bg-[#c02135] text-white text-center py-4 px-6 rounded-md shadow-sm mb-6">
          <h4 className="text-lg md:text-xl font-extrabold uppercase tracking-wider m-0">
            Kết quả điểm xét tuyển đã tính toán
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {results.xetTuyenTN !== undefined && (
            <div className={`relative overflow-hidden p-8 border rounded-md hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${
              isXetTuyenTNMax 
                ? "border-[#c02135] border-2 bg-red-50/15 shadow-sm" 
                : "border-slate-200 bg-slate-50/50"
            }`}>
              <div className={`text-sm font-black uppercase tracking-wider ${
                isXetTuyenTNMax ? "text-[#c02135]" : "text-slate-500"
              }`}>XTTN 1.3</div>
              <div className={`text-5xl font-black mt-3 ${
                isXetTuyenTNMax ? "text-[#c02135]" : "text-slate-800"
              }`}>{results.xetTuyenTN.toFixed(2)}</div>
              <span className={`absolute right-1/2 translate-x-1/2 bottom-1 opacity-5 font-black text-5xl select-none ${
                isXetTuyenTNMax ? "text-[#c02135]" : "text-slate-350"
              }`}>1.3</span>
            </div>
          )}

          {results.diemXTTN12 !== undefined && (
            <div className={`relative overflow-hidden p-8 border rounded-md hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${
              isDiemXTTN12Max 
                ? "border-[#c02135] border-2 bg-red-50/15 shadow-sm" 
                : "border-slate-200 bg-slate-50/50"
            }`}>
              <div className={`text-sm font-black uppercase tracking-wider ${
                isDiemXTTN12Max ? "text-[#c02135]" : "text-slate-500"
              }`}>XTTN 1.2</div>
              <div className={`text-5xl font-black mt-3 ${
                isDiemXTTN12Max ? "text-[#c02135]" : "text-slate-800"
              }`}>{results.diemXTTN12.toFixed(2)}</div>
              <span className={`absolute right-1/2 translate-x-1/2 bottom-1 opacity-5 font-black text-5xl select-none ${
                isDiemXTTN12Max ? "text-[#c02135]" : "text-slate-350"
              }`}>1.2</span>
            </div>
          )}
          
          {results.diemTSA !== undefined && (
            <div className={`relative overflow-hidden p-8 border rounded-md hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${
              isDiemTSAMax 
                ? "border-[#c02135] border-2 bg-red-50/15 shadow-sm" 
                : "border-slate-200 bg-slate-50/50"
            }`}>
              <div className={`text-sm font-black uppercase tracking-wider ${
                isDiemTSAMax ? "text-[#c02135]" : "text-slate-500"
              }`}>Đánh giá tư duy</div>
              <div className={`text-5xl font-black mt-3 ${
                isDiemTSAMax ? "text-[#c02135]" : "text-slate-800"
              }`}>{results.diemTSA.toFixed(2)}</div>
              <span className={`absolute right-1/2 translate-x-1/2 bottom-1 opacity-5 font-black text-5xl select-none ${
                isDiemTSAMax ? "text-[#c02135]" : "text-slate-350"
              }`}>TSA</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. SECTION: SCORE COMBINATIONS */}
      {results.combinations.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Điểm thi tốt nghiệp THPT
          </h4>
          
          <div className="space-y-6">
            {/* Category A: CÓ MÔN CHÍNH */}
            {results.combinations.some(combo => !combo.code.endsWith("_KHONG_CO_MON_CHINH")) && (
              <div className="space-y-3">
                <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
                  Chi tiết điểm các tổ hợp CÓ MÔN CHÍNH
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(() => {
                    const combos = results.combinations
                      .filter(combo => !combo.code.endsWith("_KHONG_CO_MON_CHINH"))
                      .sort((a, b) => b.score - a.score);
                    const maxScore = Math.max(...combos.map(c => c.score));
                    return combos.map((combo) => {
                      const isMax = combo.score === maxScore;
                      return (
                        <div
                          key={combo.code}
                          className={`flex justify-between items-center p-3 rounded-md border transition-all duration-200 ${
                            isMax 
                              ? "border-[#c02135] text-[#c02135] border-2 font-black bg-white shadow-sm" 
                              : "bg-slate-50/50 text-slate-700 border-slate-200 hover:bg-slate-100/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <span className="font-extrabold">{combo.code}</span>
                            {isMax && (
                              <span className="inline-flex items-center text-[9px] bg-[#c02135] text-white px-1.5 py-0.5 rounded-sm font-black uppercase tracking-wider">
                                ★ Tốt nhất
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-black">{combo.score.toFixed(2)}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Category B: KHÔNG CÓ MÔN CHÍNH */}
            {results.combinations.some(combo => combo.code.endsWith("_KHONG_CO_MON_CHINH")) && (
              <div className="space-y-3">
                <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
                  Chi tiết điểm các tổ hợp KHÔNG CÓ MÔN CHÍNH
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(() => {
                    const combos = results.combinations
                      .filter(combo => combo.code.endsWith("_KHONG_CO_MON_CHINH"))
                      .sort((a, b) => b.score - a.score);
                    const maxScore = Math.max(...combos.map(c => c.score));
                    return combos.map((combo) => {
                      const isMax = combo.score === maxScore;
                      return (
                        <div
                          key={combo.code}
                          className={`flex justify-between items-center p-3 rounded-md border transition-all duration-200 ${
                            isMax 
                              ? "border-[#c02135] text-[#c02135] border-2 font-black bg-white shadow-sm" 
                              : "bg-slate-50/50 text-slate-700 border-slate-200 hover:bg-slate-100/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <span className="font-extrabold">{combo.code.replace("_KHONG_CO_MON_CHINH", "")}</span>
                            {isMax && (
                              <span className="inline-flex items-center text-[9px] bg-[#c02135] text-white px-1.5 py-0.5 rounded-sm font-black uppercase tracking-wider">
                                ★ Tốt nhất
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-black">{combo.score.toFixed(2)}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Links and guides moved to the bottom of combinations list and styled with HUST Crimson */}
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200/80 space-y-3.5 mt-6">
            <div>
              <a
                href="https://hust.edu.vn/uploads/sys/tuyen-sinh/2026_05/qd_thong-tin-tuyen-sinh-dhbk-ha-noi-2026_final_1.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-xs text-[#c02135] hover:text-[#b41d24] font-bold hover:underline"
              >
                <ChevronRight className="h-3.5 w-3.5 text-[#c02135] transition-transform duration-200 group-hover:translate-x-0.5" />
                Tra cứu hệ số môn chính các ngành đào tạo HUST
              </a>
            </div>
            
            <div>
              <button
                className="group flex items-center gap-1.5 text-xs text-[#c02135] hover:text-[#b41d24] font-bold hover:underline focus:outline-none"
                onClick={() => setShowScoreGuide((v) => !v)}
                type="button"
              >
                {showScoreGuide ? (
                  <ChevronDown className="h-3.5 w-3.5 text-[#c02135] transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-[#c02135] transition-transform duration-200 group-hover:translate-x-0.5" />
                )}
                Công thức và quy chế tính điểm xét tuyển HUST 2026
              </button>
            </div>

            {showScoreGuide && (
              <div className="p-4 bg-white border border-slate-200 rounded-md text-xs text-slate-650 leading-relaxed space-y-3 animate-fade-in-up">
                <div>
                  <span className="font-bold text-[#c02135]">
                    Chi tiết quy định tuyển sinh theo{" "}
                    <a
                      href="https://hust.edu.vn/uploads/sys/tuyen-sinh/2026_05/qd_thong-tin-tuyen-sinh-dhbk-ha-noi-2026_final_1.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-[#c02135] hover:text-[#b41d24] font-bold"
                    >
                      Quyết định Đại học Bách Khoa Hà Nội 2026
                    </a>
                    :
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="font-bold text-slate-800">Quy tắc tính điểm THPT:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li><span className="font-semibold">Tổ hợp môn thường:</span> Điểm xét = [(Môn 1 + Môn 2 + Môn 3)] + Điểm ưu tiên.</li>
                    <li><span className="font-semibold">Tổ hợp môn chính (nhân đôi):</span> Điểm xét = [(Môn 1 + Môn 2 + Môn 3 + Môn chính) × 3/4] + Điểm ưu tiên.</li>
                    <li><span className="font-semibold">Tổ hợp K01:</span> Điểm xét = [(Toán × 3 + Văn × 1 + (Lý/Hóa/Sinh/Tin) × 2] × 1/2 + Điểm ưu tiên.</li>
                    <li><span className="font-semibold">Quy tắc giảm điểm ưu tiên:</span> Điểm đạt từ 22.5 trở lên được cộng điểm ưu tiên giảm tuyến tính theo công thức của Bộ GD&ĐT.</li>
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="font-bold text-slate-800">Quy tắc tính điểm thi TSA:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Điểm xét = Min[100, Điểm thi TSA + Điểm cộng chứng chỉ ngoại ngữ] + Điểm ưu tiên.</li>
                    <li>Giảm điểm ưu tiên bắt đầu áp dụng khi điểm chưa cộng đạt từ 75/100 trở lên.</li>
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="font-bold text-slate-800">Quy tắc tính điểm XTTN 1.2, 1.3:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Điểm xét = Điểm hồ sơ năng lực quy đổi (thang 100) + Điểm ưu tiên quy đổi.</li>
                    <li>Điểm ưu tiên quy đổi = (Điểm ưu tiên khu vực + Điểm ưu tiên đối tượng) × 10/3.</li>
                    <li>Áp dụng cơ chế giảm điểm ưu tiên tuyến tính tương tự từ mức điểm thô 75/100 trở lên.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SECTION: DETAILED PROGRAM MATCHES */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <div className="bg-[#c02135] text-white text-center py-4 px-6 rounded-md shadow-sm mb-6">
          <h4 className="text-lg md:text-xl font-extrabold uppercase tracking-wider m-0">
            Danh sách chương trình đào tạo đủ điều kiện trúng tuyển
          </h4>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-[#c02135]" />
            <p className="text-xs font-semibold">Đang tổng hợp điểm chuẩn từ cơ sở dữ liệu tuyển sinh...</p>
          </div>
        ) : suitablePrograms.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 bg-slate-50 rounded-md px-4">
            <p className="text-sm font-bold text-slate-700">Không có chương trình đào tạo phù hợp với điểm của bạn.</p>
            <p className="text-xs text-slate-500 font-semibold mt-2 whitespace-pre-line">Hãy cố gắng nâng cao điểm số để có nhiều lựa chọn hơn!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suitablePrograms.map((program) => {
              const isExpanded = expandedPrograms.has(program.code);
              return (
                <div
                  key={program.code}
                  className={`border rounded-md transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-0.5 hover:shadow-sm ${
                    isExpanded 
                      ? "shadow-sm border-slate-350 bg-white" 
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white"
                  }`}
                  onClick={() => toggleProgram(program.code)}
                >
                  {/* Row layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 gap-4 select-none">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProgram(program.code);
                        }}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors active:scale-90 shrink-0"
                        type="button"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-black text-slate-800 text-sm md:text-[17px]">{program.code}</span>
                          {program.isElectrical && (
                            <Badge variant="outline" className="border-red-100 bg-red-50/40 text-[#c02135] text-[10px] font-bold px-2 py-0.5 rounded-sm sm:hidden">
                              SEEE
                            </Badge>
                          )}
                        </div>
                        <span className={`font-bold text-slate-650 text-sm md:text-[15px] block ${
                          isExpanded 
                            ? "" 
                            : "truncate max-w-[200px] sm:max-w-[320px] md:max-w-[520px] lg:max-w-[680px]"
                        }`}>
                          : {program.name}
                        </span>
                        {program.isElectrical && (
                          <Badge variant="outline" className="border-red-100 bg-red-50/40 text-[#c02135] text-[10px] font-bold px-2.5 py-1 rounded-sm hidden sm:inline-flex shrink-0">
                            Điện - Điện tử (SEEE)
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 mt-2 sm:mt-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <span className="text-xs font-bold text-slate-500">
                        Chỉ tiêu: <span className="text-slate-800 font-extrabold">{program.quota ?? "—"}</span>
                      </span>
                      
                      <div className="flex items-center gap-2.5">
                        <a
                          href={program.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-xs font-bold transition-all active:scale-95"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-[#c02135]" />
                          Xem chi tiết
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProgram(program.code);
                          }}
                          className="px-4 py-2 bg-[#c02135] hover:bg-[#b41d24] text-white font-bold rounded text-xs transition-all active:scale-95 shadow-sm"
                          type="button"
                        >
                          {isExpanded ? "Đóng" : "Mở rộng"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Program past scores table details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-slate-200 bg-white">
                      <div className="pt-4">
                        <div className="overflow-x-auto rounded border border-slate-200">
                          <table className="min-w-full text-xs md:text-sm text-slate-600 text-left">
                            <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                              <tr>
                                <th className="py-3 px-4 text-center border-r border-slate-200">Điểm chuẩn</th>
                                <th className="py-3 px-4 text-center border-r border-slate-200">THPT</th>
                                <th className="py-3 px-4 text-center border-r border-slate-200">TSA</th>
                                <th className="py-3 px-4 text-center border-r border-slate-200">XTTN 1.3</th>
                                <th className="py-3 px-4 text-center">XTTN 1.2</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 font-medium">
                              <tr className="hover:bg-slate-50/55 transition-colors">
                                <td className="py-2.5 px-4 text-center border-r border-slate-200 bg-slate-50/40">2023</td>
                                <td className="py-2.5 px-4 text-center border-r border-slate-200">{formatScore(program.admissionScore2023)}</td>
                                <td className="py-2.5 px-4 text-center border-r border-slate-200">{formatScore(program.tsaScore2023)}</td>
                                <td className="py-2.5 px-4 text-center border-r border-slate-200">{formatScore(program.xttn3Score2023)}</td>
                                <td className="py-2.5 px-4 text-center border-slate-200">—</td>
                              </tr>
                              <tr className="hover:bg-slate-50/55 transition-colors">
                                <td className="py-2.5 px-4 text-center border-r border-slate-200 bg-slate-50/40">2024</td>
                                <td className="py-2.5 px-4 text-center border-r border-slate-200">{formatScore(program.admissionScore2024)}</td>
                                <td className="py-2.5 px-4 text-center border-r border-slate-200">{formatScore(program.tsaScore2024)}</td>
                                <td className="py-2.5 px-4 text-center border-r border-slate-200">{formatScore(program.xttn3Score2024)}</td>
                                <td className="py-2.5 px-4 text-center border-slate-200">—</td>
                              </tr>
                              <tr className="hover:bg-slate-50/55 transition-colors">
                                <td className="py-3 px-4 text-center border-r border-slate-200 bg-slate-50/40">2025</td>
                                <td className="py-3 px-4 text-center border-r border-slate-200 text-slate-850">{formatScore(program.admissionPredict)}</td>
                                <td className="py-3 px-4 text-center border-r border-slate-200 text-slate-850">{formatScore(program.tsaPredict)}</td>
                                <td className="py-3 px-4 text-center border-r border-slate-200 text-slate-850">{formatScore(program.xttn3Predict)}</td>
                                <td className="py-3 px-4 text-center text-slate-850">{formatScore(program.xttn2Predict)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
