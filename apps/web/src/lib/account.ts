import type { AccountView } from '@hs/contracts';
export const accountSections = [
  { slug: '', label: 'Tổng quan', group: 'Cá nhân', icon: 'home' },
  { slug: 'ho-so', label: 'Hồ sơ cá nhân', icon: 'user' },
  { slug: 'bao-mat', label: 'Đăng nhập & bảo mật', icon: 'shield' },
  { slug: 'tuy-chon', label: 'Tùy chọn', icon: 'settings' },
  { slug: 'goi', label: 'Gói của bạn', group: 'Gói & thanh toán', icon: 'star' },
  { slug: 'thanh-toan', label: 'Thanh toán', icon: 'card' },
  { slug: 'du-lieu', label: 'Dữ liệu & quyền riêng tư', group: 'Dữ liệu & hỗ trợ', icon: 'lock' },
  { slug: 'tro-giup', label: 'Trợ giúp', icon: 'help' },
] as const;
export const studyRoles = { student: 'Sinh viên ngành sức khỏe', self: 'Người tự học', teacher: 'Giảng viên', unspecified: 'Không muốn chia sẻ' } as const;
export function accountName(account: AccountView) { return account.displayName || 'Tài khoản của bạn'; }
export function initials(name: string) { return name.trim().split(/\s+/u).filter(Boolean).slice(-2).map(part => [...part][0]).join('').toLocaleUpperCase('vi-VN') || 'HS'; }
export function accountPath(slug: string) { return `/tai-khoan${slug ? `/${slug}` : ''}`; }
