export interface Department {
  id: string;
  code: string;
  name: string;
  category: 'Sciences' | 'Arts & Humanities' | 'Engineering' | 'Social Sciences' | 'Business' | 'Health';
  courseCount: number;
  description: string;
}

export interface SidebarLink {
  label: string;
  href: string;
  isActive?: boolean;
}

export type ViewMode = 'grid' | 'list';