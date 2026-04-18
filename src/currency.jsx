import { createContext, useContext } from "react";

export const CURRENCIES = [
  { code: "USD", symbol: "$",  name: "US Dollar" },
  { code: "EUR", symbol: "€",  name: "Euro" },
  { code: "GBP", symbol: "£",  name: "British Pound" },
  { code: "TRY", symbol: "₺",  name: "Turkish Lira" },
  { code: "JPY", symbol: "¥",  name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
];

const CurrencyContext = createContext({ code: "USD", symbol: "$" });

export function CurrencyProvider({ code, children }) {
  const found = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
  return (
    <CurrencyContext.Provider value={found}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
