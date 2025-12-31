
import { describe, it, expect } from 'vitest'
import { canonicalizeDepartment, normalizeTerm } from '@/lib/courseUtils'

describe('canonicalizeDepartment', () => {
    it('handles standard department codes', () => {
        // Current implementation maps "CS" -> "Computer Science"
        expect(canonicalizeDepartment('CS')).toBe('Computer Science')
        expect(canonicalizeDepartment('MATH')).toBe('Mathematics')
    })

    it('handles lowercase input', () => {
        expect(canonicalizeDepartment('cs')).toBe('Computer Science')
        expect(canonicalizeDepartment('math')).toBe('Mathematics')
    })

    it('handles mixed case input', () => {
        expect(canonicalizeDepartment('Cs')).toBe('Computer Science')
        expect(canonicalizeDepartment('Math')).toBe('Mathematics')
    })

    it('handles department with spaces', () => {
        expect(canonicalizeDepartment('COMP SCI')).toBe('Computer Science')
        expect(canonicalizeDepartment('comp sci')).toBe('Computer Science')
    })

    it('returns Other for unknown input', () => {
        // Current implementation defaults to "Other"
        expect(canonicalizeDepartment('')).toBe('Other')
        expect(canonicalizeDepartment('Unknown Dept')).toBe('Other')
    })
})

describe('normalizeTerm', () => {
    // Current implementation: normalizeTerm(raw, duration) -> { termLabel, termTags }

    it('handles year courses', () => {
        const result = normalizeTerm('year course', 'full-year')
        expect(result).toEqual({ termLabel: 'Full year', termTags: ['YEAR'] })
    })

    it('handles two term courses', () => {
        const result = normalizeTerm('two terms', 'two terms')
        expect(result).toEqual({ termLabel: 'Two terms', termTags: ['TWO-TERM'] })
    })

    it('handles half courses', () => {
        const result = normalizeTerm('half course', 'half')
        expect(result).toEqual({ termLabel: 'Half course', termTags: ['HALF'] })
    })

    it('handles term courses', () => {
        const result = normalizeTerm('term course', 'term')
        expect(result).toEqual({ termLabel: 'Term', termTags: ['TERM'] })
    })

    it('returns empty for unrelated input', () => {
        const result = normalizeTerm('something else', '')
        expect(result).toEqual({ termLabel: undefined, termTags: [] })
    })
})
