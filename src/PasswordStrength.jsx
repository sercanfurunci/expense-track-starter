import { useLang } from "./i18n.jsx";

export const PASSWORD_RULES = {
  length: (p) => p.length >= 8,
  upper:  (p) => /[A-Z]/.test(p),
  number: (p) => /[0-9]/.test(p),
};

export function validatePassword(password, t) {
  if (!PASSWORD_RULES.length(password)) return t("passwordTooShort");
  if (!PASSWORD_RULES.upper(password))  return t("passwordNeedsUpper");
  if (!PASSWORD_RULES.number(password)) return t("passwordNeedsNumber");
  return null;
}

export function PasswordStrength({ password }) {
  const { t } = useLang();
  if (!password) return null;

  const rules = [
    { key: "length", label: t("pwRuleLength"), pass: PASSWORD_RULES.length(password) },
    { key: "upper",  label: t("pwRuleUpper"),  pass: PASSWORD_RULES.upper(password)  },
    { key: "number", label: t("pwRuleNumber"), pass: PASSWORD_RULES.number(password) },
  ];

  const score = rules.filter((r) => r.pass).length;
  const strengthColor = score === 1 ? "var(--red)" : score === 2 ? "var(--gold)" : "var(--green)";
  const strengthLabel = score === 1 ? t("pwStrengthWeak") : score === 2 ? t("pwStrengthFair") : t("pwStrengthStrong");

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-full"
            style={{
              height: 3,
              backgroundColor: i <= score ? strengthColor : "var(--border)",
              transition: "background-color 0.2s",
            }}
          />
        ))}
      </div>

      {/* Rules */}
      <div className="flex flex-col gap-1">
        {rules.map((r) => (
          <div key={r.key} className="flex items-center gap-1.5">
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke={r.pass ? "var(--green)" : "var(--text-3)"}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              {r.pass
                ? <polyline points="20 6 9 17 4 12" />
                : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              }
            </svg>
            <span style={{ fontSize: "0.72rem", color: r.pass ? "var(--green)" : "var(--text-3)" }}>
              {r.label}
            </span>
            {score === 3 && r.key === "number" && (
              <span style={{ fontSize: "0.72rem", color: "var(--green)", marginLeft: 2 }}>
                · {strengthLabel}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
