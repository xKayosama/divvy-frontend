import currencies from '../currencies.json';
import currencyFlags from './currency-flags.json';

// Match Divvy Mobile's flags, including globes for shared regional currencies.
const flags: Readonly<Record<string, string>> = currencyFlags;

export const currencyOptions = currencies.map((value) => ({
  value,
  label: value,
  decorativeText: flags[value],
}));
