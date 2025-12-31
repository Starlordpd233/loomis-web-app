
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadPlannerState, savePlannerState } from '@/lib/plannerStore'
import { SLOTS_PER_YEAR } from '@/types/course'

describe('plannerStore', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    afterEach(() => {
        localStorage.clear()
    })

    it('loads default state when empty', () => {
        const state = loadPlannerState()
        expect(state.version).toBe(2)
        expect(state.selectedCourses).toEqual([])
        expect(state.grid.Freshman).toHaveLength(SLOTS_PER_YEAR)
    })

    it('loads existing plannerV2 state', () => {
        const mockState = {
            version: 2,
            selectedCourses: [{ title: 'CS101' }],
            grid: {
                Freshman: Array(SLOTS_PER_YEAR).fill(null),
                Sophomore: Array(SLOTS_PER_YEAR).fill(null),
                Junior: Array(SLOTS_PER_YEAR).fill(null),
                Senior: Array(SLOTS_PER_YEAR).fill(null),
            }
        }
        localStorage.setItem('plannerV2', JSON.stringify(mockState))

        const state = loadPlannerState()
        expect(state).toEqual(mockState)
    })

    it('migrates from plannerV1 (grid only)', () => {
        const legacyGrid = {
            Freshman: [null, { title: 'Math 1' }, null, null, null, null],
            Sophomore: Array(SLOTS_PER_YEAR).fill(null),
            Junior: Array(SLOTS_PER_YEAR).fill(null),
            Senior: Array(SLOTS_PER_YEAR).fill(null),
        }
        localStorage.setItem('plannerV1', JSON.stringify(legacyGrid))

        const state = loadPlannerState()
        expect(state.version).toBe(2)
        // Should have migrated grid
        expect(state.grid.Freshman[1]).toEqual({ title: 'Math 1' })
        // Should default list to empty
        expect(state.selectedCourses).toEqual([])

        // Should have saved to V2
        expect(localStorage.getItem('plannerV2')).not.toBeNull()
    })

    it('migrates from plan (list only)', () => {
        const legacyList = [{ title: 'English 1' }]
        localStorage.setItem('plan', JSON.stringify(legacyList))

        const state = loadPlannerState()
        expect(state.version).toBe(2)
        expect(state.selectedCourses).toEqual(legacyList)
        // Grid should be default
        expect(state.grid.Freshman[0]).toBeNull()

        // Should have saved to V2
        expect(localStorage.getItem('plannerV2')).not.toBeNull()
    })

    it('saves state correctly', () => {
        const state = {
            version: 2,
            selectedCourses: [{ title: 'Test' }],
            grid: {
                Freshman: Array(SLOTS_PER_YEAR).fill(null),
                Sophomore: Array(SLOTS_PER_YEAR).fill(null),
                Junior: Array(SLOTS_PER_YEAR).fill(null),
                Senior: Array(SLOTS_PER_YEAR).fill(null),
            }
        }
        // Cast to PlannerV2State usually needed, but here simple object matches shape
        savePlannerState(state as any)

        const saved = localStorage.getItem('plannerV2')
        expect(JSON.parse(saved!)).toEqual(state)
    })
})
