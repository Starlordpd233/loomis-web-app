"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

// Import shared types and utilities
import {
  PlannerV2State,
  YearKey,
  YEARS,
  SLOTS_PER_YEAR,
  TermGroup,
  isTermGroup,
} from "@/types/course";
import { loadPlannerState, savePlannerState } from "@/lib/plannerStore";

/**
 * Planner Page (Grid Only)
 *
 * Displays the 4-year plan grid. Clicking a slot navigates to the
 * Browser in "picker" mode to select a course for that slot.
 */
export default function PlannerPage() {
  const router = useRouter();

  // Unified Planner State
  const [plannerState, setPlannerState] = useState<PlannerV2State | null>(null);
  const hasLoadedStateRef = useRef(false);

  // Load planner state
  useEffect(() => {
    const s = loadPlannerState();
    setPlannerState(s);
    hasLoadedStateRef.current = true;
  }, []);

  // Persist planner state
  useEffect(() => {
    if (!hasLoadedStateRef.current || !plannerState) return;
    savePlannerState(plannerState);
  }, [plannerState]);

  // Actions
  function handleSlotClick(year: YearKey, idx: number) {
    // Navigate to browser in picker mode
    router.push(
      `/browser?mode=picker&year=${year}&slot=${idx}&returnTo=/planner`
    );
  }

  function clearSlot(year: YearKey, idx: number) {
    setPlannerState((prev) => {
      if (!prev) return null;
      const next = JSON.parse(JSON.stringify(prev)) as PlannerV2State;
      next.grid[year][idx] = null;
      return next;
    });
  }

  function clearAllSlots() {
    if (!confirm("Clear all four years?")) return;
    setPlannerState((prev) => {
      if (!prev) return null;
      const next = JSON.parse(JSON.stringify(prev)) as PlannerV2State;
      next.grid = {
        Freshman: Array(SLOTS_PER_YEAR).fill(null),
        Sophomore: Array(SLOTS_PER_YEAR).fill(null),
        Junior: Array(SLOTS_PER_YEAR).fill(null),
        Senior: Array(SLOTS_PER_YEAR).fill(null),
      };
      return next;
    });
  }

  function clearSub(year: YearKey, idx: number, sub: number) {
    setPlannerState((prev) => {
      if (!prev) return null;
      const next = JSON.parse(JSON.stringify(prev)) as PlannerV2State;
      const g = next.grid[year][idx];
      
      if (!g || !isTermGroup(g)) return next;
      
      (g as TermGroup).items[sub] = null;

      // If the whole group is empty, collapse to empty slot
      if ((g as TermGroup).items.every((x) => x === null)) {
        next.grid[year][idx] = null;
      }
      return next;
    });
  }

  if (!plannerState) {
    return <div className={styles.loading}>Loading planner...</div>;
  }

  return (
    <div className={styles.container}>
      {/* 4-Year Planner Grid */}
      <section className={styles.plannerShell}>
        <div className={styles.plannerHeaderRow}>
          <div className={styles.smallNote}>
            Here&apos;s your current four year plan. Click a slot to add a course.
          </div>
          <div className={styles.tools}>
            <button className={styles.toolBtn} onClick={clearAllSlots}>
              Clear all
            </button>
            <button className={styles.toolBtn} onClick={() => window.print()}>
              Print / Save PDF
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          {YEARS.map((year) => (
            <div key={year} className={styles.col}>
              <div className={styles.colTitle}>{year}</div>
              <div className={styles.colSlots}>
                {plannerState.grid[year].map((slot, idx) => {
                  // Grouped TERM/HALF slot
                  if (isTermGroup(slot)) {
                    return (
                      <div
                        key={`${year}-${idx}`}
                        className={`${styles.slot} ${styles.slotGroup} ${
                          slot.size === 3 ? styles.group3 : styles.group2
                        }`}
                        onClick={() => handleSlotClick(year, idx)}
                      >
                        <div className={styles.bracket} aria-hidden="true" />
                        {slot.size === 3 ? (
                          <>
                            <div
                              className={styles.bracketNotch}
                              style={{ top: "33%" }}
                              aria-hidden="true"
                            />
                            <div
                              className={styles.bracketNotch}
                              style={{ top: "66%" }}
                              aria-hidden="true"
                            />
                          </>
                        ) : (
                          <div
                            className={styles.bracketNotch}
                            style={{ top: "50%" }}
                            aria-hidden="true"
                          />
                        )}

                        <div className={styles.subStack}>
                          {slot.items.map((item, k) => (
                            <div
                              key={k}
                              className={styles.subSlot}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSlotClick(year, idx);
                              }}
                            >
                              {item ? (
                                <>
                                  <div className={styles.slotTitle}>
                                    {item.title}
                                  </div>
                                  <div className={styles.slotMeta}>
                                    <span>{item.department || "—"}</span>
                                    {item.termLabel ? (
                                      <>
                                        {" "}
                                        • <span>{item.termLabel}</span>
                                      </>
                                    ) : null}
                                    {item.level ? (
                                      <>
                                        {" "}
                                        • <span>{item.level}</span>
                                      </>
                                    ) : null}
                                  </div>
                                </>
                              ) : (
                                <span className={styles.slotPlaceholder}>
                                  Select course →
                                </span>
                              )}
                              <button
                                className={styles.subClear}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearSub(year, idx, k);
                                }}
                                aria-label="Clear sub-slot"
                                title="Clear this term slot"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Regular single slot
                  return (
                    <div
                      key={`${year}-${idx}`}
                      className={styles.slot}
                      onClick={() => handleSlotClick(year, idx)}
                      title="Click to select a course for this slot"
                    >
                      {slot ? (
                        <>
                          <div className={styles.slotTitle}>{slot.title}</div>
                          <div className={styles.slotMeta}>
                            <span>{slot.department || "—"}</span>
                            {slot.termLabel ? (
                              <>
                                {" "}
                                • <span>{slot.termLabel}</span>
                              </>
                            ) : null}
                            {slot.level ? (
                              <>
                                {" "}
                                • <span>{slot.level}</span>
                              </>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <span className={styles.slotPlaceholder}>
                          Select course →
                        </span>
                      )}
                      <button
                        className={styles.slotClear}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSlot(year, idx);
                        }}
                        aria-label="Clear slot"
                        title="Clear this slot"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
