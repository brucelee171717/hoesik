"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { HotzoneScore } from "@/lib/scoring";
import { KakaoPlace } from "@/lib/kakao";
import { scoreRestaurant } from "@/lib/restaurantScore";
import { EnrichedOutlier } from "@/lib/transitHints";

interface ResultItem extends Omit<HotzoneScore, "outliers"> {
  restaurants: KakaoPlace[];
  outliers: EnrichedOutlier[];
}

const RANK_CONFIG = [
  { label: "1순위", color: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  { label: "2순위", color: "#9d8ec7", glow: "rgba(157,142,199,0.2)" },
  { label: "3순위", color: "#6b5f8a", glow: "rgba(107,95,138,0.15)" },
];

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-6 w-40 mb-4" />
      <div className="flex gap-3 mb-4">
        <div className="skeleton h-14 flex-1 rounded-xl" />
        <div className="skeleton h-14 flex-1 rounded-xl" />
      </div>
      <div className="skeleton h-10 w-full rounded-xl" />
    </div>
  );
}

export default function ResultView() {
  const { participants, conditions, setStep, reset } = useAppStore();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participants, conditions }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResults(data.results);
      } catch {
        setError("장소를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <div className="skeleton h-5 w-48 mb-2" />
          <div className="skeleton h-3 w-32" />
        </div>
        <SkeletonCard />
        <div className="flex gap-2">
          <div className="skeleton h-10 flex-1 rounded-xl" />
          <div className="skeleton h-10 flex-1 rounded-xl" />
        </div>
        <p className="text-center text-xs animate-pulse" style={{ color: "#6b5f8a" }}>
          {participants.length}명의 이동경로 분석 중...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl mb-3">😓</p>
        <p className="text-sm mb-4" style={{ color: "#f87171" }}>{error}</p>
        <button onClick={() => setStep("conditions")} className="text-sm underline" style={{ color: "#9d8ec7" }}>
          다시 시도
        </button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl mb-3">🤔</p>
        <p className="text-sm mb-4" style={{ color: "#9d8ec7" }}>결과를 찾지 못했어요</p>
        <button onClick={() => setStep("participants")} className="text-sm underline" style={{ color: "#9d8ec7" }}>
          처음부터 다시
        </button>
      </div>
    );
  }

  const top = results[selectedIdx];
  const rankCfg = RANK_CONFIG[selectedIdx];

  return (
    <div className="space-y-5">
      <div className="fade-in">
        <h2 className="text-lg font-bold mb-0.5" style={{ color: "#f4f0ff" }}>최적 장소를 찾았어요</h2>
        <p className="text-sm" style={{ color: "#6b5f8a" }}>{participants.length}명 기준 분석 완료</p>
      </div>

      {/* 순위 탭 */}
      <div className="flex gap-2 fade-in">
        {results.map((r, i) => {
          const cfg = RANK_CONFIG[i];
          const active = i === selectedIdx;
          return (
            <button
              key={r.hotzone.id}
              onClick={() => setSelectedIdx(i)}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95"
              style={{
                background: active ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                border: active ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)",
                color: active ? cfg.color : "#6b5f8a",
              }}
            >
              <span style={{ color: cfg.color }}>{cfg.label}</span>
              <br />
              <span className="font-bold text-sm" style={{ color: active ? "#f4f0ff" : "#9d8ec7" }}>
                {r.hotzone.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 핫존 카드 */}
      <div
        key={top.hotzone.id}
        className="rounded-2xl p-5 slide-up"
        style={{
          background: "rgba(22,17,42,0.8)",
          border: `1px solid ${rankCfg.color}33`,
          boxShadow: `0 8px 32px ${rankCfg.glow}`,
        }}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${rankCfg.color}22`, color: rankCfg.color }}
              >
                {rankCfg.label}
              </span>
            </div>
            <h3 className="text-2xl font-black" style={{ color: "#f4f0ff" }}>{top.hotzone.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: "#6b5f8a" }}>
              {top.hotzone.station} · {top.hotzone.line}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs mb-0.5" style={{ color: "#6b5f8a" }}>심야 택시</p>
            <p className="text-sm" style={{ color: rankCfg.color }}>
              {"★".repeat(top.hotzone.taxiScore)}{"☆".repeat(5 - top.hotzone.taxiScore)}
            </p>
          </div>
        </div>

        {/* 이동시간 stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs mb-1" style={{ color: "#6b5f8a" }}>직장 → 회식</p>
            <p className="text-xl font-black" style={{ color: "#f4f0ff" }}>{Math.round(top.avgWorkTime)}<span className="text-sm font-normal">분</span></p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs mb-1" style={{ color: "#6b5f8a" }}>회식 → 귀가</p>
            <p className="text-xl font-black" style={{ color: "#f4f0ff" }}>{Math.round(top.avgHomeTime)}<span className="text-sm font-normal">분</span></p>
          </div>
        </div>

        {/* 원거리 귀가자 안내 */}
        {top.outliers.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#f59e0b" }}>
              ⚠ 귀가 안내
            </p>
            {top.outliers.map((o, i) => (
              <div
                key={i}
                className="rounded-xl p-3 space-y-1.5"
                style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: "#fbbf24" }}>{o.name}</span>
                  <span className="text-xs" style={{ color: "#f59e0b" }}>{o.message}</span>
                </div>
                {o.hint && (
                  <div className="flex items-start gap-1.5">
                    <span className="text-sm">{o.hint.icon}</span>
                    <p className="text-xs leading-relaxed" style={{ color: "#d97706" }}>
                      {o.hint.message}
                    </p>
                  </div>
                )}
                {!o.hint && (
                  <p className="text-xs" style={{ color: "#d97706" }}>
                    광역버스 또는 택시 이용 권장. 막차 시간 사전 확인 필수.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 참석자별 상세 */}
        <div className="space-y-1.5 mb-4">
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "#6b5f8a" }}>참석자별</p>
          {top.participantDetails.map((d) => (
            <div
              key={d.name}
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <span className="text-sm font-medium" style={{ color: "#f4f0ff" }}>{d.name}</span>
              <span className="text-xs" style={{ color: "#6b5f8a" }}>
                이동 {d.workTime}분 · 귀가 {d.homeTime}분
              </span>
            </div>
          ))}
        </div>

        {/* 식당 리스트 */}
        {top.restaurants.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "#6b5f8a" }}>
              주변 식당 {top.restaurants.length}곳
            </p>
            <div className="space-y-1.5">
              {top.restaurants.map((r) => (
                <a
                  key={r.id}
                  href={r.place_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-sm font-medium truncate" style={{ color: "#f4f0ff" }}>{r.place_name}</p>
                      {!r.phone && (
                        <span className="text-xs shrink-0" style={{ color: "#6b5f8a" }}>전화없음</span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "#6b5f8a" }}>
                      {r.category_name.split(" > ").pop()} · {r.distance}m
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                      style={{
                        background: scoreRestaurant(r) >= 70 ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                        color: scoreRestaurant(r) >= 70 ? "#10b981" : "#9d8ec7",
                      }}
                    >
                      {scoreRestaurant(r)}점
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-3 fade-in">
        <button
          onClick={() => setStep("conditions")}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-80 active:scale-95"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9d8ec7" }}
        >
          조건 변경
        </button>
        <button
          onClick={reset}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", color: "#fff" }}
        >
          처음부터
        </button>
      </div>
    </div>
  );
}
