import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
