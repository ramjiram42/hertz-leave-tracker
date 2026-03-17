import React, { useState } from 'react';
import { Upload, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExcelProcessor } from '../utils/ExcelProcessor';
import { useApp } from '../store/AppContext';

export const ExcelUpload: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualStatus, setManualStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  
  const { addRequest, setEmployees } = useApp();

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      setManualStatus('error');
      return;
    }

    setIsProcessing(true);
    setManualStatus('idle');

    try {
      const data = await ExcelProcessor.processTracker(file);
      
      // Auto-commit data
      if (data.employees.length > 0) setEmployees(data.employees);
      data.requests.forEach(req => addRequest(req));
      
      setManualStatus('success');
      setTimeout(() => setManualStatus('idle'), 3000);
    } catch (err) {
      console.error('Processing failed', err);
      setManualStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 text-center ${
        isDragging 
          ? 'border-[#C41E3A] bg-[#C41E3A]/5 scale-[0.99]' 
          : 'border-slate-200 bg-white hover:bg-slate-50'
      } ${manualStatus === 'error' ? 'border-red-500/50 bg-red-50' : ''}`}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        accept=".xlsx"
      />

      <AnimatePresence mode="wait">
        {manualStatus === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-4"
          >
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-500">
              <FileCheck size={32} />
            </div>
            <h4 className="text-lg font-bold text-emerald-400">Tracker Synced!</h4>
            <p className="text-sm text-slate-400 mt-1">Dashboard has been updated with latest data.</p>
          </motion.div>
        ) : manualStatus === 'error' ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-4"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-500">
              <AlertCircle size={32} />
            </div>
            <h4 className="text-lg font-bold text-red-400">Upload Failed</h4>
            <p className="text-sm text-slate-400 mt-1">Please ensure you are using the .xlsx tracker file.</p>
          </motion.div>
        ) : isProcessing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-4"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-[#C41E3A] shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Processing File...</h4>
            <p className="text-sm text-slate-500 mt-1">Reading sheets and normalizing leave data.</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-4"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-[#C41E3A] shadow-sm">
              <Upload size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Import Leave Tracker</h4>
            <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
              Drag and drop your 2026 tracker Excel here or click to browse.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-slate-500 uppercase tracking-tighter">.xlsx only</span>
              <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-slate-500 uppercase tracking-tighter">Multi-sheet support</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
