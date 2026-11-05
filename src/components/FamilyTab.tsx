/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wrench, ShieldAlert, Sparkles } from 'lucide-react';
import { ThemeColors } from '../utils/themeStyles.ts';
import { AppSettings } from '../services/settingsStorage.ts';

interface FamilyTabProps {
  colors: ThemeColors;
  settings: AppSettings;
}

export const FamilyTab: React.FC<FamilyTabProps> = ({ colors }) => {
  return (
    <div className="space-y-4 pb-24 animate-fadeIn select-none font-sans" dir="rtl">
      {/* بطاقة الصيانة الرئيسية */}
      <div
        className="rounded-3xl border p-8 shadow-sm relative overflow-hidden text-center space-y-5"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.borderSubtle,
        }}
      >
        <div
          className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-10 pointer-events-none"
          style={{ backgroundColor: colors.accent }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-28 h-28 rounded-full opacity-10 pointer-events-none"
          style={{ backgroundColor: colors.accent }}
        />

        <div className="flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xs"
            style={{
              backgroundColor: `${colors.accent}20`,
              borderColor: colors.accent,
              color: colors.accent,
            }}
          >
            <Wrench size={32} className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        <div>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border mb-2"
            style={{
              backgroundColor: `${colors.accent}15`,
              borderColor: `${colors.accent}40`,
              color: colors.accent,
            }}
          >
            <ShieldAlert size={12} />
            <span>قيد التطوير والتحديث الأمني</span>
          </span>

          <h2 className="font-display-victorian font-bold text-2xl mt-1" style={{ color: colors.primary }}>
            قسم رفقاء الدرب تحت الصيانة
          </h2>

          <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans mt-2 max-w-sm mx-auto leading-relaxed">
            نعمل حالياً على ترقية خوادم الترحيل المشفرة (Cloudflare Relay) وتطوير خوارزميات ربط الأجهزة المباشرة (End-to-End Encrypted Sync) لضمان أقصى درجات الخصوصية والأمان لعباداتكم.
          </p>
        </div>

        <div
          className="p-4 rounded-2xl border text-xs text-right space-y-2"
          style={{
            backgroundColor: colors.bgCardElevated,
            borderColor: colors.borderSubtle,
          }}
        >
          <div className="flex items-center gap-2 font-bold" style={{ color: colors.primary }}>
            <Sparkles size={14} style={{ color: colors.accent }} />
            <span>ما يتم العمل عليه للنسخة القادمة:</span>
          </div>
          <ul className="list-disc pr-5 space-y-1 text-[11px] text-neutral-600 dark:text-neutral-300">
            <li>اقتران فوري عبر البلوتوث ورموز QR دون الحاجة لأي خوادم وسيطة.</li>
            <li>تنبيهات أذان موحدة بين أفراد العائلة والرفقاء في أوقات الصلاة.</li>
            <li>تشفير تام لكل التحديثات وسجلات المحاسبة دون تخزين أي سجل خارجي.</li>
          </ul>
        </div>

        <div className="pt-2 text-[11px] text-neutral-400 font-sans">
          سيعود القسم للعمل فور اكتمال الترقية. تقبل الله طاعاتكم!
        </div>
      </div>
    </div>
  );
};
