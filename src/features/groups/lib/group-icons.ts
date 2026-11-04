import {
  Briefcase, Car, Coffee, Gamepad2, GraduationCap, Heart,
  House, PawPrint, Plane, Trophy, Users, Utensils,
} from 'lucide-react';

export const groupIconOptions = ([
  ['people', Users],
  ['home', House],
  ['heart', Heart],
  ['airplane', Plane],
  ['car', Car],
  ['restaurant', Utensils],
  ['cafe', Coffee],
  ['briefcase', Briefcase],
  ['school', GraduationCap],
  ['game-controller', Gamepad2],
  ['football', Trophy],
  ['paw', PawPrint],
] as const).map(([value, icon]) => ({
  value,
  label: value.replaceAll('-', ' '),
  icon,
}));

export function resolveGroupIcon(value?: string) {
  return groupIconOptions.find((option) => option.value === value)?.icon ?? Users;
}
