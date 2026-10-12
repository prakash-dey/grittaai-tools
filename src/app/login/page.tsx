import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="mb-3 h-12 w-12" />
          <h1 className="text-xl font-semibold tracking-wide text-brand">GRITTA AI</h1>
          <p className="mt-1 text-sm text-muted">Internal tools</p>
        </div>
        <LoginForm next={next ?? "/"} />
      </div>
    </main>
  );
}
