import type { Department, SurgeryCase, SurgeryCaseDetail } from "@/types/dashboard";

export const surgeryCases: SurgeryCase[] = [
  {
    id: "OR-2026-001",
    surgeryName: "고관절 전치환술",
    operatingRoom: "OR-1",
    department: "정형외과",
    scheduledTime: "07:40",
    estimatedDurationMin: 150,
    assignedNurse: "박지은",
    surgeon: "김도윤 교수",
    urgency: "일반",
    preparationStatus: "준비완료",
    surgeryStatus: "준비완료",
    checklist: { completedCount: 8, totalCount: 10, blockedByStage: "Time Out 미완료" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: false, checklistBlocked: true },
  },
  {
    id: "OR-2026-002",
    surgeryName: "복강경 담낭절제술",
    operatingRoom: "OR-2",
    department: "외과",
    scheduledTime: "08:00",
    estimatedDurationMin: 90,
    assignedNurse: "최유진",
    surgeon: "이승민 교수",
    urgency: "긴급",
    preparationStatus: "검토필요",
    surgeryStatus: "준비중",
    checklist: { completedCount: 5, totalCount: 10, blockedByStage: "Sign In 미완료" },
    flags: { missingSupplies: true, emergency: false, delayedPreparation: true, checklistBlocked: true },
  },
  {
    id: "OR-2026-003",
    surgeryName: "개두술(종양 절제)",
    operatingRoom: "OR-3",
    department: "신경외과",
    scheduledTime: "08:20",
    estimatedDurationMin: 240,
    assignedNurse: "한소라",
    surgeon: "정태훈 교수",
    urgency: "응급",
    preparationStatus: "중요",
    surgeryStatus: "지연위험",
    checklist: { completedCount: 4, totalCount: 10, blockedByStage: "Sign In 미완료" },
    flags: { missingSupplies: false, emergency: true, delayedPreparation: true, checklistBlocked: true },
  },
  {
    id: "OR-2026-004",
    surgeryName: "제왕절개술",
    operatingRoom: "OR-4",
    department: "산부인과",
    scheduledTime: "08:40",
    estimatedDurationMin: 70,
    assignedNurse: "오민지",
    surgeon: "윤하린 교수",
    urgency: "긴급",
    preparationStatus: "검토필요",
    surgeryStatus: "준비중",
    checklist: { completedCount: 6, totalCount: 10, blockedByStage: "Time Out 미완료" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: false, checklistBlocked: true },
  },
  {
    id: "OR-2026-005",
    surgeryName: "내시경 부비동 수술",
    operatingRoom: "OR-5",
    department: "이비인후과",
    scheduledTime: "09:00",
    estimatedDurationMin: 110,
    assignedNurse: "김현정",
    surgeon: "최재현 교수",
    urgency: "일반",
    preparationStatus: "준비완료",
    surgeryStatus: "준비완료",
    checklist: { completedCount: 10, totalCount: 10, blockedByStage: "없음" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: false, checklistBlocked: false },
  },
  {
    id: "OR-2026-006",
    surgeryName: "요관결석 내시경 제거술",
    operatingRoom: "OR-6",
    department: "비뇨의학과",
    scheduledTime: "09:10",
    estimatedDurationMin: 80,
    assignedNurse: "이가은",
    surgeon: "박준서 교수",
    urgency: "일반",
    preparationStatus: "누락",
    surgeryStatus: "지연위험",
    checklist: { completedCount: 3, totalCount: 10, blockedByStage: "Sign In 미완료" },
    flags: { missingSupplies: true, emergency: false, delayedPreparation: true, checklistBlocked: true },
  },
  {
    id: "OR-2026-007",
    surgeryName: "슬관절 인공관절 치환술",
    operatingRoom: "OR-1",
    department: "정형외과",
    scheduledTime: "09:30",
    estimatedDurationMin: 140,
    assignedNurse: "강민서",
    surgeon: "김도윤 교수",
    urgency: "일반",
    preparationStatus: "준비완료",
    surgeryStatus: "준비완료",
    checklist: { completedCount: 7, totalCount: 10, blockedByStage: "Time Out 미완료" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: false, checklistBlocked: true },
  },
  {
    id: "OR-2026-008",
    surgeryName: "복강경 충수절제술",
    operatingRoom: "OR-2",
    department: "외과",
    scheduledTime: "10:00",
    estimatedDurationMin: 60,
    assignedNurse: "윤서진",
    surgeon: "이승민 교수",
    urgency: "응급",
    preparationStatus: "중요",
    surgeryStatus: "준비중",
    checklist: { completedCount: 5, totalCount: 10, blockedByStage: "Sign In 미완료" },
    flags: { missingSupplies: false, emergency: true, delayedPreparation: false, checklistBlocked: true },
  },
  {
    id: "OR-2026-009",
    surgeryName: "요추 유합술",
    operatingRoom: "OR-3",
    department: "신경외과",
    scheduledTime: "10:10",
    estimatedDurationMin: 220,
    assignedNurse: "백하은",
    surgeon: "정태훈 교수",
    urgency: "일반",
    preparationStatus: "검토필요",
    surgeryStatus: "준비중",
    checklist: { completedCount: 6, totalCount: 10, blockedByStage: "Time Out 미완료" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: true, checklistBlocked: true },
  },
  {
    id: "OR-2026-010",
    surgeryName: "복강경 난소낭종 절제술",
    operatingRoom: "OR-4",
    department: "산부인과",
    scheduledTime: "10:40",
    estimatedDurationMin: 100,
    assignedNurse: "송아름",
    surgeon: "윤하린 교수",
    urgency: "일반",
    preparationStatus: "준비완료",
    surgeryStatus: "준비완료",
    checklist: { completedCount: 9, totalCount: 10, blockedByStage: "Time Out 미완료" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: false, checklistBlocked: true },
  },
  {
    id: "OR-2026-011",
    surgeryName: "갑상선 전절제술",
    operatingRoom: "OR-5",
    department: "이비인후과",
    scheduledTime: "11:00",
    estimatedDurationMin: 120,
    assignedNurse: "정유림",
    surgeon: "최재현 교수",
    urgency: "일반",
    preparationStatus: "검토필요",
    surgeryStatus: "준비중",
    checklist: { completedCount: 7, totalCount: 10, blockedByStage: "Time Out 미완료" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: false, checklistBlocked: true },
  },
  {
    id: "OR-2026-012",
    surgeryName: "경요도 전립선 절제술",
    operatingRoom: "OR-6",
    department: "비뇨의학과",
    scheduledTime: "11:20",
    estimatedDurationMin: 95,
    assignedNurse: "임다혜",
    surgeon: "박준서 교수",
    urgency: "일반",
    preparationStatus: "준비완료",
    surgeryStatus: "준비완료",
    checklist: { completedCount: 10, totalCount: 10, blockedByStage: "없음" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: false, checklistBlocked: false },
  },
  {
    id: "OR-2026-013",
    surgeryName: "견관절 회전근개 봉합술",
    operatingRoom: "OR-1",
    department: "정형외과",
    scheduledTime: "12:00",
    estimatedDurationMin: 130,
    assignedNurse: "박지은",
    surgeon: "김도윤 교수",
    urgency: "일반",
    preparationStatus: "누락",
    surgeryStatus: "지연위험",
    checklist: { completedCount: 2, totalCount: 10, blockedByStage: "Sign In 미완료" },
    flags: { missingSupplies: true, emergency: false, delayedPreparation: true, checklistBlocked: true },
  },
  {
    id: "OR-2026-014",
    surgeryName: "개복 대장절제술",
    operatingRoom: "OR-2",
    department: "외과",
    scheduledTime: "12:20",
    estimatedDurationMin: 210,
    assignedNurse: "최유진",
    surgeon: "이승민 교수",
    urgency: "긴급",
    preparationStatus: "중요",
    surgeryStatus: "준비중",
    checklist: { completedCount: 4, totalCount: 10, blockedByStage: "Sign In 미완료" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: true, checklistBlocked: true },
  },
  {
    id: "OR-2026-015",
    surgeryName: "뇌동맥류 결찰술",
    operatingRoom: "OR-3",
    department: "신경외과",
    scheduledTime: "13:00",
    estimatedDurationMin: 260,
    assignedNurse: "한소라",
    surgeon: "정태훈 교수",
    urgency: "긴급",
    preparationStatus: "검토필요",
    surgeryStatus: "준비중",
    checklist: { completedCount: 6, totalCount: 10, blockedByStage: "Time Out 미완료" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: true, checklistBlocked: true },
  },
  {
    id: "OR-2026-016",
    surgeryName: "자궁근종 절제술",
    operatingRoom: "OR-4",
    department: "산부인과",
    scheduledTime: "13:20",
    estimatedDurationMin: 120,
    assignedNurse: "오민지",
    surgeon: "윤하린 교수",
    urgency: "일반",
    preparationStatus: "준비완료",
    surgeryStatus: "준비완료",
    checklist: { completedCount: 8, totalCount: 10, blockedByStage: "Time Out 미완료" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: false, checklistBlocked: true },
  },
  {
    id: "OR-2026-017",
    surgeryName: "후두 미세수술",
    operatingRoom: "OR-5",
    department: "이비인후과",
    scheduledTime: "13:50",
    estimatedDurationMin: 75,
    assignedNurse: "김현정",
    surgeon: "최재현 교수",
    urgency: "일반",
    preparationStatus: "검토필요",
    surgeryStatus: "준비중",
    checklist: { completedCount: 6, totalCount: 10, blockedByStage: "Time Out 미완료" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: false, checklistBlocked: true },
  },
  {
    id: "OR-2026-018",
    surgeryName: "경피적 신장 결석 제거술",
    operatingRoom: "OR-6",
    department: "비뇨의학과",
    scheduledTime: "14:20",
    estimatedDurationMin: 100,
    assignedNurse: "이가은",
    surgeon: "박준서 교수",
    urgency: "긴급",
    preparationStatus: "중요",
    surgeryStatus: "지연위험",
    checklist: { completedCount: 3, totalCount: 10, blockedByStage: "Sign In 미완료" },
    flags: { missingSupplies: true, emergency: false, delayedPreparation: true, checklistBlocked: true },
  },
  {
    id: "OR-2026-019",
    surgeryName: "대퇴골 골절 내고정술",
    operatingRoom: "OR-1",
    department: "정형외과",
    scheduledTime: "15:00",
    estimatedDurationMin: 125,
    assignedNurse: "강민서",
    surgeon: "남기백 교수",
    urgency: "응급",
    preparationStatus: "중요",
    surgeryStatus: "준비중",
    checklist: { completedCount: 5, totalCount: 10, blockedByStage: "Sign In 미완료" },
    flags: { missingSupplies: false, emergency: true, delayedPreparation: true, checklistBlocked: true },
  },
  {
    id: "OR-2026-020",
    surgeryName: "유방 부분절제술",
    operatingRoom: "OR-2",
    department: "외과",
    scheduledTime: "15:20",
    estimatedDurationMin: 85,
    assignedNurse: "윤서진",
    surgeon: "심주원 교수",
    urgency: "일반",
    preparationStatus: "준비완료",
    surgeryStatus: "준비완료",
    checklist: { completedCount: 9, totalCount: 10, blockedByStage: "Time Out 미완료" },
    flags: { missingSupplies: false, emergency: false, delayedPreparation: false, checklistBlocked: true },
  },
];

