import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpenCheck, CalendarDays, Boxes, House, ShoppingCart, UserRoundCog } from "lucide-react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <main className="mx-auto w-full max-w-[420px] space-y-4 px-4 py-5">{children}</main>
    </div>
  );
}

const appTabs = [
  { href: "/inventory", label: "재고", icon: Boxes },
  { href: "/procurement", label: "발주", icon: ShoppingCart },
  { href: "/", label: "홈", icon: House },
  { href: "/schedule", label: "일정", icon: CalendarDays },
  { href: "/manual", label: "매뉴얼", icon: BookOpenCheck },
  { href: "/preferences", label: "교수선호", icon: UserRoundCog },
];

export function AppTabBar({ currentPath }: { currentPath: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--app-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-[420px] grid-cols-6 px-1 py-1">
        {appTabs.map((tab) => {
          const active = currentPath === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold ${
                active ? "bg-blue-50 text-blue-700" : "text-slate-500"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function HeaderHero({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle: string;
  right?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="rounded-[24px] bg-gradient-to-b from-[#1e56ff] to-[#0f3fd6] p-5 text-white shadow-[0_8px_24px_rgba(30,86,255,0.25)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
          <p className="mt-1 text-sm text-blue-100">{subtitle}</p>
        </div>
        {right}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </header>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[22px] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
      {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : null}
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      <div className={title || subtitle ? "mt-3" : ""}>{children}</div>
    </section>
  );
}

export function RoundedActionCard({
  title,
  description,
  actionLabel,
  onClick,
  chip,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
  chip?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#f2f6ff] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {chip}
      </div>
      <p className="mt-1 text-sm text-slate-700">{description}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[var(--app-blue)] text-sm font-semibold text-white"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function StatusChip({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "ok" | "warn" | "danger" | "info";
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "warn"
        ? "bg-amber-100 text-amber-700"
        : tone === "danger"
          ? "bg-rose-100 text-rose-700"
          : tone === "info"
            ? "bg-blue-100 text-blue-700"
            : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{label}</span>;
}

export function BottomCTABar({
  label,
  onClick,
  href,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}) {
  return (
    <div className="sticky bottom-2 z-10 rounded-[18px] bg-white/95 p-2 shadow-[0_2px_10px_rgba(15,23,42,0.1)] backdrop-blur">
      {href ? (
        <Link
          href={href}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[var(--app-blue)] text-sm font-semibold text-white"
        >
          {label}
        </Link>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          className="h-12 w-full rounded-xl bg-[var(--app-blue)] text-sm font-semibold text-white disabled:opacity-40"
        >
          {label}
        </button>
      )}
    </div>
  );
}

export function ChecklistStageCard({
  title,
  active,
  locked,
  detail,
  onClick,
}: {
  title: string;
  active?: boolean;
  locked?: boolean;
  detail: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl p-3 text-left ${
        active ? "bg-blue-600 text-white" : locked ? "bg-slate-200 text-slate-600" : "bg-[#eef3ff] text-slate-900"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className={`mt-1 text-xs ${active ? "text-blue-100" : "text-slate-600"}`}>{detail}</p>
    </button>
  );
}
