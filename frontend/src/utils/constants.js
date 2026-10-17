// ============================================================
// constants.js - Global Constants for StaffSync Frontend
// ============================================================

export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Design',
  'Quality Assurance'
];

export const LEAVE_TYPES = [
  { value: 'casual', label: 'Casual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'earned', label: 'Earned Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' }
];

export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  HR: 'hr'
};

export const STATUS_COLORS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  present: 'success',
  absent: 'danger',
  late: 'warning',
  'half-day': 'info',
  active: 'success',
  inactive: 'secondary',
  terminated: 'danger',
  upcoming: 'info',
  ongoing: 'warning',
  completed: 'success'
};

export const ANNOUNCEMENT_CATEGORIES = [
  { value: 'general', label: 'General', color: 'success' },
  { value: 'urgent', label: 'Urgent', color: 'danger' },
  { value: 'event', label: 'Event', color: 'primary' },
  { value: 'policy', label: 'Policy Update', color: 'warning' }
];

export const TRAINING_MODES = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline / In-Person' },
  { value: 'hybrid', label: 'Hybrid' }
];
