/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart } from 'lucide-react';
import { ThemeColors } from '../utils/themeStyles.ts';

interface MarriagePrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: ThemeColors;
}

export const MarriagePrayerModal: React.FC<MarriagePrayerModalProps> = ({
  isOpen,
  onClose,
  colors,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
      <div
        className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 text-center animate-scaleUp"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.accent }}
      >
        <div
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-xs"
          style={{
            backgroundColor: `${colors.accent}25`,
            borderColor: colors.accent,
            color: colors.accent,
          }}
        >
          <Heart size={26} className="fill-current text-rose-600 animate-pulse" />
        </div>

        <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
          طلب دعاء بظهر الغيب 🤲
        </h3>

        <p className="text-xs text-neutral-700 dark:text-neutral-200 font-sans leading-relaxed px-1">
          لا تنسونا من خالص دعائكم، أن يجمعني الله وإيّاها في الحلال في أقرب وقت، وأن يُيسّر لنا ما استعصى علينا، ويُذلّل لنا الصعاب، ويجمع بيننا على خيرٍ ومودّةٍ ورحمة. 🤍
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl text-xs font-bold font-sans text-white shadow-md transition-transform active:scale-95"
          style={{ backgroundColor: colors.primary }}
        >
          آمين يا رب العالمين، تقبل الله دعاءكم
        </button>
      </div>
    </div>
  );
};
