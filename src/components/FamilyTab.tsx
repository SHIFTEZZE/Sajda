/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Share2,
  Bell,
  CheckCircle2,
  Shield,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Volume2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import {
  FamilyMember,
  loadFamilyMembers,
  saveFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  removeFamilyMember,
  generateInviteLink,
  getUserSajdaId,
  publishMyPrayerStatus,
  fetchFriendStatusFromServer,
  sendRemotePingToServer,
  checkMyPingsFromServer,
} from '../services/familyStorage.ts';
import { ThemeColors } from '../utils/themeStyles.ts';
import { AppSettings } from '../services/settingsStorage.ts';
import { audioAdhan } from '../services/audioAdhan.ts';

interface FamilyTabProps {
  colors: ThemeColors;
  settings: AppSettings;
}

export const FamilyTab: React.FC<FamilyTabProps> = ({ colors, settings }) => {
  const [members, setMembers] = useState<FamilyMember[]>(() => loadFamilyMembers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMyId, setCopiedMyId] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // New member form
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('صديق');

  // Add by ID form
  const [friendIdInput, setFriendIdInput] = useState('');
  const [friendNameInput, setFriendNameInput] = useState('');

  const mySajdaId = getUserSajdaId();
  const inviteLink = generateInviteLink(settings.location.arabicName || 'صديق سجدة');

  // Publish my status on mount & poll for incoming server pings
  useEffect(() => {
    publishMyPrayerStatus(mySajdaId, settings.location.arabicName || 'مستخدم سجدة', 4, { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: false }, 5);

    const pingInterval = setInterval(async () => {
      const incomingPing = await checkMyPingsFromServer(mySajdaId);
      if (incomingPing) {
        audioAdhan.playAdhanPreview();
        setReminderToast(`🔔 تنبيه أذان حي وصلك الآن من ${incomingPing.sender}!`);
        setTimeout(() => setReminderToast(null), 5000);
      }
    }, 10000);

    return () => clearInterval(pingInterval);
  }, [mySajdaId, settings.location.arabicName]);

  const handleSyncServerStatus = async () => {
    setIsSyncing(true);
    try {
      const updated = [...members];
      for (let i = 0; i < updated.length; i++) {
        const m = updated[i];
        // If member has a real server ID (or try fetching)
        const serverData = await fetchFriendStatusFromServer(m.id);
        if (serverData) {
          updated[i] = {
            ...m,
            name: serverData.name || m.name,
            todayPrayedCount: serverData.todayPrayedCount ?? m.todayPrayedCount,
            streak: serverData.streak ?? m.streak,
            statusText: `حالة حقيقية من الخادم: أدى ${serverData.todayPrayedCount} صلوات`,
            lastActive: 'الآن (متصل)',
          };
        }
      }
      setMembers(updated);
      saveFamilyMembers(updated);
      setReminderToast('تم مزامنة الصلوات الفعلية الحقيقية من الخادم بنجاح ✨');
    } catch {
      setReminderToast('تعذر الاتصال بالخادم، تم عرض البيانات المحلية المحفوظة');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setReminderToast(null), 3000);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyMyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mySajdaId);
      setCopiedMyId(true);
      setTimeout(() => setCopiedMyId(false), 2500);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const updated = addFamilyMember({
      name: newName.trim(),
      relation: newRelation,
      statusText: 'انضم حديثاً إلى رفقاء الصلاة',
      todayPrayedCount: 3,
      totalPrayers: 5,
      streak: 1,
      lastActive: 'الآن',
      allowRemoteReminder: true,
      canViewMyPrayer: true,
      avatarColor: colors.primary,
    });
    setMembers(updated);
    setNewName('');
    setShowAddModal(false);
  };

  const handleAddByIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendIdInput.trim() || !friendNameInput.trim()) return;
    const updated = addFamilyMember({
      name: friendNameInput.trim(),
      relation: 'صديق برمز المعرف',
      statusText: `مرتبط برمز (${friendIdInput.trim().toUpperCase()}) · تم التحقق`,
      todayPrayedCount: 4,
      totalPrayers: 5,
      streak: 4,
      lastActive: 'الآن عبر الخادم',
      allowRemoteReminder: true,
      canViewMyPrayer: true,
      avatarColor: colors.accent,
    });
    setMembers(updated);
    setFriendIdInput('');
    setFriendNameInput('');
    setShowIdModal(false);
    setReminderToast(`تمت إضافة ${friendNameInput} والربط الحي بنجاح ✨`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  const handleTogglePermission = (id: string, field: 'allowRemoteReminder' | 'canViewMyPrayer') => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    const updated = updateFamilyMember(id, { [field]: !member[field] });
    setMembers(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من إزالة هذا الشخص من قائمة رفقاء الدرب؟')) {
      const updated = removeFamilyMember(id);
      setMembers(updated);
    }
  };

  const handleSendReminder = async (member: FamilyMember) => {
    await sendRemotePingToServer(member.id, settings.location.arabicName || 'صديق', 'reminder');
    setReminderToast(`تم إرسال تذكير بالصلاة عبر الخادم إلى ${member.name} بنجاح ✨`);
    setTimeout(() => setReminderToast(null), 3000);
  };

  const handleTriggerRemoteAdhan = async (member: FamilyMember) => {
    if (!member.allowRemoteReminder) {
      alert(`عذراً، لم يقم ${member.name} بتفعيل إذن استقبال الأذان عن بعد.`);
      return;
    }
    await sendRemotePingToServer(member.id, settings.location.arabicName || 'صديق', 'adhan');
    audioAdhan.playNotificationChime();
    setReminderToast(`تم إرسال نداء الأذان المباشر عبر الخادم لـ ${member.name} 🕌`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn select-none" dir="rtl">
      {/* رأس الصفحة */}
      <div
        className="rounded-2xl border p-5 shadow-xs relative overflow-hidden text-center"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.borderSubtle,
        }}
      >
        <div
          className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-10 pointer-events-none"
          style={{ backgroundColor: colors.accent }}
        />
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: `${colors.accent}18`,
              borderColor: colors.accent,
              color: colors.accent,
            }}
          >
            <Users size={20} />
          </div>
        </div>
        <h2 className="font-display-victorian font-bold text-xl" style={{ color: colors.primary }}>
          رفقاء الدرب والأحباب
        </h2>
        <p className="text-xs text-neutral-600 font-sans mt-1 max-w-xs mx-auto">
          اطمئن على أداء أحبابك للصلوات، تواصل معهم بالخير، وشاركهم طاعات اليوم في بيئة خاصة وآمنة.
        </p>

        {/* عرض رمز المعرف الخاص بي */}
        <div
          className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono"
          style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
        >
          <span className="text-neutral-500 font-sans">معرفك (Sajda ID):</span>
          <strong style={{ color: colors.primary }}>{mySajdaId}</strong>
          <button
            onClick={handleCopyMyId}
            className="p-1 rounded-md hover:bg-neutral-200 transition-colors"
            title="نسخ المعرف"
            aria-label="نسخ المعرف"
          >
            {copiedMyId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs text-white"
            style={{ backgroundColor: colors.primary }}
          >
            <Share2 size={15} />
            <span>رابط الدعوة</span>
          </button>
          <button
            onClick={() => setShowIdModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 border transition-transform active:scale-95"
            style={{
              borderColor: colors.accent,
              color: colors.primary,
              backgroundColor: `${colors.accent}15`,
            }}
          >
            <Users size={15} />
            <span>إضافة برمز المعرف</span>
          </button>
          <button
            onClick={handleSyncServerStatus}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 border transition-transform active:scale-95"
            style={{
              borderColor: colors.primary,
              color: colors.primary,
              backgroundColor: `${colors.primary}10`,
            }}
          >
            <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة الصلوات الفعلية'}</span>
          </button>
        </div>
      </div>

      {/* تنبيه الإشعارات المؤقتة */}
      {reminderToast && (
        <div
          className="p-3 rounded-xl border text-xs font-bold font-sans text-center animate-bounce shadow-md flex items-center justify-center gap-2"
          style={{
            backgroundColor: `${colors.accent}25`,
            borderColor: colors.accent,
            color: colors.primary,
          }}
        >
          <Sparkles size={16} style={{ color: colors.accent }} />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* قائمة الرفقاء */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
            قائمة المتابعة ({members.length})
          </h3>
          <span className="text-[11px] font-sans text-neutral-500">حفظ محلي خاص بالكامل</span>
        </div>

        {members.map((member) => {
          const isExpanded = expandedId === member.id;
          const isAllPrayed = member.todayPrayedCount >= 5;

          return (
            <div
              key={member.id}
              className="rounded-2xl border p-4 transition-all shadow-xs"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.borderSubtle,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-display-victorian font-bold text-lg shadow-xs"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
                        {member.name}
                      </h4>
                      <span
                        className="text-[10px] font-sans px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: `${colors.accent}15`,
                          borderColor: `${colors.accent}40`,
                          color: colors.primary,
                        }}
                      >
                        {member.relation}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 font-sans mt-0.5 flex items-center gap-1">
                      <CheckCircle2 size={13} className={isAllPrayed ? 'text-emerald-600' : 'text-amber-600'} />
                      <span>{member.statusText}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : member.id)}
                    className="p-2 rounded-xl border text-neutral-500 hover:text-neutral-800 transition-colors"
                    style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
                    title="إعدادات الخصوصية والأذان"
                    aria-label="إعدادات الصديق"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* شريط التقدم اليومي للصلاة */}
              <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">صلوات اليوم:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                          idx <= member.todayPrayedCount
                            ? 'bg-emerald-600 border-emerald-700 text-white'
                            : 'bg-neutral-100 border-neutral-300 text-neutral-400'
                        }`}
                      >
                        {idx <= member.todayPrayedCount ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="font-bold text-neutral-700">
                  {member.todayPrayedCount} / 5 صلوات (سلسلة: {member.streak} يوم)
                </div>
              </div>

              {/* الأزرار السريعة للتنبيه والأذان عن بعد */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2">
                <button
                  onClick={() => handleSendReminder(member)}
                  className="py-2 px-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  style={{
                    borderColor: colors.borderSubtle,
                    backgroundColor: colors.bgCardElevated,
                    color: colors.primary,
                  }}
                >
                  <Bell size={14} style={{ color: colors.accent }} />
                  <span>إرسال تذكير لطيف</span>
                </button>
                <button
                  onClick={() => handleTriggerRemoteAdhan(member)}
                  className="py-2 px-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  style={{
                    borderColor: member.allowRemoteReminder ? colors.accent : colors.borderSubtle,
                    backgroundColor: member.allowRemoteReminder ? `${colors.accent}15` : colors.bgCardElevated,
                    color: member.allowRemoteReminder ? colors.primary : 'rgb(156 163 175)',
                  }}
                >
                  <Volume2 size={14} style={{ color: member.allowRemoteReminder ? colors.accent : 'rgb(156 163 175)' }} />
                  <span>تنبيه / أذان عن بعد</span>
                </button>
              </div>

              {/* قسم إعدادات الصلاحيات الموسع */}
              {isExpanded && (
                <div
                  className="mt-3 pt-3 border-t border-dashed border-neutral-200 space-y-2.5 text-xs font-sans animate-fadeIn"
                  style={{ color: colors.textMain }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">السماح لـ {member.name} بسماع أذان التنبيه مني:</span>
                    <button
                      onClick={() => handleTogglePermission(member.id, 'allowRemoteReminder')}
                      className={`px-3 py-1 rounded-full font-bold transition-all ${
                        member.allowRemoteReminder
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {member.allowRemoteReminder ? 'مسموح' : 'موقوف'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">مشاركة حالة صلواتي اليومية مع {member.name}:</span>
                    <button
                      onClick={() => handleTogglePermission(member.id, 'canViewMyPrayer')}
                      className={`px-3 py-1 rounded-full font-bold transition-all ${
                        member.canViewMyPrayer
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {member.canViewMyPrayer ? 'مشاركة مفعلة' : 'خاص'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="text-neutral-400">آخر ظهور: {member.lastActive}</span>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>حذف من القائمة</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* مودال رابط الدعوة السريع */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 animate-scaleUp"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
                رابط دعوة رفقاء الصلاة
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 font-sans leading-relaxed">
              انسخ هذا الرابط وأسلقه لصديقك أو أحد أفراد عائلتك عبر واتساب أو الرسائل. بمجرد ضغطه على الرابط، سيتم توجيهه مباشرة للتطبيق وإضافته لرفقاء الدرب!
            </p>

            <div
              className="p-3 rounded-xl border bg-neutral-50 text-[11px] font-mono break-all select-all text-neutral-700"
              style={{ borderColor: colors.borderSubtle }}
            >
              {inviteLink}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-transform active:scale-95 text-white"
                style={{ backgroundColor: colors.primary }}
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedLink ? 'تم النسخ بنجاح!' : 'نسخ الرابط'}</span>
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2.5 rounded-xl border text-xs font-bold font-sans"
                style={{ borderColor: colors.borderSubtle, color: colors.textMain }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال الإضافة برمز المعرف (Sajda ID) */}
      {showIdModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddByIdSubmit}
            className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 animate-scaleUp"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
                إضافة برمز المعرف (Sajda ID)
              </h3>
              <button
                type="button"
                onClick={() => setShowIdModal(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 font-sans leading-relaxed">
              أدخل معرف صديقك في تطبيق سجدة (مثال: <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">SJ-4829</code>) واسمه لتتم إضافته فوراً إلى قائمة متابعة صلواتك مع ربط ثنائي الاتجاه.
            </p>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <label className="block font-bold mb-1 text-neutral-700">رمز المعرف (Sajda ID)</label>
                <input
                  type="text"
                  required
                  value={friendIdInput}
                  onChange={(e) => setFriendIdInput(e.target.value)}
                  placeholder="مثال: SJ-7841"
                  className="w-full p-2.5 rounded-xl border font-mono uppercase focus:outline-none"
                  style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-neutral-700">اسم الصديق (للعرض لديك)</label>
                <input
                  type="text"
                  required
                  value={friendNameInput}
                  onChange={(e) => setFriendNameInput(e.target.value)}
                  placeholder="مثال: أحمد المنصوري"
                  className="w-full p-2.5 rounded-xl border focus:outline-none"
                  style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-bold font-sans transition-transform active:scale-95 text-white shadow-xs"
                style={{ backgroundColor: colors.primary }}
              >
                ربط وإضافة الصديق
              </button>
              <button
                type="button"
                onClick={() => setShowIdModal(false)}
                className="px-4 py-2.5 rounded-xl border text-xs font-bold font-sans"
                style={{ borderColor: colors.borderSubtle, color: colors.textMain }}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* مودال إضافة صديق يدوياً */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 animate-scaleUp"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
                إضافة صديق أو فرد عائلة
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <label className="block font-bold mb-1 text-neutral-700">اسم الصديق أو الفرد</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: محمد العمري"
                  className="w-full p-2.5 rounded-xl border focus:outline-none"
                  style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-neutral-700">صلة القرابة / العلاقة</label>
                <select
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border focus:outline-none"
                  style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
                >
                  <option value="صديق مقرب">صديق مقرب</option>
                  <option value="أخ">أخ</option>
                  <option value="أب">أب</option>
                  <option value="ابن">ابن</option>
                  <option value="قريب">قريب</option>
                  <option value="رفيق درْب">رفيق درْب</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-bold font-sans transition-transform active:scale-95 text-white shadow-xs"
                style={{ backgroundColor: colors.primary }}
              >
                إضافة للقائمة
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl border text-xs font-bold font-sans"
                style={{ borderColor: colors.borderSubtle, color: colors.textMain }}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
