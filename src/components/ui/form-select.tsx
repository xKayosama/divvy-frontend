import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
interface SelectOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
}
interface FormSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  id?: string;
  name?: string;
  'aria-label'?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}
function OptionLabel({ label, icon: Icon }: SelectOption) {
  if (!Icon) return label;
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </span>
  );
}

// A controlled shadcn Select with shared form sizing and explicit option labels.
export function FormSelect({
  value,
  onValueChange,
  options,
  id,
  name,
  'aria-label': ariaLabel,
  disabled,
  required,
  placeholder = 'Choose an option',
  className,
}: FormSelectProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next !== null) onValueChange(next);
      }}
      items={options}
      name={name}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className={cn('w-full min-w-0 data-[size=default]:h-11', className)}
      >
        <SelectValue>
          {selected ? <OptionLabel {...selected} /> : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              <OptionLabel {...option} />
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
