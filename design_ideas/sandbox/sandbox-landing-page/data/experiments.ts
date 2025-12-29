import { Experiment } from '../types';

export const experiments: Experiment[] = [
  {
    id: 'exp-001',
    title: 'Enhanced Course Catalog Explorer',
    description: 'AI-powered course catalog with animated search, filtering, and Gemini recommendations for the Loomis Chaffee digital ecosystem.',
    tags: ['React 19', 'Tailwind CSS 4', 'Font Awesome', 'Google Gemini AI'],
    status: 'READY',
    category: 'Course Browser',
    lastUpdated: '2 days ago',
  },
  {
    id: 'exp-002',
    title: 'Student Dashboard V2',
    description: 'A modular widget-based dashboard allowing students to customize their daily view with schedule, assignments, and cafeteria menu.',
    tags: ['Next.js 15', 'Drag & Drop', 'Recharts'],
    status: 'IN_PROGRESS',
    category: 'Dashboard',
    lastUpdated: '1 week ago',
  },
  {
    id: 'exp-003',
    title: 'Interactive Campus Map',
    description: '3D rendered map of the campus with pathfinding and event overlays using Three.js and Mapbox integration.',
    tags: ['Three.js', 'WebGL', 'GeoJSON'],
    status: 'READY',
    category: 'Navigation',
    lastUpdated: '3 weeks ago',
  },
];