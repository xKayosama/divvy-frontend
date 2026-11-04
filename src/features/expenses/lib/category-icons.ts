import {
  Car, CircleParking, Coffee, Dumbbell, Fuel, Gamepad2, Gift,
  GraduationCap, HeartPulse, Hotel, House, PawPrint, Plane, Plug,
  Repeat2, Scissors, ShoppingBag, ShoppingBasket, Tag, Utensils, Wifi, Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ExpenseCategory } from '../types';

export const expenseCategoryIcons = {
  FOOD: Utensils,
  RENT: House,
  UTILITIES: Plug,
  INTERNET: Wifi,
  TRANSPORTATION: Car,
  GROCERIES: ShoppingBasket,
  HEALTHCARE: HeartPulse,
  ENTERTAINMENT: Gamepad2,
  SHOPPING: ShoppingBag,
  COFFEE: Coffee,
  TRAVEL: Plane,
  ACCOMMODATION: Hotel,
  FUEL: Fuel,
  PARKING: CircleParking,
  EDUCATION: GraduationCap,
  PETS: PawPrint,
  GIFTS: Gift,
  HOME_MAINTENANCE: Wrench,
  PERSONAL_CARE: Scissors,
  FITNESS: Dumbbell,
  SUBSCRIPTIONS: Repeat2,
  OTHERS: Tag,
} satisfies Record<ExpenseCategory, LucideIcon>;
