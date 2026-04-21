"use client";

import { useMemo, useState } from "react";

import { AppTabBar, HeaderHero, MobileFrame, SectionCard, StatusChip } from "@/components/mobile/design-system";
import { purchaseRequestsMock, itemMasters } from "@/data/inventory-mock";
import { getAllRecommendations, getItemPriceComparisons } from "@/lib/inventory-engine";

type ProcurementTab = "자동추천" | "가격비교" | "발주이력";

export default function ProcurementPage() {
  const [tab, setTab] = useState<ProcurementTab>("자동추천");
  const recs = useMemo(() => getAllRecommendations().filter((r) => r.order_required), []);
  const targetItemId = recs[0]?.item_id ?? itemMasters[0].item_id;
  const prices = useMemo(() => getItemPriceComparisons(targetItemId), [targetItemId]);

  return (
    <MobileFrame>
      <HeaderHero title="발주 / 가격비교" subtitle="권장발주 · 공급사비교 · 이력관리" right={<StatusChip label={`${recs.length}건`} tone="warn" />} />
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
                {row.groupSaving > 0 && <p className="mt-1 text-xs text-emerald-700">공동구매 예상 절감 {row.groupSaving.toLocaleString()}원/EA</p>}
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
