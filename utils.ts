import { InvoiceRow, AgingCategory, AuditSummary } from './types';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseCSV = (csvText: string): InvoiceRow[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const today = new Date('2023-12-31'); // Audit Date Assumption

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    // Parse numbers
    const amount = parseFloat(row['Jumlah_Tagihan'] || '0');
    const payment = parseFloat(row['Pembayaran_Diterima'] || '0');
    const invDate = new Date(row['Tanggal_Invoice']);
    
    // Calculate Days Overdue relative to Audit Date (Dec 31, 2023)
    const diffTime = Math.abs(today.getTime() - invDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    let category = AgingCategory.CURRENT;
    if (diffDays > 90) category = AgingCategory.BAD_DEBT;
    else if (diffDays > 60) category = AgingCategory.PAST_DUE_2;
    else if (diffDays > 30) category = AgingCategory.PAST_DUE_1;

    return {
      Customer_ID: row['Customer_ID'],
      Nama_Pelanggan: row['Nama_Pelanggan'],
      No_Invoice: row['No_Invoice'],
      Tanggal_Invoice: row['Tanggal_Invoice'],
      Tanggal_Jatuh_Tempo: row['Tanggal_Jatuh_Tempo'],
      Jumlah_Tagihan: amount,
      Pembayaran_Diterima: payment,
      Tanggal_Bayar: row['Tanggal_Bayar'],
      Status_Konfirmasi: row['Status_Konfirmasi'],
      Days_Overdue: diffDays,
      Aging_Category: category,
    };
  });
};

export const calculateAuditStats = (data: InvoiceRow[]): AuditSummary => {
  const summary: AuditSummary = {
    totalReceivable: 0,
    totalCollections: 0,
    netExposure: 0,
    badDebtPotential: 0,
    agingProfile: {
      [AgingCategory.CURRENT]: 0,
      [AgingCategory.PAST_DUE_1]: 0,
      [AgingCategory.PAST_DUE_2]: 0,
      [AgingCategory.BAD_DEBT]: 0,
    },
    topDebtors: [],
  };

  const debtorMap = new Map<string, number>();

  data.forEach(row => {
    const exposure = row.Jumlah_Tagihan - row.Pembayaran_Diterima;
    summary.totalReceivable += row.Jumlah_Tagihan;
    summary.totalCollections += row.Pembayaran_Diterima;
    summary.netExposure += exposure;

    if (row.Aging_Category === AgingCategory.BAD_DEBT) {
      summary.badDebtPotential += exposure;
    }

    summary.agingProfile[row.Aging_Category] += exposure;

    const currentDebtorTotal = debtorMap.get(row.Nama_Pelanggan) || 0;
    debtorMap.set(row.Nama_Pelanggan, currentDebtorTotal + exposure);
  });

  summary.topDebtors = Array.from(debtorMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return summary;
};
