import type { IconName } from '@/components/ui/icon';
import type { UiStrings } from '@/lib/i18n';

/**
 * Who is signed in. Each role gets its own tab bar, sidebar and permission set;
 * the lab owner can additionally override single permissions per staff member.
 */
export type UserRole = 'lab_owner' | 'lab_staff' | 'doctor' | 'driver';

export const USER_ROLES: readonly UserRole[] = ['lab_owner', 'lab_staff', 'doctor', 'driver'];

export type Permission =
  | 'viewDashboard'
  | 'viewOrders'
  | 'editOrders'
  | 'viewInbox'
  | 'viewFiles'
  | 'viewDoctors'
  | 'viewClinics'
  | 'viewPatients'
  | 'viewDeliveries'
  | 'viewExocad'
  | 'manageStaff';

/** Order shown in the staff permission editor. */
export const ASSIGNABLE_PERMISSIONS: readonly Permission[] = [
  'viewOrders',
  'editOrders',
  'viewInbox',
  'viewFiles',
  'viewDoctors',
  'viewClinics',
  'viewPatients',
  'viewDeliveries',
  'viewExocad',
  'manageStaff',
];

export const ROLE_LABEL_KEYS: Record<UserRole, keyof UiStrings> = {
  lab_owner: 'roleLabOwner',
  lab_staff: 'roleLabStaff',
  doctor: 'roleDoctor',
  driver: 'roleDriver',
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
  viewDeliveries: 'permViewDeliveries',
  viewExocad: 'permViewExocad',
  manageStaff: 'permManageStaff',
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
  viewDeliveries: 'car-outline',
  viewExocad: 'cube-outline',
  manageStaff: 'shield-checkmark-outline',
};

/** Baseline each role starts from before any per-member override. */
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
    'viewDeliveries',
    'viewExocad',
    'manageStaff',
  ],
  lab_staff: ['viewDashboard', 'viewOrders', 'editOrders', 'viewInbox', 'viewFiles', 'viewPatients', 'viewExocad'],
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
  const granted = new Set<Permission>(ROLE_PERMISSIONS[role]);
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
  inbox: 'viewInbox',
  folders: 'viewFiles',
};

/**
 * Tab order per role. `index` stays first because `viewDashboard` is not
 * overridable, which guarantees every role keeps at least one reachable tab.
 */
export const ROLE_TABS: Record<UserRole, readonly string[]> = {
  lab_owner: ['index', 'orders', 'inbox', 'folders'],
  lab_staff: ['index', 'orders', 'inbox', 'folders'],
  doctor: ['index', 'orders', 'inbox', 'folders'],
  driver: ['index', 'orders', 'inbox'],
};
