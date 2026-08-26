// src/components/Login.tsx
import { signIn } from "@/auth";

export default function Login() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] p-4">
      <section className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl">
        <div className="mb-4 flex flex-col items-center text-center">
          <svg
            viewBox="0 0 64 64"
            aria-hidden="true"
            className="h-20 w-20 text-[var(--brand)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M47 27.5A17 17 0 1 1 40.6 15.2"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="m24 26 7 7 19-20"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <h1
            className="text-[32px] font-normal tracking-wide text-[var(--brand)]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            ClearTrack
          </h1>

          <p className="mt-0.5 text-[13px] text-[var(--muted-foreground)]">
            Equipment Readiness Portal
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("microsoft-entra-id", {
              redirectTo: "/dashboard",
            });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
          >
            Continue with Microsoft
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          Authorized personnel only.
        </p>
      </section>
    </main>
  );
}
