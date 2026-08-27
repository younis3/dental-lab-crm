import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CLINICS,
  DOCTORS,
  PATIENTS,
  WORK_TYPES,
  workTypeKey,
  type Clinic,
  type Doctor,
  type Patient,
  type WorkType,
} from '@/lib/directory-data';
import { createStore } from '@/lib/store';

/**
 * The directory the lab edits: doctors, clinics, patients and the work type
 * price list. Seeded from the demo data, then owner additions land on top.
 */
type DirectoryState = {
  doctors: Doctor[];
  clinics: Clinic[];
  patients: Patient[];
  workTypes: WorkType[];
};

/**
 * Bumped with the seed: an older copy can hold statuses this build no longer
 * knows, and case counts that contradict them. Dropping it re-seeds instead.
 */
const STORAGE_KEY = 'lab-mobile:directory-v2';

const store = createStore<DirectoryState>({
  doctors: DOCTORS,
  clinics: CLINICS,
  patients: PATIENTS,
  workTypes: WORK_TYPES,
});

export const useDirectory = store.use;

function persist(state: DirectoryState) {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** `doc-035`, so a generated id keeps the shape of the seeded ones. */
function idFor(prefix: string, rows: { id: string }[]): string {
  const highest = rows.reduce((max, row) => {
    const value = Number.parseInt(row.id.slice(prefix.length + 1), 10);
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);
  return `${prefix}-${String(highest + 1).padStart(3, '0')}`;
}

/** `ND-2490` — one past the highest case number on file. */
function nextCaseId(patients: Patient[]): string {
  const highest = patients.reduce((max, patient) => {
    const value = Number.parseInt(patient.caseId.replace(/\D/g, ''), 10);
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 2300);
  return `ND-${highest + 1}`;
}

export type DoctorDraft = Pick<Doctor, 'name' | 'clinic' | 'specialty' | 'phone' | 'email'>;
export type ClinicDraft = Pick<Clinic, 'name' | 'city' | 'phone'>;
export type PatientDraft = Pick<Patient, 'name' | 'doctor' | 'clinic' | 'workType' | 'age'>;
export type WorkTypeDraft = Pick<WorkType, 'name' | 'category' | 'price' | 'turnaround'>;

/**
 * New rows go in at the front so the owner lands on their addition instead of
 * hunting for it on the last page of the table.
 */
export function addDoctor(draft: DoctorDraft) {
  store.set((prev) => {
    const doctor: Doctor = {
      ...draft,
      id: idFor('doc', prev.doctors),
      activeCases: 0,
      totalCases: 0,
      status: 'active',
    };
    const next = {
      ...prev,
      doctors: [doctor, ...prev.doctors],
      // The clinics table shows a doctor count, which would otherwise disagree
      // with the doctors table the moment a doctor is added.
      clinics: prev.clinics.map((clinic) =>
        clinic.name === doctor.clinic ? { ...clinic, doctors: clinic.doctors + 1 } : clinic
      ),
    };
    persist(next);
    return next;
  });
}

export function addClinic(draft: ClinicDraft) {
  store.set((prev) => {
    const clinic: Clinic = {
      ...draft,
      id: idFor('cli', prev.clinics),
      doctors: 0,
      activeCases: 0,
      outstanding: 0,
      status: 'active',
    };
    const next = { ...prev, clinics: [clinic, ...prev.clinics] };
    persist(next);
    return next;
  });
}

export function addPatient(draft: PatientDraft) {
  store.set((prev) => {
    const patient: Patient = {
      ...draft,
      id: idFor('pat', prev.patients),
      caseId: nextCaseId(prev.patients),
      stage: 'received',
    };
    const next = { ...prev, patients: [patient, ...prev.patients] };
    persist(next);
    return next;
  });
}

export function addWorkType(draft: WorkTypeDraft) {
  store.set((prev) => {
    const workType: WorkType = {
      ...draft,
      id: idFor('wt', prev.workTypes),
      status: 'active',
    };
    const next = { ...prev, workTypes: [workType, ...prev.workTypes] };
    persist(next);
    return next;
  });
}

/** Everything the owner can change on a price list row after it exists. */
export type WorkTypeEdit = WorkTypeDraft & Pick<WorkType, 'status'>;

/**
 * Cases copy the work type name when they are created, so a rename is pushed
 * onto them too — otherwise the patients table keeps the old wording and the
 * row's case count drops to zero.
 */
export function updateWorkType(id: string, edit: WorkTypeEdit) {
  store.set((prev) => {
    const current = prev.workTypes.find((workType) => workType.id === id);
    if (!current) return prev;

    const previousKey = workTypeKey(current.name);
    const renamed = previousKey !== workTypeKey(edit.name);

    const next = {
      ...prev,
      workTypes: prev.workTypes.map((workType) =>
        workType.id === id ? { ...workType, ...edit } : workType
      ),
      patients: renamed
        ? prev.patients.map((patient) =>
            workTypeKey(patient.workType) === previousKey
              ? { ...patient, workType: edit.name }
              : patient
          )
        : prev.patients,
    };
    persist(next);
    return next;
  });
}

/** A saved list replaces its seed only when it actually holds rows. */
function restored<T>(saved: T[] | undefined, seed: T[]): T[] {
  return Array.isArray(saved) && saved.length > 0 ? saved : seed;
}

export async function hydrateDirectory() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved) as Partial<DirectoryState>;
    store.set((prev) => ({
      doctors: restored(parsed.doctors, prev.doctors),
      clinics: restored(parsed.clinics, prev.clinics),
      patients: restored(parsed.patients, prev.patients),
      workTypes: restored(parsed.workTypes, prev.workTypes),
    }));
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
