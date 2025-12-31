/**
 * Course Utilities Unit Tests
 * 
 * Comprehensive tests for course data processing utilities.
 * Tests cover normalization, tag derivation, database flattening, and filtering.
 */

import { describe, it, expect } from 'vitest'
import {
    canonicalizeDepartment,
    normalizeTerm,
    deriveTags,
    flattenDatabase,
    formatGrades,
    filterCourses,
    fetchFirst,
    CATALOG_PATHS,
} from '@/lib/courseUtils'
import type { RawCourse, Course } from '@/types/course'

// =============================================================================
// TEST DATA FACTORIES
// =============================================================================

/**
 * Create a minimal raw course for testing
 */
const createRawCourse = (overrides: Partial<RawCourse> = {}): RawCourse => ({
    title: 'Test Course',
    description: 'A test course description',
    department: 'Computer Science',
    ...overrides,
})

/**
 * Create a minimal normalized course for testing
 */
const createCourse = (overrides: Partial<Course> = {}): Course => ({
    title: 'Test Course',
    description: 'A test course description',
    department: 'Computer Science',
    tags: [],
    ...overrides,
})

// =============================================================================
// CANONICALIZE DEPARTMENT TESTS
// =============================================================================

describe('canonicalizeDepartment', () => {
    describe('standard department mappings', () => {
        it('maps CS and variations to Computer Science', () => {
            expect(canonicalizeDepartment('CS')).toBe('Computer Science')
            expect(canonicalizeDepartment('cs')).toBe('Computer Science')
            expect(canonicalizeDepartment('Cs')).toBe('Computer Science')
            expect(canonicalizeDepartment('computer science')).toBe('Computer Science')
            expect(canonicalizeDepartment('COMP SCI')).toBe('Computer Science')
            expect(canonicalizeDepartment('comp sci')).toBe('Computer Science')
        })

        it('maps MATH and variations to Mathematics', () => {
            expect(canonicalizeDepartment('MATH')).toBe('Mathematics')
            expect(canonicalizeDepartment('math')).toBe('Mathematics')
            expect(canonicalizeDepartment('Math')).toBe('Mathematics')
            expect(canonicalizeDepartment('mathematics')).toBe('Mathematics')
        })

        it('maps English department', () => {
            expect(canonicalizeDepartment('English')).toBe('English')
            expect(canonicalizeDepartment('ENGLISH')).toBe('English')
            expect(canonicalizeDepartment('english')).toBe('English')
        })

        it('maps language departments', () => {
            expect(canonicalizeDepartment('Modern Languages')).toBe('Modern or Classical Languages')
            expect(canonicalizeDepartment('classical language')).toBe('Modern or Classical Languages')
            expect(canonicalizeDepartment('French')).toBe('Modern or Classical Languages')
            expect(canonicalizeDepartment('Spanish')).toBe('Modern or Classical Languages')
            expect(canonicalizeDepartment('Latin')).toBe('Modern or Classical Languages')
            expect(canonicalizeDepartment('Chinese')).toBe('Modern or Classical Languages')
            expect(canonicalizeDepartment('Arabic')).toBe('Modern or Classical Languages')
        })

        it('maps history and social science departments', () => {
            expect(canonicalizeDepartment('History')).toBe('History, Philosophy, Religious Studies & Social Science')
            expect(canonicalizeDepartment('Philosophy')).toBe('History, Philosophy, Religious Studies & Social Science')
            expect(canonicalizeDepartment('Religious Studies')).toBe('History, Philosophy, Religious Studies & Social Science')
            expect(canonicalizeDepartment('Social Science')).toBe('History, Philosophy, Religious Studies & Social Science')
            expect(canonicalizeDepartment('HPRSS')).toBe('History, Philosophy, Religious Studies & Social Science')
        })

        it('maps science departments', () => {
            expect(canonicalizeDepartment('Science')).toBe('Science')
            expect(canonicalizeDepartment('Biology')).toBe('Science')
            expect(canonicalizeDepartment('Chemistry')).toBe('Science')
            expect(canonicalizeDepartment('Physics')).toBe('Science')
            expect(canonicalizeDepartment('Environmental Science')).toBe('Science')
        })

        it('maps arts departments', () => {
            expect(canonicalizeDepartment('Performing Arts')).toBe('Performing Arts/Visual Arts')
            expect(canonicalizeDepartment('Visual Arts')).toBe('Performing Arts/Visual Arts')
            expect(canonicalizeDepartment('Music')).toBe('Performing Arts/Visual Arts')
            expect(canonicalizeDepartment('Theater')).toBe('Performing Arts/Visual Arts')
            expect(canonicalizeDepartment('Theatre')).toBe('Performing Arts/Visual Arts')
            expect(canonicalizeDepartment('Dance')).toBe('Performing Arts/Visual Arts')
        })
    })

    describe('edge cases', () => {
        it('returns Other for empty or unknown input', () => {
            expect(canonicalizeDepartment('')).toBe('Other')
            expect(canonicalizeDepartment('   ')).toBe('Other')
            expect(canonicalizeDepartment('Unknown Dept')).toBe('Other')
            expect(canonicalizeDepartment('Random Subject')).toBe('Other')
        })

        it('handles undefined input', () => {
            expect(canonicalizeDepartment(undefined)).toBe('Other')
        })

        it('handles mixed case and extra whitespace', () => {
            expect(canonicalizeDepartment('  MATH  ')).toBe('Mathematics')
            expect(canonicalizeDepartment('  computer science  ')).toBe('Computer Science')
        })
    })
})

