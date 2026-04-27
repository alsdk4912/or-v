"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Mic,
  MicOff,
  ReceiptText,
  RotateCcw,
} from "lucide-react";

import { BottomCTABar, HeaderHero, MobileFrame, SectionCard, StatusChip } from "@/components/mobile/design-system";
import { checklistStageOrder } from "@/data/checklist-templates";
import { getSurgeryCaseById } from "@/data/mock-surgeries";
import { useChecklistStore } from "@/store/checklist-store";
import type { CaseChecklistState, ChecklistItemState, ChecklistStageName, VoiceCommandLog } from "@/types/checklist";
import { Button } from "@/components/ui/button";

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
    voiceListening,
    setVoiceListening,
  } = useChecklistStore();

  const [selectedStage, setSelectedStage] = useState<ChecklistStageName>("Sign In");
  const [expandedStage, setExpandedStage] = useState<ChecklistStageName>("Sign In");
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const [mockVoiceText, setMockVoiceText] = useState("");

  useEffect(() => {
    if (caseId) initializeCase(caseId);
  }, [caseId, initializeCase]);

  if (!surgery) {
    return <div className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-sm font-semibold text-slate-700">케이스를 찾을 수 없습니다.</div>;
  }

  const caseState = cases[caseId] as CaseChecklistState | undefined;
  if (!caseState) return null;

  const stageGateMessages = checklistStageOrder.reduce(
    (acc, stage) => {
      acc[stage] = getGateReason(caseId, stage);
      return acc;
    },
    {} as Record<ChecklistStageName, string | null>,
  );

  const totalItems = checklistStageOrder.reduce((acc, stage) => acc + caseState.stages[stage].items.length, 0);
  const doneItems = checklistStageOrder.reduce(
    (acc, stage) => acc + caseState.stages[stage].items.filter((item: ChecklistItemState) => item.completed).length,
    0,
  );
  const totalRequired = checklistStageOrder.reduce(
    (acc, stage) => acc + caseState.stages[stage].items.filter((item: ChecklistItemState) => item.required).length,
    0,
  );
  const doneRequired = checklistStageOrder.reduce(
    (acc, stage) =>
      acc + caseState.stages[stage].items.filter((item: ChecklistItemState) => item.required && item.completed).length,
    0,
  );
  const progress = Math.round((doneItems / totalItems) * 100);
  const remainingRequired = Math.max(0, totalRequired - doneRequired);

  const stageVisuals: Record<ChecklistStageName, { label: string; icon: typeof ClipboardCheck }> = {
    "Sign In": { label: "Pre-Op", icon: ClipboardCheck },
    "Time Out": { label: "Intra-Op", icon: Activity },
    "Sign Out": { label: "Post-Op", icon: ReceiptText },
  };

  const handleToggle = (stage: ChecklistStageName, itemId: string) => {
    const result = toggleItem({ caseId, stage, itemId, actor: demoActor });
    if (!result.ok) setBlockMessage(result.reason ?? "항목을 처리할 수 없습니다.");
    else setBlockMessage(null);
  };

  const handleCompleteStage = () => {
    const result = completeStage({ caseId, stage: selectedStage, actor: demoActor });
    if (!result.ok) setBlockMessage(result.reason ?? "단계 완료 처리에 실패했습니다.");
    else setBlockMessage(null);
  };

  const handleMockVoice = () => {
    const result = processVoiceTranscript({
      caseId,
      roomId: surgery.operatingRoom,
      transcript: mockVoiceText,
      confidence: 0.9,
      actor: demoActor,
    });
    if (!result.ok) setBlockMessage(result.reason ?? "음성 반영 실패");
    else setBlockMessage(result.reason ?? null);
    setMockVoiceText("");
  };

  const selectedStageState = caseState.stages[selectedStage];
  const completionTone = selectedStageState.status === "완료" ? "ok" : selectedStageState.status === "진행중" ? "info" : "neutral";

  const voiceLogs = caseState.voiceLogs.slice(-4);

  return (
    <MobileFrame>
      <HeaderHero title="체크리스트 수행" subtitle={`${surgery.surgeryName} · ${surgery.operatingRoom}`} />

      <section className="sticky top-2 z-30 rounded-2xl border border-blue-100 bg-white/95 px-3 py-2 shadow-[0_2px_10px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-blue-600 text-white">
              {voiceListening ? <Mic className="size-4" /> : <MicOff className="size-4" />}
            </span>
            <div>
              <p className="text-xs font-semibold text-blue-700">Voice Assistant Active</p>
              <p className="text-[11px] text-slate-500">{voiceListening ? "실시간 수신 중" : "일시정지"}</p>
            </div>
          </div>
          <div className="flex items-end gap-1">
            {[10, 18, 14, 20, 12].map((height, idx) => (
              <span
                key={height}
                className="inline-block w-1 animate-pulse rounded-full bg-blue-500"
                style={{ height, animationDelay: `${idx * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </section>

      <Link href={`/cases/${caseId}/`} className="inline-flex items-center gap-1 text-xs text-slate-600">
        <ArrowLeft className="size-3.5" /> 케이스 상세로 돌아가기
      </Link>

      <SectionCard>
        <Button variant="outline" className="h-11 w-full rounded-xl border-0 bg-[#f1f5ff]" onClick={() => resetCase(caseId, demoActor)}>
          <RotateCcw className="size-4" />
          데모 초기화
        </Button>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-[#f4f8ff] p-4">
          <p className="text-xs font-semibold text-slate-500">Visual Progress</p>
          <div className="mt-2 flex items-center justify-center">
            <div className="relative size-36 rounded-full" style={{ background: `conic-gradient(#2563eb ${progress * 3.6}deg, #dbeafe 0deg)` }}>
              <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
                <p className="text-[11px] font-semibold text-slate-500">남은 필수 항목</p>
                <p className="text-2xl font-bold text-blue-700">{remainingRequired}개</p>
                <p className="text-xs text-slate-600">{progress}% 완료</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-slate-600">
            전체 {doneItems}/{totalItems} · 필수 {doneRequired}/{totalRequired}
          </p>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--app-border)] bg-white p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">음성 입력</p>
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
          <div className="mt-2 flex gap-2">
            <input
              value={mockVoiceText}
              onChange={(e) => setMockVoiceText(e.target.value)}
              placeholder="예: 환자 확인 완료"
              className="h-10 flex-1 rounded-lg border border-slate-200 px-2 text-xs"
            />
            <Button className="h-10 rounded-lg" onClick={handleMockVoice}>
              실행
            </Button>
          </div>
          {pendingVoice && (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              &quot;{pendingVoice.transcript_text}&quot; ({Math.round(pendingVoice.confidence_score * 100)}%)
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

      {blockMessage && (
        <section className="rounded-xl border border-[var(--app-border)] bg-white p-3">
          <p className="flex items-start gap-2 text-sm text-slate-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>차단 사유: {blockMessage}</span>
          </p>
        </section>
      )}

      <SectionCard title="체크리스트 그룹">
        <div className="space-y-3">
          {checklistStageOrder.map((stage) => {
            const stageState = caseState.stages[stage];
            const blockedReason = stageGateMessages[stage];
            const Icon = stageVisuals[stage].icon;
            const isOpen = expandedStage === stage;
            const stageRequired = stageState.items.filter((item: ChecklistItemState) => item.required).length;
            const stageRequiredDone = stageState.items.filter((item: ChecklistItemState) => item.required && item.completed).length;
            const pendingItems = stageState.items.filter((item: ChecklistItemState) => !item.completed);
            const currentTargetItem = pendingItems.find((item: ChecklistItemState) => item.required) ?? pendingItems[0];
            const tone = blockedReason ? "warn" : stageState.status === "완료" ? "ok" : "info";

            return (
              <div
                key={stage}
                className={`rounded-2xl border px-3 py-3 ${selectedStage === stage ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (blockedReason) {
                      setBlockMessage(blockedReason);
                      return;
                    }
                    setBlockMessage(null);
                    setSelectedStage(stage);
                    setExpandedStage(isOpen ? ("" as ChecklistStageName) : stage);
                  }}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <Icon className="size-4.5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{stageVisuals[stage].label}</p>
                        <p className="text-xs text-slate-600">
                          {stage} · 필수 {stageRequiredDone}/{stageRequired}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusChip label={blockedReason ? "잠금" : stageState.status} tone={tone} />
                      {isOpen ? <ChevronUp className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 space-y-2">
                    {stageState.items.map((item) => {
                      const isCurrent = currentTargetItem?.id === item.id && !item.completed;
                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border px-3 py-3 ${
                            item.completed
                              ? "border-slate-200 bg-slate-100 opacity-55"
                              : isCurrent
                                ? "border-blue-500 bg-white"
                                : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                              <p className="text-xs text-slate-600">{item.required ? "필수 항목" : "선택 항목"}</p>
                              {!item.completed && isCurrent && (
                                <p className="mt-1 text-[11px] font-semibold text-blue-700">음성으로 &quot;확인&quot;이라고 말하세요</p>
                              )}
                            </div>
                            <Button
                              variant={item.completed ? "secondary" : "outline"}
                              className={`h-9 rounded-xl border ${item.completed ? "bg-slate-200" : "bg-white"}`}
                              onClick={() => handleToggle(stage, item.id)}
                            >
                              {item.completed ? "완료 취소" : "완료"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="음성 로그">
        <div className="space-y-2">
          {voiceLogs.length === 0 && <p className="text-sm text-slate-500">아직 음성 로그가 없습니다.</p>}
          {voiceLogs.map((log: VoiceCommandLog) => (
            <div key={log.voice_log_id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold text-slate-900">{log.transcript_text}</p>
              <p className="text-[11px] text-slate-700">
                결과: {log.action_result} · 신뢰도 {Math.round(log.confidence_score * 100)}%
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <BottomCTABar label={`${selectedStage} 단계 완료 처리`} onClick={handleCompleteStage} />
      <div className="pb-20" />
    </MobileFrame>
  );
}
