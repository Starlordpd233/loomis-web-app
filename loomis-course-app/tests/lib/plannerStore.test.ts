/**
 * Planner Store Unit Tests
 * 
 * Comprehensive tests for localStorage-based planner state management.
 * Tests cover state loading, saving, and migration from legacy formats.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { loadPlannerState, savePlannerState } from '@/lib/plannerStore'
import { SLOTS_PER_YEAR, YEARS } from '@/types/course'
import type { PlannerV2State, PlannerState, PlanItem, Course, PlannerSlot } from '@/types/course'

// =============================================================================
// TEST DATA FACTORIES
// =============================================================================

/**
 * Create empty grid structure matching the planner's default
 */
const createEmptyGrid = (): PlannerState => ({
    Freshman: Array(SLOTS_PER_YEAR).fill(null),
    Sophomore: Array(SLOTS_PER_YEAR).fill(null),
    Junior: Array(SLOTS_PER_YEAR).fill(null),
    Senior: Array(SLOTS_PER_YEAR).fill(null),
})

/**
 * Create a minimal plan item for the shopping list
 */
const createPlanItem = (overrides: Partial<PlanItem> = {}): PlanItem => ({
    title: 'Test Course',
    ...overrides,
})

/**
 * Create a minimal course for grid slots
 */
const createCourse = (overrides: Partial<Course> = {}): Course => ({
    title: 'Test Course',
    tags: [],
    ...overrides,
})

/**
 * Create a valid V2 state for testing
 */
const createV2State = (overrides: Partial<PlannerV2State> = {}): PlannerV2State => ({
    version: 2,
    selectedCourses: [],
    grid: createEmptyGrid(),
    ...overrides,
})

// =============================================================================
// LOAD STATE TESTS
// =============================================================================

describe('loadPlannerState', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    afterEach(() => {
        localStorage.clear()
    })

    describe('default state', () => {
        it('returns default state when localStorage is empty', () => {
            const state = loadPlannerState()

            expect(state.version).toBe(2)
            expect(state.selectedCourses).toEqual([])
            expect(state.grid.Freshman).toHaveLength(SLOTS_PER_YEAR)
            expect(state.grid.Sophomore).toHaveLength(SLOTS_PER_YEAR)
            expect(state.grid.Junior).toHaveLength(SLOTS_PER_YEAR)
            expect(state.grid.Senior).toHaveLength(SLOTS_PER_YEAR)
        })

        it('returns default state with all grid slots as null', () => {
            const state = loadPlannerState()

            YEARS.forEach(year => {
                state.grid[year].forEach((slot: PlannerSlot) => {
                    expect(slot).toBeNull()
                })
            })
        })
    })

    describe('loading existing V2 state', () => {
        it('loads valid plannerV2 state from localStorage', () => {
            const mockState = createV2State({
                selectedCourses: [createPlanItem({ title: 'CS101' })],
            })
            localStorage.setItem('plannerV2', JSON.stringify(mockState))

            const state = loadPlannerState()

            expect(state.version).toBe(2)
            expect(state.selectedCourses).toHaveLength(1)
            expect(state.selectedCourses[0].title).toBe('CS101')
        })

        it('preserves grid assignments', () => {
            const mockState = createV2State()
            mockState.grid.Freshman[1] = createCourse({ title: 'Math 1' })
            mockState.grid.Senior[5] = createCourse({ title: 'Capstone' })
            localStorage.setItem('plannerV2', JSON.stringify(mockState))

            const state = loadPlannerState()

            const freshmanCourse = state.grid.Freshman[1] as Course | null
            const seniorCourse = state.grid.Senior[5] as Course | null
            expect(freshmanCourse?.title).toBe('Math 1')
            expect(seniorCourse?.title).toBe('Capstone')
        })
    })

    describe('migration from plannerV1', () => {
        it('migrates plannerV1 grid data to V2 format', () => {
            const legacyGrid = createEmptyGrid()
            legacyGrid.Freshman[1] = createCourse({ title: 'Legacy Course' })
            localStorage.setItem('plannerV1', JSON.stringify(legacyGrid))

            const state = loadPlannerState()

            expect(state.version).toBe(2)
            const course = state.grid.Freshman[1] as Course | null
            expect(course?.title).toBe('Legacy Course')
            expect(state.selectedCourses).toEqual([])
        })

        it('saves migrated state to plannerV2', () => {
            const legacyGrid = createEmptyGrid()
            localStorage.setItem('plannerV1', JSON.stringify(legacyGrid))

            loadPlannerState()

            const savedV2 = localStorage.getItem('plannerV2')
            expect(savedV2).not.toBeNull()
            expect(JSON.parse(savedV2!).version).toBe(2)
        })
    })

    describe('migration from plan (list only)', () => {
        it('migrates plan list data to V2 format', () => {
            const legacyList = [
                createPlanItem({ title: 'English 1' }),
                createPlanItem({ title: 'History 1' }),
            ]
            localStorage.setItem('plan', JSON.stringify(legacyList))

            const state = loadPlannerState()

            expect(state.version).toBe(2)
            expect(state.selectedCourses).toHaveLength(2)
            expect(state.selectedCourses[0].title).toBe('English 1')
        })

        it('initializes empty grid when only list exists', () => {
            const legacyList = [createPlanItem()]
            localStorage.setItem('plan', JSON.stringify(legacyList))

            const state = loadPlannerState()

            expect(state.grid.Freshman[0]).toBeNull()
        })

        it('saves migrated state to plannerV2', () => {
            const legacyList = [createPlanItem()]
            localStorage.setItem('plan', JSON.stringify(legacyList))

            loadPlannerState()

            expect(localStorage.getItem('plannerV2')).not.toBeNull()
        })
    })

    describe('combined migration', () => {
        it('combines both plannerV1 and plan data', () => {
            const legacyGrid = createEmptyGrid()
            legacyGrid.Freshman[0] = createCourse({ title: 'Grid Course' })
            localStorage.setItem('plannerV1', JSON.stringify(legacyGrid))

            const legacyList = [createPlanItem({ title: 'List Course' })]
            localStorage.setItem('plan', JSON.stringify(legacyList))

            const state = loadPlannerState()

            const gridCourse = state.grid.Freshman[0] as Course | null
            expect(gridCourse?.title).toBe('Grid Course')
            expect(state.selectedCourses[0].title).toBe('List Course')
        })
    })

    describe('error handling', () => {
        it('returns default state for corrupted localStorage data', () => {
            localStorage.setItem('plannerV2', 'not valid json')

            const state = loadPlannerState()

            expect(state.version).toBe(2)
            expect(state.selectedCourses).toEqual([])
        })

        it('logs error for corrupted data', () => {
            localStorage.setItem('plannerV2', 'not valid json')
            const consoleSpy = vi.spyOn(console, 'error')

            loadPlannerState()

            expect(consoleSpy).toHaveBeenCalled()
        })
    })
})

