import { createContext, useContext, useState } from "react";

const translations = {
  en: {
    appName: "Finance Tracker",
    appSubtitle: "Keep tabs on your income and expenses",
    signOut: "Sign out",
    dateLocale: "en-US",

    // Auth
    signInTitle: "Sign in to your account",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    confirmPassword: "Confirm Password",
    passwordPlaceholder: "Min. 6 characters",
    signingIn: "Signing in…",
    signInBtn: "Sign in",
    noAccount: "Don't have an account?",
    registerLink: "Register",
    createAccountTitle: "Create an account",
    creatingAccount: "Creating account…",
    createAccountBtn: "Create account",
    alreadyHaveAccount: "Already have an account?",
    signInLink: "Sign in",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    serverError: "Could not connect to server",
    checkYourEmail: "Check your email",
    verificationSent: "We sent a verification link to",
    backToSignIn: "Back to sign in",

    // SMS verification
    verifyMethodLabel: "Verification method",
    verifyMethodEmail: "Email",
    verifyMethodSms: "SMS",
    phoneNumber: "Phone Number",
    phonePlaceholder: "+1 234 567 8900",
    sendCode: "Send Code",
    sendingCode: "Sending…",
    otpCode: "Verification Code",
    otpPlaceholder: "6-digit code",
    verifyAndCreate: "Verify & Create Account",
    verifyingCode: "Verifying…",
    checkYourPhone: "Check your phone",
    smsSent: "We sent a 6-digit code to",
    invalidOtp: "Invalid code. Please try again.",
    phoneAlreadyRegistered: "Phone number already registered",
    accountCreated: "Account created! You can now sign in.",
    phoneLabel: "Phone",
    loginWithPhone: "Sign in with phone",

    // Linked accounts
    linkedAccounts: "Linked Accounts",
    linkedEmail: "Email",
    linkedPhone: "Phone",
    notLinked: "Not linked",
    linkBtn: "Link",
    unlinkBtn: "Unlink",
    linkPhone: "Link Phone Number",
    linkEmail: "Link Email Address",
    linkPhoneSuccess: "Phone number linked successfully!",
    linkEmailSent: "Verification email sent. Click the link to confirm.",
    linkEmailSuccess: "Email linked successfully!",
    alreadyLinked: "Already linked to another account",
    backToLanding: "Back to home",
    forgotPassword: "Forgot password?",
    forgotPasswordTitle: "Reset your password",
    forgotPasswordDesc: "Enter your email and we'll send you a reset link.",
    sendResetLink: "Send reset link",
    sendingResetLink: "Sending…",
    resetEmailSent: "Reset link sent! Check your inbox.",
    resetPasswordTitle: "Choose a new password",
    newPassword: "New Password",
    resetPassword: "Reset Password",
    resettingPassword: "Resetting…",
    passwordSameAsOld: "Your new password cannot be the same as your old password",
    resetSuccess: "Password updated! You can now sign in.",

    // Summary
    income: "Income",
    expenses: "Expenses",
    balance: "Balance",

    // Form
    addTransaction: "Add Transaction",
    description: "Description",
    descriptionPlaceholder: "Description",
    amount: "Amount",
    amountPlaceholder: "Amount",
    incomeOption: "Income",
    expenseOption: "Expense",
    addBtn: "Add",

    // List
    transactions: "Transactions",
    allTypes: "All Types",
    allCategories: "All Categories",
    date: "Date",
    category: "Category",
    noTransactions: "No transactions found",
    plusIncome: "+ Income",
    minusExpense: "− Expense",

    // Delete modal
    deleteTransaction: "Delete Transaction",
    deleteConfirmLine1: "Are you sure you want to delete",
    cancelBtn: "Cancel",
    deleteBtn: "Delete",

    // Categories
    food: "Food",
    housing: "Housing",
    utilities: "Utilities",
    transport: "Transport",
    entertainment: "Entertainment",
    salary: "Salary",
    other: "Other",

    // Dashboard
    expenseBreakdown: "Expense Breakdown",
    recentActivity: "Recent Activity",
    noTransactionsDash: "Add your first transaction to see insights",

    // Analytics
    noTransactionsAnalytics: "Add transactions to see analytics",
    avgExpense: "Avg Expense",
    busiestDay: "Busiest Day",
    biggestExpense: "Biggest Expense",
    last30Days: "Last 30 Days",
    byCategory: "By Category",

    // Profile modal
    profileTitle: "Profile",
    displayName: "Display Name",
    displayNamePlaceholder: "Your name",
    currencyLabel: "Currency",
    saveBtn: "Save",
    savingBtn: "Saving…",

    // Landing
    landingTagline: "Personal Finance · Reimagined",
    landingHeadline1: "Your money,",
    landingHeadline2: "clearly.",
    landingSubtitle: "Track income, visualize expenses, and understand your financial health — beautifully.",
    landingGetStarted: "Get started — it's free",
    landingSignIn: "Sign in",
    landingFeaturesLabel: "What you get",
    landingFeaturesTitle: "Everything you need,",
    landingFeaturesTitle2: "nothing you don't.",
    landingFeature1Title: "Track Every Transaction",
    landingFeature1Desc: "Log income and expenses in seconds. Organize by category and see exactly where your money flows.",
    landingFeature2Title: "Visualize with Analytics",
    landingFeature2Desc: "30-day bar charts, category breakdowns, and key stats deliver the full picture at a glance.",
    landingFeature3Title: "Multi-Currency Support",
    landingFeature3Desc: "Work in USD, EUR, GBP, ₺, ¥ and more. Your currency preference syncs across every screen.",
    landingCtaLabel: "Start today",
    landingCtaTitle: "Take control of your finances.",
    landingCtaBtn: "Create a free account",
    landingCtaSub: "No credit card required · Free forever",
    landingBuiltWith: "Built with care.",
    landingNetBalance: "Net Balance",
    landingMonthlySalary: "Monthly salary",
    landingGrocery: "Grocery run",
    landingElectricity: "Electricity bill",
  },

  tr: {
    appName: "Finans Takip",
    appSubtitle: "Gelir ve giderlerinizi takip edin",
    signOut: "Çıkış yap",
    dateLocale: "tr-TR",

    // Auth
    signInTitle: "Hesabınıza giriş yapın",
    email: "E-posta",
    emailPlaceholder: "siz@ornek.com",
    password: "Şifre",
    confirmPassword: "Şifreyi Onayla",
    passwordPlaceholder: "En az 6 karakter",
    signingIn: "Giriş yapılıyor…",
    signInBtn: "Giriş yap",
    noAccount: "Hesabınız yok mu?",
    registerLink: "Kayıt ol",
    createAccountTitle: "Hesap oluştur",
    creatingAccount: "Hesap oluşturuluyor…",
    createAccountBtn: "Hesap oluştur",
    alreadyHaveAccount: "Zaten hesabınız var mı?",
    signInLink: "Giriş yap",
    passwordMismatch: "Şifreler eşleşmiyor",
    passwordTooShort: "Şifre en az 6 karakter olmalı",
    serverError: "Sunucuya bağlanılamadı",
    checkYourEmail: "E-postanızı kontrol edin",
    verificationSent: "Doğrulama bağlantısı gönderildi:",
    backToSignIn: "Girişe dön",

    // SMS verification
    verifyMethodLabel: "Doğrulama yöntemi",
    verifyMethodEmail: "E-posta",
    verifyMethodSms: "SMS",
    phoneNumber: "Telefon Numarası",
    phonePlaceholder: "+90 555 123 4567",
    sendCode: "Kod Gönder",
    sendingCode: "Gönderiliyor…",
    otpCode: "Doğrulama Kodu",
    otpPlaceholder: "6 haneli kod",
    verifyAndCreate: "Doğrula ve Hesap Oluştur",
    verifyingCode: "Doğrulanıyor…",
    checkYourPhone: "Telefonunuzu kontrol edin",
    smsSent: "6 haneli kod gönderildi:",
    invalidOtp: "Geçersiz kod. Lütfen tekrar deneyin.",
    phoneAlreadyRegistered: "Bu telefon numarası zaten kayıtlı",
    accountCreated: "Hesap oluşturuldu! Şimdi giriş yapabilirsiniz.",
    phoneLabel: "Telefon",
    loginWithPhone: "Telefonla giriş yap",

    // Linked accounts
    linkedAccounts: "Bağlı Hesaplar",
    linkedEmail: "E-posta",
    linkedPhone: "Telefon",
    notLinked: "Bağlı değil",
    linkBtn: "Bağla",
    unlinkBtn: "Kaldır",
    linkPhone: "Telefon Numarası Bağla",
    linkEmail: "E-posta Adresi Bağla",
    linkPhoneSuccess: "Telefon numarası başarıyla bağlandı!",
    linkEmailSent: "Doğrulama e-postası gönderildi. Bağlantıya tıklayın.",
    linkEmailSuccess: "E-posta başarıyla bağlandı!",
    alreadyLinked: "Başka bir hesaba zaten bağlı",
    backToLanding: "Ana sayfaya dön",
    forgotPassword: "Şifremi unuttum?",
    forgotPasswordTitle: "Şifrenizi sıfırlayın",
    forgotPasswordDesc: "E-postanızı girin, size sıfırlama bağlantısı gönderelim.",
    sendResetLink: "Sıfırlama bağlantısı gönder",
    sendingResetLink: "Gönderiliyor…",
    resetEmailSent: "Sıfırlama bağlantısı gönderildi! Gelen kutunuzu kontrol edin.",
    resetPasswordTitle: "Yeni şifrenizi belirleyin",
    newPassword: "Yeni Şifre",
    resetPassword: "Şifreyi Sıfırla",
    resettingPassword: "Sıfırlanıyor…",
    passwordSameAsOld: "Yeni şifreniz eski şifrenizle aynı olamaz",
    resetSuccess: "Şifre güncellendi! Artık giriş yapabilirsiniz.",

    // Summary
    income: "Gelir",
    expenses: "Giderler",
    balance: "Bakiye",

    // Form
    addTransaction: "İşlem Ekle",
    description: "Açıklama",
    descriptionPlaceholder: "Açıklama",
    amount: "Tutar",
    amountPlaceholder: "Tutar",
    incomeOption: "Gelir",
    expenseOption: "Gider",
    addBtn: "Ekle",

    // List
    transactions: "İşlemler",
    allTypes: "Tüm Türler",
    allCategories: "Tüm Kategoriler",
    date: "Tarih",
    category: "Kategori",
    noTransactions: "İşlem bulunamadı",
    plusIncome: "+ Gelir",
    minusExpense: "− Gider",

    // Delete modal
    deleteTransaction: "İşlemi Sil",
    deleteConfirmLine1: "Silmek istediğinizden emin misiniz?",
    cancelBtn: "İptal",
    deleteBtn: "Sil",

    // Categories
    food: "Yemek",
    housing: "Konut",
    utilities: "Faturalar",
    transport: "Ulaşım",
    entertainment: "Eğlence",
    salary: "Maaş",
    other: "Diğer",

    // Dashboard
    expenseBreakdown: "Gider Dağılımı",
    recentActivity: "Son Hareketler",
    noTransactionsDash: "Analiz görmek için ilk işleminizi ekleyin",

    // Analytics
    noTransactionsAnalytics: "Analiz görmek için işlem ekleyin",
    avgExpense: "Ort. Gider",
    busiestDay: "En Yoğun Gün",
    biggestExpense: "En Büyük Gider",
    last30Days: "Son 30 Gün",
    byCategory: "Kategoriye Göre",

    // Profile modal
    profileTitle: "Profil",
    displayName: "Görünen Ad",
    displayNamePlaceholder: "Adınız",
    currencyLabel: "Para Birimi",
    saveBtn: "Kaydet",
    savingBtn: "Kaydediliyor…",

    // Landing
    landingTagline: "Kişisel Finans · Yeniden Tasarlandı",
    landingHeadline1: "Paranız,",
    landingHeadline2: "net olarak.",
    landingSubtitle: "Gelirinizi takip edin, giderlerinizi görselleştirin ve finansal sağlığınızı anlayın — güzel bir şekilde.",
    landingGetStarted: "Başlayın — ücretsiz",
    landingSignIn: "Giriş yap",
    landingFeaturesLabel: "Neler sunuyoruz",
    landingFeaturesTitle: "İhtiyacınız olan her şey,",
    landingFeaturesTitle2: "fazlası yok.",
    landingFeature1Title: "Her İşlemi Takip Edin",
    landingFeature1Desc: "Gelirinizi ve giderlerinizi saniyeler içinde kaydedin. Kategorilere göre düzenleyin ve paranızın nereye gittiğini görün.",
    landingFeature2Title: "Analitiklerle Görselleştirin",
    landingFeature2Desc: "30 günlük çubuk grafikler, kategori dökümü ve temel istatistikler finansal tablonuzu net şekilde ortaya koyar.",
    landingFeature3Title: "Çoklu Para Birimi Desteği",
    landingFeature3Desc: "USD, EUR, GBP, ₺, ¥ ve daha fazlasıyla çalışın. Para birimi tercihiniz her ekranda senkronize olur.",
    landingCtaLabel: "Bugün başlayın",
    landingCtaTitle: "Finanslarınızın kontrolünü elinize alın.",
    landingCtaBtn: "Ücretsiz hesap oluştur",
    landingCtaSub: "Kredi kartı gerekmez · Sonsuza kadar ücretsiz",
    landingBuiltWith: "Özenle yapıldı.",
    landingNetBalance: "Net Bakiye",
    landingMonthlySalary: "Aylık maaş",
    landingGrocery: "Market alışverişi",
    landingElectricity: "Elektrik faturası",
  },
};

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  const t = (key) => translations[lang][key] ?? key;

  const toggleLang = () => {
    const next = lang === "en" ? "tr" : "en";
    localStorage.setItem("lang", next);
    setLang(next);
  };

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
