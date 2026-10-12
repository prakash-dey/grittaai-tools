import { getSettings, listSignatories } from "@/lib/data";
import { CompanyForm } from "./company-form";
import { SignatoriesManager } from "./signatories";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, signatories] = await Promise.all([getSettings(), listSignatories()]);
  if (!settings) {
    return <main className="p-8 text-sm">Company settings are missing. Run <code>npm run setup</code>.</main>;
  }
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Shared by every tool. Changes apply to new documents only; issued documents keep the details they were created with.</p>
      </div>
      <SignatoriesManager
        people={signatories.map((s) => ({ id: s.id, name: s.name, title: s.title, signature: s.signature, active: s.active }))}
      />
      <CompanyForm settings={settings} />
    </main>
  );
}
