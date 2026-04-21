"use client";

import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

import { AppTabBar, HeaderHero, MobileFrame, SectionCard, StatusChip } from "@/components/mobile/design-system";
import { surgeryCases } from "@/data/mock-surgeries";

export default function ChecklistHubPage() {
  const sorted = [...surgeryCases].sort(
    (a, b) => a.checklist.completedCount / a.checklist.totalCount - b.checklist.completedCount / b.checklist.totalCount,
  );

  return (
    <MobileFrame>
      <HeaderHero title="체크리스트" subtitle="단계 게이팅 상태를 우선 확인" />
      <SectionCard title="진행 현황">
        <div className="space-y-2 pb-24">
          {sorted.map((item) => {
            const progress = Math.round((item.checklist.completedCount / item.checklist.totalCount) * 100);
            return (
              <div key={item.id} className="rounded-2xl bg-[#f5f8ff] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{item.surgeryName}</p>
                  <StatusChip label={`${progress}%`} tone={progress >= 80 ? "ok" : progress >= 50 ? "warn" : "danger"} />
                </div>
                <p className="mt-1 text-xs text-slate-700">
                  {item.id} · {item.operatingRoom} · 차단: {item.checklist.blockedByStage}
                </p>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link href={`/cases/${item.id}`} className="rounded-xl bg-white px-2 py-2 text-center text-xs font-semibold text-slate-700">
                    케이스
                  </Link>
                  <Link href={`/cases/${item.id}/checklist`} className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-2 py-2 text-xs font-semibold text-white">
                    <ClipboardCheck className="size-3.5" />
                    수행
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
      <AppTabBar currentPath="/checklists" />
    </MobileFrame>
  );
}
