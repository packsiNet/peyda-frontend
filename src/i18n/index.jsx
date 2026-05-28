import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Translations ────────────────────────────────────────────────
// To add a new language: add a new key to `all` with the same structure as `en`.

const en = {
  // Tab bar
  'tab.matches':   'Home',
  'tab.exchange':  'Exchange',
  'tab.ticketing': 'Ticketing',

  // Header
  'header.sub':       'All transactions',
  'header.thisPeriod':'this period',

  // Profile modal
  'nav.profile':    'Profile',
  'nav.identity':   'Identity',
  'nav.myRequests': 'My Requests',
  'nav.history':    'History',

  // Common
  'common.cancel':    'Cancel',
  'common.close':     'Close',
  'common.confirm':   'Confirm',
  'common.amount':    'Amount',
  'common.rate':      'Rate',
  'common.methods':   'Methods',
  'common.status':    'Status',
  'common.reference': 'Reference',
  'common.send':      'Send',
  'common.receive':   'Receive',
  'common.all':       'All',
  'common.posted':    'Posted',
  'common.from':      'From',
  'common.to':        'To',
  'common.userLevel': 'User Level',

  // Status labels
  'status.0': 'Pending',
  'status.1': 'Payment Uploaded',
  'status.2': 'Confirmed',
  'status.3': 'Completed',
  'status.4': 'Disputed',

  // Request status
  'reqStatus.0': 'Pending',
  'reqStatus.1': 'Matched',
  'reqStatus.2': 'Completed',
  'reqStatus.3': 'Cancelled',
  'reqStatus.4': 'Expired',

  // KYC status
  'kyc.0': 'Not Submitted',
  'kyc.1': 'Under Review',
  'kyc.2': 'Verified',
  'kyc.3': 'Rejected',

  // Expiry
  'expiry.today':   'Today',
  'expiry.expired': 'Expired',
  'expiry.dLeft':   '{n}d left',

  // Matching page (home)
  'matching.sendSection':    '↑ My Send Requests',
  'matching.receiveSection': '↓ My Receive Requests',
  'matching.empty':          'No active matches',
  'matching.emptySub':       'Create an exchange request to get matched with another user.',
  'matching.requested':      'Requested',
  'matching.matched':        'Matched',
  'matching.dirSend':        '↑ Send',
  'matching.dirReceive':     '↓ Receive',
  'matching.detailTitle':    'Match Details',
  'matching.actionRequired': 'Action Required',
  'matching.uploadReceipt':  'Upload Receipt',
  'matching.confirmReceipt': 'Confirm Receipt',
  'matching.settle':         'Settle',
  'matching.settled':        '✓ Settled',
  'matching.disputed':       '⚠ Disputed',

  // Create Match modal
  'match.confirmTitle':    'Confirm Match',
  'match.accountTitle':    'Your Account Details',
  'match.receiverTitle':   'Receiver Info',
  'match.confirmSub':      'Do you want to match with this request?',
  'match.accountSub':      'Choose a payment method and enter your account details',
  'match.receiverSub':     "Enter the Iranian receiver's account details",
  'match.paymentMethod':   'Payment Method',
  'match.firstName':       'First Name',
  'match.lastName':        'Last Name',
  'match.nationalId':      'National ID',
  'match.nationalIdHint':  '10 digits',
  'match.nationalIdError': 'Must be exactly 10 digits',
  'match.mobile':          'Mobile Number',
  'match.iban':            'IBAN',
  'match.ibanHint':        'IR + 24 digits',
  'match.ibanError':       'IBAN must start with IR and be 26 characters',
  'match.confirmBtn':      'Confirm',
  'match.matchBtn':        'Confirm & Match',
  'match.creating':        'Creating…',

  // Confirm match sheet
  'confirmSheet.title':  'Confirm Match',
  'confirmSheet.youSend':'You send to {name}',
  'confirmSheet.youRecv':'You receive from {name}',
  'confirmSheet.via':    'via {method}',
  'confirmSheet.level':  'Lv {n}',
  'confirmSheet.btn':    'Create Match',
  'confirmSheet.busy':   'Creating…',

  // Browse detail modal
  'browse.title':   'Request Details',
  'browse.matchBtn':'Match with this request',

  // Detail sheet
  'detail.received':     'Received',
  'detail.sent':         'Sent',
  'detail.createMatch':  'Create Match',

  // Direct match modal
  'direct.title':     'Create Match',
  'direct.sub':       'Select a matching request to pair with your {type} request',
  'direct.noResults': 'No matching requests found at this time.',
  'direct.btn':       'Create Match',
  'direct.busy':      'Creating…',

  // My Requests page
  'myReq.empty':      'No requests yet',
  'myReq.emptySub':   'Your submitted requests will appear here.',
  'myReq.cancelBtn':  'Cancel Request',
  'myReq.cancelling': 'Cancelling…',

  // Exchange modal
  'exchange.title':       'Exchange Request',
  'exchange.sub':         'Submit a send or receive money request',
  'exchange.currency':    'Currency',
  'exchange.amount':      'Amount',
  'exchange.method':      'Method',
  'exchange.methodHint':  'Multiple allowed',
  'exchange.methodReq':   'Select at least one payment method',
  'exchange.bonbastPrice':'Bonbast Price',
  'exchange.urgentPrice': 'Urgent Price',
  'exchange.custom':      'Custom',
  'exchange.customRate':  'Custom Rate',
  'exchange.customBack':  '← Presets',
  'exchange.preview':     'Preview',
  'exchange.commission':  'Commission',
  'exchange.total':       'Total',
  'exchange.next':        'Next',
  'exchange.back':        'Back',
  'exchange.submit':      'Submit Request',
  'exchange.submitting':  'Submitting…',
  'exchange.receiver':    'Iranian Receiver',
  'exchange.newReceiver': 'New Receiver',
  'exchange.addReceiver': '+ Add New Receiver',
  'exchange.cancelNew':   '← Back to list',
  'exchange.noReceivers': 'No receivers found.',
  'exchange.foreignAccs': 'Your Foreign Accounts',
  'exchange.receiverName':'Name',
  'exchange.nationalId':  'National ID',
  'exchange.mobile':      'Mobile',
  'exchange.ibanLabel':   'IBAN',

  // Identity / KYC page
  'kyc.title':           'Identity Verification',
  'kyc.firstName':       'First Name',
  'kyc.lastName':        'Last Name',
  'kyc.birthDay':        'Date of Birth',
  'kyc.phone':           'Phone Number',
  'kyc.sendCode':        'Send Code',
  'kyc.verifyCode':      'Verify Code',
  'kyc.selfie':          'Selfie',
  'kyc.document':        'ID Document',
  'kyc.takePhoto':       'Take Photo',
  'kyc.retake':          'Retake',
  'kyc.submit':          'Submit',
  'kyc.submitting':      'Submitting…',
  'kyc.status':          'KYC Status',

  // Profile page
  'profile.name':        'Name',
  'profile.phone':       'Phone',
  'profile.kycStatus':   'KYC Status',
  'profile.verified':    'Verified',
  'profile.notVerified': 'Not Verified',

  // Empty states
  'empty.noTransactions': 'No {type} transactions yet',
  'empty.txSub':          'Your completed transactions will appear here.',

  // Transaction tile type labels
  'tx.received': 'Received',
  'tx.sent':     'Sent',

  // Sorting
  'sort.label':   'Sort',
  'sort.highest': 'Highest',
  'sort.lowest':  'Lowest',

  // Match quality badges
  'match.quality.exact': 'Exact',
  'match.quality.great': 'Great',
  'match.quality.good':  'Good',
  'match.quality.fair':  'Fair',

  // Exchange modal – additional keys
  'exchange.proposedAmount':    'Proposed Amount',
  'exchange.rial':              'Rial',
  'exchange.step1Btn':          'Receiver Information',
  'exchange.step1Loading':      'Loading…',
  'exchange.step2TitleReceive': 'Your Account Details',
  'exchange.step2TitleSend':    'Receiver Information',
  'exchange.step2SubReceive':   'Enter your foreign account details for each payment method',
  'exchange.step2SubSend':      "Enter the recipient's details to complete the request",
  'exchange.savedReceivers':    'Saved Receivers',
  'exchange.commissionFmt':     '{pct}% commission',
  'exchange.optional':          'optional',

  // Profile page content
  'profile.personalInfo':     'Personal Info',
  'profile.contact':          'Contact',
  'profile.mobileLabel':      'Mobile Number',
  'profile.verifiedTg':       'Verified via Telegram',
  'profile.notVerifiedPhone': 'Not verified',
  'profile.kycVerif':         'Verification',
  'profile.photoVerif':       'Photo Verification',
  'profile.selfiePhoto':      'Selfie Photo',
  'profile.idDocument':       'Identity Document',
  'profile.photoUploaded':    'Uploaded',
  'profile.photoNotUploaded': 'Not uploaded yet',
  'profile.notProvided':      'Not provided',

  // KYC form – additional
  'kyc.personalInfo':      'Personal Info',
  'kyc.photoVerification': 'Photo Verification',
  'kyc.mobileNumber':      'Mobile Number',
  'kyc.birthday':          'Birthday',
  'kyc.verifyTelegram':    'Verify via Telegram',
  'kyc.verifying':         'Verifying…',
  'kyc.documentPhoto':     'Document Photo',
  'kyc.selfiePhoto':       'Selfie Photo',
  'kyc.tapCamera':         'Tap to open camera',
  'kyc.submitBtn':         'Submit Verification',
  'kyc.submittingTitle':   'Submitting Verification',
  'kyc.submittingSub':     'Please wait while we process your documents…',

  // KYC status banner messages
  'kyc.banner.1.title': 'Under Review',
  'kyc.banner.1.msg':   'Your identity verification is under review. Please wait while we process your documents.',
  'kyc.banner.2.title': 'Approved',
  'kyc.banner.2.msg':   'Your identity has been successfully verified and approved.',
  'kyc.banner.3.title': 'Rejected',
  'kyc.banner.3.msg':   'Your identity verification was rejected. Please resubmit with correct information and valid documents.',
};