export const allOperatingRooms = Array.from(
  new Set(surgeryCases.map((item) => item.operatingRoom)),
).sort();

export const allDepartments = Array.from(
  new Set(surgeryCases.map((item) => item.department)),
).sort();

export const allSurgeons = Array.from(
  new Set(surgeryCases.map((item) => item.surgeon)),
).sort();

const departmentMaterialMap: Record<Department, string[]> = {
  정형외과: ["멸균 드레이프 세트", "수술용 스크류 키트", "골시멘트", "지혈제"],
  외과: ["복강경 소모품 키트", "흡인 라인", "봉합사 2종", "지혈 패치"],
  신경외과: ["미세수술 기구 세트", "신경 모니터링 패치", "지혈제", "두개 고정핀"],
  산부인과: ["분만/산부인 키트", "자궁 견인기", "흡수성 봉합사", "출혈 대응 세트"],
  이비인후과: ["내시경 소모품", "비강 패킹재", "미세 흡인 팁", "지혈 스폰지"],
  비뇨의학과: ["요관 스텐트 세트", "내시경 세척 라인", "관류액", "지혈제"],
};

const departmentEquipmentMap: Record<Department, string[]> = {
  정형외과: ["C-arm", "파워 드릴 시스템", "투어니켓 장비"],
  외과: ["복강경 타워", "전기소작기", "흡인기"],
  신경외과: ["수술 현미경", "신경 모니터링 장비", "두부 고정 프레임"],
  산부인과: ["태아 모니터링 장치", "흡인기", "전기소작기"],
  이비인후과: ["ENT 내시경 타워", "미세수술 현미경", "흡인기"],
  비뇨의학과: ["비뇨기 내시경 타워", "레이저 장비", "관류 펌프"],
};

