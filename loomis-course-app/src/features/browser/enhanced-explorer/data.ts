import { Course, DepartmentMeta } from './types';

export const DEPARTMENTS: DepartmentMeta[] = [
  { name: 'Computer Science', icon: 'Code', color: 'blue', prefix: 'CS', description: 'Programming, web development, robotics, and computational thinking.' },
  { name: 'English', icon: 'BookOpen', color: 'orange', prefix: 'ENG', description: 'Literature, creative writing workshops, and critical analysis.' },
  { name: 'History', icon: 'Globe', color: 'amber', prefix: 'HIST', description: 'Global history, ethical reasoning, philosophy, and world religions.' },
  { name: 'Mathematics', icon: 'Calculator', color: 'indigo', prefix: 'MATH', description: 'Algebra, geometry, calculus, statistics, and advanced logic.' },
  { name: 'Science', icon: 'FlaskConical', color: 'emerald', prefix: 'SCI', description: 'Biology, chemistry, physics, and environmental research.' },
  { name: 'Modern Languages', icon: 'Globe', color: 'cyan', prefix: 'LANG', description: 'Arabic, Chinese, French, Latin, and Spanish language and culture.' },
  { name: 'Performing Arts', icon: 'Music', color: 'rose', prefix: 'ARTS', description: 'Music, theater, dance, orchestra, and jazz ensemble.' },
  { name: 'Visual Arts', icon: 'Palette', color: 'fuchsia', prefix: 'VART', description: 'Drawing, painting, digital media, and architecture.' },
  { name: 'Social Sciences', icon: 'Users', color: 'violet', prefix: 'SOC', description: 'Economics, psychology, and contemporary global issues.' }
];

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    code: 'CS101',
    title: 'Introduction to Computer Science',
    department: 'Computer Science',
    description: 'Learn fundamentals of computational thinking through Python programming. We cover loops, functions, and basic data structures.',
    credits: 1,
    term: 'Fall',
    gradeLevels: [9, 10],
    tags: ['Introductory', 'Python', 'Core']
  },
  {
    id: '2',
    code: 'CS450',
    title: 'Advanced Machine Learning',
    department: 'Computer Science',
    description: 'A deep dive into neural networks, supervised learning, and AI ethics. Students will build and train their own models.',
    credits: 1,
    term: 'Spring',
    gradeLevels: [11, 12],
    prerequisites: ['CS101', 'MATH202'],
    tags: ['Advanced', 'AI', 'Capstone']
  },
  {
    id: '3',
    code: 'ENG210',
    title: 'Modern World Literature',
    department: 'English',
    description: 'Exploring contemporary voices from across the globe, focusing on themes of identity, migration, and power.',
    credits: 1,
    term: 'Winter',
    gradeLevels: [10, 11],
    tags: ['Writing Intensive', 'Global']
  },
  {
    id: '4',
    code: 'MATH305',
    title: 'Multivariable Calculus',
    department: 'Mathematics',
    description: 'Calculus of functions of several variables, including partial derivatives, multiple integrals, and vector analysis.',
    credits: 1,
    term: 'Fall',
    gradeLevels: [11, 12],
    prerequisites: ['MATH300'],
    tags: ['Advanced', 'STEM']
  },
  {
    id: '5',
    code: 'SCI150',
    title: 'Molecular Biology',
    department: 'Science',
    description: 'Investigation of life at molecular level, including DNA replication, gene expression, and biotechnology.',
    credits: 1,
    term: 'Spring',
    gradeLevels: [9, 10, 11],
    tags: ['Laboratory', 'Core']
  },
  {
    id: '6',
    code: 'SOC250',
    title: 'Behavioral Psychology',
    department: 'Social Sciences',
    description: 'Understanding human behavior through cognitive, social, and developmental lenses.',
    credits: 1,
    term: 'Fall',
    gradeLevels: [11, 12],
    tags: ['Research', 'Humanities']
  },
  {
    id: '7',
    code: 'ARTS120',
    title: 'Digital Music Composition',
    department: 'Performing Arts',
    description: 'Learn to compose music using modern DAWs, synthesizers, and audio engineering techniques.',
    credits: 0.5,
    term: 'Winter',
    gradeLevels: [9, 10, 11, 12],
    tags: ['Creative', 'Tech']
  }
];
