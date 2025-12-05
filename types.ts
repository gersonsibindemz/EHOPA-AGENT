
export type ViewState = 'HOME' | 'FORM' | 'HISTORY';

export interface BaseProps {
  className?: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  species: string;
  quantity: string;
  price: string;
  condition: string;
  origin: string;
  timestamp: string;
}