const departmentLocationMap: Record<Department, Array<{ equipment: string; location: string }>> = {
  정형외과: [
    { equipment: "C-arm", location: "OR 장비실 A-2 구역" },
    { equipment: "파워 드릴 시스템", location: "OR-1 후면 카트 3번" },
  ],
  외과: [
    { equipment: "복강경 타워", location: "중앙 장비보관실 B-1" },
    { equipment: "전기소작기", location: "OR-2 벽면 전원존 좌측" },
  ],
  신경외과: [
    { equipment: "수술 현미경", location: "OR-3 고정 배치 구역" },
    { equipment: "신경 모니터링 장비", location: "중앙 장비보관실 C-2" },
  ],
  산부인과: [
    { equipment: "태아 모니터링 장치", location: "OR-4 입구 우측 모니터 랙" },
    { equipment: "흡인기", location: "OR-4 하부 캐비닛 2번" },
  ],
  이비인후과: [
    { equipment: "ENT 내시경 타워", location: "OR-5 벽면 도킹 스테이션" },
    { equipment: "미세수술 현미경", location: "중앙 장비보관실 C-1" },
  ],
  비뇨의학과: [
    { equipment: "비뇨기 내시경 타워", location: "OR-6 메인 콘솔 구역" },
    { equipment: "레이저 장비", location: "장비실 D-3 잠금 캐비닛" },
  ],
};

