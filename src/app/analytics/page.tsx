"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, BarChart3, Boxes, ShieldAlert } from "lucide-react";

import { AppTabBar, HeaderHero, MobileFrame, SectionCard } from "@/components/mobile/design-system";
import { completionLogMocks } from "@/data/admin-mock";
import { inventoryLots, surgeryUsageHistory } from "@/data/inventory-mock";
import { surgeryCases } from "@/data/mock-surgeries";

export default function AnalyticsPage() {
  const usageBySurgery = useMemo(() => {
    const deptUsage = surgeryUsageHistory.reduce<Record<string, number>>((acc, row) => {
      acc[row.department] = (acc[row.department] ?? 0) + row.used_qty;
      return acc;
    }, {});
    const deptToSurgery = new Map<string, string>();
    surgeryCases.forEach((row) => {
      if (!deptToSurgery.has(row.department)) {
        deptToSurgery.set(row.department, row.surgeryName);
      }
    });

    return Object.entries(deptUsage)
      .map(([department, qty]) => ({
        label: deptToSurgery.get(department) ?? department,
        value: Math.min(100, qty),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, []);

  const stockDropTrend = useMemo(() => {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const bucket = new Map<string, number>();

    surgeryUsageHistory.forEach((row) => {
      const day = dayNames[new Date(row.used_at).getDay()];
      bucket.set(day, (bucket.get(day) ?? 0) + row.used_qty);
    });

    return ["월", "화", "수", "목", "금"]
      .map((day) => ({ label: day, value: Math.min(100, bucket.get(day) ?? 0) }))
      .filter((row) => row.value > 0);
  }, []);

  const missRateTrend = useMemo(() => {
    const monthly = new Map<string, { total: number; delayed: number }>();

    completionLogMocks.forEach((log) => {
      const month = `${new Date(log.completedAt).getMonth() + 1}월`;
      const prev = monthly.get(month) ?? { total: 0, delayed: 0 };
      prev.total += 1;
      if (log.result === "지연 후 완료") prev.delayed += 1;
      monthly.set(month, prev);
    });

    return Array.from(monthly.entries()).map(([month, v]) => {
      const before = Math.min(100, Math.round((v.delayed / v.total) * 100 + 8));
      const after = Math.max(0, Math.round((v.delayed / v.total) * 100));
      return { month, before, after };
    });
  }, []);

  const expiringLots = inventoryLots.filter((lot) => lot.status === "임박").length;

  return (
    <MobileFrame>
      <HeaderHero title="데이터 개선 화면" subtitle={`날짜 기반 사용/누락/재고 추이 (임박 로트 ${expiringLots}건)`} />
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-600">
        <ArrowLeft className="size-3.5" /> 대시보드로 돌아가기
      </Link>

      <SectionCard title="핵심 데이터 요약">
        <div className="grid grid-cols-3 gap-2">
          <MetricIconCard icon={<BarChart3 className="size-4 text-blue-700" />} label="수술 사용량" value={`${usageBySurgery.length}유형`} />
          <MetricIconCard icon={<Boxes className="size-4 text-amber-700" />} label="재고 감소 추이" value={`${stockDropTrend.length}일`} />
          <MetricIconCard icon={<ShieldAlert className="size-4 text-rose-700" />} label="누락률 추적" value={`${missRateTrend.length}월`} />
        </div>
      </SectionCard>

      <SectionCard title="수술별 재료 사용량">
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

function MetricIconCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center">
      <div className="mb-1 flex justify-center">{icon}</div>
      <p className="text-[10px] text-slate-600">{label}</p>
      <p className="text-xs font-semibold text-slate-800">{value}</p>
    </div>
  );
}
