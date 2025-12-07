import React, { useState } from 'react';
import { Upload, FileType, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UploadViewProps {
  onDataLoaded: (csvText: string) => void;
}

const UploadView: React.FC<UploadViewProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        onDataLoaded(text);
      }
    };
    reader.onerror = () => setError('Error reading file.');
    reader.readAsText(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Initialize Audit Engagement</h2>
        <p className="text-slate-500 text-lg">Upload your Accounts Receivable transaction data (CSV) to begin substantive testing.</p>
      </div>

      <div
        className={`w-full h-80 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer bg-white
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
        
        <div className="bg-blue-100 p-6 rounded-full mb-6">
          <Upload className="w-12 h-12 text-blue-600" />
        </div>
        <p className="text-xl font-medium text-slate-700 mb-2">Drag & Drop CSV here</p>
        <p className="text-slate-400">or click to browse file system</p>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-12 w-full">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Required CSV Format</h3>
        <div className="bg-slate-100 rounded-lg p-6 overflow-x-auto border border-slate-200 font-mono text-xs text-slate-600">
          Customer_ID, Nama_Pelanggan, No_Invoice, Tanggal_Invoice, Tanggal_Jatuh_Tempo, Jumlah_Tagihan, Pembayaran_Diterima, Tanggal_Bayar, Status_Konfirmasi
        </div>
      </div>
    </div>
  );
};

export default UploadView;
