
export type ViewState = 'FORM' | 'HISTORY' | 'HELP' | 'AUTH' | 'REVENUE' | 'PROFILE' | 'PROVIDER_DETAIL' | 'FINANCIAL_DETAIL' | 'STOCK_DETAIL' | 'DELIVERY_LOG' | 'RECOVERY';

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

export interface TransactionRecord {
  id: string;
  type: 'CREDIT' | 'DEBIT'; // Credit = Sale, Debit = Withdrawal
  amount: number;
  date: string;
  time: string;
  description: string;
  method?: 'M-Pesa' | 'e-Mola' | 'mKesh' | 'Bank Transfer' | 'Cash';
  accountNumber?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface UserProfile {
  name: string;
  surname: string;
  mobileMain: string;
  mobileSecondary: string;
  email: string;
  province: string;
  district: string;
  praia: string;
  age: string;
  gender: string;
  role: string;
  affiliationDate: string;
  photoUrl: string;
}

export interface SpeciesStock {
  name: string;
  quantityKg: number;
  condition?: 'Fresco' | 'Congelado';
  date?: string; // Date of capture/entry
}

export interface ProviderStats {
  id: string;
  name: string;
  surname: string;
  address: string;
  contact: string;
  province: string;
  district: string;
  praia: string;
  age: number;
  gender: 'M' | 'F';
  totalSubmitted: number; // in submissions count
  totalKg: number;
  totalSoldMt: number;
  stockRemainingKg: number;
  stockFreshKg: number;
  stockFrozenKg: number;
  status: 'Active' | 'Inactive';
  withdrawalRequestedMt: number;
  withdrawalApprovedMt: number;
  speciesStock: SpeciesStock[];
}