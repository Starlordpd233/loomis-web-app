import { type FormEvent, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/authContext";

export default function Login() {
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter an email and password to continue.");
      return;
    }
    setError("");
    setIsAuthenticated(true);
    navigate("/course-browser");
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-serif text-xl tracking-wide">
          Loomis Chaffee
        </Link>
        <Link to="/" className="text-sm text-slate-300 hover:text-white">
          Back to home
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 pb-16 pt-4 md:grid-cols-2">
        <section>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Student portal</p>
          <h1 className="mt-4 text-3xl font-semibold md:text-4xl">Sign in to build your course plan.</h1>
          <p className="mt-4 text-base text-slate-300">
            Access saved schedules, recommended resources, and your personalized course browser.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Review courses curated by your department.",
              "Track your progress across semesters.",
              "Share your plan with advisors.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur"
        >
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-300">Use any credentials for now. We just need the pages wired.</p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="text-slate-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="student@loomischaffee.org"
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#a33c41] focus:outline-none focus:ring-2 focus:ring-[#a33c41]/40"
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#a33c41] focus:outline-none focus:ring-2 focus:ring-[#a33c41]/40"
              />
            </label>
          </div>

          {error ? <p className="mt-4 text-sm text-[#fca5a5]">{error}</p> : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-[#98252b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a33c41]"
          >
            Continue
          </button>

          <p className="mt-4 text-xs text-slate-400">
            Need help? Contact the academic office for access.
          </p>
        </form>
      </main>
    </div>
  );
}
