// ODsay 대중교통 경로 API - 서버사이드 전용
const getOdsayKey = () => (process["env"] as Record<string, string>)["ODSAY_API_KEY"] ?? "";

interface OdsayRoute {
  totalTime: number; // 총 소요시간 (분)
  totalWalk: number; // 총 도보 거리 (m)
}

// 두 좌표 간 대중교통 소요시간 조회
export async function getTransitTime(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<number> {
  // Mock 데이터: API 키 없을 때 사용
  const key = getOdsayKey();
  if (!key || key.includes("여기에")) {
    return getMockTransitTime(startLat, startLng, endLat, endLng);
  }

  const url = `https://api.odsay.com/v1/api/searchPubTransPathT?SX=${startLng}&SY=${startLat}&EX=${endLng}&EY=${endLat}&apiKey=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return getMockTransitTime(startLat, startLng, endLat, endLng);

    const data = await res.json();
    // 인증 실패 또는 에러 응답 처리
    if (data.error) return getMockTransitTime(startLat, startLng, endLat, endLng);

    const paths = data.result?.path;
    if (!paths || paths.length === 0) return getMockTransitTime(startLat, startLng, endLat, endLng);

    const best: OdsayRoute = paths[0].info;
    return best.totalTime;
  } catch {
    return getMockTransitTime(startLat, startLng, endLat, endLng);
  }
}

// API 키 없을 때 직선거리 기반 추정 (분)
function getMockTransitTime(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // 서울 지하철 평균 속도 약 33km/h + 환승/대기 고려
  const baseMin = (distKm / 33) * 60;
  const transferPenalty = distKm > 5 ? 10 : 5;
  return Math.round(baseMin + transferPenalty);
}
