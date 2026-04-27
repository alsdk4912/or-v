"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, ClipboardCheck, ShoppingCart } from "lucide-react";

import { AppTabBar } from "@/components/mobile/design-system";
import { RealtimeGatingProof } from "@/components/gating/realtime-gating-proof";

type RoleMode = "NURSE_MODE" | "ADMIN_MODE";

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  reorderPoint: number;
}

const checklistSteps = [
  { id: "gate-signin", label: "Sign In 확인", itemId: "ITEM-001", consumeQty: 1 },
  { id: "gate-timeout", label: "Time Out 확인", itemId: "ITEM-002", consumeQty: 1 },
  { id: "gate-start", label: "수술 시작 게이팅 해제", itemId: "ITEM-003", consumeQty: 2 },
] as const;

const initialInventory: InventoryItem[] = [
  { id: "ITEM-001", name: "멸균 봉합사 2-0", stock: 6, reorderPoint: 5 },
  { id: "ITEM-002", name: "멸균 봉합사 3-0", stock: 4, reorderPoint: 4 },
  { id: "ITEM-003", name: "복강경 트로카", stock: 3, reorderPoint: 4 },
];

export default function DashboardPage() {
  const [roleMode, setRoleMode] = useState<RoleMode>("NURSE_MODE");
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const shortageList = useMemo(
    () => inventory.filter((item) => item.stock <= item.reorderPoint),
    [inventory],
  );

  const handleChecklistComplete = (stepId: string, itemId: string, consumeQty: number) => {
    if (completedSteps[stepId]) return;

    // Value Chain: 간호사 체크 완료 -> 재고 자동 차감 -> 관리자 발주 필요 리스트 실시간 반영
    setCompletedSteps((prev) => ({ ...prev, [stepId]: true }));
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, stock: Math.max(0, item.stock - consumeQty) } : item,
      ),
    );
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-slate-950 text-slate-100">
      <main className="mx-auto flex h-[calc(100dvh-64px)] w-full max-w-[420px] flex-col gap-3 px-3 py-3">
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-3">
          <p className="text-[11px] font-semibold text-slate-300">Role Switcher</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRoleMode("NURSE_MODE")}
              className={`rounded-xl px-2 py-2 text-xs font-semibold ${
                roleMode === "NURSE_MODE" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"
              }`}
            >
              NURSE_MODE
            </button>
            <button
              type="button"
              onClick={() => setRoleMode("ADMIN_MODE")}
              className={`rounded-xl px-2 py-2 text-xs font-semibold ${
                roleMode === "ADMIN_MODE" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"
              }`}
            >
              ADMIN_MODE
            </button>
          </div>
        </section>

        {roleMode === "NURSE_MODE" ? (
          <NurseDashboard
            completedSteps={completedSteps}
            onComplete={handleChecklistComplete}
          />
        ) : (
          <AdminDashboard inventory={inventory} shortageList={shortageList} />
        )}
      </main>
      <AppTabBar currentPath="/" />
    </div>
  );
}

function NurseDashboard({
  completedSteps,
  onComplete,
}: {
  completedSteps: Record<string, boolean>;
  onComplete: (stepId: string, itemId: string, consumeQty: number) => void;
}) {
  return (
    <>
      <RealtimeGatingProof />

      <section className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-3">
        <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-blue-200">
          <ClipboardCheck className="size-3.5" />
          체크리스트 게이팅
        </p>
        <div className="space-y-2">
          {checklistSteps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => onComplete(step.id, step.itemId, step.consumeQty)}
              disabled={Boolean(completedSteps[step.id])}
              className={`w-full rounded-2xl px-3 py-4 text-left text-sm font-semibold ${
                completedSteps[step.id]
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white active:scale-[0.99]"
              }`}
            >
              {completedSteps[step.id] ? "완료" : "원터치 완료"} · {step.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-3">
        <p className="mb-2 text-xs font-semibold text-slate-300">교수별 프로토콜 가이드</p>
        <div className="space-y-1.5 text-xs text-slate-200">
          <p className="rounded-lg bg-slate-800 px-2 py-2">김도윤 교수: 임플란트 트레이 우측 순서 배치</p>
          <p className="rounded-lg bg-slate-800 px-2 py-2">이승민 교수: 절개 직전 30초 브리핑 필수</p>
          <p className="rounded-lg bg-slate-800 px-2 py-2">정태훈 교수: 신경 baseline 2회 확인</p>
        </div>
      </section>
    </>
  );
}

function AdminDashboard({
  inventory,
  shortageList,
}: {
  inventory: InventoryItem[];
  shortageList: InventoryItem[];
}) {
  const totalStock = inventory.reduce((acc, cur) => acc + cur.stock, 0);

  return (
    <>
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-3">
        <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-200">
          <Boxes className="size-3.5" />
          재고 현황 그래프
        </p>
        <div className="space-y-2">
          {inventory.map((item) => {
            const width = Math.max(8, Math.min(100, Math.round((item.stock / 10) * 100)));
            return (
              <div key={item.id} className="rounded-lg bg-slate-800 px-2 py-2">
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-200">{item.name}</span>
                  <span className="text-slate-400">{item.stock}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-semibold text-white"
        >
          <ShoppingCart className="size-4" />
          AI 자동 발주 실행
        </button>
        <p className="mt-2 text-center text-xs text-emerald-200">실시간 체크데이터 기반 발주 대상 {shortageList.length}건</p>
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-3">
        <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-200">
          <AlertTriangle className="size-3.5 text-amber-300" />
          발주 필요 리스트 (실시간 반영)
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-700">
          <table className="w-full text-[11px]">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-2 py-2 text-left">품목</th>
                <th className="px-2 py-2 text-right">현재</th>
                <th className="px-2 py-2 text-right">기준</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 text-slate-200">
              {shortageList.length > 0 ? (
                shortageList.map((item) => (
                  <tr key={item.id} className="border-t border-slate-800">
                    <td className="px-2 py-2">{item.name}</td>
                    <td className="px-2 py-2 text-right">{item.stock}</td>
                    <td className="px-2 py-2 text-right">{item.reorderPoint}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-2 py-3 text-center text-slate-400">
                    발주 필요 없음 (총 재고 {totalStock})
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

