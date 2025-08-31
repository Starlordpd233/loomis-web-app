import { cookies } from "next/headers";
import OnboardingPage from "./OnboardingClient";
import Script from "next/script";

export const dynamic = "force-dynamic";

export default async function OnboardingWrapper() {
  const store = await cookies();
  const showIntroDefault = !store.get("onboardingIntroSeen");

  return (
    <>
      {/* Instant client-side guard: runs before React hydrates */}
      <Script
        id="onboarding-guard"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  try {
    // Hide global wordmark header immediately to avoid flicker
    document.documentElement.classList.add('hide-wordmark');
    var m = document.cookie.match(/(?:^|; )catalogPrefs=([^;]+)/);
    if (!m) return;
    var prefs = JSON.parse(decodeURIComponent(m[1]));
    var complete = !!(prefs && prefs.grade && prefs.mathCourse && prefs.language && prefs.language.name && prefs.language.level);
    if (complete) { location.replace('/browser'); }
  } catch(e) {}
})();
          `.trim(),
        }}
      />
      <OnboardingPage showIntroDefault={showIntroDefault} />
    </>
  );
}
