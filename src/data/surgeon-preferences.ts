import type { SurgeonPreferenceProfile } from "@/types/preferences";

export const surgeonPreferenceProfiles: SurgeonPreferenceProfile[] = [
  {
    surgeon: "김도윤 교수",
    department: "정형외과",
    procedureFocus: "관절 치환/고정술",
    comparisonRows: [
      {
        category: "기구 순서",
        standardProtocol: "절개 전 기본 기구 세트 1차 배치 후 추가 요청",
        surgeonVariant: "삽입물 사이즈별 트레이를 우측 순서대로 선배치",
        caution: "사이즈 트레이 순서가 바뀌면 준비 지연 발생",
        prepImpact: "수술 시작 전 트레이 정렬 체크리스트 추가 필요",
        equipmentImpact: "임플란트 카트를 수술대 우측 1m 이내 배치",
        communicationTip: "절개 전 '사이즈 순서 확인 완료'를 구두로 보고",
      },
      {
        category: "환자 포지셔닝",
        standardProtocol: "표준 고정대 사용 후 마취팀 확인",
        surgeonVariant: "다리 지지 패드를 기본보다 1단계 높게 두고 고정을 다시 확인합니다.",
        caution: "패드 높이가 맞지 않으면 시작 전 재세팅이 필요합니다.",
        prepImpact: "포지셔닝 체크 시 패드 단계만 먼저 확인하면 됩니다.",
        equipmentImpact: "추가 패드 2개를 보조 테이블에 사전 배치",
        communicationTip: "포지셔닝 완료 후 패드 단계만 구두로 공유합니다.",
      },
    ],
  },
  {
    surgeon: "이승민 교수",
    department: "외과",
    procedureFocus: "복강경 소화기 수술",
    comparisonRows: [
      {
        category: "Draping 선호",
        standardProtocol: "표준 4면 드레이핑",
        surgeonVariant: "카메라 라인 노출 범위를 넓게 확보하는 드레이핑 선호",
        caution: "노출 범위 부족 시 재드레이핑 필요",
        prepImpact: "드레이핑 시작 전 카메라 포트 위치 재확인",
        equipmentImpact: "복강경 타워 케이블 여유 길이 확보 필요",
        communicationTip: "드레이핑 후 '카메라 라인 시야 확보' 확인 콜아웃",
      },
      {
        category: "커뮤니케이션 방식",
        standardProtocol: "Time Out 1회 브리핑",
        surgeonVariant: "절개 직전 30초 추가 브리핑 요청",
        caution: "브리핑 누락 시 수술 시작 보류 가능",
        prepImpact: "팀 타임라인에 30초 브리핑 슬롯 반영",
        equipmentImpact: "특이 장비 없음",
        communicationTip: "브리핑 담당자를 순환간호사로 명확히 지정",
      },
    ],
  },
  {
    surgeon: "정태훈 교수",
    department: "신경외과",
    procedureFocus: "개두술/척추 고난도 수술",
    comparisonRows: [
      {
        category: "특정 장비 세팅",
        standardProtocol: "신경 모니터링 장비 기본값 사용",
        surgeonVariant: "절개 전 baseline 파형을 2회 확인 선호",
        caution: "baseline 누락 시 수술 단계 전환 차단",
        prepImpact: "Sign In 필수 항목으로 baseline 2회 확인 추가",
        equipmentImpact: "신경 모니터링 장비 전극 예비 세트 필요",
        communicationTip: "마취팀과 baseline 완료 시점 동시 확인",
      },
      {
        category: "기구 순서",
        standardProtocol: "표준 미세수술 세트 순차 전달",
        surgeonVariant: "현미경 사용 전 견인기 세트를 선배치",
        caution: "선배치 누락 시 현미경 세팅 중단 가능",
        prepImpact: "견인기 세트 선배치 체크 항목 필요",
        equipmentImpact: "현미경 옆 보조 카트 추가 필요",
        communicationTip: "현미경 준비 완료 콜 전에 견인기 준비 보고",
      },
    ],
  },
];

export const allPreferenceSurgeons = surgeonPreferenceProfiles.map((item) => item.surgeon);

export function getPreferenceProfileBySurgeon(surgeon: string) {
  return surgeonPreferenceProfiles.find((item) => item.surgeon === surgeon);
}
