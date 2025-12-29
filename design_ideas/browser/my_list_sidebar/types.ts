export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  department: string;
  tags: string[];
  description?: string;
  isNew?: boolean;
  term: 'Fall' | 'Winter' | 'Spring';
}

export interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export enum NavSection {
  DISCOVER = 'DISCOVER',
  ACADEMIC_UNITS = 'ACADEMIC_UNITS',
  RESOURCES = 'RESOURCES'
}
