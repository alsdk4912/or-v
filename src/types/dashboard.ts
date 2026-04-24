export type Department =
  | "정형외과"
  | "외과"
  | "신경외과"
  | "산부인과"
  | "이비인후과"
  | "비뇨의학과";

export type UrgencyLevel = "일반" | "긴급" | "응급";

export type PreparationStatus = "준비완료" | "검토필요" | "누락" | "중요";

export type SurgeryStatus =
  | "대기"
  | "준비중"
  | "준비완료"
  | "진행중"
  | "지연위험";

export interface CaseFlags {
  missingSupplies: boolean;
  emergency: boolean;
  delayedPreparation: boolean;
  checklistBlocked: boolean;
}

export interface ChecklistSnapshot {
  completedCount: number;
  totalCount: number;
  blockedByStage: "없음" | "Sign In 미완료" | "Time Out 미완료";
}

export interface SurgeryCase {
  id: string;
  surgeryName: string;
  operatingRoom: string;
  department: Department;
  scheduledTime: string;
  estimatedDurationMin: number;
  assignedNurse: string;
  surgeon: string;
  urgency: UrgencyLevel;
  preparationStatus: PreparationStatus;
  surgeryStatus: SurgeryStatus;
  checklist: ChecklistSnapshot;
  flags: CaseFlags;
}

export interface ManualSummary {
  title: string;
  summary: string;
}

export interface CaseDetailSection {
  title: string;
  items: string[];
}

export interface SurgeryCaseDetail {
  caseId: string;
  patient: {
    patientId: string;
    age: number;
    sex: "남" | "여";
  };
  anesthesiaType: "전신마취" | "척추마취" | "국소마취";
  currentChecklistStage: "Sign In" | "Time Out" | "Sign Out";
  immediateActions: string[];
  requiredMaterials: string[];
  requiredEquipment: string[];
  equipmentLocations: Array<{ equipment: string; location: string }>;
  standardManualSummary: ManualSummary[];
  procedureManual: string[];
  surgeonDifferences: CaseDetailSection[];
  nextStepGuidance: string[];
}
