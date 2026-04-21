"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock3, Filter } from "lucide-react";

import { AppTabBar, HeaderHero, MobileFrame, SectionCard, StatusChip } from "@/components/mobile/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { allOperatingRooms, allSurgeons, surgeryCases } from "@/data/mock-surgeries";
import { getCaseItemStatus } from "@/lib/inventory-engine";
import type { UrgencyLevel } from "@/types/dashboard";

const urgencyOptions: Array<UrgencyLevel | "전체"> = ["전체", "일반", "긴급", "응급"];

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<"일간" | "주간">("일간");
  const [roomFilter, setRoomFilter] = useState("전체");
  const [surgeonFilter, setSurgeonFilter] = useState("전체");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | "전체">("전체");

  const items = useMemo(
    () =>
      surgeryCases.filter(
        (item) =>
          (roomFilter === "전체" || item.operatingRoom === roomFilter) &&
          (surgeonFilter === "전체" || item.surgeon === surgeonFilter) &&
          (urgencyFilter === "전체" || item.urgency === urgencyFilter),
      ),
    [roomFilter, surgeonFilter, urgencyFilter],
  );

  return (
    <MobileFrame>
      <HeaderHero title="수술 일정" subtitle={`${viewMode} 기준 핵심 일정만 빠르게 확인`} right={<StatusChip label={`${items.length}건`} tone="info" />} />
      <section className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-2">
        <button type="button" onClick={() => setViewMode("일간")} className={`rounded-xl px-2 py-2 text-xs font-semibold ${viewMode === "일간" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>일간</button>
        <button type="button" onClick={() => setViewMode("주간")} className={`rounded-xl px-2 py-2 text-xs font-semibold ${viewMode === "주간" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>주간</button>
      </section>
      <SectionCard title="필터" subtitle="수술실/집도의/긴급도">
        <div className="space-y-3">
          <FilterSelect label="수술실" value={roomFilter} onChange={setRoomFilter} options={["전체", ...allOperatingRooms]} />
          <FilterSelect label="집도의" value={surgeonFilter} onChange={setSurgeonFilter} options={["전체", ...allSurgeons]} />
          <FilterSelect label="긴급도" value={urgencyFilter} onChange={(v) => setUrgencyFilter(v as UrgencyLevel | "전체")} options={urgencyOptions} />
        </div>
      </SectionCard>

      <SectionCard title="오늘 일정 카드">
        <div className="space-y-2 pb-24">
          {items.map((item) => (
            <Link key={item.id} href={`/cases/${item.id}`} className="block rounded-2xl bg-[#f4f7ff] p-3">
              {(() => {
                const risks = getCaseItemStatus(item.id);
                const shortage = risks.some((r) => r.risk === "부족");
                const warning = risks.some((r) => r.risk === "부족 우려" || r.lot_status === "임박" || r.lot_status === "재멸균 필요");
                return (
                  <div className="mb-1 flex justify-end">
                    {(shortage || warning) && (
                      <StatusChip label={shortage ? "재고 부족 영향" : "재고 주의"} tone={shortage ? "danger" : "warn"} />
                    )}
                  </div>
                );
              })()}
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{item.surgeryName}</p>
                <StatusChip
                  label={item.preparationStatus}
                  tone={item.preparationStatus === "누락" ? "danger" : item.preparationStatus === "검토필요" ? "warn" : "ok"}
                />
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                <Clock3 className="size-3.5" /> {item.scheduledTime} · {item.operatingRoom} · {item.assignedNurse}
              </p>
              <p className="mt-1 text-xs text-blue-700">터치하여 케이스 상세/체크리스트 진입</p>
            </Link>
          ))}
        </div>
      </SectionCard>
      <AppTabBar currentPath="/schedule" />
    </MobileFrame>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1">
      <p className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
        <Filter className="size-3.5" />
        {label}
      </p>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className="h-11 w-full rounded-xl border-0 bg-[#f3f6ff] text-slate-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
