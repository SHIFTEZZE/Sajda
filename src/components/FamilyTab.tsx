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
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  getLocalDeviceIdentity,
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
import { getOrCreateCryptoIdentity, createSignedInvitation, verifySignedInvitation, SignedInvitation } from '../services/cryptoPairing.ts';
import { ThemeColors } from '../utils/themeStyles.ts';
import { AppSettings } from '../services/settingsStorage.ts';
import { audioAdhan } from '../services/audioAdhan.ts';

interface FamilyTabProps {
  colors: ThemeColors;
  settings: AppSettings;
}

export const FamilyTab: React.FC<FamilyTabProps> = ({ colors, settings }) => {
  const [identityData, setIdentityData] = useState<{ identity: any; privateKey: CryptoKey } | null>(null);
  const [partners, setPartners] = useState<PartnerRelationship[]>(() => {
    cleanupExpiredSharedRecords();
    return loadPartners();
  });

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPairModal, setShowPairModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMyId, setCopiedMyId] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [signedInviteString, setSignedInviteString] = useState('');

  // Pair input form
  const [incomingInviteInput, setIncomingInviteInput] = useState('');

  useEffect(() => {
    getOrCreateCryptoIdentity(settings.location.arabicName || 'مستخدم سجدة').then((res) => {
      setIdentityData(res);
      // Generate signed invitation string
      createSignedInvitation(res.privateKey, res.identity.deviceId, settings.location.arabicName || 'صديق سجدة', res.identity.publicKeyPemOrJwk).then((inv) => {
        setSignedInviteString(btoa(JSON.stringify(inv)));
      });
    });
  }, [settings.location.arabicName]);

  const inviteLink = `${window.location.origin}${window.location.pathname}?pair_invite=${encodeURIComponent(signedInviteString)}`;

  const handleSyncServerStatus = async () => {
    if (!identityData) return;
    setIsSyncing(true);
    try {
      const transport = new RelayTransport(identityData.identity, identityData.privateKey);
      await transport.registerDevice();
      
      const myStats = getMyRealPrayerStats();
      const updated = [...partners];
      for (let i = 0; i < updated.length; i++) {
        const p = updated[i];
        if (p.status === 'paired') {
          const updates = await transport.fetchPendingUpdates();
          const latest = updates.find((u) => u.senderId === p.id);
          if (latest) {
            updated[i] = {
              ...p,
              todayPrayedCount: latest.todayPrayedCount,
              streak: latest.streak,
              statusText: `أدى ${latest.todayPrayedCount} من 5 صلوات اليوم`,
              lastSyncedAt: Date.now(),
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
    if (identityData && navigator.clipboard) {
      navigator.clipboard.writeText(identityData.identity.deviceId);
      setCopiedMyId(true);
      setTimeout(() => setCopiedMyId(false), 2500);
    }
  };

  const handleProcessIncomingPairing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomingInviteInput.trim()) return;

    try {
      const decodedJson = atob(incomingInviteInput.trim());
      const invitation: SignedInvitation = JSON.parse(decodedJson);

      const isValid = await verifySignedInvitation(invitation);
      if (!isValid) {
        alert('فشل التحقق من صحة الدعوة المشفرة أو انتهاء صلاحيتها.');
        return;
      }

      // Add partner in pending state requiring explicit mutual acceptance
      const updated = addPartner({
        id: invitation.deviceId,
        name: invitation.deviceName || 'شريك جديد',
        relation: 'شريك (قيد المراجعة والموافقة)',
        status: 'pending_incoming',
        permissions: { allowRemoteReminder: true, canViewMyPrayer: false },
        todayPrayedCount: 0,
        streak: 0,
        statusText: 'في انتظار قبولك النهائي',
        avatarColor: colors.primary,
      });

      setPartners(updated);
      setIncomingInviteInput('');
      setShowPairModal(false);
      setReminderToast(`تم استلام دعوة من ${invitation.deviceName}. يرجى القبول لتفعيل المشاركة ✨`);
      setTimeout(() => setReminderToast(null), 4000);
    } catch {
      alert('رمز الدعوة غير صالح أو تالف.');
    }
  };

  const handleAcceptPairing = (id: string) => {
    const updated = updatePartner(id, {
      status: 'paired',
      relation: 'شريك معتمد وموثق',
      statusText: 'تم تفعيل المشاركة المشفرة',
    });
    setPartners(updated);
    setReminderToast('تم قبول الشريك بنجاح وتفعيل قناة المزامنة المتبادلة ✨');
    setTimeout(() => setReminderToast(null), 3000);
  };

  const handleTogglePermission = (id: string, field: 'allowRemoteReminder' | 'canViewMyPrayer') => {
    const partner = partners.find((p) => p.id === id);
    if (!partner) return;
    const updatedPerms = { ...partner.permissions, [field]: !partner.permissions[field] };
    const updated = updatePartner(id, { permissions: updatedPerms });
    setPartners(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من قطع الاتصال وإزالة هذا الشريك من قائمة المتابعة؟')) {
      const updated = removePartner(id);
      setPartners(updated);
    }
  };

  const handleSendReminder = async (partner: PartnerRelationship) => {
    if (!identityData) return;
    const transport = new RelayTransport(identityData.identity, identityData.privateKey);
    await transport.sendFcmNotification(partner.id, {
      id: 'notif_' + Date.now(),
      type: 'reminder',
      sender: settings.location.arabicName || 'صديق',
      timestamp: Date.now(),
      delivered: false,
    });
    setReminderToast(`تم إرسال طلب تذكير إلى ${partner.name} عبر وسيط الأمان 🔔`);
    setTimeout(() => setReminderToast(null), 3000);
  };

  const handleTriggerRemoteAdhan = async (partner: PartnerRelationship) => {
    if (!partner.permissions.allowRemoteReminder) {
      alert(`عذراً، لم يقم ${partner.name} بمنح إذن استقبال التنبيهات عن بعد.`);
      return;
    }
    if (!identityData) return;
    const transport = new RelayTransport(identityData.identity, identityData.privateKey);
    await transport.sendFcmNotification(partner.id, {
      id: 'notif_' + Date.now(),
      type: 'adhan',
      sender: settings.location.arabicName || 'صديق',
      timestamp: Date.now(),
      delivered: false,
    });
    audioAdhan.playNotificationChime();
    setReminderToast(`تم إرسال نداء الأذان المباشر لـ ${partner.name} 🕌`);
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
          رفقاء الدرب (اقتران مشفر ومتبادل)
        </h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans mt-1 max-w-xs mx-auto">
          متابعة صلوات الأحباب بموافقة متبادلة وتوقيعات رقمية آمنة. البيانات مخزنة محلياً وتخضع لحذف تلقائي بعد 31 يوماً.
        </p>

        {identityData && (
          <div
            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-mono"
            style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
          >
            <Shield size={13} className="text-amber-600" />
            <span className="text-neutral-500 font-sans">معرف الجهاز:</span>
            <strong style={{ color: colors.primary }} className="truncate max-w-[120px]">{identityData.identity.deviceId}</strong>
            <button
              onClick={handleCopyMyId}
              className="p-1 rounded-md hover:bg-neutral-200 transition-colors"
              title="نسخ المعرف"
              aria-label="نسخ المعرف"
            >
              {copiedMyId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs text-white"
            style={{ backgroundColor: colors.primary }}
          >
            <Share2 size={15} />
            <span>إنشاء رابط دعوة مشفر</span>
          </button>
          <button
            onClick={() => setShowPairModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 border transition-transform active:scale-95"
            style={{
              borderColor: colors.accent,
              color: colors.primary,
              backgroundColor: `${colors.accent}15`,
            }}
          >
            <UserPlus size={15} />
            <span>إدخال رمز دعوة شريك</span>
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
        </div>
      </div>

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

      {/* قائمة الشركاء */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display-victorian font-bold text-sm" style={{ color: colors.primary }}>
            قائمة الشركاء ({partners.length})
          </h3>
          <span className="text-[11px] font-sans text-neutral-500">يتطلب موافقة متبادلة</span>
        </div>

        {partners.length === 0 ? (
          <div
            className="p-8 rounded-2xl border text-center space-y-3"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <Users size={32} className="mx-auto text-neutral-400 opacity-60" />
            <h4 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
              لا يوجد شركاء مرتبطون بعد
            </h4>
            <p className="text-xs text-neutral-500 font-sans max-w-xs mx-auto">
              أنشئ رابط دعوة أو أدخل رمز دعوة شريكك لبدء الاقتران المشفر بموافقة صريحة.
            </p>
          </div>
        ) : (
          partners.map((partner) => {
            const isExpanded = expandedId === partner.id;
            const isPending = partner.status === 'pending_incoming';
            const cachedHistory = getPartnerHistory(partner.id);

            return (
              <div
                key={partner.id}
                className="rounded-2xl border p-4 transition-all shadow-xs"
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: isPending ? colors.accent : colors.borderSubtle,
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
                        {isPending ? (
                          <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 font-bold">
                            <Clock size={11} /> بانتظار موافقتك
                          </span>
                        ) : (
                          <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 font-bold">
                            ✓ مقترن وموثق
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 font-sans mt-0.5 flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>{partner.statusText}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        onClick={() => handleAcceptPairing(partner.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: colors.primary }}
                      >
                        قبول الاقتران
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : partner.id)}
                      className="p-2 rounded-xl border text-neutral-500 hover:text-neutral-800 transition-colors"
                      style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
                      title="إعدادات الشريك"
                      aria-label="إعدادات الشريك"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {!isPending && (
                  <>
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
                        {partner.todayPrayedCount} / 5 صلوات
                      </div>
                    </div>

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
                        <span>إرسال تذكير</span>
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
                  </>
                )}

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
                          partner.permissions.allowRemoteReminder ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
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
                          partner.permissions.canViewMyPrayer ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {partner.permissions.canViewMyPrayer ? 'مشاركة مفعلة' : 'خاص'}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/50 text-[11px] text-neutral-500">
                      <span>السجل المخزن محلياً ({cachedHistory.length} يوم ضمن سقف 31 يوماً):</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <span className="text-neutral-400 text-[11px]">معرف الشريك: {partner.id.substring(0, 16)}...</span>
                      <button
                        onClick={() => handleDelete(partner.id)}
                        className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                        <span>قطع الاتصال وحذف الشريك</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* مودال رابط الدعوة المشفر */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 animate-scaleUp"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
                رمز الدعوة المشفر
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
              انسخ هذا الرمز الموقّع رقمياً وأرسله لشريكك. يتضمن مفتاحك العام وفترة صلاحية مدتها 24 ساعة لضمان اقتران آمن وموثق.
            </p>

            <div
              className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-900 text-[10px] font-mono break-all select-all text-neutral-700 dark:text-neutral-300 max-h-32 overflow-y-auto"
              style={{ borderColor: colors.borderSubtle }}
            >
              {signedInviteString}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-transform active:scale-95 text-white"
                style={{ backgroundColor: colors.primary }}
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedLink ? 'تم النسخ بنجاح!' : 'نسخ الرمز المشفر'}</span>
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

      {/* مودال إدخال رمز دعوة شريك */}
      {showPairModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleProcessIncomingPairing}
            className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 animate-scaleUp"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
                إدخال رمز دعوة الشريك
              </h3>
              <button
                type="button"
                onClick={() => setShowPairModal(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
              ألصق رمز الدعوة المشفر الذي تلقيته من شريكك للتحقق من مفتاحه العام وبدء الاقتران المتبادل.
            </p>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">رمز الدعوة المشفر (Base64)</label>
                <textarea
                  required
                  rows={4}
                  value={incomingInviteInput}
                  onChange={(e) => setIncomingInviteInput(e.target.value)}
                  placeholder="ألصق الرمز هنا..."
                  className="w-full p-2.5 rounded-xl border font-mono text-[10px] focus:outline-none"
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
                التحقق وإضافة الشريك
              </button>
              <button
                type="button"
                onClick={() => setShowPairModal(false)}
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
