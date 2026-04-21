import Link from "next/link";

import { AppTabBar, HeaderHero, MobileFrame, SectionCard } from "@/components/mobile/design-system";

const links = [
  { href: "/admin", title: "관리자 설정", desc: "템플릿/장비/로그 관리" },
  { href: "/preferences", title: "교수별 선호", desc: "표준 프로토콜과 차이 확인" },
  { href: "/manual", title: "매뉴얼", desc: "현장 가이드 확인" },
  { href: "/kpi", title: "KPI 리포트", desc: "운영 성과 요약" },
];

export default function SettingsPage() {
  return (
    <MobileFrame>
      <HeaderHero title="설정 / 관리" subtitle="메인 흐름과 분리된 관리 기능" />
      <SectionCard title="관리 메뉴">
        <div className="space-y-2 pb-24">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-2xl bg-[#f5f8ff] p-3">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
            </Link>
          ))}
        </div>
      </SectionCard>
      <AppTabBar currentPath="/settings" />
    </MobileFrame>
  );
}
