"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, Clock3 } from "lucide-react";

import {
  AppTabBar,
  HeaderHero,
  MobileFrame,
  RoundedActionCard,
  SectionCard,
  StatusChip,
} from "@/components/mobile/design-system";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  allDepartments,
  allOperatingRooms,
  allSurgeons,
  surgeryCases,
} from "@/data/mock-surgeries";
import { getInventoryDashboardStats, getRecommendationForItem } from "@/lib/inventory-engine";
import { itemMasters } from "@/data/inventory-mock";
import type { PreparationStatus } from "@/types/dashboard";

const prepFilterOptions: Array<PreparationStatus | "전체"> = ["전체", "준비완료", "검토필요", "누락", "중요"];

export default function DashboardPage() {
  const router = useRouter();
  const [roomFilter, setRoomFilter] = useState("전체");
  const [deptFilter, setDeptFilter] = useState("전체");
  const [surgeonFilter, setSurgeonFilter] = useState("전체");
  const [prepFilter, setPrepFilter] = useState<PreparationStatus | "전체">("전체");

  const filteredCases = useMemo(
    () =>
      surgeryCases.filter((item) => {
        return (
          (roomFilter === "전체" || item.operatingRoom === roomFilter) &&
          (deptFilter === "전체" || item.department === deptFilter) &&
          (surgeonFilter === "전체" || item.surgeon === surgeonFilter) &&
          (prepFilter === "전체" || item.preparationStatus === prepFilter)
        );
      }),
    [roomFilter, deptFilter, surgeonFilter, prepFilter],
  );

  const summary = useMemo(() => {
    const total = filteredCases.length;
    const prepCompleteCount = filteredCases.filter((item) => item.preparationStatus === "준비완료").length;
    const delayedChecklistCount = filteredCases.filter(
      (item) => item.flags.delayedPreparation || item.checklist.blockedByStage !== "없음",
    ).length;
    const attentionRequiredCount = filteredCases.filter(
      (item) => item.flags.missingSupplies || item.flags.emergency || item.preparationStatus !== "준비완료",
    ).length;
    return { total, prepCompleteCount, delayedChecklistCount, attentionRequiredCount };
  }, [filteredCases]);

  const avgChecklistProgress = useMemo(() => {
    if (!filteredCases.length) return 0;
    return Math.round(
      filteredCases.reduce((acc, item) => acc + (item.checklist.completedCount / item.checklist.totalCount) * 100, 0) /
        filteredCases.length,
    );
  }, [filteredCases]);

  const criticalQueue = useMemo(
    () =>
      filteredCases
        .filter((item) => item.flags.missingSupplies || item.flags.emergency || item.checklist.blockedByStage !== "없음")
        .slice(0, 6),
    [filteredCases],
  );

  const inProgressCases = useMemo(
    () => filteredCases.filter((item) => item.surgeryStatus === "준비중" || item.surgeryStatus === "지연위험").slice(0, 3),
    [filteredCases],
  );

  const inventoryStats = useMemo(() => getInventoryDashboardStats(), []);
  const urgentRecommendations = useMemo(
    () =>
      itemMasters
        .map((item) => ({ item, rec: getRecommendationForItem(item.item_id) }))
        .filter((x) => x.rec.urgent_order_required)
        .slice(0, 2),
    [],
  );

  return (
    <MobileFrame>
      <HeaderHero title="오늘 수술실 운영" subtitle="중요 케이스를 먼저 확인하고 바로 처리하세요." right={<StatusChip label={`${summary.total}건`} tone="info" />}>
        <div className="grid grid-cols-3 gap-2">
          <MiniHeroStat label="준비완료" value={summary.prepCompleteCount} />
          <MiniHeroStat label="지연" value={summary.delayedChecklistCount} />
          <MiniHeroStat label="주의" value={summary.attentionRequiredCount} />
        </div>
      </HeaderHero>

      <SectionCard title="오늘의 핵심 액션" subtitle="우선순위 케이스">
        <div className="space-y-2">
          {criticalQueue.slice(0, 3).map((item) => (
            <RoundedActionCard
              key={item.id}
              title={`${item.surgeryName} (${item.operatingRoom})`}
              description={`${item.scheduledTime} · ${item.assignedNurse} · ${item.checklist.blockedByStage}`}
              actionLabel="케이스 열기"
              onClick={() => router.push(`/cases/${item.id}`)}
              chip={<StatusChip label={item.preparationStatus} tone={item.preparationStatus === "누락" ? "danger" : item.preparationStatus === "검토필요" ? "warn" : "ok"} />}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="긴급/중요 알림">
        <div className="space-y-2">
          {criticalQueue.slice(0, 2).map((item) => (
            <div key={item.id} className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
              <p className="flex items-center gap-1 text-sm font-semibold text-rose-700">
                <AlertTriangle className="size-4" /> {item.surgeryName}
              </p>
              <p className="mt-1 text-xs text-rose-700">
                {item.operatingRoom} · {item.scheduledTime} · {item.checklist.blockedByStage}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="재고/멸균 위험 요약">
        <div className="grid grid-cols-2 gap-2">
          <MiniHeroStat label="재고 부족 품목" value={inventoryStats.shortage} />
          <MiniHeroStat label="유효기간 임박" value={inventoryStats.soonExpiry} />
          <MiniHeroStat label="재멸균 필요" value={inventoryStats.sterilizationDue} />
          <MiniHeroStat label="발주 추천" value={inventoryStats.orderNeeded} />
        </div>
      </SectionCard>

      <SectionCard title="AI 인사이트">
        <div className="space-y-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
            다음주 정형외과 수술 증가로 봉합사 사용량 증가가 예상됩니다.
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
            이번 주 멸균 만료 품목 {inventoryStats.sterilizationDue}건으로 우선 사용/재멸균 처리가 필요합니다.
          </div>
        </div>
      </SectionCard>

      <SectionCard title="긴급 수술 우선 대응 품목">
        <div className="space-y-2">
          {urgentRecommendations.map(({ item, rec }) => (
            <div key={item.item_id} className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
              <p className="text-sm font-semibold text-rose-700">{item.item_name}</p>
              <p className="mt-1 text-xs text-rose-700">
                긴급발주 권고 {rec.recommended_order_qty}
                {item.unit} · 사유: {rec.risk_factors[0]}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="빠른 필터">
        <div className="space-y-3">
          <FilterSelect label="수술실" value={roomFilter} onChange={setRoomFilter} options={["전체", ...allOperatingRooms]} />
          <FilterSelect label="진료과" value={deptFilter} onChange={setDeptFilter} options={["전체", ...allDepartments]} />
          <FilterSelect label="교수/집도의" value={surgeonFilter} onChange={setSurgeonFilter} options={["전체", ...allSurgeons]} />
          <FilterSelect label="준비 상태" value={prepFilter} onChange={(value) => setPrepFilter(value as PreparationStatus | "전체")} options={prepFilterOptions} />
        </div>
      </SectionCard>

      <SectionCard title="진행 중 케이스" subtitle={`체크리스트 평균 ${avgChecklistProgress}%`}>
        <div className="space-y-2">
          {inProgressCases.map((surgery) => (
            <Link key={surgery.id} href={`/cases/${surgery.id}`} className="block rounded-2xl bg-[#f5f8ff] p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{surgery.surgeryName}</p>
                <StatusChip label={surgery.urgency} tone={surgery.urgency === "응급" ? "danger" : surgery.urgency === "긴급" ? "warn" : "info"} />
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-700">
                <Clock3 className="size-3.5" /> {surgery.scheduledTime} · {surgery.operatingRoom}
              </p>
              <p className="mt-1 text-sm text-slate-700">담당 {surgery.assignedNurse} / 집도의 {surgery.surgeon}</p>
              <p className="mt-2 text-xs text-blue-700">다음 액션: 상세 열어 체크리스트 확인</p>
            </Link>
          ))}
        </div>
      </SectionCard>

      <section className="grid grid-cols-2 gap-2 pb-24">
        <NavPill href="/schedule" label="전체 일정 보기" />
        <NavPill href="/inventory" label="재고 바로가기" />
        <NavPill href="/procurement" label="발주 바로가기" />
        <NavPill href="/sterilization" label="멸균/유효기간" />
      </section>
      <AppTabBar currentPath="/" />
    </MobileFrame>
  );
}

function MiniHeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/15 px-2 py-2">
      <p className="text-[11px] text-blue-100">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}

function NavPill({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-xl bg-white px-2 py-3 text-center text-sm font-semibold text-slate-700">
      {label}
    </Link>
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
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <Select value={value} onValueChange={(v) => v != null && onChange(v)}>
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
