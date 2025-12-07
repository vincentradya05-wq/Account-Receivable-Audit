export interface InvoiceRow {
  Customer_ID: string;
  Nama_Pelanggan: string;
  No_Invoice: string;
  Tanggal_Invoice: string;
  Tanggal_Jatuh_Tempo: string;
  Jumlah_Tagihan: number;
  Pembayaran_Diterima: number;
  Tanggal_Bayar: string;
  Status_Konfirmasi: string;
  // Computed fields
  Days_Overdue: number;
  Aging_Category: AgingCategory;
}

export enum AgingCategory {
  CURRENT = '0-30 Hari (Lancar)',
  PAST_DUE_1 = '31-60 Hari (Kurang Lancar)',
  PAST_DUE_2 = '61-90 Hari (Diragukan)',
  BAD_DEBT = '> 90 Hari (Macet)',
}

export interface AuditSummary {
  totalReceivable: number;
  totalCollections: number;
  netExposure: number;
  badDebtPotential: number; // > 90 days
  agingProfile: {
    [key in AgingCategory]: number;
  };
  topDebtors: { name: string; amount: number }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isAudio?: boolean;
}

export enum ViewState {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
  ANALYSIS = 'ANALYSIS',
  FINDINGS = 'FINDINGS',
  REPORT = 'REPORT',
}
