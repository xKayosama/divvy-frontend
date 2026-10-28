import {
  ArrowLeftRight,
  FileText,
  LayoutDashboard,
  Receipt,
  Scale,
  Users,
} from 'lucide-react';

export const navigation = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Expenses',
    path: '/expenses',
    icon: Receipt,
  },
  {
    label: 'Bills',
    path: '/bills',
    icon: FileText,
  },
  {
    label: 'Members',
    path: '/members',
    icon: Users,
  },
  {
    label: 'Balances',
    path: '/balances',
    icon: Scale,
  },
  {
    label: 'Settlements',
    path: '/settlements',
    icon: ArrowLeftRight,
  },
];
