"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppTabBar, HeaderHero, MobileFrame, SectionCard } from "@/components/mobile/design-system";

const usageBySurgery = [
  { label: "고관절 전치환술", value: 86 },
  { label: "복강경 담낭절제술", value: 64 },
  { label: "개두술", value: 58 },
  { label: "제왕절개술", value: 43 },
];

const stockDropTrend = [
  { label: "월", value: 22 },
  { label: "화", value: 35 },
  { label: "수", value: 41 },
  { label: "목", value: 29 },
  { label: "금", value: 47 },
];

const missRateTrend = [
  { month: "1월", before: 18, after: 13 },
  { month: "2월", before: 17, after: 10 },
  { month: "3월", before: 19, after: 9 },
  { month: "4월", before: 16, after: 7 },
];

export default function AnalyticsPage() {
  return (
    <MobileFrame>
      <HeaderHero title="데이터 개선 화면" subtitle="누락 방지 중심 지표를 시각화" />
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-600">
        <ArrowLeft className="size-3.5" /> 대시보드로 돌아가기
      </Link>

      <SectionCard title="수술별 재료 사용량 그래프">
        <div className="space-y-2">
          {usageBySurgery.map((row) => (
            <BarRow key={row.label} label={row.label} value={row.value} color="bg-blue-600" />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="재고 감소 패턴">
        <div className="space-y-2">
          {stockDropTrend.map((row) => (
            <BarRow key={row.label} label={`${row.label}요일`} value={row.value} color="bg-amber-500" />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="누락 발생률 변화" subtitle="체크리스트 게이팅 도입 전/후">
        <div className="space-y-2 pb-24">
          {missRateTrend.map((row) => (
            <div key={row.month} className="rounded-xl border border-slate-200 bg-slate-50 p-2">
              <p className="text-xs font-semibold text-slate-700">{row.month}</p>
              <p className="mt-1 text-[11px] text-rose-700">도입 전 누락률 {row.before}%</p>
              <p className="text-[11px] text-emerald-700">도입 후 누락률 {row.after}%</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <AppTabBar currentPath="/" />
    </MobileFrame>
  );
}

function BarRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-slate-600">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-200">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
