"use client";

import { useMemo, useState } from "react";

import { HeaderHero, MobileFrame, SectionCard, StatusChip } from "@/components/mobile/design-system";
import { inventoryLots, itemMasters } from "@/data/inventory-mock";
import { getLotPriorityBadge } from "@/lib/inventory-engine";

type SterileFilter = "전체" | "정상" | "임박" | "만료" | "재멸균 필요" | "폐기 후보";

export default function SterilizationPage() {
  const [filter, setFilter] = useState<SterileFilter>("전체");
  const rows = useMemo(
    () =>
      inventoryLots.filter((lot) => filter === "전체" || lot.status === filter).map((lot) => ({
        lot,
        item: itemMasters.find((item) => item.item_id === lot.item_id)!,
      })),
    [filter],
  );

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
    </MobileFrame>
  );
}

function Action({ label }: { label: string }) {
  return <button type="button" className="rounded-lg bg-slate-100 px-1 py-2 text-[11px] font-semibold text-slate-700">{label}</button>;
}
