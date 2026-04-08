"use client";

import { useEffect, useRef } from "react";
import { KakaoPlace } from "@/lib/kakao";

interface Props {
  centerLat: number;
  centerLng: number;
  hotzoneName: string;
  restaurants: KakaoPlace[];
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap({ centerLat, centerLng, hotzoneName, restaurants }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    const jsKey = (process["env"] as Record<string, string>)["NEXT_PUBLIC_KAKAO_JS_KEY"];

    const initMap = () => {
      if (!mapRef.current || !window.kakao?.maps) return;

      window.kakao.maps.load(() => {
        const center = new window.kakao.maps.LatLng(centerLat, centerLng);
        const map = new window.kakao.maps.Map(mapRef.current, {
          center,
          level: 4,
        });
        mapInstance.current = map;

        // 핫존 중심 마커
        const hotzoneMarker = new window.kakao.maps.Marker({
          position: center,
          map,
        });

        const hotzoneInfo = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:13px;font-weight:700;color:#7c3aed;">${hotzoneName}</div>`,
        });
        hotzoneInfo.open(map, hotzoneMarker);

        // 식당 마커
        restaurants.forEach((r) => {
          const pos = new window.kakao.maps.LatLng(parseFloat(r.y), parseFloat(r.x));
          const marker = new window.kakao.maps.Marker({ position: pos, map });

          const infoWindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px 8px;font-size:12px;max-width:140px;"><b>${r.place_name}</b><br/><span style="color:#888;">${r.distance}m</span></div>`,
          });

          window.kakao.maps.event.addListener(marker, "click", () => {
            infoWindow.open(map, marker);
          });
        });
      });
    };

    // 카카오맵 SDK 이미 로드된 경우
    if (window.kakao?.maps) {
      initMap();
      return;
    }

    // SDK 동적 로드
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      // cleanup: script는 재사용하므로 제거하지 않음
    };
  }, [centerLat, centerLng, hotzoneName, restaurants]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: 220, borderRadius: 16, overflow: "hidden" }}
    />
  );
}
