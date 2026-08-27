import type { Tone } from '@/components/ui/pill';
import type { LocalizedText, MaybeLocalized, UiStrings } from '@/lib/i18n';
import type { OrderStage } from '@/lib/mock-data';

/**
 * Deterministic demo directory. Rows are generated from fixed pools with
 * index arithmetic rather than `Math.random`, so every run — and every
 * screenshot — shows the same data.
 */

/** Either the lab is working with the row right now, or it is not. */
export type DirectoryStatus = 'active' | 'inactive';

export const DIRECTORY_STATUSES: readonly DirectoryStatus[] = ['active', 'inactive'];

export const STATUS_META: Record<DirectoryStatus, { labelKey: keyof UiStrings; tone: Tone }> = {
  active: { labelKey: 'statusActive', tone: 'success' },
  inactive: { labelKey: 'statusInactive', tone: 'neutral' },
};

export type Doctor = {
  id: string;
  name: string;
  clinic: string;
  specialty: LocalizedText;
  phone: string;
  /** Where invoices are sent. */
  email: string;
  activeCases: number;
  totalCases: number;
  status: DirectoryStatus;
};

export type Clinic = {
  id: string;
  name: string;
  city: LocalizedText;
  phone: string;
  doctors: number;
  activeCases: number;
  /** Unpaid balance in shekels. */
  outstanding: number;
  status: DirectoryStatus;
};

export type Patient = {
  id: string;
  name: string;
  clinic: string;
  doctor: string;
  caseId: string;
  /** Copied from the work type list, so it can be seeded or owner-typed. */
  workType: MaybeLocalized;
  /** `0` when it was not recorded. */
  age: number;
  stage: OrderStage;
};

/** Families the price list is grouped and filtered by. */
export type WorkTypeCategory = 'crown' | 'bridge' | 'veneer' | 'denture' | 'implant' | 'appliance';

export const WORK_TYPE_CATEGORIES: readonly WorkTypeCategory[] = [
  'crown',
  'bridge',
  'veneer',
  'denture',
  'implant',
  'appliance',
];

export const CATEGORY_LABEL_KEYS: Record<WorkTypeCategory, keyof UiStrings> = {
  crown: 'workTypeCrown',
  bridge: 'workTypeBridge',
  veneer: 'workTypeVeneer',
  denture: 'workTypeDenture',
  implant: 'workTypeImplant',
  appliance: 'workTypeAppliance',
};

/** One line of the lab's price list. */
export type WorkType = {
  id: string;
  /** Seeded rows ship both languages; owner-typed names are plain strings. */
  name: MaybeLocalized;
  category: WorkTypeCategory;
  /** Price per unit in shekels. `0` when it has not been priced yet. */
  price: number;
  /** Working days from case receipt to delivery. `0` when unset. */
  turnaround: number;
  status: DirectoryStatus;
};

/**
 * Stable key for a work type across languages, so a patient row can be matched
 * back to the price list no matter which language it was created in.
 */
export const workTypeKey = (name: MaybeLocalized) =>
  (typeof name === 'string' ? name : name.en).trim().toLowerCase();

const FIRST_NAMES = [
  'Amir', 'Rana', 'Lina', 'Yara', 'Sami', 'Noor', 'Dana', 'Karim',
  'Maya', 'Tarek', 'Hala', 'Omar', 'Leila', 'Fadi', 'Nadia', 'Ziad',
  'Rasha', 'Elias', 'Sahar', 'Basel', 'Layla', 'Yusuf', 'Salma', 'Adam',
];

const LAST_NAMES = [
  'Saleh', 'Odeh', 'Farah', 'Haddad', 'Khoury', 'Mansour', 'Nassar', 'Barakat',
  'Kassab', 'Aziz', 'Shami', 'Daher', 'Zoabi', 'Sabbagh', 'Younis', 'Hijazi',
  'Cohen', 'Amara', 'Karam', 'Tannous',
];

const CLINIC_NAMES = [
  'Bright Smile Clinic',
  'Dentaris Center',
  'Peak Dental Studio',
  'Cedar Dental',
  'Aurora Dental Care',
  'Orchid Family Dental',
  'Northgate Dental',
  'Marina Smile Studio',
  'Vista Oral Care',
  'Crescent Dental',
  'Lumina Dental',
  'Harbour Dental Group',
  'Elite Implant Centre',
  'Green Valley Dental',
  'Riverside Orthodontics',
  'Alma Dental Clinic',
];

export const CITIES: LocalizedText[] = [
  { en: 'Haifa', he: 'חיפה' },
  { en: 'Nazareth', he: 'נצרת' },
  { en: 'Tel Aviv', he: 'תל אביב' },
  { en: 'Jerusalem', he: 'ירושלים' },
  { en: 'Acre', he: 'עכו' },
  { en: 'Tiberias', he: 'טבריה' },
];

export const SPECIALTIES: LocalizedText[] = [
  { en: 'Prosthodontics', he: 'שיקום הפה' },
  { en: 'Implantology', he: 'אימפלנטולוגיה' },
  { en: 'Orthodontics', he: 'יישור שיניים' },
  { en: 'General dentistry', he: 'רפואת שיניים כללית' },
  { en: 'Periodontics', he: 'מחלות חניכיים' },
  { en: 'Oral surgery', he: 'כירורגיה פה ולסת' },
];