// =============================================================================
// SAVE STATE TESTS
// =============================================================================

describe('savePlannerState', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    afterEach(() => {
        localStorage.clear()
    })

    it('saves state to localStorage under plannerV2 key', () => {
        const state = createV2State({
            selectedCourses: [createPlanItem({ title: 'Test' })],
        })

        savePlannerState(state)

        const saved = localStorage.getItem('plannerV2')
        expect(saved).not.toBeNull()
        expect(JSON.parse(saved!)).toEqual(state)
    })

    it('serializes grid assignments correctly', () => {
        const state = createV2State()
        state.grid.Junior[3] = createCourse({ title: 'Chemistry' })

        savePlannerState(state)

        const saved = JSON.parse(localStorage.getItem('plannerV2')!)
        expect(saved.grid.Junior[3].title).toBe('Chemistry')
    })

    it('overwrites existing plannerV2 data', () => {
        const oldState = createV2State({ selectedCourses: [] })
        localStorage.setItem('plannerV2', JSON.stringify(oldState))

        const newState = createV2State({
            selectedCourses: [createPlanItem({ title: 'New Course' })],
        })
        savePlannerState(newState)

        const saved = JSON.parse(localStorage.getItem('plannerV2')!)
        expect(saved.selectedCourses).toHaveLength(1)
        expect(saved.selectedCourses[0].title).toBe('New Course')
    })

    it('handles complex course data', () => {
        const state = createV2State({
            selectedCourses: [
                createPlanItem({
                    title: 'Advanced Course',
                }),
            ],
        })
        state.grid.Freshman[0] = createCourse({
            title: 'Complex Course',
            description: 'A complex course with special characters: "quotes" & <tags>',
            tags: ['GESC', 'CL'],
        })

        savePlannerState(state)

        const saved = JSON.parse(localStorage.getItem('plannerV2')!)
        expect(saved.grid.Freshman[0].description).toContain('special characters')
    })
})

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('load and save integration', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    afterEach(() => {
        localStorage.clear()
    })

    it('round-trips state correctly', () => {
        const originalState = createV2State({
            selectedCourses: [
                createPlanItem({ title: 'Course A' }),
                createPlanItem({ title: 'Course B' }),
            ],
        })
        originalState.grid.Freshman[0] = createCourse({ title: 'Freshman Course' })
        originalState.grid.Senior[5] = createCourse({ title: 'Senior Course' })

        savePlannerState(originalState)
        const loadedState = loadPlannerState()

        expect(loadedState).toEqual(originalState)
    })

    it('maintains state across multiple saves', () => {
        const state1 = createV2State({ selectedCourses: [createPlanItem({ title: 'A' })] })
        savePlannerState(state1)

        const loaded1 = loadPlannerState()
        loaded1.selectedCourses.push(createPlanItem({ title: 'B' }))
        savePlannerState(loaded1)

        const loaded2 = loadPlannerState()
        expect(loaded2.selectedCourses).toHaveLength(2)
    })
})

// =============================================================================
// CONSTANTS TESTS
// =============================================================================

describe('planner constants', () => {
    it('has correct SLOTS_PER_YEAR value', () => {
        expect(SLOTS_PER_YEAR).toBe(6)
    })

    it('has correct YEARS array', () => {
        expect(YEARS).toEqual(['Freshman', 'Sophomore', 'Junior', 'Senior'])
    })
})
