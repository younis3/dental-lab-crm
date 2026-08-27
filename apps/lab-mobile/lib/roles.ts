import type { IconName } from '@/components/ui/icon';
import type { UiStrings } from '@/lib/i18n';

/**
 * Who is signed in. Each role gets its own tab bar, sidebar and permission set;
 * the lab owner can additionally override single permissions per staff member.
 *
 * The first four work at the lab. A doctor is a client of the lab and a driver
 * only ever sees the courier board, so both stay outside the staff hierarchy.
 */
export type UserRole =
  | 'lab_owner'
  | 'receptionist'
  | 'staff_manager'
  | 'worker'
  | 'doctor'
  | 'driver';

export const USER_ROLES: readonly UserRole[] = [
  'lab_owner',
  'receptionist',
  'staff_manager',
  'worker',
  'doctor',
  'driver',
];

/** Roles that appear on the lab roster. Doctors are clients, not employees. */
export const ROSTER_ROLES = [
  'lab_owner',
  'receptionist',
  'staff_manager',
  'worker',
  'driver',
] as const;

export type RosterRole = (typeof ROSTER_ROLES)[number];

export type Permission =
  | 'viewDashboard'
  | 'viewOrders'
  | 'editOrders'
  | 'viewInbox'
  | 'viewFiles'
  | 'viewDoctors'
  | 'viewClinics'
  | 'viewPatients'
  | 'viewWorkTypes'
  | 'viewDeliveries'
  | 'viewBilling'
  | 'viewAnalytics'
  | 'viewExocad'
  | 'manageStaff'
  | 'manageTasks';

/** Order shown in the staff permission editor. */
export const ASSIGNABLE_PERMISSIONS: readonly Permission[] = [
  'viewOrders',
  'editOrders',
  'viewInbox',
  'viewFiles',
  'viewDoctors',
  'viewClinics',
  'viewPatients',
  'viewWorkTypes',
  'viewDeliveries',
  'viewBilling',
  'viewAnalytics',
  'viewExocad',
  'manageStaff',
  'manageTasks',
];

export const ROLE_LABEL_KEYS: Record<UserRole, keyof UiStrings> = {
  lab_owner: 'roleLabOwner',
  receptionist: 'roleReceptionist',
  staff_manager: 'roleStaffManager',
  worker: 'roleWorker',
  doctor: 'roleDoctor',
  driver: 'roleDriver',
};

export const ROLE_HINT_KEYS: Record<UserRole, keyof UiStrings> = {
  lab_owner: 'roleLabOwnerHint',
  receptionist: 'roleReceptionistHint',
  staff_manager: 'roleStaffManagerHint',
  worker: 'roleWorkerHint',
  doctor: 'roleDoctorHint',
  driver: 'roleDriverHint',
};

export const PERMISSION_LABEL_KEYS: Record<Permission, keyof UiStrings> = {
  viewDashboard: 'permViewDashboard',
  viewOrders: 'permViewOrders',
  editOrders: 'permEditOrders',
  viewInbox: 'permViewInbox',
  viewFiles: 'permViewFiles',
  viewDoctors: 'permViewDoctors',
  viewClinics: 'permViewClinics',
  viewPatients: 'permViewPatients',
  viewWorkTypes: 'permViewWorkTypes',
  viewDeliveries: 'permViewDeliveries',
  viewBilling: 'permViewBilling',
  viewAnalytics: 'permViewAnalytics',
  viewExocad: 'permViewExocad',
  manageStaff: 'permManageStaff',
  manageTasks: 'permManageTasks',
};

export const PERMISSION_ICONS: Record<Permission, IconName> = {
  viewDashboard: 'grid-outline',
  viewOrders: 'layers-outline',
  editOrders: 'create-outline',
  viewInbox: 'chatbubbles-outline',
  viewFiles: 'folder-open-outline',
  viewDoctors: 'medkit-outline',
  viewClinics: 'business-outline',
  viewPatients: 'people-outline',
  viewWorkTypes: 'pricetags-outline',
  viewDeliveries: 'car-outline',
  viewBilling: 'receipt-outline',
  viewAnalytics: 'stats-chart-outline',
  viewExocad: 'cube-outline',
  manageStaff: 'shield-checkmark-outline',
  manageTasks: 'checkmark-done-outline',
};

