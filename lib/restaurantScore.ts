import { KakaoPlace } from "./kakao";

// 카테고리 키워드 → 회식 적합도 점수
const CATEGORY_SCORES: { keywords: string[]; score: number }[] = [
  { keywords: ["삼겹살", "고기구이", "곱창", "막창", "갈비", "바베큐"], score: 40 },
  { keywords: ["횟집", "해산물", "조개구이", "오마카세"], score: 35 },
  { keywords: ["한식", "백반", "보쌈", "족발", "순대", "국밥", "찜닭", "닭갈비"], score: 33 },
  { keywords: ["일식", "이자카야", "스시", "초밥", "라멘", "돈까스"], score: 33 },
  { keywords: ["중식", "중국요리", "양꼬치", "마라탕"], score: 28 },
  { keywords: ["양식", "스테이크", "이탈리안", "파스타", "피자"], score: 26 },
  { keywords: ["분식", "떡볶이", "순대국"], score: 15 },
  { keywords: ["카페", "베이커리", "디저트"], score: 3 },
];

function getCategoryScore(categoryName: string): number {
  const lower = categoryName.toLowerCase();
  for (const { keywords, score } of CATEGORY_SCORES) {
    if (keywords.some((k) => lower.includes(k))) return score;
  }
  // 기타 음식점
  if (lower.includes("음식점") || lower.includes("식당")) return 20;
  return 10;
}

function getDistanceScore(distanceStr: string): number {
  const dist = parseInt(distanceStr || "9999");
  if (dist <= 200) return 30;
  if (dist <= 400) return 20;
  if (dist <= 600) return 10;
  return 5;
}

export function scoreRestaurant(r: KakaoPlace): number {
  const categoryScore = getCategoryScore(r.category_name);
  const distanceScore = getDistanceScore(r.distance);
  const phoneBonus = r.phone ? 15 : 0;
  const roadAddressBonus = r.road_address_name ? 10 : 0;
  const placeUrlBonus = r.place_url ? 5 : 0;

  return categoryScore + distanceScore + phoneBonus + roadAddressBonus + placeUrlBonus;
}

export function rankRestaurants(restaurants: KakaoPlace[]): KakaoPlace[] {
  return [...restaurants].sort((a, b) => scoreRestaurant(b) - scoreRestaurant(a));
}
