"use client";

import { useState } from "react";
import { useAppStore, CuisineType, Conditions } from "@/store/useAppStore";

const CUISINES: { type: CuisineType; emoji: string }[] = [
  { type: "고기", emoji: "🥩" },
  { type: "회/해산물", emoji: "🐟" },
  { type: "한식", emoji: "🍚" },
  { type: "일식", emoji: "🍣" },
  { type: "중식", emoji: "🥢" },
  { type: "양식", emoji: "🍝" },
  { type: "분식", emoji: "🍜" },
  { type: "상관없음", emoji: "✨" },
];

const BUDGET_OPTIONS = [
  { label: "2만원", value: 20000 },
  { label: "3만원", value: 30000 },
  { label: "5만원", value: 50000 },
  { label: "7만원", value: 70000 },
  { label: "10만원+", value: 100000 },
];

export default function ConditionForm() {
  const { conditions, setConditions, setStep } = useAppStore();
  const [budget, setBudget] = useState(conditions.budget);
  const [cuisines, setCuisines] = useState<CuisineType[]>(conditions.cuisines);
  const [needRoom, setNeedRoom] = useState(conditions.needRoom);

  const toggleCuisine = (c: CuisineType) => {
    if (c === "상관없음") { setCuisines(["상관없음"]); return; }
    const next = cuisines.includes(c)
      ? cuisines.filter((x) => x !== c)
      : [...cuisines.filter((x) => x !== "상관없음"), c];
    setCuisines(next.length === 0 ? ["상관없음"] : next);
  };

  const handleNext = () => {
    setConditions({ budget, cuisines, needRoom, minSeats: 0 } as Conditions);
    setStep("result");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-0.5" style={{ color: "#f4f0ff" }}>어떤 조건을 원하나요?</h2>
        <p className="text-sm" style={{ color: "#6b5f8a" }}>예산과 종목을 선택하세요</p>
      </div>

      {/* 예산 */}
      <div>
        <label className="block text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: "#9d8ec7" }}>
          1인당 예산 (식사+주류)
        </label>
        <div className="grid grid-cols-5 gap-2">
          {BUDGET_OPTIONS.map((b) => {
            const active = budget === b.value;
            return (
              <button
                key={b.value}
                onClick={() => setBudget(b.value)}
                className="py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95"
                style={{
                  background: active ? "linear-gradient(135deg, #7c3aed, #8b5cf6)" : "rgba(255,255,255,0.04)",
                  border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
                  color: active ? "#fff" : "#9d8ec7",
                  boxShadow: active ? "0 4px 16px rgba(124,58,237,0.3)" : "none",
                }}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 종목 */}
      <div>
        <label className="block text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: "#9d8ec7" }}>
          종목 (복수 선택 가능)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {CUISINES.map(({ type, emoji }) => {
            const active = cuisines.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleCuisine(type)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95"
                style={{
                  background: active ? "rgba(124, 58, 237, 0.2)" : "rgba(255,255,255,0.04)",
                  border: active ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  color: active ? "#a78bfa" : "#6b5f8a",
                }}
              >
                <span className="text-lg">{emoji}</span>
                <span>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 룸 선호 */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3.5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: "#f4f0ff" }}>룸 선호</p>
          <p className="text-xs mt-0.5" style={{ color: "#6b5f8a" }}>독립된 공간이 있는 식당</p>
        </div>
        <button
          onClick={() => setNeedRoom(!needRoom)}
          className="relative transition-all duration-200"
          style={{ width: 44, height: 24 }}
        >
          <div
            className="absolute inset-0 rounded-full transition-all duration-200"
            style={{ background: needRoom ? "#7c3aed" : "rgba(255,255,255,0.1)" }}
          />
          <div
            className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
            style={{ left: needRoom ? 22 : 2 }}
          />
        </button>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={() => setStep("participants")}
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-80 active:scale-95"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9d8ec7" }}
        >
          ← 이전
        </button>
        <button
          onClick={handleNext}
          className="flex-[2] py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
          }}
        >
          장소 찾기 →
        </button>
      </div>
    </div>
  );
}