const surgeonPreferenceMap: Record<string, string[]> = {
  "김도윤 교수": ["기구 카운트 구두 확인 2회", "삽입물 사이즈를 테이블 우측 순서로 정렬"],
  "이승민 교수": ["복강경 카메라 화이트밸런스 재확인", "절개 전 팀 브리핑 1분 필수"],
  "정태훈 교수": ["신경 모니터링 baseline 먼저 확인", "현미경 초점 세팅을 절개 전 완료"],
  "윤하린 교수": ["신생아 대응 키트 접근성 우선 배치", "Time Out에서 출혈 대응 시나리오 재확인"],
  "최재현 교수": ["흡인팁 예비 세트 2개 추가 배치", "드레이핑 경계 라인 표시 선호"],
  "박준서 교수": ["관류 라인 누수 테스트 필수", "레이저 안전안경 착용 여부 구두 체크"],
  "남기백 교수": ["골절 정복 확인 시 C-arm 각도 고정 요청", "기구 전달 템포를 일정하게 유지"],
  "심주원 교수": ["표본 라벨링을 절개 직후 재확인", "봉합 재료 옵션 2종을 테이블 좌측 배치"],
};

const anesthesiaByDepartment: Record<Department, SurgeryCaseDetail["anesthesiaType"]> = {
  정형외과: "전신마취",
  외과: "전신마취",
  신경외과: "전신마취",
  산부인과: "척추마취",
  이비인후과: "전신마취",
  비뇨의학과: "전신마취",
};

const surgeonReadySummaryMap: Record<string, string[]> = {
  "김도윤 교수": ["임플란트 사이즈 트레이를 우측 순서대로 선배치", "절개 전 기구 카운트 2회 구두 확인"],
  "이승민 교수": ["카메라 화이트밸런스 재확인 후 포트 위치 브리핑", "절개 직전 30초 팀 브리핑 필수"],
  "정태훈 교수": ["신경모니터링 baseline 2회 확인 후 시작", "현미경 초점 세팅 완료 후 견인기 전달"],
  "윤하린 교수": ["출혈 대응 세트 접근성 우선 배치", "Time Out에서 응급 전환 시나리오 재확인"],
  "최재현 교수": ["흡인팁 예비세트 2개를 테이블 좌측 고정", "드레이핑 경계선 표시 후 절개 준비"],
  "박준서 교수": ["관류 라인 누수 테스트 후 레이저 준비", "안전안경 착용 구두 체크 후 장비 활성화"],
  "남기백 교수": ["C-arm 각도 고정 후 골절 정복 확인", "전달 템포 일정 유지하도록 기구 순서 고정"],
  "심주원 교수": ["표본 라벨을 절개 직후 1차 확인", "봉합 재료 2종을 테이블 좌측 선배치"],
};

