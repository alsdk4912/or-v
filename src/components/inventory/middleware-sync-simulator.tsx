"use client";

import { useMemo, useState } from "react";
import { Barcode, CheckCircle2, Loader2, ScanText } from "lucide-react";

type SyncStatus = "Standby" | "Syncing" | "Completed";

interface InventoryItemState {
  itemName: string;
  appStock: number;
  erpStock: number;
}

const INITIAL_ITEM: InventoryItemState = {
  itemName: "멸균 봉합사 2-0",
  appStock: 42,
  erpStock: 42,
};

export function MiddlewareSyncSimulator() {
  const [status, setStatus] = useState<SyncStatus>("Standby");
  const [item, setItem] = useState<InventoryItemState>(INITIAL_ITEM);
  const [lastLog, setLastLog] = useState("대기 중");

  const statusTone = useMemo(() => {
    if (status === "Syncing") return "bg-amber-100 text-amber-700";
    if (status === "Completed") return "bg-emerald-100 text-emerald-700";
    return "bg-slate-100 text-slate-700";
  }, [status]);

  const simulateMiddlewareSync = async (source: "BARCODE" | "OCR") => {
    setStatus("Syncing");
    setLastLog(`${source} 인식 완료 → Middleware API 전송 중`);

    // Direct DB 접근이 아닌 REST API 방식을 사용하여 병원 보안 가이드라인 준수
    const payload = {
      item_name: item.itemName,
      used_qty: 1,
      source,
      sent_at: new Date().toISOString(),
      api_mode: "REST",
    };

    await new Promise((resolve) => setTimeout(resolve, 1200));
    void payload;

    setItem((prev) => ({
      ...prev,
      appStock: prev.appStock - 1,
      erpStock: prev.erpStock - 1,
    }));
    setStatus("Completed");
    setLastLog(`전송 성공: 앱/ERP 재고 동시 반영 (${item.itemName} -1)`);
  };

  return (
    <section className="rounded-2xl border border-blue-900/40 bg-gradient-to-b from-slate-900 to-blue-950 p-3 text-slate-100 shadow-[0_8px_18px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Middleware 재고 연동 시뮬레이션</h3>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone}`}>{status}</span>
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-2 text-xs">
        <p className="font-semibold text-blue-100">대상 품목: {item.itemName}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-950/60 px-2 py-2">
            <p className="text-[11px] text-slate-400">앱 재고</p>
            <p className="text-sm font-bold text-blue-200">{item.appStock}</p>
          </div>
          <div className="rounded-lg bg-slate-950/60 px-2 py-2">
            <p className="text-[11px] text-slate-400">ERP 재고</p>
            <p className="text-sm font-bold text-emerald-200">{item.erpStock}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void simulateMiddlewareSync("BARCODE")}
          disabled={status === "Syncing"}
          className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-2 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          <Barcode className="size-3.5" />
          바코드 스캔
        </button>
        <button
          type="button"
          onClick={() => void simulateMiddlewareSync("OCR")}
          disabled={status === "Syncing"}
          className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-800 disabled:opacity-60"
        >
          <ScanText className="size-3.5" />
          OCR 인식
        </button>
      </div>

      {/* QR이 없는 병원을 위해 카메라 OCR로 텍스트를 인식하여 전송하는 예외 처리 로직 설계 */}
      <p className="mt-2 text-[11px] text-slate-300">
        QR 미부착 환경은 OCR 인식 경로로 동일 Middleware API 전송을 수행합니다.
      </p>

      <div className="mt-2 rounded-lg bg-white/10 px-2 py-2 text-[11px]">
        {status === "Syncing" ? (
          <p className="flex items-center gap-1 text-amber-200">
            <Loader2 className="size-3.5 animate-spin" />
            {lastLog}
          </p>
        ) : status === "Completed" ? (
          <p className="flex items-center gap-1 text-emerald-200">
            <CheckCircle2 className="size-3.5" />
            {lastLog}
          </p>
        ) : (
          <p className="text-slate-300">{lastLog}</p>
        )}
      </div>
    </section>
  );
}
