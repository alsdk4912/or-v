"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { AppCard, BlueHero, MobileAppShell } from "@/components/mobile/app-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSurgeryCaseDetailById, surgeryCases } from "@/data/mock-surgeries";

export default function ManualPage() {
  const [caseId, setCaseId] = useState(surgeryCases[0]?.id ?? "");
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
              <p>{detail.requiredEquipment.join(", ")}</p>
              <p className="mt-1">
                {detail.equipmentLocations.map((item) => `${item.equipment}: ${item.location}`).join(" / ")}
              </p>
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
    </MobileAppShell>
  );
}
