import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

export function FAQAccordion({ items }: { items: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="border border-slate-200 bg-white">
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <span className="text-sm font-bold text-slate-900">{item.question}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 text-sm leading-relaxed text-slate-600 border-t border-slate-50">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="h-8 w-8 border-2 border-slate-200 border-t-slate-950 rounded-full"
      />
    </div>
  );
}
