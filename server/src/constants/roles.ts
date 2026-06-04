import { config } from '../config';

/**
 * نظام الأدوار المحمي (Role Security System)
 * بدلاً من استخدام نصوص صريحة مثل 'admin'، نستخدم مفاتيح سرية (Secret Keys)
 * يتم جلب هذه المفاتيح من ملف الإعدادات المركزي لضمان أعلى مستوى من الحماية.
 */

export const UserRole = {
  ADMIN: config.roles.admin,
  ARTISAN: config.roles.artisan,
  BUYER: config.roles.buyer
} as const;

export type RoleValue = typeof UserRole[keyof typeof UserRole];

/**
 * الأدوار العامة (Public Role Labels)
 * تُستخدم في التوثيق (Swagger) والطلبات (API Requests) بدلاً من المفاتيح السرية.
 */
export enum PublicRole {
  ARTISAN = 'artisan',
  BUYER = 'buyer'
}

/**
 * خريطة تحويل الأدوار من العامة إلى السرية
 */
export const RoleMapping: Record<PublicRole, RoleValue> = {
  [PublicRole.ARTISAN]: UserRole.ARTISAN,
  [PublicRole.BUYER]: UserRole.BUYER
};

/**
 * دالة التحويل العكسي: تحويل المفتاح السري إلى اسم عام للعرض في الواجهة
 */
export function getPublicRole(roleValue: RoleValue): string {
  if (roleValue === UserRole.ADMIN) return 'admin';
  const entry = Object.entries(RoleMapping).find(([_, value]) => value === roleValue);
  return entry ? entry[0] : 'user';
}

export const publicRegistrationRoles: RoleValue[] = [UserRole.BUYER, UserRole.ARTISAN];

export function isValidRole(value: any): boolean {
  return Object.values(UserRole).includes(value);
}

export function isPublicRegistrationRole(value: any): boolean {
  return publicRegistrationRoles.includes(value);
}
