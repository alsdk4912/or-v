"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Camera, X } from "lucide-react";

import { AppTabBar, HeaderHero, MobileFrame, SectionCard, StatusChip } from "@/components/mobile/design-system";
import { purchaseRequestsMock, itemMasters } from "@/data/inventory-mock";
import { getAllRecommendations, getItemPriceComparisons } from "@/lib/inventory-engine";

type ProcurementTab = "자동추천" | "가격비교" | "발주이력";

export default function ProcurementPage() {
  const [tab, setTab] = useState<ProcurementTab>("자동추천");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const recs = useMemo(() => getAllRecommendations().filter((r) => r.order_required), []);
  const targetItemId = selectedItemId || recs[0]?.item_id || itemMasters[0].item_id;
  const prices = useMemo(() => getItemPriceComparisons(targetItemId), [targetItemId]);
  const yearlySaving = useMemo(() => {
    const top = prices[0];
    if (!top) return 0;
    return Math.round((top.groupSaving || Math.round(top.price * 0.05)) * 1200);
  }, [prices]);

  return (
    <MobileFrame>
      <HeaderHero
        title="발주 / 가격비교"
        subtitle="권장발주 · 공급사비교 · 이력관리"
        right={
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setScannerOpen(true)} className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-xs font-semibold text-white">
              <Camera className="size-3.5" />
              QR검색
            </button>
            <StatusChip label={`${recs.length}건`} tone="warn" />
          </div>
        }
      />
      {scanMessage && (
        <p className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">{scanMessage}</p>
      )}
      <section className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-2">
        {(["자동추천", "가격비교", "발주이력"] as ProcurementTab[]).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={`rounded-xl px-2 py-2 text-xs font-semibold ${tab === name ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            {name}
          </button>
        ))}
      </section>

      {tab === "자동추천" && (
        <SectionCard title="자동발주 추천">
          <div className="space-y-2">
            {recs.map((rec) => {
              const item = itemMasters.find((i) => i.item_id === rec.item_id)!;
              return (
                <div key={rec.item_id} className="rounded-2xl bg-[#f5f8ff] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{item.item_name}</p>
                    <StatusChip label={rec.urgent_order_required ? "긴급발주" : "발주권고"} tone={rec.urgent_order_required ? "danger" : "warn"} />
                  </div>
                  <p className="mt-1 text-xs text-slate-700">권장수량 {rec.recommended_order_qty}{item.unit} · 최소재고 {rec.minimum_stock}</p>
                  <p className="mt-1 text-xs text-slate-600">{rec.reason_lines[1]}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <ActionButton label="승인요청" />
                    <ActionButton label="보류" />
                    <ActionButton label="Mock 전송" accent />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {tab === "가격비교" && (
        <SectionCard title="공급사 가격비교">
          <div className="mb-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2">
            <p className="text-xs font-semibold text-emerald-900">최저가/최적공급사 선택 시 연간 예상 절감액</p>
            <p className="mt-1 text-sm font-bold text-emerald-700">{Math.round(yearlySaving / 10000).toLocaleString()}만 원</p>
          </div>
          <div className="space-y-2">
            {prices.map((row) => (
              <div key={row.vendor_item_price_id} className="rounded-2xl border border-[var(--app-border)] bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{row.vendor_name}</p>
                  <StatusChip label={`종합점수 ${row.score}`} tone="info" />
                </div>
                <p className="mt-1 text-xs text-slate-700">
                  단가 {row.price.toLocaleString()}원 · 납기 {row.lead_time_days}일 · MOQ {row.moq}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  계약 {row.contract_type} {row.group_purchase_supported ? "· 공동구매 가능" : ""}
                </p>
                {row.groupSaving > 0 && <p className="mt-1 text-xs text-emerald-700">공동구매 예상 절감 {row.groupSaving.toLocaleString()}원/EA · 연간 {Math.round((row.groupSaving * 1200) / 10000).toLocaleString()}만 원</p>}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === "발주이력" && (
        <SectionCard title="발주 요청 이력">
          <div className="space-y-2 pb-24">
            {purchaseRequestsMock.map((req) => {
              const item = itemMasters.find((i) => i.item_id === req.item_id)!;
              return (
                <div key={req.purchase_request_id} className="rounded-2xl bg-[#f5f8ff] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{item.item_name}</p>
                    <StatusChip label={req.request_status} tone={req.request_status === "전송완료" ? "ok" : req.request_status === "승인대기" ? "warn" : "neutral"} />
                  </div>
                  <p className="mt-1 text-xs text-slate-700">요청수량 {req.request_qty}{item.unit} · 요청 {req.requested_at}</p>
                  {req.mock_order_result && <p className="mt-1 text-xs text-blue-700">{req.mock_order_result}</p>}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
      <AppTabBar currentPath="/procurement" />
      {scannerOpen && (
        <QrScannerModal
          onClose={() => setScannerOpen(false)}
          onDetected={(code) => {
            const item = itemMasters.find((row) => row.item_id === code || row.item_name.includes(code));
            if (!item) {
              setScanMessage(`인식된 코드(${code})와 일치하는 품목이 없습니다.`);
              return;
            }
            setSelectedItemId(item.item_id);
            setTab("가격비교");
            setScanMessage(`QR 인식 완료: ${item.item_name} 가격비교로 이동했습니다.`);
            setScannerOpen(false);
          }}
        />
      )}
    </MobileFrame>
  );
}

function ActionButton({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <button type="button" className={`rounded-xl px-2 py-2 text-xs font-semibold ${accent ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
      {label}
    </button>
  );
}

function QrScannerModal({
  onClose,
  onDetected,
}: {
  onClose: () => void;
  onDetected: (code: string) => void;
}) {
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState("");

  const startScan = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const video = document.createElement("video");
      video.srcObject = media;
      await video.play();

      const detectorAvailable = typeof window !== "undefined" && "BarcodeDetector" in window;
      if (!detectorAvailable) {
        setCameraError("이 브라우저는 QR 자동인식을 지원하지 않아 코드 직접 입력이 필요합니다.");
        media.getTracks().forEach((track) => track.stop());
        return;
      }

      const Detector = (window as unknown as { BarcodeDetector: new (options?: { formats?: string[] }) => { detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector;
      const detector = new Detector({ formats: ["qr_code"] });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        media.getTracks().forEach((track) => track.stop());
        setCameraError("카메라 프레임을 처리할 수 없습니다.");
        return;
      }

      const loop = async () => {
        if (video.readyState >= 2) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const codes = await detector.detect(canvas);
          const first = codes[0]?.rawValue;
          if (first) {
            media.getTracks().forEach((track) => track.stop());
            onDetected(first.trim());
            return;
          }
        }
        requestAnimationFrame(loop);
      };
      loop();
    } catch {
      setCameraError("카메라 권한을 허용해야 QR 검색을 사용할 수 있습니다.");
    }
  };

  return (
    <section className="fixed inset-0 z-40 flex items-end bg-slate-900/45">
      <div className="w-full rounded-t-3xl bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">발주 QR 검색</h3>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 p-1.5 text-slate-700">
            <X className="size-4" />
          </button>
        </div>
        <button type="button" onClick={startScan} className="w-full rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white">
          카메라 활성화 후 QR 인식
        </button>
        <p className="mt-2 text-[11px] text-slate-600">QR이 인식되면 해당 품목의 가격비교로 자동 이동합니다.</p>
        {cameraError && <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-700">{cameraError}</p>}
        <div className="mt-2 flex gap-2">
          <input
            value={manualCode}
            onChange={(event) => setManualCode(event.target.value)}
            placeholder="수동 코드 입력 (ITEM-001)"
            className="h-9 flex-1 rounded-lg border border-slate-200 px-2 text-xs"
          />
          <button type="button" onClick={() => manualCode.trim() && onDetected(manualCode.trim())} className="rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white">
            적용
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          권한 차단 시 브라우저 주소창의 카메라 권한을 허용해 주세요.
        </p>
        <Link href="/settings" className="mt-2 inline-block text-[11px] text-blue-700 underline">
          권한 설정 안내
        </Link>
      </div>
    </section>
  );
}
