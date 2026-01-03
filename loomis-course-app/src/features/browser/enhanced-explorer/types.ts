export type Department = 'Computer Science' | 'English' | 'History' | 'Mathematics' | 'Science' | 'Performing Arts' | 'Visual Arts' | 'Modern Languages' | 'Social Sciences';
export type DepartmentFilter = Department | 'All';

export interface Course {
  id: string;
  code: string;
  title: string;
  department: Department;
  description: string;
  credits: number;
  term?: 'Fall' | 'Winter' | 'Spring';
  gradeLevels: number[];
  prerequisites?: string[];
  tags: string[];
}

export interface UserShortlist {
  courseIds: string[];
}

export interface DepartmentMeta {
  name: string;
  icon: string;
  color: string;
  prefix: string;
  description: string;
}
