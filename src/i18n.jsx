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
