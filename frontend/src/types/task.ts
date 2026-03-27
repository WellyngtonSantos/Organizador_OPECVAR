export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum Status {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  STAND_BY = 'STAND_BY',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export interface Label {
  id: string;
  name: string;
  color: string | null;
}

export interface Bucket {
  id: string;
  name: string;
  color: string | null;
}

export interface TaskNote {
  id: string;
  taskId: string;
  authorId: string;
  author: { id: string; name: string };
  content: string;
  createdAt: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  user: { id: string; name: string };
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: string;
}

export interface TimerSession {
  id: string;
  taskId: string;
  userId: string;
  startedAt: string;
  stoppedAt: string | null;
  hours: number | null;
}

export interface Task {
  id: string;
  name: string;
  analystId: string;
  analyst: { id: string; name: string };
  createdById: string;
  createdBy: { id: string; name: string };
  receivedDate: string;
  startDate: string | null;
  estimatedCompletionDate: string | null;
  actualCompletionDate: string | null;
  estimatedHours: number | null;
  actualHours: number;
  bucketId: string | null;
  bucket: Bucket | null;
  priority: Priority;
  status: Status;
  queueOrder: number;
  labels: { label: Label }[];
  notes?: TaskNote[];
  history?: TaskHistory[];
  timerSessions?: TimerSession[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  name: string;
  analystId: string;
  receivedDate: string;
  startDate?: string | null;
  estimatedCompletionDate?: string | null;
  estimatedHours?: number | null;
  bucketId?: string | null;
  priority?: Priority;
  status?: Status;
  queueOrder?: number;
  labelIds?: string[];
}

export interface UpdateTaskInput {
  name?: string;
  analystId?: string;
  receivedDate?: string;
  startDate?: string | null;
  estimatedCompletionDate?: string | null;
  actualCompletionDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number;
  bucketId?: string | null;
  priority?: Priority;
  status?: Status;
  queueOrder?: number;
  labelIds?: string[];
}
