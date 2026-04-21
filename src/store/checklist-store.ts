"use client";

import { create } from "zustand";

import { checklistStageOrder, checklistTemplates } from "@/data/checklist-templates";
import { parseVoiceIntent } from "@/lib/voice-intent-parser";
import { getCaseItemStatus } from "@/lib/inventory-engine";
import type {
  CaseChecklistState,
  ChecklistActionHistory,
  ChecklistItemState,
  ChecklistLogEntry,
  ChecklistStageName,
  ChecklistStageState,
  VoiceCommandLog,
  VoiceSetting,
} from "@/types/checklist";

function toKstTimeString(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(date);
}

function createInitialCaseState(caseId: string): CaseChecklistState {
  const stages = {} as Record<ChecklistStageName, ChecklistStageState>;
  checklistStageOrder.forEach((stage) => {
    const items: ChecklistItemState[] = checklistTemplates[stage].map((item) => ({
      ...item,
      completed: false,
      completedBy: null,
      completedAt: null,
    }));
    stages[stage] = {
      stage,
      status: "미시작",
      items,
      completedBy: null,
      completedAt: null,
    };
  });

  return { caseId, stages, logs: [], voiceLogs: [], actionHistory: [] };
}

function allRequiredCompleted(stage: ChecklistStageState) {
  return stage.items.filter((item) => item.required).every((item) => item.completed);
}

function stageProgressStatus(stage: ChecklistStageState): ChecklistStageState["status"] {
  const completedCount = stage.items.filter((item) => item.completed).length;
  if (completedCount === 0) {
    return "미시작";
  }
  if (completedCount === stage.items.length) {
    return "완료";
  }
  return "진행중";
}

function gateReason(caseState: CaseChecklistState, stage: ChecklistStageName): string | null {
  if (stage === "Sign In") {
    return null;
  }

  const signIn = caseState.stages["Sign In"];
  const timeOut = caseState.stages["Time Out"];

  if (stage === "Time Out") {
    if (signIn.status !== "완료") {
      return "Sign In이 완료되지 않아 Time Out을 진행할 수 없습니다.";
    }
    if (!allRequiredCompleted(signIn)) {
      return "Sign In의 필수 항목이 모두 완료되지 않아 Time Out이 차단되었습니다.";
    }
    return null;
  }

  if (timeOut.status !== "완료") {
    return "Time Out이 완료되지 않아 Sign Out을 진행할 수 없습니다.";
  }
  if (!allRequiredCompleted(timeOut)) {
    return "Time Out의 필수 항목이 모두 완료되지 않아 Sign Out이 차단되었습니다.";
  }

  return null;
}

interface ChecklistStore {
  cases: Record<string, CaseChecklistState>;
  voiceSetting: VoiceSetting;
  pendingVoice: VoiceCommandLog | null;
  voiceListening: boolean;
  initializeCase: (caseId: string) => void;
  toggleItem: (params: {
    caseId: string;
    stage: ChecklistStageName;
    itemId: string;
    actor: string;
  }) => { ok: boolean; reason?: string };
  completeStage: (params: {
    caseId: string;
    stage: ChecklistStageName;
    actor: string;
  }) => { ok: boolean; reason?: string };
  resetCase: (caseId: string, actor: string) => void;
  getGateReason: (caseId: string, stage: ChecklistStageName) => string | null;
  processVoiceTranscript: (params: {
    caseId: string;
    roomId: string;
    transcript: string;
    confidence: number;
    actor: string;
  }) => { ok: boolean; reason?: string };
  confirmPendingVoice: (caseId: string, actor: string) => { ok: boolean; reason?: string };
  rejectPendingVoice: () => void;
  undoLastVoiceAction: (caseId: string, actor: string) => { ok: boolean; reason?: string };
  updateVoiceSetting: (patch: Partial<VoiceSetting>) => void;
  setVoiceListening: (value: boolean) => void;
}

