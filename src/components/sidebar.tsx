"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOLS } from "@/documents/meta";
import { DOC_TYPES } from "@/documents/schemas";
import { IconFolder, IconHome, IconLogout, IconSettings, TOOL_ICONS } from "./icons";
import { logout } from "@/app/login/actions";

function NavLink({ href, label, Icon, exact = false }: { href: string; label: string; Icon: React.ComponentType<{ className?: string }>; exact?: boolean }) {
  const path = usePathname();
  const base = href.split("/").slice(0, 2).join("/");
  const active = exact ? path === href : path === href || path.startsWith(base + "/") || path === base;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
        active ? "bg-brand-50 font-medium text-brand" : "text-ink/80 hover:bg-gray-100"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-white px-3 py-5 lg:flex">
      <Link href="/" className="mb-6 flex items-center gap-2.5 px-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="h-8 w-8" />
        <span className="text-[15px] font-semibold tracking-wide text-brand">GRITTA AI</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-0.5">
        <NavLink href="/" label="Home" Icon={IconHome} exact />
        <p className="mt-4 mb-1 px-3 text-[11px] font-semibold tracking-wider text-muted uppercase">Tools</p>
        {DOC_TYPES.map((t) => (
          <NavLink key={t} href={TOOLS[t].href} label={TOOLS[t].name} Icon={TOOL_ICONS[TOOLS[t].icon]} />
        ))}
        <p className="mt-4 mb-1 px-3 text-[11px] font-semibold tracking-wider text-muted uppercase">Workspace</p>
        <NavLink href="/documents" label="Documents" Icon={IconFolder} />
        <NavLink href="/settings" label="Settings" Icon={IconSettings} />
      </nav>
      <form action={logout}>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-gray-100">
          <IconLogout className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </form>
    </aside>
  );
}

/** Compact top navigation for small screens. */
export function MobileNav() {
  const path = usePathname();
  const items = [
    { href: "/", label: "Home" },
    ...DOC_TYPES.map((t) => ({ href: TOOLS[t].href, label: TOOLS[t].short })),
    { href: "/documents", label: "Documents" },
    { href: "/settings", label: "Settings" },
  ];
  return (
    <div className="sticky top-0 z-10 border-b border-line bg-white lg:hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="h-7 w-7" />
        <span className="font-semibold tracking-wide text-brand">GRITTA AI</span>
      </div>
      <div className="flex gap-1 overflow-x-auto px-3 pb-2">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${path === i.href ? "bg-brand text-white" : "bg-gray-100 text-ink/80"}`}
          >
            {i.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
