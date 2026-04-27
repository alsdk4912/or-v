"use client";

import { useState } from "react";
import { AlertTriangle, Lock, Unlock } from "lucide-react";

export function RealtimeGatingProof() {
  const [timeOutDone, setTimeOutDone] = useState(false);

  return (
    <section className="rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-slate-900 to-slate-950 p-3 shadow-[0_10px_22px_rgba(15,23,42,0.5)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-cyan-200">실시간 안전 검증기 (Gating)</p>
        <div className="group relative">
          <button
            type="button"
            className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
          >
            안내
          </button>
          <div className="pointer-events-none absolute right-0 top-7 z-10 w-56 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-[10px] text-slate-200 opacity-0 transition group-hover:opacity-100">
            이 기능은 PC 기반 EMR이 수행할 수 없는 현장 밀착형 안전 장치입니다.
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-2">
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-2 py-2">
          <p className="text-[11px] font-semibold text-amber-200">Time-out (수술 전 최종 확인)</p>
          <button
            type="button"
            onClick={() => setTimeOutDone((prev) => !prev)}
            className={`mt-2 w-full rounded-lg px-2 py-2 text-xs font-semibold ${
              timeOutDone ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
            }`}
          >
            {timeOutDone ? "완료됨 (게이트 통과)" : "미완료 (탭하여 완료)"}
          </button>
        </div>

        <div
          className={`rounded-xl border p-2 transition-all duration-300 ${
            timeOutDone
              ? "border-emerald-400/40 bg-emerald-500/10 opacity-100 blur-0"
              : "border-slate-700 bg-slate-800/60 opacity-70 blur-[1px]"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-100">수술 도구 준비</p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                timeOutDone ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {timeOutDone ? (
                <Unlock className="size-3.5 animate-pulse" />
              ) : (
                <Lock className="size-3.5" />
              )}
              {timeOutDone ? "Unlocked" : "Locked"}
            </span>
          </div>
          <button
            type="button"
            disabled={!timeOutDone}
            className="w-full rounded-lg bg-slate-900 px-2 py-2 text-left text-xs text-slate-100 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            <span className="flex items-center gap-1">
              <AlertTriangle className="size-3.5" />
              C-arm, Retractor, 흡인기 준비 확인
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