const fa = {
  // Tab bar
  'tab.matches':   'خانه',
  'tab.exchange':  'صرافی',
  'tab.ticketing': 'تیکتینگ',

  // Header
  'header.sub':       'همه تراکنش‌ها',
  'header.thisPeriod':'این دوره',

  // Profile modal
  'nav.profile':    'پروفایل',
  'nav.identity':   'احراز هویت',
  'nav.myRequests': 'درخواست‌های من',
  'nav.history':    'تاریخچه',

  // Common
  'common.cancel':    'لغو',
  'common.close':     'بستن',
  'common.confirm':   'تأیید',
  'common.amount':    'مبلغ',
  'common.rate':      'نرخ',
  'common.methods':   'روش‌ها',
  'common.status':    'وضعیت',
  'common.reference': 'مرجع',
  'common.send':      'ارسال',
  'common.receive':   'دریافت',
  'common.all':       'همه',
  'common.posted':    'ثبت شده',
  'common.from':      'از',
  'common.to':        'به',
  'common.userLevel': 'سطح کاربر',

  // Status labels
  'status.0': 'در انتظار',
  'status.1': 'رسید آپلود شد',
  'status.2': 'تأیید شده',
  'status.3': 'تکمیل شده',
  'status.4': 'در اختلاف',

  // Request status
  'reqStatus.0': 'در انتظار',
  'reqStatus.1': 'مچ شده',
  'reqStatus.2': 'تکمیل شده',
  'reqStatus.3': 'لغو شده',
  'reqStatus.4': 'منقضی شده',

  // KYC status
  'kyc.0': 'ثبت نشده',
  'kyc.1': 'در حال بررسی',
  'kyc.2': 'تأیید شده',
  'kyc.3': 'رد شده',

  // Expiry
  'expiry.today':   'امروز',
  'expiry.expired': 'منقضی',
  'expiry.dLeft':   '{n} روز مانده',

  // Matching page (home)
  'matching.sendSection':    '↑ درخواست‌های ارسالی من',
  'matching.receiveSection': '↓ درخواست‌های دریافتی من',
  'matching.empty':          'هیچ مچ فعالی وجود ندارد',
  'matching.emptySub':       'یک درخواست صرافی ایجاد کنید تا با کاربر دیگری تطبیق پیدا کنید.',
  'matching.requested':      'تاریخ درخواست',
  'matching.matched':        'تاریخ مچ',
  'matching.dirSend':        '↑ ارسال',
  'matching.dirReceive':     '↓ دریافت',
  'matching.detailTitle':    'جزئیات مچ',
  'matching.actionRequired': 'نیاز به اقدام',
  'matching.uploadReceipt':  'آپلود رسید',
  'matching.confirmReceipt': 'تأیید دریافت',
  'matching.settle':         'تسویه',
  'matching.settled':        '✓ تسویه شد',
  'matching.disputed':       '⚠ در اختلاف',

  // Create Match modal
  'match.confirmTitle':    'تأیید مچ',
  'match.accountTitle':    'اطلاعات حساب شما',
  'match.receiverTitle':   'اطلاعات گیرنده',
  'match.confirmSub':      'آیا می‌خواهید با این درخواست مچ شوید؟',
  'match.accountSub':      'روش پرداخت را انتخاب کرده و اطلاعات حساب خود را وارد کنید',
  'match.receiverSub':     'اطلاعات حساب ایرانی گیرنده را وارد کنید',
  'match.paymentMethod':   'روش پرداخت',
  'match.firstName':       'نام',
  'match.lastName':        'نام خانوادگی',
  'match.nationalId':      'کد ملی',
  'match.nationalIdHint':  '۱۰ رقم',
  'match.nationalIdError': 'باید دقیقاً ۱۰ رقم باشد',
  'match.mobile':          'شماره موبایل',
  'match.iban':            'شبا',
  'match.ibanHint':        'IR + ۲۴ رقم',
  'match.ibanError':       'شبا باید با IR شروع شود و ۲۶ کاراکتر باشد',
  'match.confirmBtn':      'تأیید',
  'match.matchBtn':        'تأیید و مچ',
  'match.creating':        'در حال ایجاد…',

  // Confirm match sheet
  'confirmSheet.title':  'تأیید مچ',
  'confirmSheet.youSend':'ارسال به {name}',
  'confirmSheet.youRecv':'دریافت از {name}',
  'confirmSheet.via':    'از طریق {method}',
  'confirmSheet.level':  'سطح {n}',
  'confirmSheet.btn':    'ایجاد مچ',
  'confirmSheet.busy':   'در حال ایجاد…',

  // Browse detail modal
  'browse.title':   'جزئیات درخواست',
  'browse.matchBtn':'مچ با این درخواست',

  // Detail sheet
  'detail.received':     'دریافتی',
  'detail.sent':         'ارسالی',
  'detail.createMatch':  'ایجاد مچ',

  // Direct match modal
  'direct.title':     'ایجاد مچ',
  'direct.sub':       'یک درخواست برای تطبیق با درخواست {type} خود انتخاب کنید',
  'direct.noResults': 'درخواست مطابقی یافت نشد.',
  'direct.btn':       'ایجاد مچ',
  'direct.busy':      'در حال ایجاد…',

  // My Requests page
  'myReq.empty':      'هنوز درخواستی ثبت نشده',
  'myReq.emptySub':   'درخواست‌های ثبت‌شده شما اینجا نمایش داده می‌شوند.',
  'myReq.cancelBtn':  'لغو درخواست',
  'myReq.cancelling': 'در حال لغو…',

  // Exchange modal
  'exchange.title':       'درخواست صرافی',
  'exchange.sub':         'درخواست ارسال یا دریافت پول ثبت کنید',
  'exchange.currency':    'ارز',
  'exchange.amount':      'مبلغ',
  'exchange.method':      'روش',
  'exchange.methodHint':  'چند انتخاب مجاز',
  'exchange.methodReq':   'حداقل یک روش پرداخت انتخاب کنید',
  'exchange.bonbastPrice':'قیمت بنبست',
  'exchange.urgentPrice': 'قیمت فوری',
  'exchange.custom':      'سفارشی',
  'exchange.customRate':  'نرخ سفارشی',
  'exchange.customBack':  '← بازگشت',
  'exchange.preview':     'پیش‌نمایش',
  'exchange.commission':  'کمیسیون',
  'exchange.total':       'جمع کل',
  'exchange.next':        'بعدی',
  'exchange.back':        'قبلی',
  'exchange.submit':      'ثبت درخواست',
  'exchange.submitting':  'در حال ثبت…',
  'exchange.receiver':    'گیرنده ایرانی',
  'exchange.newReceiver': 'گیرنده جدید',
  'exchange.addReceiver': '+ افزودن گیرنده جدید',
  'exchange.cancelNew':   '← بازگشت به لیست',
  'exchange.noReceivers': 'گیرنده‌ای یافت نشد.',
  'exchange.foreignAccs': 'حساب‌های خارجی شما',
  'exchange.receiverName':'نام',
  'exchange.nationalId':  'کد ملی',
  'exchange.mobile':      'موبایل',
  'exchange.ibanLabel':   'شبا',

  // Identity / KYC page
  'kyc.title':           'احراز هویت',
  'kyc.firstName':       'نام',
  'kyc.lastName':        'نام خانوادگی',
  'kyc.birthDay':        'تاریخ تولد',
  'kyc.phone':           'شماره تلفن',
  'kyc.sendCode':        'ارسال کد',
  'kyc.verifyCode':      'تأیید کد',
  'kyc.selfie':          'سلفی',
  'kyc.document':        'مدرک هویتی',
  'kyc.takePhoto':       'عکس بگیر',
  'kyc.retake':          'تکرار',
  'kyc.submit':          'ثبت',
  'kyc.submitting':      'در حال ارسال…',
  'kyc.status':          'وضعیت احراز هویت',

  // Profile page
  'profile.name':        'نام',
  'profile.phone':       'تلفن',
  'profile.kycStatus':   'وضعیت احراز هویت',
  'profile.verified':    'تأیید شده',
  'profile.notVerified': 'تأیید نشده',

  // Empty states
  'empty.noTransactions': 'هنوز تراکنش {type} وجود ندارد',
  'empty.txSub':          'تراکنش‌های تکمیل‌شده شما اینجا نمایش داده می‌شوند.',

  // Transaction tile type labels
  'tx.received': 'دریافتی',
  'tx.sent':     'ارسالی',

  // Sorting
  'sort.label':   'مرتب‌سازی',
  'sort.highest': 'بیشترین',
  'sort.lowest':  'کمترین',

  // Match quality badges
  'match.quality.exact': 'دقیق',
  'match.quality.great': 'عالی',
  'match.quality.good':  'خوب',
  'match.quality.fair':  'متوسط',

  // Exchange modal – additional keys
  'exchange.proposedAmount':    'مبلغ پیشنهادی',
  'exchange.rial':              'ریال',
  'exchange.step1Btn':          'اطلاعات گیرنده',
  'exchange.step1Loading':      'در حال بارگذاری…',
  'exchange.step2TitleReceive': 'اطلاعات حساب شما',
  'exchange.step2TitleSend':    'اطلاعات گیرنده',
  'exchange.step2SubReceive':   'اطلاعات حساب خارجی خود را برای هر روش پرداخت وارد کنید',
  'exchange.step2SubSend':      'اطلاعات گیرنده را برای تکمیل درخواست وارد کنید',
  'exchange.savedReceivers':    'گیرندگان ذخیره‌شده',
  'exchange.commissionFmt':     '{pct}% کمیسیون',
  'exchange.optional':          'اختیاری',

  // Profile page content
  'profile.personalInfo':     'اطلاعات شخصی',
  'profile.contact':          'اطلاعات تماس',
  'profile.mobileLabel':      'شماره موبایل',
  'profile.verifiedTg':       'تأیید از طریق تلگرام',
  'profile.notVerifiedPhone': 'تأیید نشده',
  'profile.kycVerif':         'تأیید هویت',
  'profile.photoVerif':       'تأیید تصویری',
  'profile.selfiePhoto':      'عکس سلفی',
  'profile.idDocument':       'مدرک هویتی',
  'profile.photoUploaded':    'آپلود شده',
  'profile.photoNotUploaded': 'هنوز آپلود نشده',
  'profile.notProvided':      'ارائه نشده',

  // KYC form – additional
  'kyc.personalInfo':      'اطلاعات شخصی',
  'kyc.photoVerification': 'تأیید تصویری',
  'kyc.mobileNumber':      'شماره موبایل',
  'kyc.birthday':          'تاریخ تولد',
  'kyc.verifyTelegram':    'تأیید از طریق تلگرام',
  'kyc.verifying':         'در حال تأیید…',
  'kyc.documentPhoto':     'عکس مدرک',
  'kyc.selfiePhoto':       'عکس سلفی',
  'kyc.tapCamera':         'برای باز کردن دوربین ضربه بزنید',
  'kyc.submitBtn':         'ارسال تأیید هویت',
  'kyc.submittingTitle':   'در حال ارسال تأیید هویت',
  'kyc.submittingSub':     'لطفاً صبر کنید در حالی که مدارک شما پردازش می‌شود…',

  // KYC status banner messages
  'kyc.banner.1.title': 'در حال بررسی',
  'kyc.banner.1.msg':   'تأیید هویت شما در دست بررسی است. لطفاً صبر کنید تا مدارک شما پردازش شود.',
  'kyc.banner.2.title': 'تأیید شده',
  'kyc.banner.2.msg':   'هویت شما با موفقیت تأیید و پذیرفته شده است.',
  'kyc.banner.3.title': 'رد شده',
  'kyc.banner.3.msg':   'تأیید هویت شما رد شده است. لطفاً با اطلاعات صحیح و مدارک معتبر دوباره ارسال کنید.',
};

