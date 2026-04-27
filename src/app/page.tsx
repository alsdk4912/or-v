"use client";

import { useMemo, useState } from "react";
import { BarChart3, Camera, Info, ShoppingCart } from "lucide-react";

import { AppTabBar } from "@/components/mobile/design-system";
import { MiddlewareSyncSimulator } from "@/components/inventory/middleware-sync-simulator";
import { surgeryCases } from "@/data/mock-surgeries";

type RoleMode = "NURSE_MODE" | "ADMIN_MODE";

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  reorderPoint: number;
}

const TRUST_BLUE = "#0052CC";

const initialInventory: InventoryItem[] = [
  { id: "ITEM-001", name: "멸균 봉합사 2-0", stock: 40, reorderPoint: 30 },
  { id: "ITEM-002", name: "복강경 트로카", stock: 16, reorderPoint: 12 },
  { id: "ITEM-003", name: "수술용 거즈", stock: 60, reorderPoint: 45 },
];

export default function DashboardPage() {
  const [userId, setUserId] = useState("");
  const [roleMode, setRoleMode] = useState<RoleMode | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [cameraSyncMessage, setCameraSyncMessage] = useState("");
  const [quickHelpOpen, setQuickHelpOpen] = useState(false);
  const [timeOutDoneRooms, setTimeOutDoneRooms] = useState(94);

  const shortageList = useMemo(
    () => inventory.filter((item) => item.stock <= item.reorderPoint),
    [inventory],
  );

  const timeoutRate = useMemo(() => Math.round((timeOutDoneRooms / 98) * 100), [timeOutDoneRooms]);
  const currentSurgery = useMemo(
    () => surgeryCases.find((item) => item.surgeryStatus === "진행중" || item.surgeryStatus === "준비중") ?? surgeryCases[0],
    [],
  );
  const timelineCases = useMemo(
    () => surgeryCases.filter((item) => item.surgeryStatus === "준비중" || item.surgeryStatus === "지연위험").slice(0, 4),
    [],
  );
  const [selectedTimelineCaseId, setSelectedTimelineCaseId] = useState(timelineCases[0]?.id ?? currentSurgery.id);
  const selectedTimelineCase = useMemo(
    () => timelineCases.find((item) => item.id === selectedTimelineCaseId) ?? timelineCases[0] ?? currentSurgery,
    [currentSurgery, selectedTimelineCaseId, timelineCases],
  );
  const nextActionHint = useMemo(() => {
    if (selectedTimelineCase.checklist.blockedByStage === "Sign In 미완료") return "다음 진행: 환자/수술부위 확인 후 Sign In 완료";
    if (selectedTimelineCase.checklist.blockedByStage === "Time Out 미완료") return "다음 진행: 팀 브리핑 후 Time Out 완료";
    return "다음 진행: 사용 소모품 스캔 및 Sign Out 기록";
  }, [selectedTimelineCase.checklist.blockedByStage]);

  const login = () => {
    if (userId === "nurse") setRoleMode("NURSE_MODE");
    if (userId === "admin") setRoleMode("ADMIN_MODE");
  };

  const applyConsumption = (itemId: string, qty: number, source: "QR" | "MANUAL") => {
    // 사람이 안전하게 일하면 데이터가 자동으로 생성된다:
    // 간호사의 스캔/기록이 즉시 재고 데이터로 변환되고 관리자 대시보드에 반영된다.
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, stock: Math.max(0, item.stock - qty) } : item,
      ),
    );
    setCameraSyncMessage(`ERP 재고 연동 성공 · ${source} 인식 · ${itemId} -${qty}`);
    setTimeOutDoneRooms((prev) => Math.min(98, prev + 1));
  };

  const simulateCameraScan = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      applyConsumption("ITEM-003", 10, "QR");
    } catch {
      setCameraSyncMessage("카메라 권한 필요: 수기 입력 모드를 사용하세요.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900">
      <main className="mx-auto w-full max-w-[430px] space-y-3 px-4 py-4">
        {!roleMode ? (
          <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_6px_18px_rgba(0,82,204,0.08)]">
            <p className="text-sm font-semibold text-[#0052CC]">ORPlanner 로그인</p>
            <p className="mt-1 text-xs text-slate-500">사용자 권한에 따라 필요한 정보만 노출하여 인지 부하를 줄입니다.</p>
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="ID 입력 (nurse / admin)"
              className="mt-3 h-12 w-full rounded-xl border border-blue-100 px-3 text-sm"
            />
            <button
              type="button"
              onClick={login}
              className="mt-2 h-12 w-full rounded-xl bg-[#0052CC] text-sm font-semibold text-white"
            >
              로그인
            </button>
          </section>
        ) : roleMode === "NURSE_MODE" ? (
          <>
            <header className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_6px_18px_rgba(0,82,204,0.08)]">
              <p className="text-xs font-semibold text-slate-500">현재 진행 수술</p>
              <h1 className="mt-1 text-xl font-bold text-[#0052CC]">{currentSurgery.surgeryName}</h1>
              <p className="mt-1 text-sm font-semibold text-slate-700">{currentSurgery.surgeon} · {currentSurgery.operatingRoom}</p>
              <button
                type="button"
                onClick={() => void simulateCameraScan()}
                className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0052CC] text-sm font-semibold text-white"
              >
                <Camera className="size-4" />
                물품 추가 (바코드/QR/수기)
              </button>
            </header>

            <header className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_6px_18px_rgba(0,82,204,0.08)]">
              <p className="text-xs font-semibold text-slate-500">일반간호사 모드</p>
              <h1 className="mt-1 text-lg font-bold text-[#0052CC]">진행중 수술 타임라인</h1>
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                {timelineCases.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedTimelineCaseId(item.id)}
                    className={`w-full rounded-lg px-2 py-2 text-left ${
                      selectedTimelineCase.id === item.id ? "bg-blue-600 text-white" : "bg-blue-50 text-slate-700"
                    }`}
                  >
                    {item.scheduledTime} {item.surgeryName} ({item.operatingRoom})
                  </button>
                ))}
              </div>
            </header>

            <section className="rounded-2xl border border-blue-100 bg-white p-4">
              <p className="mb-2 text-xs font-semibold text-slate-500">체크리스트 진행 현황</p>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{selectedTimelineCase.surgeryName}</p>
                <p className="mt-1 text-xs text-slate-600">
                  진행률 {selectedTimelineCase.checklist.completedCount}/{selectedTimelineCase.checklist.totalCount}
                </p>
                <div className="mt-2 h-2 rounded-full bg-blue-100">
                  <div
                    className="h-2 rounded-full bg-[#0052CC]"
                    style={{
                      width: `${Math.round(
                        (selectedTimelineCase.checklist.completedCount / selectedTimelineCase.checklist.totalCount) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-blue-700">{nextActionHint}</p>
                <p className="mt-1 text-xs text-slate-600">현재 잠금 단계: {selectedTimelineCase.checklist.blockedByStage}</p>
              </div>
            </section>
            {cameraSyncMessage && (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700">{cameraSyncMessage}</p>
              </section>
            )}

            <button
              type="button"
              onClick={() => setQuickHelpOpen(true)}
              className="fixed bottom-24 right-4 inline-flex size-12 items-center justify-center rounded-full bg-[#0052CC] text-white shadow-[0_8px_18px_rgba(0,82,204,0.3)]"
            >
              <Info className="size-5" />
            </button>
            {quickHelpOpen && (
              <section className="fixed inset-0 z-30 flex items-end bg-black/30">
                <div className="w-full rounded-t-3xl bg-white p-4">
                  <p className="text-sm font-semibold text-[#0052CC]">Quick Help</p>
                  <p className="mt-2 rounded-lg bg-blue-50 px-2 py-2 text-xs">기구 도감: Retractor / C-arm / 흡인기 기본 핸들링</p>
                  <p className="mt-2 rounded-lg bg-blue-50 px-2 py-2 text-xs">교수님 특이 요청: 절개 직전 30초 브리핑 필수</p>
                  <button
                    type="button"
                    onClick={() => setQuickHelpOpen(false)}
                    className="mt-3 h-11 w-full rounded-xl bg-slate-100 text-sm font-semibold text-slate-700"
                  >
                    닫기
                  </button>
                </div>
              </section>
            )}
          </>
        ) : (
          <>
            <header className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_6px_18px_rgba(0,82,204,0.08)]">
              <p className="text-xs font-semibold text-slate-500">관리자 모드</p>
              <h1 className="mt-1 text-lg font-bold text-[#0052CC]">Compliance Dashboard</h1>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="relative size-24 rounded-full"
                  style={{
                    background: `conic-gradient(${TRUST_BLUE} ${Math.min(timeoutRate, 100) * 3.6}deg, #E5E7EB 0deg)`,
                  }}
                >
                  <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-sm font-bold text-[#0052CC]">
                    {timeoutRate}%
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Time-out 이행률</p>
                  <p className="text-sm font-bold text-slate-900">목표 98%</p>
                </div>
              </div>
            </header>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-700">Predictive Inventory</p>
              <p className="mt-1 text-sm font-bold text-amber-900">현재 수술 속도 기반, 2시간 뒤 거즈 부족 예정</p>
            </section>
            <MiddlewareSyncSimulator />

            <section className="rounded-2xl border border-blue-100 bg-white p-4">
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-500">
                <BarChart3 className="size-3.5 text-[#0052CC]" />
                재고 현황 그래프
              </p>
              <div className="space-y-2">
                {inventory.map((item) => {
                  const width = Math.max(8, Math.min(100, Math.round((item.stock / 60) * 100)));
                  return (
                    <div key={item.id} className="rounded-lg bg-blue-50 px-2 py-2">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{item.name}</span>
                        <span className="text-slate-500">{item.stock}</span>
                      </div>
                      <div className="h-2 rounded-full bg-blue-100">
                        <div className="h-2 rounded-full bg-[#0052CC]" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <button
                type="button"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white"
              >
                <ShoppingCart className="size-4" />
                AI 자동 발주 버튼
              </button>
              <p className="mt-2 text-center text-xs text-emerald-700">발주 필요 대상 {shortageList.length}건</p>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-white p-4">
              <p className="mb-2 text-xs font-semibold text-slate-500">Live Status (전 수술실 모니터링)</p>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-blue-50 text-slate-600">
                    <tr>
                      <th className="px-2 py-2 text-left">수술실</th>
                      <th className="px-2 py-2 text-left">진행</th>
                      <th className="px-2 py-2 text-right">체크리스트</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { room: "OR-1", stage: "Intra", completion: "8/10" },
                      { room: "OR-2", stage: "Pre", completion: "5/10" },
                      { room: "OR-3", stage: "Post", completion: "10/10" },
                    ].map((row) => (
                      <tr key={row.room} className="border-t border-slate-100">
                        <td className="px-2 py-2">{row.room}</td>
                        <td className="px-2 py-2">{row.stage}</td>
                        <td className="px-2 py-2 text-right">{row.completion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
      {roleMode && (
        <button
          type="button"
          onClick={() => {
            setRoleMode(null);
            setUserId("");
          }}
          className="fixed right-4 top-4 z-30 rounded-lg bg-[#0052CC] px-3 py-2 text-xs font-semibold text-white"
        >
          로그아웃
        </button>
      )}
      <AppTabBar currentPath="/" />
    </div>
  );
}

