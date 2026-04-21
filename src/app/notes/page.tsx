"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppTabBar, HeaderHero, MobileFrame, SectionCard, StatusChip } from "@/components/mobile/design-system";
import { Input } from "@/components/ui/input";
import { getSurgeryCaseDetailById, surgeryCases } from "@/data/mock-surgeries";

export default function NotesPage() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCaseId(params.get("caseId"));
  }, []);

  const items = useMemo(() => {
    return surgeryCases
      .map((item) => {
        const detail = getSurgeryCaseDetailById(item.id);
        return {
          id: item.id,
          surgeryName: item.surgeryName,
          surgeon: item.surgeon,
          note: detail?.surgeonDifferences[0]?.items[0] ?? "표준 프로토콜 우선 적용",
          action: detail?.immediateActions[0] ?? "핵심 준비 항목 확인",
        };
      })
      .filter((item) => {
        const matchesQuery = `${item.surgeryName} ${item.surgeon} ${item.note}`.includes(query);
        const matchesCase = caseId ? item.id === caseId : true;
        return matchesQuery && matchesCase;
      });
  }, [query, caseId]);

  return (
    <MobileFrame>
      <HeaderHero title="기록 / 메모" subtitle={caseId ? `${caseId} 연동 메모` : "케이스 특이사항을 카드로 빠르게 조회"} right={<StatusChip label={`${items.length}건`} tone="info" />} />
      <SectionCard title="검색">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="수술명, 교수명, 메모 키워드"
          className="h-11 rounded-xl border-0 bg-[#f3f6ff]"
        />
      </SectionCard>
      <SectionCard title="최근 메모">
        <div className="space-y-2 pb-24">
          {items.map((item) => (
            <Link key={item.id} href={`/cases/${item.id}`} className="block rounded-2xl border border-[var(--app-border)] bg-white p-3">
              <p className="text-sm font-semibold text-slate-900">{item.surgeryName}</p>
              <p className="mt-1 text-xs text-slate-600">{item.surgeon}</p>
              <p className="mt-2 text-sm text-slate-800">메모: {item.note}</p>
              <p className="mt-1 text-xs text-blue-700">다음 액션: {item.action}</p>
            </Link>
          ))}
        </div>
      </SectionCard>
      <AppTabBar currentPath="/notes" />
    </MobileFrame>
  );
}
