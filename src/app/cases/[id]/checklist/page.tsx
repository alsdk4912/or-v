"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Mic, MicOff, RotateCcw } from "lucide-react";

import {
  BottomCTABar,
  ChecklistStageCard,
  HeaderHero,
  MobileFrame,
  SectionCard,
  StatusChip,
} from "@/components/mobile/design-system";
import { checklistStageOrder } from "@/data/checklist-templates";
import { getSurgeryCaseById } from "@/data/mock-surgeries";
import { useChecklistStore } from "@/store/checklist-store";
import type {
  CaseChecklistState,
  ChecklistItemState,
  ChecklistStageName,
  ChecklistStageState,
  VoiceCommandLog,
} from "@/types/checklist";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const demoActor = "김나영 간호사";

export default function ChecklistExecutionPage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;
  const surgery = getSurgeryCaseById(caseId);

  const {
    cases,
    initializeCase,
    toggleItem,
    completeStage,
    resetCase,
    getGateReason,
    processVoiceTranscript,
    pendingVoice,
    confirmPendingVoice,
    rejectPendingVoice,
    voiceSetting,
    updateVoiceSetting,
    voiceListening,
    setVoiceListening,
  } =
    useChecklistStore();
  const [selectedStage, setSelectedStage] = useState<ChecklistStageName>("Sign In");
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<"체크리스트" | "음성로그" | "설정">("체크리스트");
  const [mockVoiceText, setMockVoiceText] = useState("");

  useEffect(() => {
    if (caseId) {
      initializeCase(caseId);
    }
  }, [caseId, initializeCase]);

  if (!surgery) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] px-4 py-6">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>케이스를 찾을 수 없습니다</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const caseState = cases[caseId] as CaseChecklistState | undefined;
  if (!caseState) {
    return null;
  }

  const selected: ChecklistStageState = caseState.stages[selectedStage];
  const completedItems = selected.items.filter((item: ChecklistItemState) => item.completed).length;
  const requiredTotal = selected.items.filter((item: ChecklistItemState) => item.required).length;
  const requiredCompleted = selected.items.filter((item: ChecklistItemState) => item.required && item.completed).length;

  const totalItems = checklistStageOrder.reduce((acc, stage) => acc + caseState.stages[stage].items.length, 0);
  const doneItems = checklistStageOrder.reduce(
    (acc, stage) =>
      acc + caseState.stages[stage].items.filter((item: ChecklistItemState) => item.completed).length,
    0,
  );
  const progress = Math.round((doneItems / totalItems) * 100);

  const stageGateMessages = checklistStageOrder.reduce(
    (acc, stage) => {
      acc[stage] = getGateReason(caseId, stage);
      return acc;
    },
    {} as Record<ChecklistStageName, string | null>,
  );

  const handleSelectStage = (stage: ChecklistStageName) => {
    const reason = stageGateMessages[stage];
    if (reason) {
      setBlockMessage(reason);
      return;
    }
    setBlockMessage(null);
    setSelectedStage(stage);
  };

  const handleToggle = (itemId: string) => {
    const result = toggleItem({ caseId, stage: selectedStage, itemId, actor: demoActor });
    if (!result.ok) {
      setBlockMessage(result.reason ?? "항목을 처리할 수 없습니다.");
    } else {
      setBlockMessage(null);
    }
  };

  const handleCompleteStage = () => {
    const result = completeStage({ caseId, stage: selectedStage, actor: demoActor });
    if (!result.ok) {
      setBlockMessage(result.reason ?? "단계 완료 처리에 실패했습니다.");
    } else {
      setBlockMessage(null);
    }
  };

  const handleMockVoice = () => {
    const confidence = 0.9;
    const result = processVoiceTranscript({
      caseId,
      roomId: surgery.operatingRoom,
      transcript: mockVoiceText,
      confidence,
      actor: demoActor,
    });
    if (!result.ok) setBlockMessage(result.reason ?? "음성 반영 실패");
    else setBlockMessage(result.reason ?? null);
    setMockVoiceText("");
  };

  return (
    <MobileFrame>
      <HeaderHero
        title="체크리스트 수행"
        subtitle={`${surgery.surgeryName} · 수행자 ${demoActor}`}
      />
      <Link href={`/cases/${caseId}`} className="inline-flex items-center gap-1 text-xs text-slate-600">
        <ArrowLeft className="size-3.5" /> 케이스 상세로 돌아가기
      </Link>
      <SectionCard>
        <Button
          variant="outline"
          className="h-11 w-full rounded-xl border-0 bg-[#f1f5ff]"
          onClick={() => resetCase(caseId, demoActor)}
        >
          <RotateCcw className="size-4" />
          데모 초기화
        </Button>

          <div className="mt-4 grid gap-2">
            <SummaryCard label="전체 진행률" value={`${progress}%`} helper={`${doneItems}/${totalItems} 항목 완료`} />
            <SummaryCard
              label="현재 단계 상태"
              value={selected.status}
              helper={`필수 완료 ${requiredCompleted}/${requiredTotal}`}
            />
            <SummaryCard
              label="단계 완료 정보"
              value={selected.completedAt ? "완료" : "미완료"}
              helper={selected.completedAt ? `${selected.completedBy} | ${selected.completedAt}` : "아직 완료 처리 전"}
            />
          </div>
          <div className="mt-3 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            진행 원칙: Sign In 필수 완료 → Time Out 진행 → Time Out 필수 완료 → Sign Out 진행
          </div>
          <div className="mt-3 rounded-xl border border-[var(--app-border)] bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Voice Checklist Mode</p>
              <button
                type="button"
                onClick={() => setVoiceListening(!voiceListening)}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                  voiceListening ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                {voiceListening ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
                {voiceListening ? "수신중" : "일시정지"}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              케이스 {surgery.surgeryName} · 수술실 {surgery.operatingRoom} · 현재 단계 {selectedStage}
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={mockVoiceText}
                onChange={(e) => setMockVoiceText(e.target.value)}
                placeholder="예: 환자 확인 완료, 사인인 완료"
                className="h-10 flex-1 rounded-lg border border-slate-200 px-2 text-xs"
              />
              <Button className="h-10 rounded-lg" onClick={handleMockVoice}>
                명령 실행
              </Button>
            </div>
            {pendingVoice && (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                &quot;{pendingVoice.transcript_text}&quot; 인식됨 ({Math.round(pendingVoice.confidence_score * 100)}%)
                <div className="mt-2 flex gap-2">
                  <Button size="sm" className="h-8" onClick={() => confirmPendingVoice(caseId, demoActor)}>
                    반영
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8" onClick={rejectPendingVoice}>
                    취소
                  </Button>
                </div>
              </div>
            )}
          </div>
      </SectionCard>

      <SectionCard title="단계 선택">
          <div className="mt-3 space-y-2">
            {checklistStageOrder.map((stage) => {
              const stageState = caseState.stages[stage];
              const blockedReason = stageGateMessages[stage];
              return (
                <ChecklistStageCard
                  key={stage}
                  onClick={() => handleSelectStage(stage)}
                  title={stage}
                  active={selectedStage === stage}
                  locked={Boolean(blockedReason)}
                  detail={blockedReason ? `차단: ${blockedReason}` : `상태: ${stageState.status}`}
                />
              );
            })}
          </div>
      </SectionCard>

        {blockMessage && (
          <section className="rounded-xl border border-[var(--app-border)] bg-white p-3">
            <p className="flex items-start gap-2 text-sm text-slate-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>차단 사유: {blockMessage}</span>
            </p>
          </section>
        )}

        <section className="grid gap-4">
          <section className="grid grid-cols-3 gap-2">
            {(["체크리스트", "음성로그", "설정"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPanelTab(tab)}
                className={`rounded-xl px-2 py-2 text-xs font-semibold ${
                  panelTab === tab ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </section>
          {panelTab === "체크리스트" && (
          <Card className="rounded-[22px] border-0 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedStage} 체크 항목</span>
                <StatusChip label={selected.status} tone={selected.status === "완료" ? "ok" : selected.status === "진행중" ? "info" : "neutral"} />
              </CardTitle>
              <CardDescription>
                필수 항목을 모두 완료해야 다음 단계로 진행할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {selected.items.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl px-3 py-3 ${
                    item.completed ? "bg-emerald-50" : "bg-[#f4f7ff]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-600">
                        {item.required ? "필수 항목" : "선택 항목"} | 상태: {item.completed ? "완료" : "미완료"}
                      </p>
                      {item.completedAt && (
                        <p className="text-xs text-slate-600">
                          completed by {item.completedBy} / completed at {item.completedAt}
                        </p>
                      )}
                    </div>
                    <Button
                      variant={item.completed ? "secondary" : "outline"}
                      className="h-10 rounded-xl border-0 bg-white"
                      onClick={() => handleToggle(item.id)}
                    >
                      {item.completed ? "완료 취소" : "완료 처리"}
                    </Button>
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-800">
                현재 단계 진행: {completedItems}/{selected.items.length} 항목 완료
              </div>

            </CardContent>
          </Card>
          )}

          {panelTab === "음성로그" && (
            <Card className="rounded-[22px] border-0 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
              <CardHeader>
                <CardTitle>음성 반영 로그</CardTitle>
                <CardDescription>인식된 명령과 결과를 확인합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {caseState.voiceLogs.length === 0 && <p className="text-sm text-slate-500">아직 음성 로그가 없습니다.</p>}
                {caseState.voiceLogs.map((log: VoiceCommandLog) => (
                  <div key={log.voice_log_id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs font-semibold text-slate-900">{log.transcript_text}</p>
                    <p className="text-xs text-slate-700">
                      intent: {log.detected_intent} | 결과: {log.action_result} | 신뢰도 {Math.round(log.confidence_score * 100)}%
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">{log.captured_at}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {panelTab === "설정" && (
            <Card className="rounded-[22px] border-0 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
              <CardHeader>
                <CardTitle>음성 설정</CardTitle>
                <CardDescription>자동반영 안전 정책을 설정합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ToggleRow
                  label="음성 체크 모드"
                  value={voiceSetting.enabled}
                  onToggle={() => updateVoiceSetting({ enabled: !voiceSetting.enabled })}
                />
                <ToggleRow
                  label="조건부 자동반영"
                  value={voiceSetting.auto_apply_enabled}
                  onToggle={() => updateVoiceSetting({ auto_apply_enabled: !voiceSetting.auto_apply_enabled })}
                />
                <ToggleRow
                  label="웨이크워드 사용"
                  value={voiceSetting.wake_word_enabled}
                  onToggle={() => updateVoiceSetting({ wake_word_enabled: !voiceSetting.wake_word_enabled })}
                />
                <div>
                  <p className="text-xs text-slate-500">신뢰도 임계치: {voiceSetting.confidence_threshold.toFixed(2)}</p>
                  <input
                    type="range"
                    min={0.6}
                    max={0.99}
                    step={0.01}
                    value={voiceSetting.confidence_threshold}
                    onChange={(e) => updateVoiceSetting({ confidence_threshold: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <Button variant="secondary" className="h-9" onClick={() => setVoiceListening(true)}>
                  테스트 시작
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

      <BottomCTABar label={`${selectedStage} 단계 완료 처리`} onClick={handleCompleteStage} />
    </MobileFrame>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left">
      <span>{label}</span>
      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${value ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`}>
        {value ? "ON" : "OFF"}
      </span>
    </button>
  );
}

function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-xl bg-[#f4f7ff] px-3 py-3">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{helper}</p>
    </div>
  );
}
