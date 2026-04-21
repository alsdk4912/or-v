import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardCheck, MapPin } from "lucide-react";

import {
  BottomCTABar,
  HeaderHero,
  MobileFrame,
  SectionCard,
  StatusChip,
} from "@/components/mobile/design-system";
import { Badge } from "@/components/ui/badge";
import { getSurgeryCaseById, getSurgeryCaseDetailById } from "@/data/mock-surgeries";
import { getCaseItemStatus } from "@/lib/inventory-engine";

export default function SurgeryCaseDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { tab?: string };
}) {
  const { id } = params;
  const tab = searchParams?.tab;
  const surgery = getSurgeryCaseById(id);
  const detail = getSurgeryCaseDetailById(id);

  if (!surgery || !detail) {
    notFound();
  }

  const section = tab ?? "요약";
  const requiredItems = getCaseItemStatus(surgery.id);

  return (
    <MobileFrame>
      <HeaderHero
        title={surgery.surgeryName}
        subtitle={`${surgery.operatingRoom} · ${surgery.scheduledTime} · 담당 ${surgery.assignedNurse}`}
        right={<StatusChip label={surgery.preparationStatus} tone={surgery.preparationStatus === "누락" ? "danger" : surgery.preparationStatus === "검토필요" ? "warn" : "ok"} />}
      />
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-600">
        <ArrowLeft className="size-3.5" /> 대시보드로 돌아가기
      </Link>

      <section className="sticky top-2 z-10 grid grid-cols-4 gap-2 rounded-2xl bg-white/95 p-2 backdrop-blur">
        <SegmentTab href={`/cases/${surgery.id}?tab=요약`} label="요약" active={section === "요약"} />
        <SegmentTab href={`/cases/${surgery.id}?tab=준비`} label="준비" active={section === "준비"} />
        <SegmentTab href={`/cases/${surgery.id}?tab=프로토콜`} label="프로토콜" active={section === "프로토콜"} />
        <SegmentTab href={`/cases/${surgery.id}?tab=체크`} label="체크" active={section === "체크"} />
      </section>

      {section === "요약" && (
        <SectionCard title="핵심 요약">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <TopInfo label="환자 정보(더미)" value={`${detail.patient.patientId} / ${detail.patient.sex} / ${detail.patient.age}세`} />
            <TopInfo label="수술실" value={surgery.operatingRoom} />
            <TopInfo label="시간" value={`${surgery.scheduledTime} (${surgery.estimatedDurationMin}분)`} />
            <TopInfo label="담당자" value={surgery.assignedNurse} />
            <TopInfo label="교수명" value={surgery.surgeon} />
            <TopInfo label="마취 방식" value={detail.anesthesiaType} />
            <TopInfo label="진행 상태" value={surgery.surgeryStatus} />
            <TopInfo label="현재 단계" value={detail.currentChecklistStage} />
          </div>
        </SectionCard>
      )}

      {section === "준비" && (
        <>
          <SectionCard title="지금 해야 할 일" subtitle="현재 케이스 우선 대응 항목">
            <ul className="space-y-2">
              {detail.immediateActions.map((item) => (
                <li key={item} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-blue-soft)] px-3 py-2 text-sm text-slate-800">
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="준비물-재고 연계" subtitle="부족/임박/멸균 상태를 함께 확인">
            <div className="space-y-2">
              {requiredItems.map((req) => (
                <div key={req.item_id} className="rounded-xl border border-[var(--app-border)] bg-white px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{req.item_name}</p>
                    <StatusChip label={req.risk} tone={req.risk === "부족" ? "danger" : req.risk === "부족 우려" ? "warn" : "ok"} />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    필요 {req.required_qty}개 · FEFO 추천로트 {req.fefo_lot_id} ({req.lot_status})
                  </p>
                  <p className="mt-1 text-xs text-blue-700">다음 조치: {req.urgent_action}</p>
                  {req.substitute_items.length > 0 && (
                    <p className="mt-1 text-xs text-amber-700">대체 가능: {req.substitute_items.join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
          <InfoListCard title="필요 재료" items={detail.requiredMaterials} />
          <InfoListCard title="필요 장비" items={detail.requiredEquipment} />
          <SectionCard title="정확한 장비 위치">
            <p className="mb-2 inline-flex items-center gap-2 text-sm text-blue-700">
              <MapPin className="size-4 text-blue-700" />
              위치 확인
            </p>
            {detail.equipmentLocations.map((item) => (
              <div key={`${item.equipment}-${item.location}`} className="mb-2 rounded-xl border border-[var(--app-border)] bg-white px-3 py-2 text-sm">
                <p className="font-medium text-slate-800">{item.equipment}</p>
                <p className="text-slate-600">{item.location}</p>
              </div>
            ))}
          </SectionCard>
        </>
      )}

      {section === "프로토콜" && (
        <>
          <SectionCard title="표준 매뉴얼 요약">
            {detail.standardManualSummary.map((item) => (
              <div key={item.title} className="mb-2 rounded-xl border border-[var(--app-border)] px-3 py-2">
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-sm text-slate-600">{item.summary}</p>
              </div>
            ))}
          </SectionCard>
          <SectionCard title="교수별 차이사항" subtitle="표준과 분리해서 확인">
            {detail.surgeonDifferences.map((diff) => (
              <div key={diff.title} className="space-y-2">
                <p className="text-sm font-semibold text-slate-800">{diff.title}</p>
                <ul className="space-y-1">
                  {diff.items.map((item) => (
                    <li key={item} className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </SectionCard>
        </>
      )}

      {section === "체크" && (
        <>
          <SectionCard title="현재 체크리스트 단계">
            <p className="mb-2 inline-flex items-center gap-2 text-sm text-blue-700">
              <ClipboardCheck className="size-4 text-blue-700" />
              진행 단계
            </p>
            <Badge className="bg-blue-600 text-white">{detail.currentChecklistStage}</Badge>
            <p className="text-sm text-slate-700">현재 차단 상태: {surgery.checklist.blockedByStage}</p>
            <p className="text-sm text-slate-600">
              완료 항목: {surgery.checklist.completedCount}/{surgery.checklist.totalCount}
            </p>
          </SectionCard>
          <SectionCard title="수술 전 재고/멸균 확인">
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="rounded-md bg-slate-50 px-3 py-2">[ ] 준비물 확보 완료 확인</li>
              <li className="rounded-md bg-slate-50 px-3 py-2">[ ] 멸균 확인 완료</li>
              <li className="rounded-md bg-slate-50 px-3 py-2">[ ] 유효기간 임박 품목 FEFO 우선 사용 확인</li>
            </ul>
          </SectionCard>
          <InfoListCard title="다음 단계 안내" items={detail.nextStepGuidance} />
        </>
      )}
      <BottomCTABar label="체크리스트 수행 시작" href={`/cases/${surgery.id}/checklist`} />
      <div className="grid grid-cols-2 gap-2 pb-2">
        <Link href="/manual" className="rounded-xl bg-white px-3 py-3 text-center text-sm font-semibold text-slate-700">매뉴얼 보기</Link>
        <Link href={`/preferences?surgeon=${encodeURIComponent(surgery.surgeon)}`} className="rounded-xl bg-white px-3 py-3 text-center text-sm font-semibold text-slate-700">교수별 차이 보기</Link>
      </div>
    </MobileFrame>
  );
}

function SegmentTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} className={`rounded-xl px-2 py-2 text-center text-xs font-semibold ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
      {label}
    </Link>
  );
}

function TopInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-800">{value}</p>
    </div>
  );
}

function InfoListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <SectionCard title={title}>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {item}
            </li>
          ))}
        </ul>
    </SectionCard>
  );
}
