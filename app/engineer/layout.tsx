import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEngineer } from "@/lib/auth";
import { SessionGuard } from "@/components/SessionGuard";

export default async function EngineerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const engineer = await getCurrentEngineer();
  if (!engineer) redirect("/engineer-login");

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <SessionGuard type="engineer" />
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3"><div className="engineering-mark small">CE</div><div><h1 className="text-lg font-bold tracking-tight">Construction Estimator</h1><p className="text-xs text-slate-500">Engineering workspace</p></div></div>
          </div>
          <nav className="flex-1 p-4">
            <p className="nav-label">Workspace</p>
            <div className="space-y-1">
              {[["/engineer","Dashboard"],["/engineer/projects","Projects"],["/engineer/calculations","Calculation Library"],["/engineer/materials","Material Rates"]].map(([href,label]) => <Link key={href} href={href} className="nav-link">{label}</Link>)}
            </div>
            <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Project workflow</p><p className="mt-2 text-sm leading-5 text-slate-600">Open a project to manage its drawings, calculations, specifications, materials, costing and report.</p></div>
          </nav>
          <div className="border-t border-slate-200 p-4"><p className="truncate text-sm font-semibold text-slate-800">{engineer.name}</p><p className="truncate text-xs text-slate-500">{engineer.email}</p><form action="/api/auth/logout" method="post" className="mt-3"><button type="submit" className="text-xs font-semibold text-slate-500 hover:text-slate-900">Sign out</button></form></div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Engineer workspace</p><p className="text-sm text-slate-500">Technical estimation & project control</p></div><Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900">View customer site</Link></header>
          <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
