import { z } from 'zod';

// Phone number validator
export const phoneNumberSchema = z
  .string()
  .min(8, 'Phone number must be at least 8 digits')
  .max(15, 'Phone number must be at most 15 digits')
  .regex(/^[\d+\s-()]+$/, 'Phone number contains invalid characters')
  .transform((val) => val.replace(/\D/g, ''));

// File validator
export const fileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().positive('File size must be positive'),
  type: z.string().min(1, 'File type is required'),
});

// Upload form validator
export const uploadFormSchema = z.object({
  file: z.instanceof(File, 'File is required'),
  compress: z.boolean().default(true),
  compressionOptions: z.object({
    quality: z.number().min(1).max(100).optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    bitrate: z.number().positive().optional(),
    fps: z.number().positive().optional(),
  }).optional(),
});

// Connection form validator
export const connectionFormSchema = z.object({
  phoneNumber: z.string().optional(),
  method: z.enum(['qr', 'pairing']).default('qr'),
});

// Compression options validator
export const compressionOptionsSchema = z.object({
  quality: z.number().min(1).max(100).default(85),
  width: z.number().positive().max(4096).optional(),
  height: z.number().positive().max(4096).optional(),
  bitrate: z.number().positive().max(10000).optional(),
  fps: z.number().positive().max(120).optional(),
});

// Export types
export type PhoneNumberSchema = z.infer<typeof phoneNumberSchema>;
export type FileSchema = z.infer<typeof fileSchema>;
export type UploadFormSchema = z.infer<typeof uploadFormSchema>;
export type ConnectionFormSchema = z.infer<typeof connectionFormSchema>;
export type CompressionOptionsSchema = z.infer<typeof compressionOptionsSchema>;

// Validate file type
export function isValidFileType(file: File): boolean {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/3gpp'];
  
  return [...validImageTypes, ...validVideoTypes].includes(file.type);
}

// Validate file size
export function isValidFileSize(file: File, maxSize: number = 100 * 1024 * 1024): boolean {
  return file.size <= maxSize;
}

// Validate phone number with country code
export function isValidInternationalPhoneNumber(phoneNumber: string): boolean {
  // Simple validation for international format
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length >= 8 && cleaned.length <= 15;
}