const procedureByDepartment: Record<Department, string[]> = {
  정형외과: ["환자 포지셔닝 및 C-arm 위치 고정", "절개 후 관절 노출 및 병변 확인", "임플란트 삽입, 정렬 확인, 지혈 후 봉합"],
  외과: ["복강경 포트 삽입 및 시야 확보", "병변 확인 후 절제/결찰 진행", "세척, 지혈, 포트 제거 및 봉합"],
  신경외과: ["두부 고정 및 현미경/모니터링 세팅 확인", "병변 접근 및 미세기구 절제 단계 진행", "지혈 확인 후 층별 봉합 및 신경기능 재확인"],
  산부인과: ["포지셔닝 및 수술부위 소독/드레이핑", "자궁/부속기 병변 노출 후 절제", "출혈 점검 후 층별 봉합 및 회복실 인계"],
  이비인후과: ["내시경/현미경 시야 세팅", "병변 절제 또는 교정 단계 진행", "지혈 및 패킹 후 최종 카운트"],
  비뇨의학과: ["내시경 또는 레이저 장비 세팅 확인", "결석/병변 제거 및 관류 상태 점검", "스텐트/도뇨 상태 확인 후 종료"],
};

export function getSurgeryCaseById(caseId: string) {
  return surgeryCases.find((item) => item.id === caseId);
}

export function getSurgeryCaseDetailById(caseId: string): SurgeryCaseDetail | undefined {
  const base = getSurgeryCaseById(caseId);
  if (!base) {
    return undefined;
  }

  const stage =
    base.checklist.blockedByStage === "Sign In 미완료"
      ? "Sign In"
      : base.checklist.blockedByStage === "Time Out 미완료"
        ? "Time Out"
        : "Sign Out";

  return {
    caseId: base.id,
    patient: {
      patientId: `P-${base.id.slice(-3)}-XXXX`,
      age: 40 + (Number(base.id.slice(-2)) % 25),
      sex: Number(base.id.slice(-2)) % 2 === 0 ? "여" : "남",
    },
    anesthesiaType: anesthesiaByDepartment[base.department],
    currentChecklistStage: stage,
    immediateActions: [
      ...(surgeonReadySummaryMap[base.surgeon] ?? [`집도의(${base.surgeon}) 요청 세팅 재점검`]),
      `${base.operatingRoom} 멸균 영역 최종 확인`,
    ],
    requiredMaterials: departmentMaterialMap[base.department],
    requiredEquipment: departmentEquipmentMap[base.department],
    equipmentLocations: departmentLocationMap[base.department],
    standardManualSummary: [
      { title: "안전 확인", summary: "환자 식별, 수술 부위, 알레르기, 항생제 투여 시점을 확인합니다." },
      { title: "감염 관리", summary: "무균 필드 유지와 기구 카운트 이중 확인 절차를 준수합니다." },
      { title: "팀 커뮤니케이션", summary: "절개 전 브리핑과 단계별 구두 콜아웃을 표준으로 수행합니다." },
    ],
    procedureManual: procedureByDepartment[base.department],
    surgeonDifferences: [
      {
        title: "교수별 선호",
        items: surgeonPreferenceMap[base.surgeon] ?? ["표준 프로토콜 우선 적용"],
      },
    ],
    nextStepGuidance:
      stage === "Sign In"
        ? ["환자/수술 부위 확인 완료 후 Sign In 잠금 해제", "마취 준비 완료 시 Time Out 단계로 이동"]
        : stage === "Time Out"
          ? ["팀 전원 구두 확인 완료 후 Time Out 종료", "절개 전 Sign Out 사전 항목 예고"]
          : ["수술 종료 전 기구 카운트와 검체 라벨 재확인", "Sign Out 완료 로그를 책임간호사가 검토"],
  };
}

