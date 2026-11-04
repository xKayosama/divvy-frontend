import {
  Baby,
  Banknote,
  CreditCard,
  Droplet,
  Flame,
  GraduationCap,
  House,
  Landmark,
  Repeat2,
  ShieldCheck,
  Smartphone,
  Tag,
  Users,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BillCategory } from '../types';

export const billCategoryIcons = {
  RENT: House,
  ELECTRICITY: Zap,
  WATER: Droplet,
  INTERNET: Wifi,
  PHONE: Smartphone,
  SUBSCRIPTION: Repeat2,
  INSURANCE: ShieldCheck,
  GAS: Flame,
  ASSOCIATION_DUES: Users,
  EDUCATION: GraduationCap,
  CHILDCARE: Baby,
  LOAN: Banknote,
  CREDIT_CARD: CreditCard,
  PROPERTY_TAX: Landmark,
  MAINTENANCE: Wrench,
  OTHER: Tag,
} satisfies Record<BillCategory, LucideIcon>;