// =============================================================================
// NORMALIZE TERM TESTS
// =============================================================================

describe('normalizeTerm', () => {
    describe('standard term formats', () => {
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
    })

    describe('edge cases', () => {
        it('returns empty for unrelated input', () => {
            const result = normalizeTerm('something else', '')
            expect(result).toEqual({ termLabel: undefined, termTags: [] })
        })

        it('handles undefined inputs', () => {
            const result = normalizeTerm(undefined, undefined)
            expect(result).toEqual({ termLabel: undefined, termTags: [] })
        })

        it('handles mixed case input', () => {
            const result = normalizeTerm('YEAR', 'FULL-YEAR')
            expect(result).toEqual({ termLabel: 'Full year', termTags: ['YEAR'] })
        })

        it('handles partial matches', () => {
            const result = normalizeTerm('yearly', '')
            expect(result).toEqual({ termLabel: 'Full year', termTags: ['YEAR'] })
        })
    })
})

// =============================================================================
// DERIVE TAGS TESTS
// =============================================================================

describe('deriveTags', () => {
    it('derives GESC tag when course has gesc flag', () => {
        const course = createRawCourse({ gesc: true })
        const result = deriveTags(course)
        expect(result.tags).toContain('GESC')
    })

    it('derives PPR tag when course has ppr flag', () => {
        const course = createRawCourse({ ppr: true })
        const result = deriveTags(course)
        expect(result.tags).toContain('PPR')
    })

    it('derives CL level for rigor >= 3', () => {
        const course = createRawCourse({ rigor: 3 })
        const result = deriveTags(course)
        expect(result.tags).toContain('CL')
        expect(result.level).toBe('CL')
    })

    it('derives CL level for titles starting with "CL "', () => {
        const course = createRawCourse({ title: 'CL Chemistry' })
        const result = deriveTags(course)
        expect(result.tags).toContain('CL')
        expect(result.level).toBe('CL')
    })

    it('derives ADV level for rigor === 2', () => {
        const course = createRawCourse({ rigor: 2 })
        const result = deriveTags(course)
        expect(result.tags).toContain('ADV')
        expect(result.level).toBe('ADV')
    })

    it('derives term tags based on duration', () => {
        const course = createRawCourse({ term: 'year', duration: 'full-year' })
        const result = deriveTags(course)
        expect(result.tags).toContain('YEAR')
    })

    it('combines multiple tags', () => {
        const course = createRawCourse({
            gesc: true,
            ppr: true,
            rigor: 3,
            term: 'year',
        })
        const result = deriveTags(course)
        expect(result.tags).toContain('GESC')
        expect(result.tags).toContain('PPR')
        expect(result.tags).toContain('CL')
        expect(result.tags).toContain('YEAR')
    })

    it('removes duplicate tags', () => {
        const course = createRawCourse({ rigor: 3 })
        const result = deriveTags(course)
        const clCount = result.tags.filter(t => t === 'CL').length
        expect(clCount).toBe(1)
    })
})

// =============================================================================
// FORMAT GRADES TESTS
// =============================================================================

describe('formatGrades', () => {
    it('formats single grade', () => {
        expect(formatGrades([9])).toBe('Freshman')
        expect(formatGrades([10])).toBe('Sophomore')
        expect(formatGrades([11])).toBe('Junior')
        expect(formatGrades([12])).toBe('Senior')
    })

    it('formats multiple grades', () => {
        const result = formatGrades([9, 10, 11])
        expect(result).toBe('Freshman, Sophomore, Junior')
    })

    it('handles all grades', () => {
        const result = formatGrades([9, 10, 11, 12])
        expect(result).toBe('Freshman, Sophomore, Junior, Senior')
    })

    it('sorts grades before formatting', () => {
        const result = formatGrades([12, 9, 11, 10])
        expect(result).toBe('Freshman, Sophomore, Junior, Senior')
    })

    it('removes duplicates', () => {
        const result = formatGrades([9, 9, 10, 10])
        expect(result).toBe('Freshman, Sophomore')
    })

    it('returns null for empty or undefined input', () => {
        expect(formatGrades([])).toBeNull()
        expect(formatGrades(undefined)).toBeNull()
    })

    it('filters out invalid grades', () => {
        const result = formatGrades([9, 99, 10])
        expect(result).toBe('Freshman, Sophomore')
    })
})

// =============================================================================
// FLATTEN DATABASE TESTS
// =============================================================================

