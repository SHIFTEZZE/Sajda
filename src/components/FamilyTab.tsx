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
  QrCode,
  Lock,
  AlertCircle,
} from 'lucide-react';
import {
  initializeSecurePairingIdentity,
  createSecureInvitation,
  verifyAndParseInvitation,
  loadTrustedPartners,
  saveTrustedPartners,
  computePublicKeyFingerprint,
  PairingInvitation,
  TrustedPartnerConnection,
  SecureDeviceIdentity,
} from '../services/securePairingProtocol.ts';
import { ThemeColors } from '../utils/themeStyles.ts';
import { AppSettings } from '../services/settingsStorage.ts';
import { audioAdhan } from '../services/audioAdhan.ts';
import { runSecurePairingTests } from '../services/securePairing.test.ts';

interface FamilyTabProps {
  colors: ThemeColors;
  settings: AppSettings;
}

export const FamilyTab: React.FC<FamilyTabProps> = ({ colors, settings }) => {
  const [identity, setIdentity] = useState<SecureDeviceIdentity | null>(null);
  const [partners, setPartners] = useState<TrustedPartnerConnection[]>(() => loadTrustedPartners());

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMyId, setCopiedMyId] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  
  // Invitation & QR state
  const [activeInvite, setActiveInvite] = useState<{ invitation: PairingInvitation; fragment: string } | null>(null);
  const [incomingFragmentInput, setIncomingFragmentInput] = useState('');
  const [pendingInvitationPreview, setPendingInvitationPreview] = useState<{ invitation: PairingInvitation; fingerprint: string } | null>(null);

  // Test suite results
  const [testResults, setTestResults] = useState<{ name: string; passed: boolean; message: string }[] | null>(null);

  useEffect(() => {
    initializeSecurePairingIdentity(settings.location.arabicName || 'مستخدم سجدة').then(async (res) => {
      setIdentity(res.identity);
      const inv = await createSecureInvitation(res.identity.deviceName);
      setActiveInvite({ invitation: inv.invitation, fragment: inv.inviteUrlFragment });
    });

    // Check if URL has #invite= fragment on load
    if (typeof window !== 'undefined' && window.location.hash.includes('#invite=')) {
      const fragment = window.location.hash;
      verifyAndParseInvitation(fragment).then(async (parsed) => {
        if (parsed) {
          const fp = await computePublicKeyFingerprint(parsed.senderPublicKey);
          setPendingInvitationPreview({ invitation: parsed, fingerprint: fp });
          setShowScanModal(true);
        }
      });
    }
  }, [settings.location.arabicName]);

  const handleRunTests = async () => {
    const results = await runSecurePairingTests();
    setTestResults(results);
  };

  const handleCopyInviteLink = () => {
    if (activeInvite && navigator.clipboard) {
      const fullUrl = `${window.location.origin}${window.location.pathname}${activeInvite.fragment}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyMyId = () => {
    if (identity && navigator.clipboard) {
      navigator.clipboard.writeText(identity.deviceId);
      setCopiedMyId(true);
      setTimeout(() => setCopiedMyId(false), 2500);
    }
  };

  const handleProcessIncomingFragment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomingFragmentInput.trim()) return;

    const parsed = await verifyAndParseInvitation(incomingFragmentInput.trim());
    if (!parsed) {
      alert('رمز الدعوة غير صالح، منتهي الصلاحية (أكثر من 10 دقائق)، أو فشل التوقيع الرقمي.');
      return;
    }

    const fp = await computePublicKeyFingerprint(parsed.senderPublicKey);
    setPendingInvitationPreview({ invitation: parsed, fingerprint: fp });
  };

  const handleAcceptPairingRequest = async () => {
    if (!pendingInvitationPreview) return;
    const inv = pendingInvitationPreview.invitation;

    const newConnection: TrustedPartnerConnection = {
      partnerId: inv.senderId,
      partnerName: inv.senderName,
      partnerPublicKey: inv.senderPublicKey,
      state: 'accepted',
      fingerprint: pendingInvitationPreview.fingerprint,
      pairedAt: Date.now(),
      lastActiveAt: Date.now(),
    };

    const updated = [newConnection, ...partners.filter((p) => p.partnerId !== inv.senderId)];
    setPartners(updated);
    saveTrustedPartners(updated);

    setPendingInvitationPreview(null);
    setShowScanModal(false);
    setIncomingFragmentInput('');
    setReminderToast(`تم قبول الاقتران المشفر مع ${inv.senderName} بنجاح ✨`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  const handleRejectPairingRequest = () => {
    setPendingInvitationPreview(null);
    setReminderToast('تم رفض دعوة الاقتران بحذر لأسباب أمنية.');
    setTimeout(() => setReminderToast(null), 3000);
  };

  const handleRevokePartner = (partnerId: string) => {
    if (window.confirm('هل أنت متأكد من إلغاء وتجميد هذا الشريك؟ سيتوقف أي تبادل تتبعي فوراً.')) {
      const updated = partners.map((p) => (p.partnerId === partnerId ? { ...p, state: 'revoked' as const } : p));
      setPartners(updated);
      saveTrustedPartners(updated);
    }
  };

  const handleDeletePartner = (partnerId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الشريك تماماً من قائمتك؟')) {
      const updated = partners.filter((p) => p.partnerId !== partnerId);
      setPartners(updated);
      saveTrustedPartners(updated);
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn select-none" dir="rtl">
      {/* رأس الصفحة الأمني */}
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
            <Shield size={20} />
          </div>
        </div>
        <h2 className="font-display-victorian font-bold text-xl" style={{ color: colors.primary }}>
          رفقاء الدرب (الاقتران المشفر المتبادل)
        </h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans mt-1 max-w-xs mx-auto">
          بروتوكول أمني متقدم يعتمد على مفاتيح تشفير محلية (ECDSA)، صلاحية دعوات لمدة 10 دقائق، وبدون أي تخزين على الخادم.
        </p>

        {identity && (
          <div
            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-mono"
            style={{ backgroundColor: colors.bgCardElevated, borderColor: colors.borderSubtle }}
          >
            <Lock size={13} className="text-emerald-600" />
            <span className="text-neutral-500 font-sans">معرف الجهاز الآمن:</span>
            <strong style={{ color: colors.primary }} className="truncate max-w-[120px]">{identity.deviceId}</strong>
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
            <span>إنشاء دعوة (QR ورابط)</span>
          </button>
          <button
            onClick={() => setShowScanModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 border transition-transform active:scale-95"
            style={{
              borderColor: colors.accent,
              color: colors.primary,
              backgroundColor: `${colors.accent}15`,
            }}
          >
            <QrCode size={15} />
            <span>مسح أو لصق دعوة شريك</span>
          </button>
          <button
            onClick={handleRunTests}
            className="px-3.5 py-2 rounded-xl text-xs font-bold font-sans border border-amber-600/40 text-amber-700 bg-amber-50 dark:bg-amber-950/20"
          >
            تشغيل اختبارات الأمان
          </button>
        </div>
      </div>

      {/* نتائج اختبارات الأمان */}
      {testResults && (
        <div
          className="p-4 rounded-2xl border text-xs font-sans space-y-2 animate-fadeIn"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
        >
          <div className="flex items-center justify-between font-bold" style={{ color: colors.primary }}>
            <span>نتائج اختبارات بروتوكول الاقتران المشفر:</span>
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
            قائمة الشركاء الموثقين ({partners.length})
          </h3>
          <span className="text-[11px] font-sans text-neutral-500">مفتاح عام موثق</span>
        </div>

        {partners.length === 0 ? (
          <div
            className="p-8 rounded-2xl border text-center space-y-3"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <Shield size={32} className="mx-auto text-neutral-400 opacity-60" />
            <h4 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
              لا يوجد شركاء مقترنون حالياً
            </h4>
            <p className="text-xs text-neutral-500 font-sans max-w-xs mx-auto">
              قم بإنشاء رمز دعوة أو مسح رمز شريكك عبر بروتوكول الاقتران المشفر المتبادل.
            </p>
          </div>
        ) : (
          partners.map((partner) => {
            const isAccepted = partner.state === 'accepted';
            const isRevoked = partner.state === 'revoked';

            return (
              <div
                key={partner.partnerId}
                className="rounded-2xl border p-4 transition-all shadow-xs"
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: isRevoked ? 'rgb(239 68 68 / 0.5)' : colors.borderSubtle,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-display-victorian font-bold text-lg shadow-xs"
                      style={{ backgroundColor: isRevoked ? 'rgb(156 163 175)' : colors.primary }}
                    >
                      {partner.partnerName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display-victorian font-bold text-base" style={{ color: colors.primary }}>
                          {partner.partnerName}
                        </h4>
                        {isAccepted ? (
                          <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                            ✓ مقترن وموثق
                          </span>
                        ) : (
                          <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold flex items-center gap-1">
                            ✕ مجمد / ملغي
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                        بصمة المفتاح: {partner.fingerprint.substring(0, 19)}...
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAccepted ? (
                      <button
                        onClick={() => handleRevokePartner(partner.partnerId)}
                        className="px-3 py-1.5 rounded-xl border text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                        style={{ borderColor: 'rgb(245 158 11 / 0.4)' }}
                      >
                        إلغاء الصلاحية
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeletePartner(partner.partnerId)}
                        className="px-3 py-1.5 rounded-xl border text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                        style={{ borderColor: 'rgb(239 68 68 / 0.4)' }}
                      >
                        حذف نهائي
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* مودال إنشاء دعوة (QR ورابط) */}
      {showInviteModal && activeInvite && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 animate-scaleUp text-center"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
                دعوة الاقتران المشفر (صلاحية ١٠ دقائق)
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
              قم بعرض رمز الاستجابة السريع (QR Code) للمستخدم المجاور، أو انسخ رابط الدعوة المشفر (الذي يحفظ السر حصرياً في جزء التجزئة `#`).
            </p>

            {/* تمثيل مرئي لرمز الاستجابة السريع QR */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border flex items-center justify-center shadow-inner relative" style={{ borderColor: colors.borderSubtle }}>
              <div className="w-full h-full border-4 border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center p-2 text-center bg-neutral-900 text-amber-400 font-mono text-[9px] overflow-hidden">
                <QrCode size={48} className="text-amber-400 mb-1" />
                <span>[رمز QR مشفر]</span>
                <span className="text-[7px] text-neutral-300 mt-1 truncate max-w-full">ID: {activeInvite.invitation.senderId}</span>
              </div>
            </div>

            <div
              className="p-2.5 rounded-xl border bg-neutral-50 dark:bg-neutral-900 text-[10px] font-mono break-all select-all text-neutral-700 dark:text-neutral-300 max-h-24 overflow-y-auto"
              style={{ borderColor: colors.borderSubtle }}
            >
              {window.location.origin}{window.location.pathname}{activeInvite.fragment}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCopyInviteLink}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-transform active:scale-95 text-white"
                style={{ backgroundColor: colors.primary }}
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedLink ? 'تم النسخ!' : 'نسخ رابط الدعوة'}</span>
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

      {/* مودال مسح أو معاينة دعوة الشريك */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 animate-scaleUp"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display-victorian font-bold text-lg" style={{ color: colors.primary }}>
                معاينة وقبول دعوة شريك
              </h3>
              <button
                onClick={() => {
                  setShowScanModal(false);
                  setPendingInvitationPreview(null);
                }}
                className="text-neutral-400 hover:text-neutral-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {pendingInvitationPreview ? (
              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-600/30 space-y-2">
                  <div className="font-bold text-sm" style={{ color: colors.primary }}>
                    الشريك الداعي: {pendingInvitationPreview.invitation.senderName}
                  </div>
                  <div className="text-[11px] text-neutral-600 font-mono break-all">
                    معرف الجهاز: {pendingInvitationPreview.invitation.senderId}
                  </div>
                  <div className="text-[11px] text-neutral-600 font-mono break-all">
                    بصمة المفتاح العام (Fingerprint):<br />
                    <strong className="text-amber-800">{pendingInvitationPreview.fingerprint}</strong>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleAcceptPairingRequest}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold font-sans transition-transform active:scale-95 text-white shadow-xs"
                    style={{ backgroundColor: colors.primary }}
                  >
                    قبول الاقتران وتوثيق المفتاح
                  </button>
                  <button
                    onClick={handleRejectPairingRequest}
                    className="px-4 py-2.5 rounded-xl border text-xs font-bold text-red-600"
                    style={{ borderColor: colors.borderSubtle }}
                  >
                    رفض
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProcessIncomingFragment} className="space-y-3 font-sans text-xs">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  ألصق رابط الدعوة الكامل (متضمنًا جزء التجزئة `#invite=...`) أو النص المشفر للتحقق من المفتاح العام وصلاحية الـ 10 دقائق.
                </p>
                <div>
                  <textarea
                    required
                    rows={4}
                    value={incomingFragmentInput}
                    onChange={(e) => setIncomingFragmentInput(e.target.value)}
                    placeholder="ألصق الرابط أو الرمز هنا..."
                    className="w-full p-2.5 rounded-xl border font-mono text-[10px] focus:outline-none"
                    style={{ borderColor: colors.borderSubtle, backgroundColor: colors.bgCardElevated }}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold font-sans transition-transform active:scale-95 text-white shadow-xs"
                    style={{ backgroundColor: colors.primary }}
                  >
                    التحقق من الدعوة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScanModal(false)}
                    className="px-4 py-2.5 rounded-xl border text-xs font-bold font-sans"
                    style={{ borderColor: colors.borderSubtle, color: colors.textMain }}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
