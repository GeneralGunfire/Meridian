import { FileData } from '../types';
import { motion } from 'motion/react';

interface DownloadTableProps {
  files: FileData[];
}

export function DownloadTable({ files }: DownloadTableProps) {
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="w-full overflow-x-auto border border-slate-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <th className="px-6 py-4">Release Week</th>
            <th className="px-6 py-4">Publish Date</th>
            <th className="px-6 py-4">Row count</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {files.map((file, idx) => (
            <motion.tr 
              key={file.week}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group hover:bg-slate-50/50"
            >
              <td className="px-6 py-4 text-sm font-bold text-slate-950">{file.week}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{file.date}</td>
              <td className="px-6 py-4 text-sm font-mono text-slate-400">{file.rows.toLocaleString()}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => handleDownload(file.csv_url, `meridian_${file.week}.csv`)}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors"
                  >
                    CSV
                  </button>
                  <button 
                    onClick={() => handleDownload(file.xlsx_url, `meridian_${file.week}.xlsx`)}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors"
                  >
                    EXCEL
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
