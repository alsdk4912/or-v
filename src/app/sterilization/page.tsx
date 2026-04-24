"use client";

import { useMemo, useState } from "react";

import { HeaderHero, MobileFrame, SectionCard, StatusChip } from "@/components/mobile/design-system";
import { inventoryLots, itemMasters } from "@/data/inventory-mock";
import { getLotPriorityBadge } from "@/lib/inventory-engine";

type SterileFilter = "전체" | "정상" | "임박" | "만료" | "재멸균 필요" | "폐기 후보";

export default function SterilizationPage() {
  const [filter, setFilter] = useState<SterileFilter>("전체");
  const [scanCode, setScanCode] = useState("");
  const [usageLog, setUsageLog] = useState<string[]>([]);
  const rows = useMemo(
    () =>
      inventoryLots.filter((lot) => filter === "전체" || lot.status === filter).map((lot) => ({
        lot,
        item: itemMasters.find((item) => item.item_id === lot.item_id)!,
      })),
    [filter],
  );
  const expiringRows = useMemo(() => inventoryLots.filter((lot) => lot.status === "임박"), []);
  const autoOrders = useMemo(
    () =>
      usageLog
        .map((entry) => itemMasters.find((item) => entry.includes(item.item_id)))
        .filter((item): item is (typeof itemMasters)[number] => Boolean(item))
        .map((item) => `${item.item_name} 자동발주 요청 생성(공급사 ${item.preferred_vendor_id})`),
    [usageLog],
  );

  const handleMockScan = () => {
    const target = inventoryLots.find((lot) => lot.lot_id === scanCode || lot.item_id === scanCode);
    if (!target) {
      setUsageLog((prev) => [`[실패] ${scanCode} 식별 불가`, ...prev].slice(0, 5));
      return;
    }
    const item = itemMasters.find((row) => row.item_id === target.item_id)!;
    setUsageLog((prev) => [`[사용처리] LOT ${target.lot_id} · ${item.item_name} 1${item.unit} 차감`, ...prev].slice(0, 5));
    setScanCode("");
  };

  return (
    <MobileFrame>
      <HeaderHero title="멸균 / 유효기간" subtitle="FEFO 우선사용과 재멸균 대상을 관리" right={<StatusChip label={`${rows.length}로트`} tone="info" />} />
      <section className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-2">
        {(["전체", "임박", "재멸균 필요", "만료", "폐기 후보", "정상"] as SterileFilter[]).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setFilter(name)}
            className={`rounded-xl px-2 py-2 text-[11px] font-semibold ${filter === name ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            {name}
          </button>
        ))}
      </section>
      <SectionCard title="로트 상태">
        <div className="space-y-2 pb-6">
          {rows.map(({ lot, item }) => (
            <div key={lot.lot_id} className="rounded-2xl border border-[var(--app-border)] bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{item.item_name}</p>
                <StatusChip label={lot.status} tone={lot.status === "만료" || lot.status === "폐기 후보" ? "danger" : lot.status === "임박" || lot.status === "재멸균 필요" ? "warn" : "ok"} />
              </div>
              <p className="mt-1 text-xs text-slate-700">LOT {lot.lot_id} · 수량 {lot.quantity}{item.unit} · 위치 {lot.location}</p>
              <p className="mt-1 text-xs text-slate-600">유효기간 {lot.expiry_date} · 멸균만료 {lot.sterilization_expiry_date ?? "-"}</p>
              <p className="mt-1 text-xs text-blue-700">권장 액션: {getLotPriorityBadge(lot.status)}</p>
              <div className="mt-2 grid grid-cols-4 gap-1">
                <Action label="우선사용" />
                <Action label="재멸균" />
                <Action label="폐기" />
                <Action label="대체품" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="카메라 스캔 사용처리" subtitle="멸균 라벨/QR 인식 후 자동 반영(데모)">
        <div className="space-y-2">
          <input
            value={scanCode}
            onChange={(event) => setScanCode(event.target.value)}
            placeholder="LOT-001 또는 ITEM-001"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
          />
          <button type="button" onClick={handleMockScan} className="w-full rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white">
            스캔 결과 반영
          </button>
          <p className="text-[11px] text-slate-500">예시 코드: LOT-001, LOT-007, ITEM-006</p>
        </div>
      </SectionCard>
      <SectionCard title="자동 생성 알림">
        <div className="space-y-2 pb-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-900">유효기간 임박 리스트</p>
            <p className="mt-1 text-xs text-amber-800">
              {expiringRows.map((lot) => `${lot.lot_id}`).join(", ")} ({expiringRows.length}건)
            </p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs font-semibold text-blue-900">사용분 자동발주 생성</p>
            <p className="mt-1 text-xs text-blue-800">{autoOrders[0] ?? "스캔 후 자동발주 제안이 생성됩니다."}</p>
          </div>
          <div className="space-y-1">
            {usageLog.map((log) => (
              <p key={log} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                {log}
              </p>
            ))}
          </div>
        </div>
      </SectionCard>
    </MobileFrame>
  );
}

function Action({ label }: { label: string }) {
  return <button type="button" className="rounded-lg bg-slate-100 px-1 py-2 text-[11px] font-semibold text-slate-700">{label}</button>;
}
