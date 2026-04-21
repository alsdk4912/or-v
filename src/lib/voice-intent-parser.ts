import type { ChecklistStageName, VoiceIntentType } from "@/types/checklist";

export interface ParsedVoiceIntent {
  intent: VoiceIntentType;
  targetStep: ChecklistStageName | null;
  targetItemId: string | null;
  normalized: string;
}

const stepPatterns: Array<{ regex: RegExp; intent: VoiceIntentType; step: ChecklistStageName }> = [
  { regex: /(사인인|sign ?in).*(시작|들어|진행)/, intent: "step_start", step: "Sign In" },
  { regex: /(사인인|sign ?in).*(완료|끝|끝났)/, intent: "step_complete", step: "Sign In" },
  { regex: /(타임아웃|time ?out).*(시작|들어|진행)/, intent: "step_start", step: "Time Out" },
  { regex: /(타임아웃|time ?out).*(완료|끝|끝났)/, intent: "step_complete", step: "Time Out" },
  { regex: /(사인아웃|sign ?out).*(시작|들어|진행)/, intent: "step_start", step: "Sign Out" },
  { regex: /(사인아웃|sign ?out).*(완료|끝|끝났)/, intent: "step_complete", step: "Sign Out" },
];

const itemPatterns: Array<{ regex: RegExp; itemId: string }> = [
  { regex: /(환자).*(확인).*(완료|끝)/, itemId: "si-1" },
  { regex: /(수술부위|수술 부위).*(확인).*(완료|끝)/, itemId: "si-2" },
  { regex: /(멸균).*(확인|체크).*(완료|끝)/, itemId: "si-4" },
  { regex: /(준비물).*(확보).*(완료|끝)/, itemId: "si-5" },
  { regex: /(항생제).*(확인|투여).*(완료|끝)/, itemId: "to-3" },
  { regex: /(영상자료|영상).*(확인).*(완료|끝)/, itemId: "to-4" },
  { regex: /(기구|카운트).*(완료|확인|끝)/, itemId: "so-2" },
];

export function parseVoiceIntent(transcript: string): ParsedVoiceIntent {
  const normalized = transcript.toLowerCase().trim().replace(/\s+/g, " ");

  if (/(방금|마지막).*(취소)/.test(normalized)) {
    return { intent: "undo_last", targetStep: null, targetItemId: null, normalized };
  }
  if (/(일시정지|잠시 멈춰)/.test(normalized)) {
    return { intent: "pause_voice", targetStep: null, targetItemId: null, normalized };
  }
  if (/(다시 시작|재개)/.test(normalized)) {
    return { intent: "resume_voice", targetStep: null, targetItemId: null, normalized };
  }

  for (const pattern of stepPatterns) {
    if (pattern.regex.test(normalized)) {
      return {
        intent: pattern.intent,
        targetStep: pattern.step,
        targetItemId: null,
        normalized,
      };
    }
  }

  for (const pattern of itemPatterns) {
    if (pattern.regex.test(normalized)) {
      return {
        intent: "item_check",
        targetStep: null,
        targetItemId: pattern.itemId,
        normalized,
      };
    }
  }

  return { intent: "none", targetStep: null, targetItemId: null, normalized };
}
