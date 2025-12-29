
export type Department = 'Computer Science' | 'English' | 'History' | 'Mathematics' | 'Science' | 'Performing Arts' | 'Visual Arts' | 'Modern Languages' | 'Social Sciences';

export interface Course {
  id: string;
  code: string;
  title: string;
  department: Department;
  description: string;
  credits: number;
  gradeLevels: number[];
  prerequisites?: string[];
  tags: string[];
}

export interface UserShortlist {
  courseIds: string[];
}
