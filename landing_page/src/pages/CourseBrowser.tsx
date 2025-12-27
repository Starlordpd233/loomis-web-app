import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "@/contexts/authContext";

const COURSES = [
  {
    id: "ap-physics-1",
    title: "AP Physics 1",
    department: "Science",
    level: "11-12",
    summary: "Kinematics, energy, momentum, and circuits with applied labs.",
  },
  {
    id: "calculus-bc",
    title: "AP Calculus BC",
    department: "Mathematics",
    level: "11-12",
    summary: "Limits, derivatives, integrals, and series with intensive practice.",
  },
  {
    id: "us-history",
    title: "U.S. History",
    department: "Social Studies",
    level: "10-12",
    summary: "Primary sources, civics, and historical argumentation skills.",
  },
];

export default function CourseBrowser() {
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-serif text-xl tracking-wide">
          Loomis Chaffee
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-slate-300 hover:text-white">
            Home
          </Link>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-slate-200 transition hover:border-white/40"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-slate-200 transition hover:border-white/40"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {!isAuthenticated ? (
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            You are viewing the preview. Sign in to save a course plan.
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Course browser</p>
          <h1 className="text-3xl font-semibold md:text-4xl">Build your next semester.</h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Explore featured courses and jump into the resource library when you are ready.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {COURSES.map((course) => (
            <div key={course.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">{course.department}</div>
              <h2 className="mt-4 text-xl font-semibold">{course.title}</h2>
              <p className="mt-2 text-sm text-slate-300">Level {course.level}</p>
              <p className="mt-4 text-sm text-slate-200">{course.summary}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-full bg-[#98252b] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#a33c41]"
                >
                  View resources
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/40"
                >
                  Add to plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
