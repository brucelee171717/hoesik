// 카카오 로컬 API - 서버사이드 전용
const KAKAO_REST_KEY = process.env.KAKAO_REST_API_KEY!;

export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  place_url: string;
  distance: string;
  x: string; // lng
  y: string; // lat
}

// 역 이름으로 좌표 조회
export async function getStationCoords(stationName: string): Promise<{ lat: number; lng: number } | null> {
  const query = stationName.includes("역") ? stationName : `${stationName}역`;
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&category_group_code=SW8&size=1`;

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[kakao] getStationCoords failed: ${res.status}`, text);
    return null;
  }
  const data = await res.json();
  console.log(`[kakao] getStationCoords "${query}" →`, JSON.stringify(data.documents?.[0] ?? null));
  const doc = data.documents?.[0];
  if (!doc) return null;

  return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
}

// 핫존 주변 식당 검색 - 카테고리 검색 기반 (안정적)
export async function searchRestaurants(params: {
  lat: number;
  lng: number;
  cuisineKeywords?: string[]; // 업종별 키워드 배열 (각각 검색 후 병합)
  radius?: number;
}): Promise<KakaoPlace[]> {
  const { lat, lng, cuisineKeywords, radius = 600 } = params;

  const fetchCategory = async () => {
    const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&x=${lng}&y=${lat}&radius=${radius}&sort=distance&size=15`;
    const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.documents ?? []) as KakaoPlace[];
  };

  const fetchKeyword = async (keyword: string) => {
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&category_group_code=FD6&x=${lng}&y=${lat}&radius=${radius}&sort=distance&size=10`;
    const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.documents ?? []) as KakaoPlace[];
  };

  // 업종 키워드가 있으면 각각 검색 후 중복 제거, 없으면 카테고리 검색
  if (cuisineKeywords && cuisineKeywords.length > 0) {
    const results = await Promise.all(cuisineKeywords.map(fetchKeyword));
    const merged = results.flat();
    // id 기준 중복 제거 후 거리순 정렬
    const unique = Array.from(new Map(merged.map((r) => [r.id, r])).values());
    const sorted = unique.sort((a, b) => parseInt(a.distance) - parseInt(b.distance));
    // 결과 없으면 카테고리 검색으로 폴백
    if (sorted.length === 0) return fetchCategory();
    console.log(`[kakao] searchRestaurants (${cuisineKeywords.join(",")}) → ${sorted.length}개`);
    return sorted.slice(0, 15);
  }

  const docs = await fetchCategory();
  console.log(`[kakao] searchRestaurants (카테고리) → ${docs.length}개`);
  return docs;
}