describe('flattenDatabase', () => {
    it('returns empty array for null input', () => {
        expect(flattenDatabase(null)).toEqual([])
    })

    it('handles direct array format', () => {
        const rawCourses: RawCourse[] = [
            createRawCourse({ title: 'Course 1' }),
            createRawCourse({ title: 'Course 2' }),
        ]

        const result = flattenDatabase(rawCourses)
        expect(result).toHaveLength(2)
        expect(result[0].title).toBe('Course 1')
        expect(result[1].title).toBe('Course 2')
    })

    it('handles { departments: [...] } format', () => {
        const catalog = {
            departments: [
                {
                    department: 'Math',
                    courses: [
                        createRawCourse({ title: 'Algebra', department: undefined }),
                        createRawCourse({ title: 'Calculus', department: undefined }),
                    ],
                },
            ],
        }

        const result = flattenDatabase(catalog)
        expect(result).toHaveLength(2)
        expect(result[0].department).toBe('Math')
    })

    it('handles { courses: [...] } format', () => {
        const catalog = {
            courses: [
                createRawCourse({ title: 'Test Course' }),
            ],
        }

        const result = flattenDatabase(catalog)
        expect(result).toHaveLength(1)
    })

    it('preserves course properties during flattening', () => {
        const rawCourses: RawCourse[] = [
            createRawCourse({
                title: 'Advanced Physics',
                description: 'Physics course',
                department: 'Science',
                grades: [11, 12],
                gesc: true,
                rigor: 3,
            }),
        ]

        const result = flattenDatabase(rawCourses)
        expect(result[0].title).toBe('Advanced Physics')
        expect(result[0].department).toBe('Science')
        expect(result[0].grades).toEqual([11, 12])
        expect(result[0].tags).toContain('GESC')
        expect(result[0].tags).toContain('CL')
    })
})

// =============================================================================
// FILTER COURSES TESTS
// =============================================================================

describe('filterCourses', () => {
    const testCourses: Course[] = [
        createCourse({
            title: 'Intro to CS',
            department: 'Computer Science',
            tags: ['GESC'],
        }),
        createCourse({
            title: 'Advanced Math',
            department: 'Mathematics',
            tags: ['CL', 'PPR'],
        }),
        createCourse({
            title: 'English Literature',
            department: 'English',
            description: 'Study of classic literature',
        }),
    ]

    describe('query filtering', () => {
        it('filters by title query', () => {
            const result = filterCourses(testCourses, { query: 'Intro' })
            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Intro to CS')
        })

        it('filters by department query', () => {
            const result = filterCourses(testCourses, { query: 'math' })
            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Advanced Math')
        })

        it('filters by description when enabled', () => {
            const result = filterCourses(testCourses, {
                query: 'classic',
                includeDescriptions: true,
            })
            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('English Literature')
        })

        it('does not filter by description when disabled', () => {
            const result = filterCourses(testCourses, {
                query: 'classic',
                includeDescriptions: false,
            })
            expect(result).toHaveLength(0)
        })

        it('returns all courses for empty query', () => {
            const result = filterCourses(testCourses, { query: '' })
            expect(result).toHaveLength(3)
        })
    })

    describe('department filtering', () => {
        it('filters by specific department', () => {
            const result = filterCourses(testCourses, { department: 'Mathematics' })
            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Advanced Math')
        })

        it('returns all courses for "All" department', () => {
            const result = filterCourses(testCourses, { department: 'All' })
            expect(result).toHaveLength(3)
        })
    })

    describe('tag filtering', () => {
        it('filters by GESC tag', () => {
            const result = filterCourses(testCourses, { tags: { gesc: true } })
            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Intro to CS')
        })

        it('filters by PPR tag', () => {
            const result = filterCourses(testCourses, { tags: { ppr: true } })
            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Advanced Math')
        })

        it('filters by CL tag', () => {
            const result = filterCourses(testCourses, { tags: { cl: true } })
            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Advanced Math')
        })

        it('combines multiple tag filters', () => {
            const result = filterCourses(testCourses, {
                tags: { cl: true, ppr: true }
            })
            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Advanced Math')
        })
    })

    describe('combined filtering', () => {
        it('combines query and department filters', () => {
            const result = filterCourses(testCourses, {
                query: 'Math',
                department: 'Mathematics',
            })
            expect(result).toHaveLength(1)
        })

        it('combines query and tag filters', () => {
            const result = filterCourses(testCourses, {
                query: 'intro',
                tags: { gesc: true },
            })
            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Intro to CS')
        })
    })
})

// =============================================================================
// CONSTANTS TESTS
// =============================================================================

describe('constants', () => {
    it('exports CATALOG_PATHS with expected paths', () => {
        expect(CATALOG_PATHS).toContain('/catalog.json')
        expect(CATALOG_PATHS).toContain('/catalogdbfinal.json')
        expect(CATALOG_PATHS).toContain('/course_catalog_full.json')
    })
})
