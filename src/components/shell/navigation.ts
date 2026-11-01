import {
  ArrowLeftRight,
  Bell,
  FileText,
  LayoutDashboard,
  Mail,
  Receipt,
  Scale,
  Settings,
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
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Invitations', path: '/invitations', icon: Mail },
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
  { label: 'Group settings', path: '/group-settings', icon: Settings },
];
