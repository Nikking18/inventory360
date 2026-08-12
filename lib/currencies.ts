export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', flag: '🇬🇧' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', flag: '🇮🇳' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', flag: '🇯🇵' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', flag: '🇦🇺' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)', flag: '🇸🇬' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)', flag: '🇦🇪' },
  { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal (SAR)', flag: '🇸🇦' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (BRL)', flag: '🇧🇷' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan (CNY)', flag: '🇨🇳' },
];
