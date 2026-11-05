/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BatteryCharging, Check, BellRing } from 'lucide-react';
import { ThemeColors } from '../utils/themeStyles.ts';

interface BatteryOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: ThemeColors;
}

export const BatteryOptimizationModal: React.FC<BatteryOptimizationModalProps> = ({
  isOpen,
  onClose,
  colors,
}) => {
  if (!isOpen) return null;

  const handleRequestUnrestricted = () => {
    // In Android webview / Capacitor, prompt or guide to settings
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        // Native intent to battery optimization settings if available
        console.log('Requesting battery optimization exemption');
      }
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
      <div
        className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 text-center animate-scaleUp"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.accent }}
      >
        <div
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-xs"
          style={{
            backgroundColor: `${colors.accent}20`,
            borderColor: colors.accent,
            color: colors.accent,
          }}
        >
          <BatteryCharging size={28} className="text-amber-500 animate-bounce" />
        </div>

        <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
          تشغيل الأذان بدقة ودون قيود 🕌
        </h3>

        <p className="text-xs text-neutral-700 dark:text-neutral-300 font-sans leading-relaxed text-right">
          لكي يرتفع صوت الأذان في موعده بدقة حتى وإن كان الهاتف مغلقاً أو في وضع السكون، يُرجى ضبط التطبيق على <strong className="text-amber-600">«غير مقيّد / بدون قيود» (Unrestricted)</strong> في استخدام البطارية والسماح بالتشغيل في الخلفية.
        </p>

        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-neutral-200/50 text-[11px] font-sans text-right space-y-1.5 text-neutral-600 dark:text-neutral-300">
          <div className="flex items-center gap-1.5 font-bold" style={{ color: colors.primary }}>
            <BellRing size={13} style={{ color: colors.accent }} />
            <span>خطوات التفعيل السريعة:</span>
          </div>
          <p>١. توفير البطارية ← اختر <strong>«بلا قيود»</strong>.</p>
          <p>٢. فعّل <strong>«التشغيل التلقائي والنشاط في الخلفية»</strong> لضمان انطلاق الأذان دائماً.</p>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={handleRequestUnrestricted}
            className="w-full py-3 rounded-2xl text-xs font-bold font-sans text-white shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Check size={16} />
            <span>السماح بالعمل دون قيود</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl text-xs font-bold font-sans text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            تخطي الآن
          </button>
        </div>
      </div>
    </div>
  );
};
