"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MapPin, PlayCircle, X } from "lucide-react";

import { AppCard, BlueHero, MobileAppShell } from "@/components/mobile/app-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSurgeryCaseDetailById, surgeryCases } from "@/data/mock-surgeries";

export default function ManualPage() {
  const [caseId, setCaseId] = useState(surgeryCases[0]?.id ?? "");
  const [activeEquipment, setActiveEquipment] = useState<string | null>(null);
  const [mapTarget, setMapTarget] = useState<{ equipment: string; location: string } | null>(null);
  const detail = getSurgeryCaseDetailById(caseId);
  const surgery = surgeryCases.find((item) => item.id === caseId);

  if (!detail || !surgery) {
    return null;
  }

  return (
    <MobileAppShell>
      <BlueHero title="매뉴얼 / 학습" subtitle="현장에서 필요한 핵심만 단계적으로 확인하세요." />
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-600">
        <ArrowLeft className="size-3.5" /> 대시보드로 돌아가기
      </Link>
      <section className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-2">
        <Link href="/manual" className="rounded-xl bg-blue-600 px-2 py-2 text-center text-xs font-semibold text-white">
          매뉴얼
        </Link>
        <Link href="/preferences" className="rounded-xl bg-slate-100 px-2 py-2 text-center text-xs font-semibold text-slate-700">
          교수 선호
        </Link>
      </section>

      <AppCard title="수술 선택">
        <Select value={caseId} onValueChange={(value) => value && setCaseId(value)}>
          <SelectTrigger className="h-11 w-full rounded-xl border-[var(--app-border)] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {surgeryCases.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.surgeryName} ({item.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AppCard>

      <AppCard title={surgery.surgeryName} subtitle="신규/숙련 모두를 위한 핵심 가이드">
        <Accordion defaultValue={["ready"]}>
          <AccordionItem value="ready">
            <AccordionTrigger>준비 요약</AccordionTrigger>
            <AccordionContent>
              <p>{detail.immediateActions.join(", ")}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="mat">
            <AccordionTrigger>필요 재료</AccordionTrigger>
            <AccordionContent>
              <p>{detail.requiredMaterials.join(", ")}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="eq">
            <AccordionTrigger>필요 장비 / 위치</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {detail.requiredEquipment.map((equipment) => {
                  const location = detail.equipmentLocations.find((item) => item.equipment === equipment);
                  return (
                    <div key={equipment} className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveEquipment(equipment)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 underline decoration-dotted underline-offset-2"
                        >
                          <PlayCircle className="size-4 text-blue-600" />
                          {equipment}
                        </button>
                        <button
                          type="button"
                          onClick={() => location && setMapTarget(location)}
                          disabled={!location}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white disabled:bg-slate-300"
                        >
                          <MapPin className="size-3.5" />
                          위치찾기
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{location ? location.location : "위치 정보 없음"}</p>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="safe">
            <AccordionTrigger>안전·감염·실수 방지 포인트</AccordionTrigger>
            <AccordionContent>
              <p>환자 식별·수술부위·알레르기 확인을 첫 단계에서 마칩니다. 무균 필드 이탈 징후를 즉시 공유합니다.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="why">
            <AccordionTrigger>왜 중요한가</AccordionTrigger>
            <AccordionContent>
              <p>표준화된 준비와 교수별 차이 반영을 동시에 수행하면 준비 누락, 재세팅, 단계 지연을 줄일 수 있습니다.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </AppCard>

      {mapTarget && (
        <AppCard title={`${mapTarget.equipment} 위치`} subtitle="장비실 레이아웃(데모)">
          <div className="space-y-3">
            <div className="relative h-44 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="absolute left-3 top-3 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">OR 입구</div>
              <div className="absolute bottom-3 left-3 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">멸균 보관존</div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">장비 카트 구역</div>
              <div className="absolute left-[62%] top-[46%]">
                <span className="absolute inline-flex size-7 animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex size-7 rounded-full border-2 border-white bg-rose-600" />
              </div>
            </div>
            <p className="text-xs text-rose-700">현재 위치: {mapTarget.location}</p>
            <button
              type="button"
              onClick={() => setMapTarget(null)}
              className="w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700"
            >
              지도 닫기
            </button>
          </div>
        </AppCard>
      )}

      {activeEquipment && (
        <section className="fixed inset-0 z-40 flex items-end bg-slate-900/45">
          <div className="w-full rounded-t-3xl bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{activeEquipment} 30초 사용 요약</h3>
              <button type="button" onClick={() => setActiveEquipment(null)} className="rounded-lg bg-slate-100 p-1.5 text-slate-700">
                <X className="size-4" />
              </button>
            </div>
            <video controls className="h-44 w-full rounded-xl bg-slate-900" poster="https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop&q=60">
              <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
            </video>
            <p className="mt-2 text-xs text-slate-600">핵심: 전원 확인 → 멸균 커버 장착 → 교정/초점 확인 후 사용 시작</p>
          </div>
        </section>
      )}
    </MobileAppShell>
  );
}
