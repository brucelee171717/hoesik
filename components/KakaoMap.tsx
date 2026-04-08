"use client";

import { useEffect, useRef, useState } from "react";
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
  const [debugMsg, setDebugMsg] = useState<string>("초기화 중...");

  useEffect(() => {
    const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

    if (!jsKey) {
      setDebugMsg("JS 키 없음 (NEXT_PUBLIC_KAKAO_JS_KEY 미설정)");
      return;
    }

    setDebugMsg(`키 확인: ${jsKey.slice(0, 6)}...`);

    const initMap = () => {
      if (!mapRef.current) {
        setDebugMsg("mapRef 없음");
        return;
      }
      if (!window.kakao?.maps) {
        setDebugMsg("kakao.maps 없음 (SDK 로드 실패)");
        return;
      }

      window.kakao.maps.load(() => {
        try {
          const center = new window.kakao.maps.LatLng(centerLat, centerLng);
          const map = new window.kakao.maps.Map(mapRef.current, { center, level: 4 });

          const hotzoneMarker = new window.kakao.maps.Marker({ position: center, map });
          const hotzoneInfo = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:6px 10px;font-size:13px;font-weight:700;color:#7c3aed;">${hotzoneName}</div>`,
          });
          hotzoneInfo.open(map, hotzoneMarker);

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

          setDebugMsg("OK");
        } catch (e: any) {
          setDebugMsg(`초기화 오류: ${e?.message}`);
        }
      });
    };

    if (window.kakao?.maps) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      setDebugMsg("SDK 로드 완료, 지도 초기화 중...");
      initMap();
    };
    script.onerror = () => {
      setDebugMsg("SDK 스크립트 로드 실패 (도메인 미등록 또는 키 오류)");
    };
    document.head.appendChild(script);
  }, [centerLat, centerLng, hotzoneName, restaurants]);

  return (
    <div style={{ width: "100%", borderRadius: 16, overflow: "hidden", position: "relative" }}>
      <div ref={mapRef} style={{ width: "100%", height: 220 }} />
      {debugMsg !== "OK" && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(22,17,42,0.9)", color: "#f59e0b", fontSize: 12,
          borderRadius: 16, padding: "0 16px", textAlign: "center"
        }}>
          {debugMsg}
        </div>
      )}
    </div>
  );
}
