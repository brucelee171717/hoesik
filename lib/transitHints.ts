// 집 근처 역 이름 기반으로 귀가 교통 힌트 제공

interface TransitHint {
  icon: string;
  message: string;
}

const HINT_RULES: { keywords: string[]; icon: string; message: string }[] = [
  {
    keywords: ["동탄", "병점", "세류", "오산", "진위", "송탄", "평택", "천안", "아산"],
    icon: "🚄",
    message: "수서역에서 SRT 이용 가능. 또는 강남역·양재역에서 1004번 광역버스 확인.",
  },
  {
    keywords: ["수원", "매탄", "망포", "영통", "화서", "성균관대", "수원시청"],
    icon: "🚇",
    message: "수도권 1호선 급행 또는 수인분당선 이용. 막차 약 23:30.",
  },
  {
    keywords: ["안양", "명학", "관악", "석수", "군포", "의왕", "당정"],
    icon: "🚇",
    message: "수도권 1호선 급행 이용. 강남 방면 광역버스 병행 가능.",
  },
  {
    keywords: ["안산", "시흥", "광명", "신길온천", "정왕", "오이도"],
    icon: "🚇",
    message: "수인분당선 또는 4호선 이용. 막차 시간 사전 확인 권장.",
  },
  {
    keywords: ["인천", "부평", "부천", "송내", "역곡", "소사", "계양"],
    icon: "🚇",
    message: "수도권 1호선 또는 인천1·2호선 이용. 막차 약 23:30.",
  },
  {
    keywords: ["일산", "킨텍스", "탄현", "대화", "주엽", "정발산", "마두", "화정", "능곡"],
    icon: "🚌",
    message: "경의중앙선 또는 합정·홍대 방면 광역버스 이용. 막차 시간 확인 필수.",
  },
  {
    keywords: ["파주", "운정", "야당", "금촌", "문산"],
    icon: "🚌",
    message: "경의중앙선 막차 약 22:30. 신촌·홍대 방면 광역버스 병행 권장.",
  },
  {
    keywords: ["의정부", "녹양", "가능", "회룡", "망월사", "도봉산"],
    icon: "🚇",
    message: "1호선 또는 7호선 이용. 막차 약 23:20.",
  },
  {
    keywords: ["구리", "다산", "별내", "갈매", "퇴계원", "남양주", "도농", "양정"],
    icon: "🚌",
    message: "경의중앙선 또는 강변역 방면 광역버스 이용. 막차 확인 필수.",
  },
  {
    keywords: ["하남", "미사", "풍산", "검단산"],
    icon: "🚇",
    message: "5호선 연장 또는 강동 방면 버스 이용.",
  },
  {
    keywords: ["분당", "판교", "정자", "수내", "서현", "이매", "야탑", "모란"],
    icon: "🚇",
    message: "신분당선 또는 수인분당선 이용. 막차 약 23:30.",
  },
  {
    keywords: ["용인", "수지", "기흥", "동백", "상갈", "신갈"],
    icon: "🚇",
    message: "신분당선 또는 분당선 이용. 강남역에서 광역버스 병행 가능.",
  },
  {
    keywords: ["광주", "경기광주", "초월", "곤지암", "이천"],
    icon: "🚌",
    message: "잠실역·강남역 방면 광역버스 이용. 막차 시간 사전 확인 필수.",
  },
  {
    keywords: ["김포", "양촌", "통진", "걸포"],
    icon: "🚌",
    message: "김포골드라인 또는 강서·마포 방면 광역버스 이용.",
  },
];

// 귀가 시간이 몇 분 이상이면 외곽 사용자로 판단
const OUTLIER_HOME_TIME_THRESHOLD = 50;
const OUTLIER_RELATIVE_THRESHOLD = 15; // 평균보다 15분 초과

export interface EnrichedOutlier {
  name: string;
  homeTime: number;
  avgHomeTime: number;
  hint: TransitHint | null;
  message: string;
}

export function getTransitHint(homeStation: string): TransitHint | null {
  for (const rule of HINT_RULES) {
    if (rule.keywords.some((k) => homeStation.includes(k))) {
      return { icon: rule.icon, message: rule.message };
    }
  }
  return null;
}

export function detectEnrichedOutliers(
  participants: { name: string; homeStation: string; homeTime: number }[],
  avgHomeTime: number
): EnrichedOutlier[] {
  return participants
    .filter(
      (p) =>
        p.homeTime > OUTLIER_HOME_TIME_THRESHOLD ||
        p.homeTime - avgHomeTime > OUTLIER_RELATIVE_THRESHOLD
    )
    .map((p) => ({
      name: p.name,
      homeTime: p.homeTime,
      avgHomeTime,
      hint: getTransitHint(p.homeStation),
      message:
        p.homeTime > OUTLIER_HOME_TIME_THRESHOLD
          ? `귀가까지 약 ${p.homeTime}분 소요 예상`
          : `평균보다 ${Math.round(p.homeTime - avgHomeTime)}분 더 소요`,
    }));
}
