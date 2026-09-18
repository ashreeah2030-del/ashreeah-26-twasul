import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TOKEN_SECRET = process.env.SECURE_LINK_SECRET || 'default-secret-key-123';

export function generateTeacherToken(teacherId: string | number) {
  return crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(teacherId.toString())
    .digest('hex')
    .substring(0, 16);
}

export function verifyTeacherToken(teacherId: string | number, token: string) {
  const expectedToken = generateTeacherToken(teacherId);
  return expectedToken === token;
}
