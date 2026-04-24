"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Bell, Clock3 } from "lucide-react";

import {
  AppTabBar,
  StatusChip,
} from "@/components/mobile/design-system";
import { surgeryCases } from "@/data/mock-surgeries";
import { getInventoryDashboardStats } from "@/lib/inventory-engine";

export default function DashboardPage() {
  const [panelTab, setPanelTab] = useState<"긴급" | "수술" | "인사이트">("긴급");
  const summary = useMemo(() => {
    const total = surgeryCases.length;
    const emergencyCount = surgeryCases.filter((item) => item.urgency === "응급").length;
    const inProgressCount = surgeryCases.filter(
      (item) => item.surgeryStatus === "준비중" || item.surgeryStatus === "지연위험",
    ).length;
    return { total, emergencyCount, inProgressCount };
  }, []);

  const urgentCases = useMemo(
    () =>
      surgeryCases
        .filter((item) => item.flags.missingSupplies || item.flags.emergency || item.checklist.blockedByStage !== "없음")
        .slice(0, 5),
    [],
  );

  const inventoryStats = useMemo(() => getInventoryDashboardStats(), []);
  const orderNeedCount = inventoryStats.orderNeeded;
  const blockedCount = useMemo(
    () => surgeryCases.filter((item) => item.checklist.blockedByStage !== "없음").length,
    [],
  );
  const missingRiskCount = useMemo(
    () => surgeryCases.filter((item) => item.flags.missingSupplies).length,
    [],
  );
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
      }).format(new Date()),
    [],
  );

  const upcomingSurgeries = useMemo(
    () =>
      [...surgeryCases]
        .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
        .slice(0, 3),
    [],
  );

  return (
    <div className="h-[100dvh] overflow-hidden bg-[var(--app-bg)]">
      <main className="mx-auto flex h-[calc(100dvh-64px)] w-full max-w-[420px] flex-col gap-2 px-3 py-3">
        <section className="rounded-2xl bg-gradient-to-b from-[#1e56ff] to-[#0f3fd6] px-3 py-3 text-white shadow-[0_6px_18px_rgba(30,86,255,0.22)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-blue-100">{todayLabel}</p>
              <h1 className="text-base font-semibold leading-tight">오늘 수술실 상황판</h1>
            </div>
            <div className="flex items-center gap-2">
              <StatusChip label={`발주 ${orderNeedCount}`} tone="warn" />
              <Bell className="size-4 text-blue-100" />
            </div>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            <HeroChip label="수술" value={`${summary.total}`} />
            <HeroChip label="응급" value={`${summary.emergencyCount}`} />
            <HeroChip label="진행" value={`${summary.inProgressCount}`} />
            <HeroChip label="발주" value={`${orderNeedCount}`} />
          </div>
          <div className="mt-2 rounded-xl border border-white/20 bg-white/10 px-2 py-2">
            <p className="flex items-center gap-1 text-xs font-semibold">
              <AlertTriangle className="size-3.5" />
              핵심: 체크리스트 게이팅 + 누락 방지
            </p>
            <p className="mt-1 text-[11px] text-blue-100">차단 상태 {blockedCount}건 · 누락 위험 {missingRiskCount}건을 우선 통제</p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-2 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
          <div className="space-y-1">
            <DetectionRow label="오늘 준비 누락 위험" value={missingRiskCount} tone={missingRiskCount > 0 ? "danger" : "ok"} />
            <DetectionRow label="재고 부족 예상" value={inventoryStats.shortage} tone={inventoryStats.shortage > 0 ? "warn" : "ok"} />
            <DetectionRow label="발주 필요" value={inventoryStats.orderNeeded} tone={inventoryStats.orderNeeded > 0 ? "warn" : "ok"} />
            <DetectionRow label="체크리스트 차단 상태" value={blockedCount} tone={blockedCount > 0 ? "danger" : "ok"} />
          </div>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2">
          <p className="text-[11px] text-blue-800">핵심 지표 추이는 하단 탭 대신 데이터 화면에서 확인하세요.</p>
          <Link href="/analytics" className="mt-1 inline-block text-xs font-semibold text-blue-700 underline">
            데이터 개선 화면 열기
          </Link>
        </section>

        <section className="min-h-0 flex-1 rounded-2xl bg-white p-2 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
          <div className="grid grid-cols-3 gap-1.5">
            <PanelTab label="긴급/주의" active={panelTab === "긴급"} onClick={() => setPanelTab("긴급")} />
            <PanelTab label="다가오는 수술" active={panelTab === "수술"} onClick={() => setPanelTab("수술")} />
            <PanelTab label="AI 인사이트" active={panelTab === "인사이트"} onClick={() => setPanelTab("인사이트")} />
          </div>

          <div className="mt-2 h-[calc(100%-38px)] overflow-y-auto">
            {panelTab === "긴급" && (
              <div className="space-y-1.5">
                {urgentCases.slice(0, 3).map((item) => (
                  <Link key={item.id} href={`/cases/${item.id}/`} className="block rounded-xl border border-rose-100 bg-rose-50 px-2.5 py-2">
                    <p className="truncate text-xs font-semibold text-rose-700">{item.surgeryName}</p>
                    <p className="mt-0.5 truncate text-[11px] text-rose-700">
                      {item.scheduledTime} · {item.operatingRoom} · {item.checklist.blockedByStage}
                    </p>
                  </Link>
                ))}
                <Link href="/schedule" className="block text-right text-[11px] font-semibold text-blue-700">
                  더보기
                </Link>
              </div>
            )}

            {panelTab === "수술" && (
              <div className="space-y-1.5">
                {upcomingSurgeries.map((surgery) => (
                  <Link key={surgery.id} href={`/cases/${surgery.id}/`} className="block rounded-xl bg-[#f4f7ff] px-2.5 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-slate-900">{surgery.surgeryName}</p>
                      <StatusChip label={surgery.urgency} tone={surgery.urgency === "응급" ? "danger" : surgery.urgency === "긴급" ? "warn" : "info"} />
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-600">
                      <Clock3 className="size-3" /> {surgery.scheduledTime} · {surgery.operatingRoom}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            {panelTab === "인사이트" && (
              <div className="space-y-1.5">
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-2.5 py-2 text-[11px] text-blue-800">
                  다음주 정형외과 수술 증가로 봉합사 수요 상승이 예상됩니다.
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-800">
                  멸균 만료 예정 품목 {inventoryStats.sterilizationDue}건은 우선 사용 또는 재처리가 필요합니다.
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <AppTabBar currentPath="/" />
    </div>
  );
}

function PanelTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-1 py-1.5 text-[11px] font-semibold ${
        active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
      }`}
    >
      {label}
    </button>
  );
}

function HeroChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/12 px-1.5 py-1.5">
      <p className="text-[10px] text-blue-100">{label}</p>
      <p className="text-xs font-semibold">{value}</p>
    </div>
  );
}

function DetectionRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ok" | "warn" | "danger";
}) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-2 py-1.5 text-xs ${
      tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : tone === "warn" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
    }`}>
      <p className="font-semibold">{label}</p>
      <span className="rounded-full bg-white/80 px-2 py-0.5 font-bold">{value}건</span>
    </div>
  );
}

