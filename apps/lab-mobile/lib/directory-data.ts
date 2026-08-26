import type { Tone } from '@/components/ui/pill';
import type { LocalizedText, UiStrings } from '@/lib/i18n';
import type { OrderStage } from '@/lib/mock-data';

/**
 * Deterministic demo directory. Rows are generated from fixed pools with
 * index arithmetic rather than `Math.random`, so every run — and every
 * screenshot — shows the same data.
 */

export type DirectoryStatus = 'active' | 'pending' | 'inactive';

export const STATUS_META: Record<DirectoryStatus, { labelKey: keyof UiStrings; tone: Tone }> = {
  active: { labelKey: 'statusActive', tone: 'success' },
  pending: { labelKey: 'statusPending', tone: 'warning' },
  inactive: { labelKey: 'statusInactive', tone: 'neutral' },
};

export type Doctor = {
  id: string;
  name: string;
  clinic: string;
  specialty: LocalizedText;
  phone: string;
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
  workType: LocalizedText;
  age: number;
  stage: OrderStage;
};

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

const CITIES: LocalizedText[] = [
  { en: 'Haifa', he: 'חיפה', ar: 'حيفا' },
  { en: 'Nazareth', he: 'נצרת', ar: 'الناصرة' },
  { en: 'Tel Aviv', he: 'תל אביב', ar: 'تل أبيب' },
  { en: 'Jerusalem', he: 'ירושלים', ar: 'القدس' },
  { en: 'Acre', he: 'עכו', ar: 'عكا' },
  { en: 'Tiberias', he: 'טבריה', ar: 'طبريا' },
];

const SPECIALTIES: LocalizedText[] = [
  { en: 'Prosthodontics', he: 'שיקום הפה', ar: 'استعاضة سنية' },
  { en: 'Implantology', he: 'אימפלנטולוגיה', ar: 'زراعة الأسنان' },
  { en: 'Orthodontics', he: 'יישור שיניים', ar: 'تقويم الأسنان' },
  { en: 'General dentistry', he: 'רפואת שיניים כללית', ar: 'طب أسنان عام' },
  { en: 'Periodontics', he: 'מחלות חניכיים', ar: 'أمراض اللثة' },
  { en: 'Oral surgery', he: 'כירורגיה פה ולסת', ar: 'جراحة الفم' },
];

const WORK_TYPES: LocalizedText[] = [
  { en: 'Zirconia crown', he: 'כתר זירקוניה', ar: 'تاج زيركونيا' },
  { en: 'E-max veneers', he: 'ציפויי E-max', ar: 'قشور E-max' },
  { en: 'Implant bridge', he: 'גשר על שתלים', ar: 'جسر زرعات' },
  { en: 'PFM crown', he: 'כתר חרסינה על מתכת', ar: 'تاج بورسلين على معدن' },
  { en: 'Night guard', he: 'סד לילה', ar: 'واقٍ ليلي' },
  { en: 'Partial denture', he: 'תותבת חלקית', ar: 'طقم جزئي' },
  { en: 'Inlay / onlay', he: 'אינליי / אונליי', ar: 'حشوة داخلية / خارجية' },
];

const STAGES: OrderStage[] = ['received', 'design', 'production', 'quality', 'courier', 'delivered'];

const STATUSES: DirectoryStatus[] = ['active', 'active', 'active', 'pending', 'active', 'inactive'];

/** `05x-xxx-xxxx`, stable per row. */
const phoneFor = (seed: number) =>
  `05${(seed % 5) + 2}-${String(200 + ((seed * 37) % 800))}-${String(1000 + ((seed * 613) % 9000))}`;

const fullName = (seed: number) =>
  `${FIRST_NAMES[seed % FIRST_NAMES.length]} ${LAST_NAMES[(seed * 7) % LAST_NAMES.length]}`;

export const DOCTORS: Doctor[] = Array.from({ length: 34 }, (_, index) => {
  const seed = index + 3;
  const activeCases = (seed * 5) % 14;
  return {
    id: `doc-${String(index + 1).padStart(3, '0')}`,
    name: `Dr. ${fullName(seed)}`,
    clinic: CLINIC_NAMES[seed % CLINIC_NAMES.length],
    specialty: SPECIALTIES[seed % SPECIALTIES.length],
    phone: phoneFor(seed),
    activeCases,
    totalCases: 40 + ((seed * 29) % 260),
    status: activeCases === 0 ? 'inactive' : STATUSES[seed % STATUSES.length],
  };
});

export const CLINICS: Clinic[] = CLINIC_NAMES.map((name, index) => {
  const seed = index + 2;
  const doctors = DOCTORS.filter((doctor) => doctor.clinic === name).length;
  return {
    id: `cli-${String(index + 1).padStart(3, '0')}`,
    name,
    city: CITIES[seed % CITIES.length],
    phone: phoneFor(seed * 3),
    doctors,
    activeCases: DOCTORS.filter((doctor) => doctor.clinic === name).reduce(
      (sum, doctor) => sum + doctor.activeCases,
      0
    ),
    outstanding: (seed * 740) % 9200,
    status: doctors === 0 ? 'inactive' : STATUSES[(seed * 2) % STATUSES.length],
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
    workType: WORK_TYPES[seed % WORK_TYPES.length],
    age: 18 + ((seed * 17) % 58),
    stage: STAGES[seed % STAGES.length],
  };
});
