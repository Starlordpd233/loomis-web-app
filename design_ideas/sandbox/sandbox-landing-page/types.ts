export interface Experiment {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: 'READY' | 'IN_PROGRESS' | 'ARCHIVED';
  icon?: React.ReactNode;
  category: string;
  lastUpdated: string;
}

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}