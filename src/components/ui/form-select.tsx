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
          {options.find((option) => option.value === value)?.label ??
            placeholder}
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
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
