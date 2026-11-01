import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui/input-group';
export default function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  hint = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  hint?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
            disabled={disabled}
            size="icon-sm"
          >
            {visible ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
      {hint && (
        <FieldDescription id={`${id}-hint`}>
          At least 8 characters, up to 72 UTF-8 bytes.
        </FieldDescription>
      )}
    </Field>
  );
}
