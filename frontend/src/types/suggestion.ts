export enum SuggestionStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  ACCEPTED = 'ACCEPTED',
  DONE = 'DONE',
  REJECTED = 'REJECTED',
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  authorId: string;
  author: { id: string; name: string; email: string };
  status: SuggestionStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export const suggestionStatusLabels: Record<SuggestionStatus, string> = {
  [SuggestionStatus.OPEN]: 'Aberta',
  [SuggestionStatus.IN_REVIEW]: 'Em Analise',
  [SuggestionStatus.ACCEPTED]: 'Aceita',
  [SuggestionStatus.DONE]: 'Concluida',
  [SuggestionStatus.REJECTED]: 'Rejeitada',
};

export const suggestionStatusColors: Record<SuggestionStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  [SuggestionStatus.OPEN]: 'default',
  [SuggestionStatus.IN_REVIEW]: 'info',
  [SuggestionStatus.ACCEPTED]: 'warning',
  [SuggestionStatus.DONE]: 'success',
  [SuggestionStatus.REJECTED]: 'error',
};