// ── Language registry (add new languages here) ──────────────────
export const LANGUAGES = {
  fa: { label: 'فا', dir: 'rtl', name: 'فارسی' },
  en: { label: 'EN', dir: 'ltr', name: 'English' },
};

const all = { en, fa };

// ── Pure translation function ────────────────────────────────────
export function t(lang, key, params = {}) {
  let str = all[lang]?.[key] ?? all.en?.[key] ?? key;
  Object.entries(params).forEach(([k, v]) => {
    str = str.replace(`{${k}}`, String(v));
  });
  return str;
}

// ── Context & hook ───────────────────────────────────────────────
const LANG_KEY = 'payda_lang';

const LangContext = createContext({ lang: 'fa', toggleLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem(LANG_KEY) || 'fa'
  );

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    const info = LANGUAGES[lang] ?? LANGUAGES.fa;
    document.documentElement.setAttribute('dir',  info.dir);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const toggleLang = useCallback(() => {
    const keys = Object.keys(LANGUAGES);
    setLang(l => {
      const next = keys[(keys.indexOf(l) + 1) % keys.length];
      return next;
    });
  }, []);

  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

// useT() → returns t(key, params?) bound to current lang
export function useT() {
  const { lang } = useLang();
  return useCallback(
    (key, params) => t(lang, key, params),
    [lang]
  );
}
