import { Department, SidebarLink } from './types';

export const DEPARTMENTS: Department[] = [
  { id: '1', code: 'ENG', name: 'English', category: 'Arts & Humanities', courseCount: 52, description: 'Literature, creative writing workshops, and critical analysis.' },
  { id: '2', code: 'MCL', name: 'Modern and Classical Languages', category: 'Arts & Humanities', courseCount: 58, description: 'Arabic, Chinese, French, Latin, and Spanish language and culture.' },
  { id: '3', code: 'HPR', name: 'History, Philosophy, and Religious Studies', category: 'Arts & Humanities', courseCount: 45, description: 'Global history, ethical reasoning, philosophy, and world religions.' },
  { id: '4', code: 'SOC', name: 'Social Science', category: 'Social Sciences', courseCount: 30, description: 'Economics, psychology, and political science electives.' },
  { id: '5', code: 'MATH', name: 'Mathematics', category: 'Sciences', courseCount: 48, description: 'Algebra, geometry, calculus, statistics, and advanced logic.' },
  { id: '6', code: 'SCI', name: 'Science', category: 'Sciences', courseCount: 65, description: 'Biology, chemistry, physics, and environmental science.' },
  { id: '7', code: 'CS', name: 'Computer Science', category: 'Engineering', courseCount: 20, description: 'Programming, web development, robotics, and computational thinking.' },
  { id: '8', code: 'PA', name: 'Performing Arts', category: 'Arts & Humanities', courseCount: 35, description: 'Music, theater, dance, orchestra, and jazz ensemble.' },
  { id: '9', code: 'VA', name: 'Visual Arts', category: 'Arts & Humanities', courseCount: 40, description: 'Drawing, painting, sculpture, photography, and digital media.' },
];

export const SIDEBAR_LINKS: SidebarLink[] = [
  { label: 'Courses A-Z', href: '#', isActive: true },
  { label: 'Programs A-Z', href: '#' },
  { label: 'Diploma Requirements', href: '#' },
  { label: 'Archive', href: '#' },
  { label: 'College Guidance', href: '#' },
  { label: 'Tuition & Financial Aid', href: '#' },
  { label: 'Academic Calendar', href: '#' },
  { label: 'Registrar', href: '#' },
];

export const CATEGORIES: string[] = [
  'All',
  'Arts & Humanities',
  'Sciences',
  'Social Sciences',
  'Engineering'
];

export const ALPHABET: string[] = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");