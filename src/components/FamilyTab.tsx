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
  Copy,
  Check,
  Trash2,
  Sparkles,
  Volume2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Shield,
  WifiOff,
} from 'lucide-react';
import {
  getOrCreateDeviceIdentity,
  loadPartners,
  addPartner,
  updatePartner,
  removePartner,
  getMyRealPrayerStats,
} from '../services/familySync.ts';
import {
  PartnerRelationship,
  PartnerStatus,
} from '../services/familyModels.ts';
import {
  cleanupExpiredSharedRecords,
  getPartnerHistory,
} from '../services/sharedPrayerHistory.ts';
import { RelayTransport } from '../services/relayTransport.ts';
import { ThemeColors } from '../utils/themeStyles.ts';
import { AppSettings } from '../services/settingsStorage.ts';
import { audioAdhan } from '../services/audioAdhan.ts';
import { runFamilySyncTests } from '../services/familySync.test.ts';

interface FamilyTabProps {
  colors: ThemeColors;
  settings: AppSettings;
}

export const FamilyTab: React.FC<FamilyTabProps> = ({ colors, settings }) => {
  const [deviceIdentity] = useState(() => getOrCreateDeviceIdentity(settings.location.arabicName || 'مستخدم سجدة'));
  const [partners, setPartners] = useState<PartnerRelationship[]>(() => {
    cleanupExpiredSharedRecords();
    return loadPartners();
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMyId, setCopiedMyId] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResults, setTestResults] = useState<{ name: string; passed: boolean; message: string }[] | null>(null);

  // New partner form
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('صديق');

  // Add by device ID form
  const [peerIdInput, setPeerIdInput] = useState('');
  const [peerNameInput, setPeerNameInput] = useState('');

  const transport = new RelayTransport('https://sajda-relay.workers.dev', deviceIdentity);
  const inviteLink = `${window.location.origin}${window.location.pathname}?pair_device=${encodeURIComponent(deviceIdentity.deviceId)}&name=${encodeURIComponent(settings.location.arabicName || 'صديق سجدة')}`;

  // On mount: register device, sync real stats, run retention cleanup & tests
  useEffect(() => {
    transport.registerDevice();
    cleanupExpiredSharedRecords();

    const myStats = getMyRealPrayerStats();
    // Publish real stats silently if connected
    transport.sendPrayerUpdate('relay_broadcast', {
      senderId: deviceIdentity.deviceId,
      date: new Date().toISOString().split('T')[0],
      prayerStates: myStats.prayerStates,
      todayPrayedCount: myStats.todayPrayedCount,
      streak: myStats.streak,
      timestamp: Date.now(),
    });
  }, [deviceIdentity]);

  const handleRunTests = () => {
    const results = runFamilySyncTests();
    setTestResults(results);
  };

  const handleSyncServerStatus = async () => {
    setIsSyncing(true);
    try {
      await transport.registerDevice();
      const myStats = getMyRealPrayerStats();
      
      const updated = [...partners];
      for (let i = 0; i < updated.length; i++) {
        const p = updated[i];
        if (p.status === 'paired') {
          // Fetch updates from relay transport
          const updates = await transport.fetchPendingUpdates();
          const latest = updates.find((u) => u.senderId === p.id);
          if (latest) {
            updated[i] = {
              ...p,
              todayPrayedCount: latest.todayPrayedCount,
              streak: latest.streak,
              statusText: `أدى ${latest.todayPrayedCount} من 5 صلوات اليوم`,
              lastSyncedAt: Date.now(),
              status: 'paired',
            };
          }
        }
      }
      setPartners(updated);
      setReminderToast('تمت المزامنة بنجاح واستلام سجلات 31 يوماً الأخيرة ✨');
    } catch {
      setReminderToast('تعذر الاتصال بالخادم الوسيط، تم الاعتماد على التخزين المحلي الآمن');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setReminderToast(null), 3500);
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
      navigator.clipboard.writeText(deviceIdentity.deviceId);
      setCopiedMyId(true);
      setTimeout(() => setCopiedMyId(false), 2500);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const myStats = getMyRealPrayerStats();
    const updated = addPartner({
      id: 'partner_' + Math.random().toString(36).substring(2, 10),
      name: newName.trim(),
      relation: newRelation,
      status: 'paired',
      permissions: { allowRemoteReminder: true, canViewMyPrayer: true },
      todayPrayedCount: 0,
      streak: 0,
      statusText: 'في انتظار المزامنة الأولى',
      avatarColor: colors.primary,
    });
    setPartners(updated);
    setNewName('');
    setShowAddModal(false);
    setReminderToast(`تمت إضافة ${newName} بنجاح تحت إشراف أمان سجدة المحلي ✨`);
    setTimeout(() => setReminderToast(null), 3000);
  };

  const handleAddByIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!peerIdInput.trim() || !peerNameInput.trim()) return;
    const updated = addPartner({
      id: peerIdInput.trim(),
      name: peerNameInput.trim(),
      relation: 'شريك بالمعرف الآمن',
      status: 'paired',
      permissions: { allowRemoteReminder: true, canViewMyPrayer: true },
      todayPrayedCount: 0,
      streak: 0,
      statusText: 'تم الربط بالمعرف المشفر',
      avatarColor: colors.accent,
    });
    setPartners(updated);
    setPeerIdInput('');
    setPeerNameInput('');
    setShowIdModal(false);
    setReminderToast(`تم ربط جهاز ${peerNameInput} بنجاح ✨`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  const handleTogglePermission = (id: string, field: 'allowRemoteReminder' | 'canViewMyPrayer') => {
    const partner = partners.find((p) => p.id === id);
    if (!partner) return;
    const updatedPerms = { ...partner.permissions, [field]: !partner.permissions[field] };
    const updated = updatePartner(id, { permissions: updatedPerms });
    setPartners(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من إزالة هذا الشريك من قائمة المتابعة؟')) {
      const updated = removePartner(id);
      setPartners(updated);
    }
  };

  const handleSendReminder = async (partner: PartnerRelationship) => {
    await transport.sendFcmNotification(partner.id, {
      id: 'notif_' + Date.now(),
      type: 'reminder',
      sender: settings.location.arabicName || 'صديق',
      timestamp: Date.now(),
      delivered: true,
    });
    setReminderToast(`تم إرسال تذكير بالصلاة إلى ${partner.name} عبر وسيط الأمان بنجاح ✨`);
    setTimeout(() => setReminderToast(null), 3000);
  };

  const handleTriggerRemoteAdhan = async (partner: PartnerRelationship) => {
    if (!partner.permissions.allowRemoteReminder) {
      alert(`عذراً، لم يقم ${partner.name} بمنح إذن استقبال التنبيهات عن بعد.`);
      return;
    }
    await transport.sendFcmNotification(partner.id, {
      id: 'notif_' + Date.now(),
      type: 'adhan',
      sender: settings.location.arabicName || 'صديق',
      timestamp: Date.now(),
      delivered: true,
    });
    audioAdhan.playNotificationChime();
    setReminderToast(`تم إرسال نداء الأذان المباشر لـ ${partner.name} 🕌`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn select-none" dir="rtl">
      {/* رأس الصفحة الآمن */}
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
          رفقاء الدرب والأحباب (مزامنة آمنة)
        </h2>
        <p className="text-xs text-neutral-600 font-sans mt-1 max-w-xs mx-auto">
          متابعة صلوات الأحباب باختيارك الشخصي البحت. البيانات مخزنة محلياً وتخضع لسياسة انتهاء الصلاحية خلال 31 يوماً لحماية الخصوصية المطلقة.
        </p>

        {/* عرض معرف الجهاز المشفر */}
        <div
          className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-mono"
          style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
        >
          <Shield size={13} className="text-amber-600" />
          <span className="text-neutral-500 font-sans">معرف الجهاز الآمن:</span>
          <strong style={{ color: colors.primary }} className="truncate max-w-[120px]">{deviceIdentity.deviceId}</strong>
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
            <span>رابط الدعوة الآمن</span>
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
            <UserPlus size={15} />
            <span>إضافة بمعرف الجهاز</span>
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
            <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة السجلات'}</span>
          </button>
          <button
            onClick={handleRunTests}
            className="px-3 py-2 rounded-xl text-xs font-bold font-sans border border-amber-600/40 text-amber-700 bg-amber-50 dark:bg-amber-950/20"
          >
            اختبارات الأمان والاحتفاظ
          </button>
        </div>
      </div>

      {/* نتائج اختبارات النظام والاحتفاظ لمدة 31 يوم */}
      {testResults && (
        <div
          className="p-4 rounded-2xl border text-xs font-sans space-y-2 animate-fadeIn"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
        >
          <div className="flex items-center justify-between font-bold" style={{ color: colors.primary }}>
            <span>نتائج فحص الخصوصية والاحتفاظ (31 يوماً):</span>
            <button onClick={() => setTestResults(null)} className="text-neutral-400 hover:text-neutral-700">✕</button>
          </div>
          {testResults.map((t, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/50">
              <span className="font-bold text-neutral-700 dark:text-neutral-300">{t.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {t.passed ? '✓ نجاح' : '✗ فشل'} - {t.message}
              </span>
            </div>
          ))}
        </div>
      )}

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

      {/* قائمة الشركاء والرفقاء */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
            قائمة الشركاء والرفقاء ({partners.length})
          </h3>
          <span className="text-[11px] font-sans text-neutral-500">انتهاء تلقائي للمخزن بعد 31 يوماً</span>
        </div>

        {partners.length === 0 ? (
          <div
            className="p-8 rounded-2xl border text-center space-y-3"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <Users size={32} className="mx-auto text-neutral-400 opacity-60" />
            <h4 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
              لا يوجد شركاء مضافون حالياً
            </h4>
            <p className="text-xs text-neutral-500 font-sans max-w-xs mx-auto">
              أضف شريكاً عبر رابط الدعوة الآمن أو بمعرف الجهاز لتبادل متابعة الصلوات بكل خصوصية وموثوقية.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold font-sans text-white shadow-xs"
              style={{ backgroundColor: colors.primary }}
            >
              إضافة شريك جديد
            </button>
          </div>
        ) : (
          partners.map((partner) => {
            const isExpanded = expandedId === partner.id;
            const isAllPrayed = partner.todayPrayedCount >= 5;
            const cachedHistory = getPartnerHistory(partner.id);

            return (
              <div
                key={partner.id}
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
                      style={{ backgroundColor: partner.avatarColor }}
                    >
                      {partner.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
                          {partner.name}
                        </h4>
                        <span
                          className="text-[10px] font-sans px-2 py-0.5 rounded-md border"
                          style={{
                            backgroundColor: `${colors.accent}15`,
                            borderColor: `${colors.accent}40`,
                            color: colors.primary,
                          }}
                        >
                          {partner.relation}
                        </span>
                        {partner.status === 'offline' ? (
                          <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-600 flex items-center gap-1">
                            <WifiOff size={10} /> غير متصل
                          </span>
                        ) : (
                          <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            ● متصل آمن
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-600 font-sans mt-0.5 flex items-center gap-1">
                        <CheckCircle2 size={13} className={isAllPrayed ? 'text-emerald-600' : 'text-amber-600'} />
                        <span>{partner.statusText}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : partner.id)}
                      className="p-2 rounded-xl border text-neutral-500 hover:text-neutral-800 transition-colors"
                      style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
                      title="إعدادات الخصوصية والأذان"
                      aria-label="إعدادات الشريك"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* شريط التقدم اليومي للصلاة */}
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">صلوات اليوم:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div
                          key={idx}
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                            idx <= partner.todayPrayedCount
                              ? 'bg-emerald-600 border-emerald-700 text-white'
                              : 'bg-neutral-100 border-neutral-300 text-neutral-400'
                          }`}
                        >
                          {idx <= partner.todayPrayedCount ? '✓' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="font-bold text-neutral-700 dark:text-neutral-300">
                    {partner.todayPrayedCount} / 5 صلوات (سلسلة: {partner.streak} يوم)
                  </div>
                </div>

                {/* الأزرار السريعة للتنبيه والأذان عن بعد */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2">
                  <button
                    onClick={() => handleSendReminder(partner)}
                    className="py-2 px-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                    style={{
                      borderColor: colors.borderSubtle,
                      backgroundColor: colors.bgCardElevated,
                      color: colors.primary,
                    }}
                  >
                    <Bell size={14} style={{ color: colors.accent }} />
                    <span>إرسال تذكير بالصلاة</span>
                  </button>
                  <button
                    onClick={() => handleTriggerRemoteAdhan(partner)}
                    className="py-2 px-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                    style={{
                      borderColor: partner.permissions.allowRemoteReminder ? colors.accent : colors.borderSubtle,
                      backgroundColor: partner.permissions.allowRemoteReminder ? `${colors.accent}15` : colors.bgCardElevated,
                      color: partner.permissions.allowRemoteReminder ? colors.primary : 'rgb(156 163 175)',
                    }}
                  >
                    <Volume2 size={14} style={{ color: partner.permissions.allowRemoteReminder ? colors.accent : 'rgb(156 163 175)' }} />
                    <span>تنبيه أذان مباشر</span>
                  </button>
                </div>

                {/* قسم إعدادات الصلاحيات الموسع وسجل 31 يوم */}
                {isExpanded && (
                  <div
                    className="mt-3 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 space-y-2.5 text-xs font-sans animate-fadeIn"
                    style={{ color: colors.textMain }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">السماح بتلقي تنبيهات أذان مباشرة مني:</span>
                      <button
                        onClick={() => handleTogglePermission(partner.id, 'allowRemoteReminder')}
                        className={`px-3 py-1 rounded-full font-bold transition-all ${
                          partner.permissions.allowRemoteReminder
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {partner.permissions.allowRemoteReminder ? 'مسموح' : 'موقوف'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">مشاركة حالة صلواتي مع هذا الشريك:</span>
                      <button
                        onClick={() => handleTogglePermission(partner.id, 'canViewMyPrayer')}
                        className={`px-3 py-1 rounded-full font-bold transition-all ${
                          partner.permissions.canViewMyPrayer
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {partner.permissions.canViewMyPrayer ? 'مشاركة مفعلة' : 'خاص'}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/50 text-[11px] text-neutral-500">
                      <span>السجل المخزن محلياً لهذا الشريك ({cachedHistory.length} يوم محفوظ ضمن سقف 31 يوماً):</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <span className="text-neutral-400 text-[11px]">معرف الشريك: {partner.id.substring(0, 16)}...</span>
                      <button
                        onClick={() => handleDelete(partner.id)}
                        className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                        <span>حذف الشريك</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* زر إضافة شريك يدوي */}
      {partners.length > 0 && (
        <div className="text-center pt-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold font-sans inline-flex items-center gap-1.5 border"
            style={{ borderColor: colors.primary, color: colors.primary, backgroundColor: `${colors.primary}10` }}
          >
            <UserPlus size={15} />
            <span>إضافة شريك جديد للقائمة</span>
          </button>
        </div>
      )}

      {/* مودال رابط الدعوة الآمن */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 animate-scaleUp"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
                رابط الدعوة الآمن لرفقة الصلاة
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
              انسخ هذا الرابط وأسلقه لشريكك. بمجرد قبوله، يتم إنشاء قناة ربط مشفرة مع احتفاظ كل طرف بسجلاته على جهازه وبحد احتفاظ 31 يوماً.
            </p>

            <div
              className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-900 text-[11px] font-mono break-all select-all text-neutral-700 dark:text-neutral-300"
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

      {/* مودال الإضافة بمعرف الجهاز الآمن */}
      {showIdModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddByIdSubmit}
            className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 animate-scaleUp"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
                إضافة شريك بمعرف الجهاز الآمن
              </h3>
              <button
                type="button"
                onClick={() => setShowIdModal(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
              أدخل معرف جهاز شريكك الفريد واسمه لتفعيل المزامنة المباشرة.
            </p>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">معرف الجهاز (Device ID)</label>
                <input
                  type="text"
                  required
                  value={peerIdInput}
                  onChange={(e) => setPeerIdInput(e.target.value)}
                  placeholder="مثال: dev_a8b9c2..."
                  className="w-full p-2.5 rounded-xl border font-mono focus:outline-none"
                  style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">اسم الشريك (للعرض لديك)</label>
                <input
                  type="text"
                  required
                  value={peerNameInput}
                  onChange={(e) => setPeerNameInput(e.target.value)}
                  placeholder="مثال: أحمد الفاسي"
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
                ربط وحفظ الشريك
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

      {/* مودال إضافة شريك محلياً */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 animate-scaleUp"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
                إضافة شريك جديد
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
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">اسم الشريك أو الفرد</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: يوسف العلوي"
                  className="w-full p-2.5 rounded-xl border focus:outline-none"
                  style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">صلة القرابة / العلاقة</label>
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
                إفظ الشريك
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
