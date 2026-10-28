import { useState } from 'react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useGetHouseholdMembersQuery } from '@/features/members/memberApi';
import type { HouseholdMemberUser } from '@/features/members/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from '../expenseApi';
import {
  expenseCategories,
  categoryLabel,
  splitLabels,
  participantId,
  personName,
} from '../types';
import type {
  Expense,
  ExpenseCategory,
  ExpenseItem,
  ExpensePayload,
  ExpenseSplitType,
  Frequency,
  Adjustments,
} from '../types';
import { apiMessage, currencyMoney, todayDate } from '../lib/money';
import { calculateSplit } from '../lib/split';

interface Props {
  expense?: Expense;
  groupId: string;
  currency: string;
  onClose: () => void;
  onSaved: (expense: Expense) => void;
}
const selectStyle =
  'h-11 w-full min-w-0 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';
const fieldStyle = 'space-y-2';
interface ItemDraft {
  key: string;
  description: string;
  quantity: string;
  amount: string;
  memberIds: string[];
}
const newItem = (): ItemDraft => ({
  key: crypto.randomUUID(),
  description: '',
  quantity: '1',
  amount: '',
  memberIds: [],
});

export default function ExpenseFormDialog(props: Props) {
  const [busy, setBusy] = useState(false);
  const {
    currentData: data,
    isFetching,
    isError,
    refetch,
  } = useGetHouseholdMembersQuery(props.groupId);
  return (
    <Dialog
      open
      onOpenChange={(value) => {
        if (!value && !busy) props.onClose();
      }}
    >
      {isError ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Members unavailable</DialogTitle>
            <DialogDescription>
              We couldn’t load the members for this expense.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => refetch()}>Try again</Button>
        </DialogContent>
      ) : !data ? (
        <DialogContent>
          <DialogTitle>Loading expense form</DialogTitle>
          <DialogDescription>
            Please wait while we load your group members.
          </DialogDescription>
          {isFetching && <LoaderCircle className="animate-spin text-primary" />}
        </DialogContent>
      ) : (
        <ExpenseForm
          key={`${props.groupId}:${props.expense?._id ?? 'new'}`}
          {...props}
          onBusy={setBusy}
          members={data.data.members
            .filter((member) => member.userId && member.status === 'ACTIVE')
            .map((member) => member.userId)}
        />
      )}
    </Dialog>
  );
}

