import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function calculateSavings(
  originalPriceMin: number,
  originalPriceMax: number,
  discountedPriceMin: number,
  discountedPriceMax: number
): string {
  // Calculate average savings percentage
  const originalAvg = (originalPriceMin + originalPriceMax) / 2;
  const discountedAvg = (discountedPriceMin + discountedPriceMax) / 2;

  if (originalAvg === 0) {
    return "0%";
  }

  const savingsPercentage = ((originalAvg - discountedAvg) / originalAvg) * 100;

  // Round to nearest whole number
  const roundedSavings = Math.round(savingsPercentage);

  return `${roundedSavings}%`;
}