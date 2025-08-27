import { cookies } from "next/headers";
import OnboardingPage from "./OnboardingClient";

// Server Component (no "use client")
export default async function OnboardingWrapper() {
  const cookieStore = await cookies();
  const seen = cookieStore.get("onboardingIntroSeen");
  const showIntroDefault = !seen;

  return <OnboardingPage showIntroDefault={showIntroDefault} />;
}