export const WORK_TYPES: WorkType[] = [
  {
    id: 'wt-001',
    name: { en: 'Zirconia crown', he: 'כתר זירקוניה' },
    category: 'crown',
    price: 720,
    turnaround: 4,
    status: 'active',
  },
  {
    id: 'wt-002',
    name: { en: 'E-max veneers', he: 'ציפויי E-max' },
    category: 'veneer',
    price: 890,
    turnaround: 5,
    status: 'active',
  },
  {
    id: 'wt-003',
    name: { en: 'Implant bridge', he: 'גשר על שתלים' },
    category: 'implant',
    price: 2400,
    turnaround: 8,
    status: 'active',
  },
  {
    id: 'wt-004',
    name: { en: 'PFM crown', he: 'כתר חרסינה על מתכת' },
    category: 'crown',
    price: 540,
    turnaround: 4,
    status: 'active',
  },
  {
    id: 'wt-005',
    name: { en: 'Night guard', he: 'סד לילה' },
    category: 'appliance',
    price: 380,
    turnaround: 3,
    status: 'active',
  },
  {
    id: 'wt-006',
    name: { en: 'Partial denture', he: 'תותבת חלקית' },
    category: 'denture',
    price: 1650,
    turnaround: 9,
    status: 'active',
  },
  {
    id: 'wt-007',
    name: { en: 'Inlay / onlay', he: 'אינליי / אונליי' },
    category: 'crown',
    price: 610,
    turnaround: 4,
    status: 'active',
  },
  {
    id: 'wt-008',
    name: { en: 'Full-arch bridge', he: 'גשר לקשת שלמה' },
    category: 'bridge',
    price: 5200,
    turnaround: 12,
    status: 'active',
  },
  {
    id: 'wt-009',
    name: { en: 'Complete denture', he: 'תותבת שלמה' },
    category: 'denture',
    price: 2900,
    turnaround: 11,
    status: 'active',
  },
  {
    id: 'wt-010',
    name: { en: 'Clear aligner set', he: 'סט קשתיות שקופות' },
    category: 'appliance',
    price: 4300,
    turnaround: 14,
    status: 'inactive',
  },
];

const STAGES: OrderStage[] = ['received', 'design', 'production', 'quality', 'courier', 'delivered'];

/** Clinics the lab has stopped working with, so their doctors are dormant too. */
const RETIRED_CLINICS: readonly string[] = [CLINIC_NAMES[9], CLINIC_NAMES[14]];

/** `05x-xxx-xxxx`, stable per row. */
const phoneFor = (seed: number) =>
  `05${(seed % 5) + 2}-${String(200 + ((seed * 37) % 800))}-${String(1000 + ((seed * 613) % 9000))}`;

const fullName = (seed: number) =>
  `${FIRST_NAMES[seed % FIRST_NAMES.length]} ${LAST_NAMES[(seed * 7) % LAST_NAMES.length]}`;

/** `Dr. Amir Saleh` at `Bright Smile Clinic` → `amir.saleh@brightsmileclinic.com`. */
const emailFor = (name: string, clinic: string) => {
  const person = name
    .replace(/^Dr\.?\s+/i, '')
    .toLowerCase()
    .split(/\s+/)
    .join('.');
  return `${person}@${clinic.toLowerCase().replace(/[^a-z]/g, '')}.com`;
};

export const DOCTORS: Doctor[] = Array.from({ length: 34 }, (_, index) => {
  const seed = index + 3;
  const name = `Dr. ${fullName(seed)}`;
  const clinic = CLINIC_NAMES[seed % CLINIC_NAMES.length];
  // Dormant either because the lab dropped the clinic or because this doctor
  // stopped referring. Either way none of their work can still be in the lab,
  // so the case count has to follow the badge.
  const dormant = RETIRED_CLINICS.includes(clinic) || seed % 7 === 0;
  return {
    id: `doc-${String(index + 1).padStart(3, '0')}`,
    name,
    clinic,
    specialty: SPECIALTIES[seed % SPECIALTIES.length],
    phone: phoneFor(seed),
    email: emailFor(name, clinic),
    activeCases: dormant ? 0 : (seed * 5) % 14,
    /** Dormant doctors keep the history they built up. */
    totalCases: 40 + ((seed * 29) % 260),
    status: dormant ? 'inactive' : 'active',
  };
});

export const CLINICS: Clinic[] = CLINIC_NAMES.map((name, index) => {
  const seed = index + 2;
  const doctors = DOCTORS.filter((doctor) => doctor.clinic === name);
  return {
    id: `cli-${String(index + 1).padStart(3, '0')}`,
    name,
    city: CITIES[seed % CITIES.length],
    phone: phoneFor(seed * 3),
    doctors: doctors.length,
    // Summed from the doctors, so a retired clinic lands on zero by itself.
    activeCases: doctors.reduce((sum, doctor) => sum + doctor.activeCases, 0),
    /** A retired clinic can still owe the lab money. */
    outstanding: (seed * 740) % 9200,
    status: RETIRED_CLINICS.includes(name) || doctors.length === 0 ? 'inactive' : 'active',
  };
});

export const PATIENTS: Patient[] = Array.from({ length: 46 }, (_, index) => {
  const seed = index + 11;
  const doctor = DOCTORS[(seed * 3) % DOCTORS.length];
  return {
    id: `pat-${String(index + 1).padStart(3, '0')}`,
    name: fullName(seed * 5),
    clinic: doctor.clinic,
    doctor: doctor.name,
    caseId: `ND-${2300 + ((seed * 13) % 190)}`,
    workType: WORK_TYPES[seed % WORK_TYPES.length].name,
    age: 18 + ((seed * 17) % 58),
    stage: STAGES[seed % STAGES.length],
  };
});
