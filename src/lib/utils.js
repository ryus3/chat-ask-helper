import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

// دالة تنسيق العملة
export function formatCurrency(amount) {
  if (amount == null || amount === '') return '0 د.ع';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 د.ع';
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num).replace('IQD', 'د.ع');
}