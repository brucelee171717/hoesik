import { NextRequest, NextResponse } from "next/server";
import { getStationCoords, searchRestaurants } from "@/lib/kakao";
import { getTransitTime } from "@/lib/odsay";
import { rankHotzones, Participant } from "@/lib/scoring";
import { rankRestaurants } from "@/lib/restaurantScore";
import { detectEnrichedOutliers } from "@/lib/transitHints";
import { HOTZONES } from "@/lib/hotzones";
import { Conditions } from "@/store/useAppStore";

const CUISINE_KEYWORDS: Record<string, string> = {
  고기: "고기집",
  "회/해산물": "횟집",
  한식: "한식",
  일식: "일식",
  중식: "중식당",
  양식: "양식",
  분식: "분식",
  상관없음: "",
};

export async function POST(req: NextRequest) {
  // 런타임 환경변수 디버그
  const kakaoKey = (process["env"] as Record<string,string>)["KAKAO_REST_API_KEY"];
  console.log("[debug] KAKAO_REST_API_KEY exists:", !!kakaoKey, "length:", kakaoKey?.length);
  console.log("[debug] All env keys:", Object.keys(process.env).filter(k => k.includes("KAKAO") || k.includes("ODSAY")));

  const { participants, conditions }: { participants: Participant[]; conditions: Conditions } =
    await req.json();

  if (!participants || participants.length === 0) {
    return NextResponse.json({ error: "참석자 정보가 없습니다." }, { status: 400 });
  }

  // 1. 참석자별 역 좌표 조회
  const participantsWithCoords = await Promise.all(
    participants.map(async (p) => {
      const workCoords = await getStationCoords(p.workStation);
      const homeCoords = await getStationCoords(p.homeStation);
      return { ...p, workLat: workCoords?.lat, workLng: workCoords?.lng, homeLat: homeCoords?.lat, homeLng: homeCoords?.lng };
    })
  );

  // 2. 각 참석자 × 각 핫존 소요시간 계산
  const transitTimes: Record<string, Record<string, { workTime: number; homeTime: number }>> = {};

  await Promise.all(
    participantsWithCoords.map(async (p) => {
      if (!p.workLat || !p.homeLat) return;
      transitTimes[p.name] = {};
      await Promise.all(
        HOTZONES.map(async (hz) => {
          const [workTime, homeTime] = await Promise.all([
            getTransitTime(p.workLat!, p.workLng!, hz.lat, hz.lng),
            getTransitTime(hz.lat, hz.lng, p.homeLat!, p.homeLng!),
          ]);
          transitTimes[p.name][hz.id] = { workTime, homeTime };
        })
      );
    })
  );

  // 3. 핫존 랭킹
  const ranked = rankHotzones(transitTimes);
  const top3 = ranked.slice(0, 3);

  // 4. 식당 검색
  const cuisineKeywords =
    conditions.cuisines.includes("상관없음") || conditions.cuisines.length === 0
      ? []
      : conditions.cuisines.map((c) => CUISINE_KEYWORDS[c]).filter(Boolean);

  const resultsWithRestaurants = await Promise.all(
    top3.map(async (item) => {
      const restaurants = await searchRestaurants({
        lat: item.hotzone.lat,
        lng: item.hotzone.lng,
        cuisineKeywords: cuisineKeywords.length > 0 ? cuisineKeywords : undefined,
        radius: 600,
      });

      // 5. 아웃라이어 감지 (enriched - 교통 힌트 포함)
      const avgHomeTime = item.avgHomeTime;
      const participantsForOutlier = item.participantDetails.map((d) => {
        const found = participantsWithCoords.find((p) => p.name === d.name);
        return { name: d.name, homeStation: found?.homeStation ?? "", homeTime: d.homeTime };
      });
      const enrichedOutliers = detectEnrichedOutliers(participantsForOutlier, avgHomeTime);

      return {
        ...item,
        outliers: enrichedOutliers, // scoring.ts의 기본 outliers 대체
        restaurants: rankRestaurants(restaurants).slice(0, 8),
      };
    })
  );

  return NextResponse.json({ results: resultsWithRestaurants });
}
