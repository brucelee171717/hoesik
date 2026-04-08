"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Participant } from "@/lib/scoring";

export default function ParticipantForm() {
  const { participants, addParticipant, removeParticipant, setStep } = useAppStore();
  const [name, setName] = useState("");
  const [workStation, setWorkStation] = useState("");
  const [homeStation, setHomeStation] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!name.trim() || !workStation.trim() || !homeStation.trim()) {
      setError("이름, 직장역, 집 근처역을 모두 입력해주세요.");
      return;
    }
    addParticipant({ name: name.trim(), workStation: workStation.trim(), homeStation: homeStation.trim() } as Participant);
    setName(""); setWorkStation(""); setHomeStation("");
    setError("");
  };

  const handleNext = () => {
    if (participants.length === 0) { setError("참석자를 1명 이상 추가해주세요."); return; }
    setStep("conditions");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-0.5" style={{ color: "#f4f0ff" }}>누가 참여하나요?</h2>
        <p className="text-sm" style={{ color: "#6b5f8a" }}>이름과 직장·집 근처 전철역을 입력하세요</p>
      </div>

      {/* 입력 폼 */}
      <div className="space-y-3 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#9d8ec7" }}>이름</label>
          <input
            className="input-base"
            placeholder="예: 김철수"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#9d8ec7" }}>직장 근처 전철역</label>
          <input
            className="input-base"
            placeholder="예: 선릉역"
            value={workStation}
            onChange={(e) => setWorkStation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#9d8ec7" }}>집 근처 전철역</label>
          <input
            className="input-base"
            placeholder="예: 잠실역"
            value={homeStation}
            onChange={(e) => setHomeStation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>

        {error && (
          <p className="text-xs fade-in" style={{ color: "#f59e0b" }}>{error}</p>
        )}

        <button
          onClick={handleAdd}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            background: "rgba(124, 58, 237, 0.15)",
            border: "1px solid rgba(124, 58, 237, 0.3)",
            color: "#a78bfa",
          }}
        >
          + 참석자 추가
        </button>
      </div>

      {/* 참석자 목록 */}
      {participants.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#6b5f8a" }}>
            참석자 {participants.length}명
          </p>
          {participants.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl px-4 py-3 slide-up"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                animationDelay: `${i * 50}ms`,
              }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: "#f4f0ff" }}>{p.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#6b5f8a" }}>
                  {p.workStation} → {p.homeStation}
                </p>
              </div>
              <button
                onClick={() => removeParticipant(i)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all duration-200 hover:scale-110"
                style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={participants.length === 0}
        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: participants.length > 0
            ? "linear-gradient(135deg, #7c3aed, #8b5cf6)"
            : "rgba(255,255,255,0.06)",
          color: "#fff",
          boxShadow: participants.length > 0 ? "0 8px 24px rgba(124,58,237,0.3)" : "none",
        }}
      >
        다음 단계 →
      </button>
    </div>
  );
}
