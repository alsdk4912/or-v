export type ChecklistStageName = "Sign In" | "Time Out" | "Sign Out";
export type VoiceActionMode = "auto" | "confirm" | "manual";
export type VoiceActionResult = "success" | "confirmed" | "rejected" | "ignored" | "cancelled";
export type VoiceIntentType =
  | "step_start"
  | "step_complete"
  | "item_check"
  | "undo_last"
  | "pause_voice"
  | "resume_voice"
  | "none";

export type ChecklistStageStatus = "미시작" | "진행중" | "완료";

export interface ChecklistItemTemplate {
  id: string;
  label: string;
  required: boolean;
}

export interface ChecklistItemState extends ChecklistItemTemplate {
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
  sourceType?: "voice" | "manual" | "system";
  sourceLogId?: string | null;
}

export interface ChecklistStageState {
  stage: ChecklistStageName;
  status: ChecklistStageStatus;
  items: ChecklistItemState[];
  completedBy: string | null;
  completedAt: string | null;
}

export interface ChecklistLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  stage: ChecklistStageName;
  action: string;
  detail: string;
}

export interface CaseChecklistState {
  caseId: string;
  stages: Record<ChecklistStageName, ChecklistStageState>;
  logs: ChecklistLogEntry[];
  voiceLogs: VoiceCommandLog[];
  actionHistory: ChecklistActionHistory[];
}

export interface VoiceCommandLog {
  voice_log_id: string;
  case_id: string;
  room_id: string;
  captured_at: string;
  transcript_text: string;
  normalized_text: string;
  detected_intent: VoiceIntentType;
  target_step: ChecklistStageName | null;
  target_item: string | null;
  confidence_score: number;
  action_mode: VoiceActionMode;
  action_result: VoiceActionResult;
  actor_type: "system" | "user";
  auto_applied: boolean;
}

export interface ChecklistActionHistory {
  action_history_id: string;
  case_id: string;
  checklist_item_id: string;
  action_type: "check" | "uncheck" | "step_start" | "step_complete" | "revert";
  source_type: "voice" | "manual" | "system";
  source_log_id?: string;
  performed_at: string;
  performed_by: string;
  note?: string;
}

export interface VoiceSetting {
  enabled: boolean;
  auto_apply_enabled: boolean;
  wake_word_enabled: boolean;
  wake_word_text: string;
  confidence_threshold: number;
  language: string;
  noise_filter_enabled: boolean;
  mode: "always" | "wake_word" | "push_to_talk";
}
