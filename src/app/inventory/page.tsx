"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";

import { AppTabBar, HeaderHero, MobileFrame, SectionCard, StatusChip } from "@/components/mobile/design-system";
import { Input } from "@/components/ui/input";
import { inventoryLots, itemMasters } from "@/data/inventory-mock";
import { getAllRecommendations, getItemRisk } from "@/lib/inventory-engine";

export default function InventoryPage() {
  const [query, setQuery] = useState("");
  const recommendations = useMemo(() => getAllRecommendations(), []);

  const rows = useMemo(
    () =>
      itemMasters
        .filter((item) => `${item.item_name} ${item.category}`.includes(query))
        .map((item) => {
          const rec = recommendations.find((r) => r.item_id === item.item_id)!;
          const lotCount = inventoryLots.filter((lot) => lot.item_id === item.item_id).length;
          return { item, rec, risk: getItemRisk(item.item_id), lotCount };
        }),
    [query, recommendations],
  );

  return (
    <MobileFrame>
      <HeaderHero title="재고" subtitle="수술 예측 기반 권장재고와 실제 로트를 함께 관리" right={<StatusChip label={`${rows.length}품목`} tone="info" />} />
      <SectionCard title="검색/필터">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="품목명, 카테고리" className="h-11 rounded-xl border-0 bg-[#f3f6ff]" />
      </SectionCard>

      <SectionCard title="AI 재고추천" subtitle="권장 근거를 함께 제공합니다">
        <div className="space-y-2">
          {recommendations.slice(0, 3).map((rec) => {
            const item = itemMasters.find((i) => i.item_id === rec.item_id)!;
            return (
              <div key={rec.item_id} className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
                <p className="flex items-center gap-1 text-sm font-semibold text-blue-800">
                  <Sparkles className="size-4" />
                  {item.item_name}
                </p>
                <p className="mt-1 text-xs text-blue-700">권장재고 {rec.recommended_stock}{item.unit} / 현재 {rec.current_stock}{item.unit}</p>
                <p className="mt-1 text-xs text-slate-700">{rec.reason_lines[0]}</p>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="품목 재고현황">
        <div className="space-y-2 pb-24">
          {rows.map(({ item, rec, risk, lotCount }) => (
            <div key={item.item_id} className="rounded-2xl bg-white p-3 shadow-[0_1px_6px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{item.item_name}</p>
                <StatusChip label={risk} tone={risk === "부족" ? "danger" : risk === "부족 우려" ? "warn" : "ok"} />
              </div>
              <p className="mt-1 text-xs text-slate-600">{item.category} · 로트 {lotCount}개</p>
              <p className="mt-1 text-xs text-slate-700">현재 {rec.current_stock} / 안전 {rec.safety_stock} / 권장 {rec.recommended_stock}</p>
              {rec.order_required && (
                <p className="mt-2 flex items-center gap-1 text-xs text-rose-700">
                  <AlertTriangle className="size-3.5" /> 권장발주 {rec.recommended_order_qty}{item.unit}
                </p>
              )}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/procurement" className="rounded-xl bg-slate-100 px-2 py-2 text-center text-xs font-semibold text-slate-700">
                  발주 검토
                </Link>
                <Link href="/sterilization" className="rounded-xl bg-blue-600 px-2 py-2 text-center text-xs font-semibold text-white">
                  멸균 확인
                </Link>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <AppTabBar currentPath="/inventory" />
    </MobileFrame>
  );
}
