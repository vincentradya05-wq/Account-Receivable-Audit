import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { InvoiceRow, AuditSummary } from './types';

// System Prompt for the Persona
const AUDIT_SYSTEM_PROMPT = `
Role: Anda adalah AI Senior Auditor dan Data Analyst bernama "AuditGuard".
Tugas: Melakukan audit substantif piutang usaha (Accounts Receivable).

Capabilities:
1. Data Ingestion: Membaca data CSV transaksi piutang.
2. Risk Assessment: Mendeteksi pola fraud seperti 'Lapping' (pembayaran bulat yang terus tertunda) atau saldo macet >120 hari.
3. Voice/Chat Interaction: Jawab dengan gaya percakapan lisan yang ringkas, profesional, namun "humanis" (seperti konsultan berbicara pada klien). JANGAN membacakan tabel angka panjang. Berikan rangkuman eksekutif.
4. Reporting: Menyusun laporan audit formal sesuai standar SPAP/ISA.

Rules:
- Fokus pada asersi: Eksistensi, Kelengkapan, dan Penilaian (Valuation).
- Jika menemukan saldo > 90 hari, sarankan pembentukan Cadangan Kerugian Penurunan Nilai (CKPN).
- Asumsikan Tanggal Neraca adalah 31 Desember 2023.
`;

export class GeminiAuditService {
  private ai: GoogleGenAI;
  private modelId = 'gemini-2.5-flash'; 

  constructor() {
    // Assuming API Key is available in process.env.API_KEY as per instructions
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private formatContext(data: InvoiceRow[], summary: AuditSummary): string {
    // We sample data if it's too large to fit in context efficiently, 
    // but for this demo, we assume a reasonable dataset size.
    // We convert the rows to a CSV-like string for the model.
    const csvString = data.map(r => 
      `${r.Nama_Pelanggan}, Inv:${r.No_Invoice}, Date:${r.Tanggal_Invoice}, Due:${r.Tanggal_Jatuh_Tempo}, Amt:${r.Jumlah_Tagihan}, Paid:${r.Pembayaran_Diterima}, PaidDate:${r.Tanggal_Bayar}, Status:${r.Status_Konfirmasi}`
    ).join('\n');

    return `
    CONTEXT DATA (AUDIT SUMMARY):
    Total Receivable: ${summary.totalReceivable}
    Bad Debt (>90 days): ${summary.badDebtPotential}
    
    RAW DATA SAMPLE (CSV format):
    Customer, Invoice, Date, DueDate, Amount, Paid, PaidDate, ConfirmStatus
    ${csvString}
    `;
  }

  async analyzeQuery(query: string, data: InvoiceRow[], summary: AuditSummary, history: {role: string, text: string}[] = []): Promise<string> {
    const context = this.formatContext(data, summary);
    
    // Construct the prompt with history
    const historyText = history.map(h => `${h.role === 'user' ? 'User' : 'AuditGuard'}: ${h.text}`).join('\n');
    
    const prompt = `
    ${AUDIT_SYSTEM_PROMPT}

    ${context}

    Conversation History:
    ${historyText}

    User Question: ${query}
    
    Answer (Professional, concise, Indonesian):
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt,
      });
      return response.text || "Maaf, saya tidak dapat menganalisis data saat ini.";
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return "Terjadi kesalahan saat menghubungi server AI. Pastikan API Key valid.";
    }
  }

  async analyzeAudioQuery(audioBase64: string, data: InvoiceRow[], summary: AuditSummary): Promise<string> {
    const context = this.formatContext(data, summary);

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: {
          parts: [
            { text: AUDIT_SYSTEM_PROMPT },
            { text: "Berikut adalah data audit untuk konteks jawaban Anda:" },
            { text: context },
            { text: "User bertanya melalui audio berikut. Jawablah secara lisan (teks yang merepresentasikan jawaban lisan)." },
            {
              inlineData: {
                mimeType: "audio/webm;codecs=opus", // Assuming MediaRecorder standard
                data: audioBase64
              }
            }
          ]
        }
      });
      return response.text || "Maaf, suara tidak terdengar jelas.";
    } catch (error) {
      console.error("Gemini Audio Error:", error);
      return "Gagal memproses audio.";
    }
  }

  async generateReport(data: InvoiceRow[], summary: AuditSummary): Promise<string> {
    const context = this.formatContext(data, summary);
    const prompt = `
    ${AUDIT_SYSTEM_PROMPT}

    DATA:
    ${context}

    REQUEST:
    Berdasarkan seluruh analisis sesi ini, buatkan Draf Laporan Audit Internal dalam format MARKDOWN yang terstruktur.
    
    Struktur Laporan:
    1. Opini Ringkas (Wajar/Tidak Wajar)
    2. Ringkasan Saldo & Aging (Sajikan angka kunci)
    3. Temuan Utama (Key Audit Matters): Fokus pada indikasi Lapping, Konfirmasi yang 'No Reply', dan Saldo Macet.
    4. Evaluasi CKPN: Analisis kecukupan cadangan.
    5. Rekomendasi Pengendalian Internal.

    Gunakan format Markdown profesional.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt,
      });
      return response.text || "Gagal membuat laporan.";
    } catch (error) {
      return "Error generating report.";
    }
  }
}

export const geminiService = new GeminiAuditService();
