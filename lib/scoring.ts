import { HOTZONES, Hotzone } from "./hotzones";

export interface Participant {
  name: string;
  workStation: string; // 직장 근처 전철역
  homeStation: string; // 집 근처 전철역
  workLat?: number;
  workLng?: number;
  homeLat?: number;
  homeLng?: number;
}

export interface HotzoneScore {
  hotzone: Hotzone;
  totalScore: number;
  avgWorkTime: number; // 평균 직장→핫존 소요시간(분)
  avgHomeTime: number; // 평균 핫존→집 소요시간(분)
  participantDetails: ParticipantDetail[];
  outliers: OutlierNote[];
}

export interface ParticipantDetail {
  name: string;
  workTime: number;
  homeTime: number;
}

export interface OutlierNote {
  name: string;
  message: string;
}

// 점수 계산 (낮을수록 좋음 → 역수로 변환)
// workTime 40%, homeTime 40%, taxiScore 20%
function calcScore(avgWorkTime: number, avgHomeTime: number, taxiScore: number): number {
  const timeScore = avgWorkTime * 0.4 + avgHomeTime * 0.4;
  const taxiBonus = (5 - taxiScore) * 5; // 택시 좋을수록 패널티 감소
  return timeScore + taxiBonus;
}

// 아웃라이어 감지: 개인 소요시간이 평균보다 15분 이상 초과
function detectOutliers(
  details: ParticipantDetail[],
  avgWorkTime: number,
  avgHomeTime: number
): OutlierNote[] {
  const notes: OutlierNote[] = [];
  for (const d of details) {
    if (d.homeTime - avgHomeTime > 15) {
      notes.push({
        name: d.name,
        message: `귀가 시간이 평균보다 ${Math.round(d.homeTime - avgHomeTime)}분 더 소요됩니다. 심야 버스/택시 확인을 권장합니다.`,
      });
    }
    if (d.workTime - avgWorkTime > 15) {
      notes.push({
        name: d.name,
        message: `이동 시간이 평균보다 ${Math.round(d.workTime - avgWorkTime)}분 더 소요됩니다.`,
      });
    }
  }
  return notes;
}

export function rankHotzones(
  transitTimes: Record<string, Record<string, { workTime: number; homeTime: number }>>
  // transitTimes[participantName][hotzoneId] = { workTime, homeTime }
): HotzoneScore[] {
  const results: HotzoneScore[] = [];

  for (const hotzone of HOTZONES) {
    const participantDetails: ParticipantDetail[] = [];
    let totalWorkTime = 0;
    let totalHomeTime = 0;
    let count = 0;

    for (const [name, times] of Object.entries(transitTimes)) {
      const t = times[hotzone.id];
      if (!t) continue;
      participantDetails.push({ name, workTime: t.workTime, homeTime: t.homeTime });
      totalWorkTime += t.workTime;
      totalHomeTime += t.homeTime;
      count++;
    }

    if (count === 0) continue;

    const avgWorkTime = totalWorkTime / count;
    const avgHomeTime = totalHomeTime / count;
    const totalScore = calcScore(avgWorkTime, avgHomeTime, hotzone.taxiScore);
    const outliers = detectOutliers(participantDetails, avgWorkTime, avgHomeTime);

    results.push({
      hotzone,
      totalScore,
      avgWorkTime,
      avgHomeTime,
      participantDetails,
      outliers,
    });
  }

  return results.sort((a, b) => a.totalScore - b.totalScore);
}