export const useChecklistStore = create<ChecklistStore>((set, get) => {
  const applyVoiceIntent = (
    caseId: string,
    intent: VoiceCommandLog["detected_intent"],
    targetStep: ChecklistStageName | null,
    targetItemId: string | null,
    actor: string,
  ) => {
    const voiceActor = `${actor}(음성)`;
    if (intent === "step_complete" && targetStep) {
      return get().completeStage({ caseId, stage: targetStep, actor: voiceActor });
    }
    if (intent === "step_start" && targetStep) {
      const reason = get().getGateReason(caseId, targetStep);
      return reason ? { ok: false, reason } : { ok: true };
    }
    if (intent === "item_check" && targetItemId) {
      if (targetItemId === "si-5") {
        const blocked = getCaseItemStatus(caseId).some((r) => r.risk === "부족");
        if (blocked) return { ok: false, reason: "재고 부족 상태로 준비물 확보 완료를 반영할 수 없습니다." };
      }
      const current = get().cases[caseId];
      if (!current) return { ok: false, reason: "케이스 없음" };
      const stage = checklistStageOrder.find((s) => current.stages[s].items.some((i) => i.id === targetItemId));
      if (!stage) return { ok: false, reason: "항목 매핑 실패" };
      return get().toggleItem({ caseId, stage, itemId: targetItemId, actor: voiceActor });
    }
    return { ok: false, reason: "지원하지 않는 명령" };
  };

  return ({
  cases: {},
  voiceSetting: {
    enabled: true,
    auto_apply_enabled: false,
    wake_word_enabled: true,
    wake_word_text: "오알 플래너",
    confidence_threshold: 0.86,
    language: "ko-KR",
    noise_filter_enabled: true,
    mode: "wake_word",
  },
  pendingVoice: null,
  voiceListening: true,

  initializeCase: (caseId) => {
    set((state) => {
      if (state.cases[caseId]) {
        return state;
      }
      return {
        cases: {
          ...state.cases,
          [caseId]: createInitialCaseState(caseId),
        },
      };
    });
  },

  toggleItem: ({ caseId, stage, itemId, actor }) => {
    const current = get().cases[caseId];
    if (!current) {
      return { ok: false, reason: "체크리스트 상태를 찾을 수 없습니다." };
    }

    const blockedReason = gateReason(current, stage);
    if (blockedReason) {
      return { ok: false, reason: blockedReason };
    }

    const targetStage = current.stages[stage];
    if (targetStage.completedAt) {
      return { ok: false, reason: "이미 완료 처리된 단계는 수정할 수 없습니다." };
    }

    const targetItem = targetStage.items.find((item) => item.id === itemId);
    if (!targetItem) {
      return { ok: false, reason: "체크 항목을 찾을 수 없습니다." };
    }

    const now = new Date();
    const timestamp = toKstTimeString(now);

    set((state) => {
      const caseState = state.cases[caseId];
      if (!caseState) {
        return state;
      }

      const stageState = caseState.stages[stage];
      const updatedItems = stageState.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        const nextDone = !item.completed;
        return {
          ...item,
          completed: nextDone,
          completedBy: nextDone ? actor : null,
          completedAt: nextDone ? timestamp : null,
        };
      });

      const updatedStage: ChecklistStageState = {
        ...stageState,
        items: updatedItems,
        status: stageProgressStatus({ ...stageState, items: updatedItems }),
      };

      const log: ChecklistLogEntry = {
        id: `${caseId}-${stage}-${itemId}-${now.getTime()}`,
        timestamp,
        actor,
        stage,
        action: "항목 상태 변경",
        detail: `${targetItem.label} ${targetItem.completed ? "완료 취소" : "완료 처리"}`,
      };

      const sourceType = actor.includes("음성") ? "voice" : "manual";
      return {
        cases: {
          ...state.cases,
          [caseId]: {
            ...caseState,
            stages: {
              ...caseState.stages,
              [stage]: updatedStage,
            },
            logs: [log, ...caseState.logs],
            actionHistory: [
              {
                action_history_id: `${caseId}-${itemId}-${now.getTime()}`,
                case_id: caseId,
                checklist_item_id: itemId,
                action_type: targetItem.completed ? "uncheck" : "check",
                source_type: sourceType,
                performed_at: timestamp,
                performed_by: actor,
                note: "항목 상태 변경",
              },
              ...caseState.actionHistory,
            ],
          },
        },
      };
    });

    return { ok: true };
  },

  completeStage: ({ caseId, stage, actor }) => {
    const current = get().cases[caseId];
    if (!current) {
      return { ok: false, reason: "체크리스트 상태를 찾을 수 없습니다." };
    }

    const blockedReason = gateReason(current, stage);
    if (blockedReason) {
      return { ok: false, reason: blockedReason };
    }

    const targetStage = current.stages[stage];
    if (targetStage.completedAt) {
      return { ok: false, reason: "이미 완료된 단계입니다." };
    }

    if (!allRequiredCompleted(targetStage)) {
      return { ok: false, reason: `${stage}의 필수 항목을 먼저 완료해야 합니다.` };
    }

    const now = new Date();
    const timestamp = toKstTimeString(now);

    set((state) => {
      const caseState = state.cases[caseId];
      if (!caseState) {
        return state;
      }

      const stageState = caseState.stages[stage];
      const updatedStage: ChecklistStageState = {
        ...stageState,
        status: "완료",
        completedAt: timestamp,
        completedBy: actor,
      };

      const log: ChecklistLogEntry = {
        id: `${caseId}-${stage}-complete-${now.getTime()}`,
        timestamp,
        actor,
        stage,
        action: "단계 완료",
        detail: `${stage} 단계 완료`,
      };

      const sourceType = actor.includes("음성") ? "voice" : "manual";
      return {
        cases: {
          ...state.cases,
          [caseId]: {
            ...caseState,
            stages: {
              ...caseState.stages,
              [stage]: updatedStage,
            },
            logs: [log, ...caseState.logs],
            actionHistory: [
              {
                action_history_id: `${caseId}-${stage}-complete-${now.getTime()}`,
                case_id: caseId,
                checklist_item_id: stage,
                action_type: "step_complete",
                source_type: sourceType,
                performed_at: timestamp,
                performed_by: actor,
                note: `${stage} 단계 완료`,
              } as ChecklistActionHistory,
              ...caseState.actionHistory,
            ],
          },
        },
      };
    });

    return { ok: true };
  },

  resetCase: (caseId, actor) => {
    const now = new Date();
    const timestamp = toKstTimeString(now);
    set((state) => ({
      cases: {
        ...state.cases,
        [caseId]: {
          ...createInitialCaseState(caseId),
          logs: [
            {
              id: `${caseId}-reset-${now.getTime()}`,
              timestamp,
              actor,
              stage: "Sign In",
              action: "데모 초기화",
              detail: "체크리스트 상태를 초기화했습니다.",
            },
          ],
        },
      },
    }));
  },

  getGateReason: (caseId, stage) => {
    const current = get().cases[caseId];
    if (!current) {
      return "체크리스트 상태를 찾을 수 없습니다.";
    }
    return gateReason(current, stage);
  },

  processVoiceTranscript: ({ caseId, roomId, transcript, confidence, actor }) => {
    const current = get().cases[caseId];
    if (!current) return { ok: false, reason: "체크리스트 상태를 찾을 수 없습니다." };
    const setting = get().voiceSetting;
    if (!setting.enabled) return { ok: false, reason: "음성 체크 모드가 비활성화되었습니다." };

    const parsed = parseVoiceIntent(transcript);
    const timestamp = toKstTimeString(new Date());
    const mode =
      confidence >= setting.confidence_threshold && setting.auto_apply_enabled ? "auto" : confidence >= 0.62 ? "confirm" : "manual";
    const baseLog: VoiceCommandLog = {
      voice_log_id: `${caseId}-${Date.now()}`,
      case_id: caseId,
      room_id: roomId,
      captured_at: timestamp,
      transcript_text: transcript,
      normalized_text: parsed.normalized,
      detected_intent: parsed.intent,
      target_step: parsed.targetStep,
      target_item: parsed.targetItemId,
      confidence_score: confidence,
      action_mode: mode,
      action_result: "ignored",
      actor_type: "system",
      auto_applied: false,
    };

    const registerLog = (log: VoiceCommandLog) =>
      set((state) => {
        const caseState = state.cases[caseId];
        if (!caseState) return state;
        return {
          cases: {
            ...state.cases,
            [caseId]: { ...caseState, voiceLogs: [log, ...caseState.voiceLogs] },
          },
        };
      });

    if (parsed.intent === "none") {
      registerLog(baseLog);
      return { ok: false, reason: "명령으로 인식되지 않았습니다." };
    }

    if (parsed.intent === "pause_voice") {
      set({ voiceListening: false });
      registerLog({ ...baseLog, action_result: "success" });
      return { ok: true };
    }
    if (parsed.intent === "resume_voice") {
      set({ voiceListening: true });
      registerLog({ ...baseLog, action_result: "success" });
      return { ok: true };
    }
    if (parsed.intent === "undo_last") {
      registerLog(baseLog);
      return get().undoLastVoiceAction(caseId, actor);
    }

    if (mode === "confirm") {
      set({ pendingVoice: baseLog });
      registerLog({ ...baseLog, action_result: "confirmed" });
      return { ok: true, reason: "확인 대기 중" };
    }

    const applyResult = applyVoiceIntent(caseId, parsed.intent, parsed.targetStep, parsed.targetItemId, actor);
    registerLog({ ...baseLog, action_result: applyResult.ok ? "success" : "rejected", auto_applied: applyResult.ok });
    return applyResult;
  },

  confirmPendingVoice: (caseId, actor) => {
    const pending = get().pendingVoice;
    if (!pending || pending.case_id !== caseId) return { ok: false, reason: "확인할 음성 명령이 없습니다." };
    const result = applyVoiceIntent(caseId, pending.detected_intent, pending.target_step, pending.target_item, actor);
    set({ pendingVoice: null });
    return result;
  },

  rejectPendingVoice: () => set({ pendingVoice: null }),

  undoLastVoiceAction: (caseId, actor) => {
    const current = get().cases[caseId];
    if (!current) return { ok: false, reason: "케이스 상태 없음" };
    const last = current.actionHistory.find((h) => h.source_type === "voice");
    if (!last) return { ok: false, reason: "취소할 음성 반영 이력이 없습니다." };
    if (last.action_type === "check") {
      const stage = checklistStageOrder.find((s) => current.stages[s].items.some((i) => i.id === last.checklist_item_id));
      if (!stage) return { ok: false, reason: "원본 항목 없음" };
      return get().toggleItem({ caseId, stage, itemId: last.checklist_item_id, actor: `${actor}(음성취소)` });
    }
    return { ok: false, reason: "해당 작업은 자동 취소를 지원하지 않습니다." };
  },

  updateVoiceSetting: (patch) =>
    set((state) => ({
      voiceSetting: { ...state.voiceSetting, ...patch },
    })),

  setVoiceListening: (value) => set({ voiceListening: value }),
  });
});
