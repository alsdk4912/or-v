"use client";

import { useState } from "react";
import { Camera, X } from "lucide-react";

export function UsageScanner({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const handleUse = () => {
    if (!code.trim()) return;
    setLogs((prev) => [`${caseId} 사용처리 완료: ${code.trim()}`, ...prev].slice(0, 4));
    setCode("");
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
        <Camera className="size-3.5" />
        재료 QR
      </button>
      {open && (
        <section className="fixed inset-0 z-40 flex items-end bg-slate-900/45">
          <div className="w-full rounded-t-3xl bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">사용 재료 QR 스캔</h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-slate-100 p-1.5 text-slate-700">
                <X className="size-4" />
              </button>
            </div>
            <p className="mb-2 text-xs text-slate-600">수술 {caseId}에서 사용한 재료의 QR/라벨 코드를 입력해 사용처리합니다.</p>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="예: LOT-001 또는 ITEM-003"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
            />
            <button type="button" onClick={handleUse} className="mt-2 w-full rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white">
              사용처리 반영
            </button>
            <div className="mt-2 space-y-1">
              {logs.map((log) => (
                <p key={log} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                  {log}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