/**
 * Baseline each role starts from before any per-member override. Money is the
 * dividing line: only the owner and the front desk invoice clients and read the
 * lab's numbers, so `viewBilling` and `viewAnalytics` stop there.
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  lab_owner: [
    'viewDashboard',
    'viewOrders',
    'editOrders',
    'viewInbox',
    'viewFiles',
    'viewDoctors',
    'viewClinics',
    'viewPatients',
    'viewWorkTypes',
    'viewDeliveries',
    'viewBilling',
    'viewAnalytics',
    'viewExocad',
    'manageStaff',
    'manageTasks',
  ],
  receptionist: [
    'viewDashboard',
    'viewOrders',
    'editOrders',
    'viewInbox',
    'viewFiles',
    'viewDoctors',
    'viewClinics',
    'viewPatients',
    'viewWorkTypes',
    'viewDeliveries',
    'viewBilling',
    'viewAnalytics',
  ],
  staff_manager: [
    'viewDashboard',
    'viewOrders',
    'editOrders',
    'viewInbox',
    'viewFiles',
    'viewDoctors',
    'viewClinics',
    'viewPatients',
    'viewWorkTypes',
    'viewDeliveries',
    'viewExocad',
    'manageStaff',
    'manageTasks',
  ],
  worker: [
    'viewDashboard',
    'viewOrders',
    'editOrders',
    'viewInbox',
    'viewFiles',
    'viewPatients',
    'viewWorkTypes',
    'viewDeliveries',
    'viewExocad',
  ],
  doctor: ['viewDashboard', 'viewOrders', 'viewInbox', 'viewFiles', 'viewPatients'],
  driver: ['viewDashboard', 'viewDeliveries', 'viewInbox'],
};

/** Per-member deltas on top of the role baseline. */
export type PermissionOverrides = Partial<Record<Permission, boolean>>;

/**
 * Role baseline merged with the member's overrides. The lab owner is
 * deliberately not overridable — the workspace must always keep one full seat.
 */
export function effectivePermissions(
  role: UserRole,
  overrides?: PermissionOverrides
): ReadonlySet<Permission> {
  const granted = new Set<Permission>(ROLE_PERMISSIONS[role] ?? []);
  if (role === 'lab_owner' || !overrides) return granted;

  for (const [permission, enabled] of Object.entries(overrides) as [Permission, boolean][]) {
    if (enabled) granted.add(permission);
    else granted.delete(permission);
  }
  return granted;
}

export function hasPermission(
  role: UserRole,
  overrides: PermissionOverrides | undefined,
  permission: Permission
): boolean {
  return effectivePermissions(role, overrides).has(permission);
}

/** How a single destination is gated and worded for the current role. */
export type NavAspect = { permission: Permission; labelKey: keyof UiStrings };

/**
 * One route, different jobs. The orders screen is the lab's production queue, a
 * doctor's own cases and a driver's delivery run, so its wording and its gate
 * both move with the role. Keyed by the slug the tab bar and the sidebar share.
 */
const ROLE_ROUTE_OVERRIDES: Partial<Record<UserRole, Record<string, Partial<NavAspect>>>> = {
  doctor: { orders: { labelKey: 'navMyCases' } },
  driver: { orders: { permission: 'viewDeliveries', labelKey: 'navDeliveries' } },
};

/** Applied by both navigators so they can never disagree about a destination. */
export function resolveNav(role: UserRole, slug: string, base: NavAspect): NavAspect {
  const override = ROLE_ROUTE_OVERRIDES[role]?.[slug];
  return override ? { ...base, ...override } : base;
}

/** Baseline gate for each route inside `app/(app)/(tabs)`. */
export const TAB_PERMISSIONS: Record<string, Permission> = {
  index: 'viewDashboard',
  orders: 'viewOrders',
  tasks: 'viewDashboard',
  inbox: 'viewInbox',
  folders: 'viewFiles',
};

/**
 * Tab order per role. `index` stays first because `viewDashboard` is not
 * overridable, which guarantees every role keeps at least one reachable tab.
 */
export const ROLE_TABS: Record<UserRole, readonly string[]> = {
  lab_owner: ['index', 'orders', 'tasks', 'inbox', 'folders'],
  receptionist: ['index', 'orders', 'tasks', 'inbox', 'folders'],
  staff_manager: ['index', 'orders', 'tasks', 'inbox', 'folders'],
  worker: ['index', 'orders', 'tasks', 'inbox', 'folders'],
  doctor: ['index', 'orders', 'inbox', 'folders'],
  driver: ['index', 'orders', 'inbox'],
};