function ExpenseForm({
  expense,
  groupId,
  currency,
  members,
  onClose,
  onSaved,
  onBusy,
}: Props & {
  members: HouseholdMemberUser[];
  onBusy: (busy: boolean) => void;
}) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [description, setDescription] = useState(expense?.description ?? '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [category, setCategory] = useState<ExpenseCategory>(
    expense?.category ?? 'FOOD',
  );
  const [payer, setPayer] = useState(
    expense?.paidBy?._id ??
      members.find((member) => member._id === currentUser?._id)?._id ??
      members[0]?._id ??
      '',
  );
  const [date, setDate] = useState(expense?.date.slice(0, 10) ?? todayDate());
  const [notes, setNotes] = useState(expense?.notes ?? '');
  const [splitType, setSplitType] = useState<ExpenseSplitType>(
    expense?.splitType ?? 'EQUAL',
  );
  const [selected, setSelected] = useState(
    expense?.participants.map((p) => participantId(p.userId)) ??
      members.map((m) => m._id),
  );
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(
      expense?.participants.map((p) => [
        participantId(p.userId),
        String(
          expense.splitType === 'SHARES'
            ? (p.shares ?? 1)
            : expense.splitType === 'PERCENTAGE'
              ? (p.percentage ?? 0)
              : p.amount,
        ),
      ]) ?? [],
    ),
  );
  const [items, setItems] = useState<ItemDraft[]>(
    expense?.items?.map((item) => ({
      ...item,
      key: crypto.randomUUID(),
      amount: String(item.amount),
      quantity: String(item.quantity),
    })) ?? [newItem()],
  );
  const [tax, setTax] = useState(
    expense?.adjustments?.tax ? String(expense.adjustments.tax.amount) : '',
  );
  const [tip, setTip] = useState(
    expense?.adjustments?.tip ? String(expense.adjustments.tip.amount) : '',
  );
  const [taxAllocation, setTaxAllocation] = useState<'EQUAL' | 'PROPORTIONAL'>(
    expense?.adjustments?.tax?.allocation ?? 'PROPORTIONAL',
  );
  const [tipAllocation, setTipAllocation] = useState<'EQUAL' | 'PROPORTIONAL'>(
    expense?.adjustments?.tip?.allocation ?? 'PROPORTIONAL',
  );
  const [frequency, setFrequency] = useState<Frequency | ''>('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [create, createState] = useCreateExpenseMutation();
  const [update, updateState] = useUpdateExpenseMutation();
  const saving = createState.isLoading || updateState.isLoading;
  const money = currencyMoney(currency);
  const participants = selected.map((userId) => ({
    userId,
    ...(splitType === 'EXACT'
      ? { amount: Number(values[userId] ?? 0) }
      : splitType === 'PERCENTAGE'
        ? { percentage: Number(values[userId] ?? 0) }
        : splitType === 'SHARES'
          ? { shares: Number(values[userId] ?? 1) }
          : { amount: 0 }),
  }));
  const parsedItems: ExpenseItem[] = items.map((item) => ({
    description: item.description.trim(),
    quantity: Number(item.quantity),
    amount: Number(item.amount),
    memberIds: item.memberIds,
  }));
  const adjustments: Adjustments = {
    ...(tax !== ''
      ? { tax: { amount: Number(tax), allocation: taxAllocation } }
      : {}),
    ...(tip !== ''
      ? { tip: { amount: Number(tip), allocation: tipAllocation } }
      : {}),
  };
  const preview = calculateSplit({
    amount: Number(amount),
    currency,
    splitType,
    participants,
    items: parsedItems,
    adjustments,
  });
  const knownIds = new Set(members.map((member) => member._id));
  const selectedIds =
    splitType === 'ITEMIZED'
      ? parsedItems.flatMap((item) => item.memberIds)
      : selected;
  const unavailable =
    selectedIds.some((id) => !knownIds.has(id)) || !knownIds.has(payer);
  const memberName = (id: string) =>
    personName(members.find((member) => member._id === id));
  function changeType(type: ExpenseSplitType) {
    setSplitType(type);
    setValues({});
    setError('');
  }
  function patchItem(key: string, patch: Partial<ItemDraft>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setError('');
    if (expense?.billId) {
      setError('Paid bill expenses cannot be changed independently.');
      return;
    }
    if (!description.trim()) {
      setError('Enter a description.');
      return;
    }
    if (!payer || unavailable) {
      setError(
        'Choose an active payer and remove unavailable members from the split.',
      );
      return;
    }
    if (preview.error) {
      setError(preview.error);
      return;
    }
    if (frequency && endDate && endDate < date) {
      setError('The repeat end date must be on or after the expense date.');
      return;
    }
    const body: ExpensePayload = {
      description: description.trim(),
      amount: Number(amount),
      category,
      paidBy: payer,
      splitType,
      notes: notes.trim(),
      ...(!expense?.recurring ? { date } : {}),
      ...(splitType === 'ITEMIZED'
        ? { items: parsedItems, adjustments }
        : { participants }),
    };
    onBusy(true);
    try {
      const response = expense
        ? await update({ expenseId: expense._id, ...body }).unwrap()
        : await create({
            householdId: groupId,
            ...body,
            ...(frequency
              ? { recurring: { frequency, endDate: endDate || null } }
              : {}),
          }).unwrap();
      onSaved(response.data.expense);
      onClose();
    } catch (caught) {
      setError(
        apiMessage(caught, 'Could not save this expense. Please try again.'),
      );
    } finally {
      onBusy(false);
    }
  }
  return (
    <DialogContent
      className="flex max-h-[92svh] flex-col gap-0 overflow-hidden rounded-3xl bg-card p-0 text-card-foreground sm:max-w-3xl"
      showCloseButton={!saving}
    >
      <DialogHeader className="border-b px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
          Shared expenses · {currency}
        </p>
        <DialogTitle className="text-2xl font-semibold">
          {expense ? 'Edit expense' : 'Add an expense'}
        </DialogTitle>
        <DialogDescription>
          Record what you paid and see everyone’s share before saving.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={submit}
        className="flex min-h-0 flex-1 flex-col"
        aria-busy={saving}
      >
        <fieldset
          disabled={saving}
          className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6"
        >
          {!members.length && (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 p-3 text-destructive"
            >
              No active group members are available.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
            <div className={fieldStyle}>
              <label
                htmlFor="expense-description"
                className="text-sm font-medium"
              >
                Description
              </label>
              <Input
                id="expense-description"
                className="h-11"
                placeholder="What was it for?"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className={fieldStyle}>
              <label htmlFor="expense-amount" className="text-sm font-medium">
                Amount ({currency})
              </label>
              <Input
                id="expense-amount"
                type="number"
                className="h-11"
                required
                min={money.step}
                step={money.step}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={(0).toFixed(money.digits)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={fieldStyle}>
              <label htmlFor="expense-category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="expense-category"
                className={selectStyle}
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              >
                {expenseCategories.map((value) => (
                  <option key={value} value={value}>
                    {categoryLabel(value)}
                  </option>
                ))}
              </select>
            </div>
            <div className={fieldStyle}>
              <label htmlFor="expense-payer" className="text-sm font-medium">
                Paid by
              </label>
              <select
                id="expense-payer"
                className={selectStyle}
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
                required
              >
                {!knownIds.has(payer) && (
                  <option value={payer}>Choose an active member</option>
                )}
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {personName(member)}
                  </option>
                ))}
              </select>
            </div>
            <div className={fieldStyle}>
              <label htmlFor="expense-date" className="text-sm font-medium">
                Expense date (UTC)
              </label>
              <Input
                id="expense-date"
                type="date"
                className="h-11"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!!expense?.recurring}
              />
              {expense?.recurring && (
                <p className="text-xs text-muted-foreground">
                  The first date anchors this schedule.
                </p>
              )}
            </div>
          </div>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">How should we split it?</h3>
              <span className="text-xs text-muted-foreground">
                {currency} · {money.digits} decimal places
              </span>
            </div>
            <div
              className="grid grid-cols-2 gap-2 sm:grid-cols-5"
              role="group"
              aria-label="Split method"
            >
              {(Object.keys(splitLabels) as ExpenseSplitType[]).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={type === splitType ? 'default' : 'outline'}
                  className="h-10"
                  aria-pressed={type === splitType}
                  onClick={() => changeType(type)}
                >
                  {splitLabels[type]}
                </Button>
              ))}
            </div>
            {splitType !== 'ITEMIZED' ? (
              <div className="divide-y overflow-hidden rounded-2xl border">
                {[
                  ...new Set([
                    ...members.map((member) => member._id),
                    ...selected,
                  ]),
                ].map((id) => (
                  <div key={id} className="flex items-center gap-3 px-4 py-3">
                    <label className="flex min-w-0 flex-1 items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={selected.includes(id)}
                        onChange={() =>
                          setSelected((current) =>
                            current.includes(id)
                              ? current.filter((value) => value !== id)
                              : [...current, id],
                          )
                        }
                      />
                      <span className="truncate">
                        {memberName(id)}
                        {!knownIds.has(id) && ' (unavailable)'}
                      </span>
                    </label>
                    {selected.includes(id) && splitType !== 'EQUAL' && (
                      <div className="flex w-32 shrink-0 items-center gap-2">
                        <Input
                          aria-label={`${splitLabels[splitType]} for ${memberName(id)}`}
                          type="number"
                          min={splitType === 'SHARES' ? 1 : 0}
                          max={
                            splitType === 'PERCENTAGE'
                              ? 100
                              : splitType === 'SHARES'
                                ? 1000000
                                : undefined
                          }
                          step={
                            splitType === 'SHARES'
                              ? 1
                              : splitType === 'PERCENTAGE'
                                ? 0.01
                                : money.step
                          }
                          value={
                            values[id] ?? (splitType === 'SHARES' ? '1' : '')
                          }
                          onChange={(e) =>
                            setValues((current) => ({
                              ...current,
                              [id]: e.target.value,
                            }))
                          }
                          placeholder="0"
                        />
                        {splitType === 'PERCENTAGE' && <span>%</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs leading-5 text-muted-foreground">
                  Enter each line’s total, including its quantity. Assign who
                  shared it. Quantity is informational; the line total is not
                  multiplied.
                </p>
                {items.map((item, index) => (
                  <div
                    key={item.key}
                    className="space-y-3 rounded-2xl border bg-background/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">
                        Item {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove item ${index + 1}`}
                        disabled={items.length === 1}
                        onClick={() =>
                          setItems((current) =>
                            current.filter((value) => value.key !== item.key),
                          )
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                      <Input
                        aria-label={`Item ${index + 1} description`}
                        placeholder="Item description"
                        className="col-span-2 sm:col-span-1"
                        maxLength={200}
                        required
                        value={item.description}
                        onChange={(e) =>
                          patchItem(item.key, { description: e.target.value })
                        }
                      />
                      <Input
                        aria-label={`Item ${index + 1} quantity`}
                        type="number"
                        min="0.001"
                        max="1000000"
                        step="0.001"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          patchItem(item.key, { quantity: e.target.value })
                        }
                      />
                      <Input
                        aria-label={`Item ${index + 1} line total`}
                        type="number"
                        min="0"
                        step={money.step}
                        required
                        placeholder="Line total"
                        value={item.amount}
                        onChange={(e) =>
                          patchItem(item.key, { amount: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        ...new Set([
                          ...members.map((member) => member._id),
                          ...item.memberIds,
                        ]),
                      ].map((id) => (
                        <label
                          key={id}
                          className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            className="accent-primary"
                            checked={item.memberIds.includes(id)}
                            onChange={() =>
                              patchItem(item.key, {
                                memberIds: item.memberIds.includes(id)
                                  ? item.memberIds.filter(
                                      (value) => value !== id,
                                    )
                                  : [...item.memberIds, id],
                              })
                            }
                          />
                          {memberName(id)}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  disabled={items.length >= 100}
                  onClick={() => setItems((current) => [...current, newItem()])}
                >
                  <Plus className="size-4" />
                  Add item
                </Button>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(['tax', 'tip'] as const).map((key) => (
                    <div key={key} className="space-y-2">
                      <label
                        htmlFor={`expense-${key}`}
                        className="text-sm font-medium"
                      >
                        {key === 'tax' ? 'Tax' : 'Tip'} ({currency}, optional)
                      </label>
                      <Input
                        id={`expense-${key}`}
                        type="number"
                        min="0"
                        step={money.step}
                        value={key === 'tax' ? tax : tip}
                        onChange={(e) =>
                          (key === 'tax' ? setTax : setTip)(e.target.value)
                        }
                      />
                      <select
                        aria-label={`${key} allocation`}
                        className={selectStyle}
                        value={key === 'tax' ? taxAllocation : tipAllocation}
                        onChange={(e) =>
                          (key === 'tax' ? setTaxAllocation : setTipAllocation)(
                            e.target.value as 'EQUAL' | 'PROPORTIONAL',
                          )
                        }
                      >
                        <option value="PROPORTIONAL">
                          In proportion to item shares
                        </option>
                        <option value="EQUAL">
                          Equally between assigned members
                        </option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
          <section
            className="rounded-2xl bg-secondary p-4"
            aria-label="Split preview"
            aria-live="polite"
          >
            <h3 className="mb-3 text-sm font-semibold text-secondary-foreground">
              Everyone’s share
            </h3>
            {preview.error ? (
              <p className="text-sm text-muted-foreground">{preview.error}</p>
            ) : (
              <div className="space-y-2">
                {preview.participants?.map((p) => (
                  <div
                    key={p.userId}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span>{memberName(p.userId)}</span>
                    <strong>{money.format(p.amount)}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
          {!expense && (
            <section className="grid gap-4 rounded-2xl border p-4 sm:grid-cols-2">
              <div className={fieldStyle}>
                <label
                  htmlFor="expense-frequency"
                  className="text-sm font-medium"
                >
                  Repeat this expense
                </label>
                <select
                  id="expense-frequency"
                  className={selectStyle}
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(e.target.value as Frequency | '')
                  }
                >
                  <option value="">Does not repeat</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              {frequency && (
                <div className={fieldStyle}>
                  <label htmlFor="expense-end" className="text-sm font-medium">
                    Repeat until (optional)
                  </label>
                  <Input
                    id="expense-end"
                    className="h-11"
                    type="date"
                    min={date}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}
              <p className="text-xs leading-5 text-muted-foreground sm:col-span-2">
                {frequency
                  ? 'The same amount and split will be recorded automatically. Past start dates can generate missed entries. Manage the schedule from expense details.'
                  : 'Choose a schedule for regular shared costs such as rent or subscriptions.'}
              </p>
            </section>
          )}
          <div className={fieldStyle}>
            <label htmlFor="expense-notes" className="text-sm font-medium">
              Notes (optional)
            </label>
            <textarea
              id="expense-notes"
              className="min-h-20 w-full rounded-xl border bg-card p-3 text-sm outline-none focus:border-primary"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything the group should know?"
            />
          </div>
          {unavailable && (
            <p className="text-sm text-destructive">
              A payer or participant is no longer active. Update the selection
              before saving.
            </p>
          )}
        </fieldset>
        {error && (
          <p
            role="alert"
            className="shrink-0 border-t bg-destructive/10 px-6 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <div className="flex shrink-0 items-center justify-end gap-3 border-t bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving || !members.length || !!expense?.billId}
            className="h-10 px-5"
          >
            {saving && <LoaderCircle className="size-4 animate-spin" />}
            {saving ? 'Saving…' : expense ? 'Save changes' : 'Add expense'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
