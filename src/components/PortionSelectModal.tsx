import React from 'react';
import { X, Check } from 'lucide-react';
import { MenuItem } from '../data/menuData';

interface PortionSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onSelect: (option: { name: string; price: number; portionLabel: string }) => void;
}

export const PortionSelectModal: React.FC<PortionSelectModalProps> = ({
  isOpen,
  onClose,
  item,
  onSelect,
}) => {
  if (!isOpen || !item) return null;

  const regularPrice = item.price || 0;
  const familyPrice = item.familyPrice || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full bg-[#181a20] rounded-2xl border border-stone-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-1">
          Select Serving Size
        </div>
        <h3 className="font-serif-brand text-xl font-bold text-white mb-2">
          {item.name}
        </h3>
        <p className="text-xs text-stone-400 mb-6">
          Choose between individual single bowl or large family serving.
        </p>

        <div className="space-y-3 mb-6">
          {/* Regular Option */}
          <button
            onClick={() => {
              onSelect({
                name: `${item.name} (Regular)`,
                price: regularPrice,
                portionLabel: 'Regular',
              });
              onClose();
            }}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-stone-800 hover:border-amber-500/60 bg-stone-900 hover:bg-stone-800/80 transition-all text-left group"
          >
            <div>
              <span className="font-semibold text-white block group-hover:text-amber-300">
                Regular Bowl
              </span>
              <span className="text-xs text-stone-400">Single serving</span>
            </div>
            <span className="font-bold text-white tabular-nums text-base">
              Rs. {regularPrice.toLocaleString()}
            </span>
          </button>

          {/* Family Option */}
          <button
            onClick={() => {
              onSelect({
                name: `${item.name} (Family)`,
                price: familyPrice,
                portionLabel: 'Family',
              });
              onClose();
            }}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-stone-800 hover:border-amber-500/60 bg-stone-900 hover:bg-stone-800/80 transition-all text-left group"
          >
            <div>
              <span className="font-semibold text-white block group-hover:text-amber-300">
                Family Tureen
              </span>
              <span className="text-xs text-stone-400">Large sharing portion</span>
            </div>
            <span className="font-bold text-white tabular-nums text-base">
              Rs. {familyPrice.toLocaleString()}
            </span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 text-xs uppercase font-semibold text-stone-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
