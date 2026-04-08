"use client";

import { useAppStore } from "@/store/useAppStore";
import ParticipantForm from "@/components/ParticipantForm";
import ConditionForm from "@/components/ConditionForm";
import ResultView from "@/components/ResultView";

const STEPS = ["참석자", "조건", "결과"];
const STEP_MAP = { participants: 0, conditions: 1, result: 2 };

export default function Home() {
  const { step, reset } = useAppStore();
  const currentStep = STEP_MAP[step];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 pb-20 px-4"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%), #0c0a14" }}
    >
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3 cursor-pointer" onClick={reset}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: "linear-gradient(135deg, #7c3aed, #10b981)" }}>
              🍽
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "#f4f0ff" }}>
              이지회식
            </h1>
          </div>
          <p className="text-sm" style={{ color: "#6b5f8a" }}>모두가 납득하는 회식장소</p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300"
                  style={{
                    background: i < currentStep
                      ? "#10b981"
                      : i === currentStep
                        ? "linear-gradient(135deg, #7c3aed, #8b5cf6)"
                        : "rgba(255,255,255,0.06)",
                    color: i <= currentStep ? "#fff" : "#6b5f8a",
                    boxShadow: i === currentStep ? "0 0 16px rgba(124,58,237,0.5)" : "none",
                  }}
                >
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <span className="text-xs font-medium transition-colors duration-300"
                  style={{ color: i === currentStep ? "#9d8ec7" : "#6b5f8a" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          {/* 프로그레스 바 */}
          <div className="h-0.5 rounded-full mx-4" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
                background: "linear-gradient(90deg, #7c3aed, #10b981)",
              }}
            />
          </div>
        </div>

        {/* 메인 카드 */}
        <div className="glass rounded-2xl p-6">
          {step === "participants" && <ParticipantForm />}
          {step === "conditions" && <ConditionForm />}
          {step === "result" && <ResultView />}
        </div>
      </div>
    </div>
  );
}
