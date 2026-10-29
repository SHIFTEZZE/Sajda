import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ScrollText,
  Search,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
} from 'lucide-react';
import { NAWAWI_HADITHS, HadithEntry } from '../data/hadithData.ts';
import { loadHadithFavorites, toggleHadithFavorite } from '../services/trackerStorage.ts';
import { ThemeColors } from '../utils/themeStyles.ts';

interface HadithViewProps {
  colors: ThemeColors;
  onBack: () => void;
}

export const HadithView: React.FC<HadithViewProps> = ({ colors, onBack }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    setFavorites(loadHadithFavorites());
  }, []);

  const handleToggleFav = (id: number) => {
    const updated = toggleHadithFavorite(id);
    setFavorites(updated);
  };

  const handleShare = (h: HadithEntry) => {
    const text = `حديث رقم ${h.id}: ${h.titleAr}\n\n« ${h.arabicText} »\n\nالراوي: ${h.narrator}\nالمصدر: ${h.source} [${h.grading}]`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(h.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filtered = NAWAWI_HADITHS.filter((h) => {
    const query = searchQuery.trim();
    const matchesSearch =
      h.titleAr.includes(query) ||
      h.arabicText.includes(query) ||
      h.narrator.includes(query) ||
      h.id.toString() === query;
    const matchesFav = !showFavoritesOnly || favorites.includes(h.id);
    return matchesSearch && matchesFav;
  });

  return (
    <div className="space-y-4 pb-24 animate-fadeIn select-none" dir="rtl">
      {/* شريط العنوان وزر الرجوع */}
      <div className="flex items-center justify-between pb-1 font-sans">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-transform active:scale-95"
          style={{
            borderColor: colors.borderSubtle,
            backgroundColor: colors.bgCard,
            color: colors.primary,
          }}
        >
          <ArrowRight size={14} />
          <span>الرئيسية</span>
        </button>

        <div className="text-left">
          <h2 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
            رياض الأحاديث الشريفة
          </h2>
          <span className="text-[10px] text-neutral-500">
            الأربعون النووية للإمام النووي
          </span>
        </div>
      </div>

      {/* بطاقة توثيق المجموعة الحديثية */}
      <div
        className="rounded-2xl border p-4 shadow-xs font-sans"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <ScrollText size={18} style={{ color: colors.accent }} />
            <h3 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
              الأربعون النووية
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-600/30 text-amber-800 bg-amber-500/10">
            أحاديث صحيحة موثقة
          </span>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed mt-1">
          جمع الإمام المحدث يحيى بن شرف النووي رحمه الله (631–676 هـ) هذه الأحاديث الجامعة لقواعد الإسلام وأصول الدين. جميع الأحاديث موثقة التخريج من صحيحي البخاري ومسلم والسنن المعتمدة.
        </p>
      </div>

      {/* البحث والمفضلة */}
      <div className="space-y-2 font-sans">
        <div className="relative">
          <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأحاديث بالكلمة أو الموضوع أو الرقم..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border text-xs outline-none focus:ring-1 text-right font-sans"
            style={{
              borderColor: colors.borderSubtle,
              backgroundColor: colors.bgCard,
              color: colors.textMain,
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors"
            style={{
              borderColor: showFavoritesOnly ? colors.accent : colors.borderSubtle,
              backgroundColor: showFavoritesOnly ? `${colors.accent}15` : colors.bgCard,
              color: showFavoritesOnly ? colors.primary : colors.textMuted,
            }}
          >
            <Bookmark size={13} />
            <span>الأحاديث المفضلة ({favorites.length})</span>
          </button>

          <span className="text-[11px] text-neutral-500">
            عرض {filtered.length} من {NAWAWI_HADITHS.length} حديثاً
          </span>
        </div>
      </div>

      {/* قائمة بطاقات الأحاديث */}
      <div className="space-y-4">
        {filtered.map((hadith) => {
          const isFav = favorites.includes(hadith.id);

          return (
            <div
              key={hadith.id}
              className="rounded-3xl border p-5 shadow-xs transition-all space-y-3"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: isFav ? colors.accent : colors.borderSubtle,
              }}
            >
              {/* رأس بطاقة الحديث والإجراءات */}
              <div className="flex items-start justify-between pb-2 border-b border-neutral-100 font-sans">
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs"
                    style={{
                      borderColor: colors.accent,
                      backgroundColor: `${colors.accent}12`,
                      color: colors.primary,
                    }}
                  >
                    #{hadith.id}
                  </span>
                  <div>
                    <h4 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
                      {hadith.titleAr}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleShare(hadith)}
                    className="p-1.5 rounded-lg border text-neutral-500 hover:text-neutral-800 transition-colors"
                    style={{ borderColor: colors.borderSubtle }}
                    title="نسخ نص الحديث وتخريجه"
                    aria-label="نسخ الحديث"
                  >
                    {copiedId === hadith.id ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Share2 size={14} />
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleFav(hadith.id)}
                    className="p-1.5 rounded-lg border transition-transform active:scale-95"
                    style={{
                      borderColor: isFav ? colors.accent : colors.borderSubtle,
                      color: isFav ? colors.accent : colors.textMuted,
                      backgroundColor: isFav ? `${colors.accent}15` : 'transparent',
                    }}
                    title={isFav ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                    aria-label={`تفضيل حديث ${hadith.id}`}
                  >
                    {isFav ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  </button>
                </div>
              </div>

              {/* سند ورواية الصحابي الجليل */}
              <div className="text-xs font-sans text-neutral-600 font-medium">
                عن: <strong>{hadith.narrator}</strong>
              </div>

              {/* متن الحديث الشريف بالرسم الواضح المتميز */}
              <div
                className="p-4 rounded-2xl border"
                style={{
                  backgroundColor: colors.quranSurface,
                  borderColor: colors.borderSubtle,
                }}
              >
                <p
                  className="font-arabic-uthmani text-right text-lg leading-[2.3]"
                  style={{ color: colors.quranText }}
                >
                  « {hadith.arabicText} »
                </p>
              </div>

              {/* التخريج ودرجة الصحة الصريحة */}
              <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs font-sans text-neutral-500">
                <span>
                  المصدر: <strong>{hadith.source}</strong>
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full border text-[11px] font-bold"
                  style={{
                    backgroundColor: `${colors.primary}0D`,
                    borderColor: `${colors.primary}25`,
                    color: colors.primary,
                  }}
                  title={hadith.scholarGradeSource}
                >
                  {hadith.scholarGradeSource || hadith.grading}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
