import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import UploadView from './components/UploadView';
import DashboardView from './components/DashboardView';
import AnalysisView from './components/AnalysisView';
import FindingsView from './components/FindingsView';
import ReportView from './components/ReportView';
import { ViewState, InvoiceRow } from './types';
import { parseCSV, calculateAuditStats } from './utils';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.UPLOAD);
  const [data, setData] = useState<InvoiceRow[]>([]);

  const summary = useMemo(() => {
    return data.length > 0 ? calculateAuditStats(data) : null;
  }, [data]);

  const handleDataLoaded = (csvText: string) => {
    try {
      const parsedData = parseCSV(csvText);
      setData(parsedData);
      setCurrentView(ViewState.DASHBOARD);
    } catch (e) {
      console.error("Failed to parse CSV", e);
      alert("Error parsing CSV. Please check the format.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        hasData={data.length > 0} 
      />
      
      <main className="flex-1 ml-64 overflow-hidden relative">
        {currentView === ViewState.UPLOAD && (
          <UploadView onDataLoaded={handleDataLoaded} />
        )}
        
        {currentView === ViewState.DASHBOARD && summary && (
          <div className="h-full overflow-y-auto">
            <DashboardView summary={summary} />
          </div>
        )}

        {currentView === ViewState.ANALYSIS && summary && (
          <div className="h-full overflow-hidden">
            <AnalysisView data={data} summary={summary} />
          </div>
        )}

        {currentView === ViewState.FINDINGS && (
          <div className="h-full overflow-hidden">
            <FindingsView data={data} />
          </div>
        )}

        {currentView === ViewState.REPORT && summary && (
          <div className="h-full overflow-hidden">
            <ReportView data={data} summary={summary} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
