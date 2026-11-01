export interface ScannedReceipt {
  isReceipt: boolean;
  merchant: string | null;
  date: string | null;
  currency: string | null;
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  total: number | null;
  items: {
    description: string | null;
    quantity: number | null;
    unitPrice: number | null;
    total: number | null;
  }[];
  warnings: string[];
}
export interface ReceiptExpenseDraft {
  description: string;
  amount: string;
  date: string;
  splitType: 'EQUAL' | 'ITEMIZED';
  items?: { description: string; quantity: string; amount: string }[];
  tax?: string;
  tip?: string;
}
