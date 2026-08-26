import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';

import { createStore } from '@/lib/store';
import type { AuthUser } from '@/store/auth-store';
import type { StaffMember } from '@/store/staff-store';

/**
 * Internal work management. Two-level hierarchy: head tasks plus one level of
 * subtasks — a subtask can never become a parent. Completed tasks move to the
 * archive unless their assignee marks them done, in which case they wait for a
 * manager (anyone with `manageTasks`) to confirm them first.
 */
export type TaskStatus = 'open' | 'pendingReview' | 'archived';

export type Task = {
  id: string;
  title: string;
  notes: string;
  /** ISO date of the due day, or null when the task has no deadline. */
  dueDate: string | null;
  /** Staff member id the task is assigned to. */
  assigneeId: string;
  /** Auth id of whoever created the task. */
  createdById: string;
  createdByName: string;
  /** Head tasks keep their children here; subtasks keep their parent's id. */
  parentId: string | null;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
};

export type TaskDraft = Pick<Task, 'title' | 'notes' | 'dueDate' | 'assigneeId'> & {
  parentId?: string | null;
};

const STORAGE_KEY = 'lab-mobile:tasks:v3';

const isoDay = (offsetDays: number) => {
  const date = new Date(Date.now() + offsetDays * 86_400_000);
  date.setHours(17, 0, 0, 0);
  return date.toISOString();
};

const SEED: Task[] = [
  {
    id: 't-1',
    title: 'Pour models for ND-2417',
    notes: 'Full arch implant bridge — double-check pin placement before pouring.',
    dueDate: isoDay(0),
    assigneeId: 'st-2',
    createdById: 'u-owner',
    createdByName: 'Nadeem Younis',
    parentId: null,
    status: 'open',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    completedAt: null,
  },
  {
    id: 't-1a',
    title: 'Box the impressions',
    notes: 'Keep the Peak Dental trays in the same bag. Label the box ND-2417 before it goes to pour.',
    dueDate: isoDay(0),
    assigneeId: 'st-2',
    createdById: 'u-owner',
    createdByName: 'Nadeem Younis',
    parentId: 't-1',
    status: 'open',
    createdAt: new Date(Date.now() - 3_400_000).toISOString(),
    completedAt: null,
  },
  {
    id: 't-1b',
    title: 'Mix stone and pour',
    notes: 'Type IV stone, vacuum mix 30 seconds. Pour the full arch first, then the opposing.',
    dueDate: isoDay(0),
    assigneeId: 'st-2',
    createdById: 'u-owner',
    createdByName: 'Nadeem Younis',
    parentId: 't-1',
    status: 'open',
    createdAt: new Date(Date.now() - 3_200_000).toISOString(),
    completedAt: null,
  },
  {
    id: 't-1c',
    title: 'Trim bases and pin',
    notes: 'Trim to the vestibule, then pin the working model. Check the pin seats before it dries fully.',
    dueDate: isoDay(0),
    assigneeId: 'st-3',
    createdById: 'u-owner',
    createdByName: 'Nadeem Younis',
    parentId: 't-1',
    status: 'open',
    createdAt: new Date(Date.now() - 3_000_000).toISOString(),
    completedAt: null,
  },
  {
    id: 't-1d',
    title: 'Photo the pour for the case file',
    notes: 'Top and side shots on the grey board. Upload to the case folder before handing off to design.',
    dueDate: isoDay(0),
    assigneeId: 'st-2',
    createdById: 'u-owner',
    createdByName: 'Nadeem Younis',
    parentId: 't-1',
    status: 'open',
    createdAt: new Date(Date.now() - 2_800_000).toISOString(),
    completedAt: null,
  },
  {
    id: 't-2',
    title: 'Scan impressions from Peak Dental',
    notes: '',
    dueDate: isoDay(0),
    assigneeId: 'st-3',
    createdById: 'u-owner',
    createdByName: 'Nadeem Younis',
    parentId: null,
    status: 'open',
    createdAt: new Date(Date.now() - 7_200_000).toISOString(),
    completedAt: null,
  },
  {
    id: 't-3',
    title: 'Design crown ND-2415',
    notes: 'Six E-max veneers — start with the centrals.',
    dueDate: isoDay(1),
    assigneeId: 'st-2',
    createdById: 'u-owner',
    createdByName: 'Nadeem Younis',
    parentId: null,
    status: 'open',
    createdAt: new Date(Date.now() - 14_400_000).toISOString(),
    completedAt: null,
  },
  {
    id: 't-3a',
    title: 'Check margin line with Dr. Saleh',
    notes: 'Call before 2pm. He wants the finish line dropped 0.3mm on the palatal of 11 and 21.',
    dueDate: isoDay(1),
    assigneeId: 'st-3',
    createdById: 'u-tech',
    createdByName: 'Karim Haddad',
    parentId: 't-3',
    status: 'open',
    createdAt: new Date(Date.now() - 12_000_000).toISOString(),
    completedAt: null,
  },
  {
    id: 't-4',
    title: 'Glaze batch — anterior crowns',
    notes: '',
    dueDate: isoDay(1),
    assigneeId: 'st-3',
    createdById: 'u-owner',
    createdByName: 'Nadeem Younis',
    parentId: null,
    status: 'open',
    createdAt: new Date(Date.now() - 20_000_000).toISOString(),
    completedAt: null,
  },
  {
    id: 't-5',
    title: 'QC check ND-2418 before courier',
    notes: 'Shade match against the tab photo.',
    dueDate: isoDay(0),
    assigneeId: 'st-4',
    createdById: 'u-owner',
    createdByName: 'Nadeem Younis',
    parentId: null,
    status: 'open',
    createdAt: new Date(Date.now() - 28_800_000).toISOString(),
    completedAt: null,
  },
  {
    id: 't-6',
    title: 'Order zirconia blanks (A2, A3)',
    notes: 'Supplier: DentaSupply. Last order was 2 boxes.',
    dueDate: isoDay(3),
    assigneeId: 'st-2',
    createdById: 'u-owner',
    createdByName: 'Nadeem Younis',
    parentId: null,
    status: 'open',
    createdAt: new Date(Date.now() - 40_000_000).toISOString(),
    completedAt: null,
  },
  {
    id: 't-7',
    title: 'Polish night guard ND-2412',
    notes: '',
    dueDate: isoDay(-1),
    assigneeId: 'st-3',
    createdById: 'u-owner',
    createdByName: 'Nadeem Younis',
    parentId: null,
    status: 'pendingReview',
    createdAt: new Date(Date.now() - 90_000_000).toISOString(),
    completedAt: new Date(Date.now() - 5_000_000).toISOString(),
  },
  {
    id: 't-8',
    title: 'Calibrate milling machine',
    notes: 'Weekly calibration, log the spindle reading.',
    dueDate: isoDay(-2),
    assigneeId: 'st-2',
    createdById: 'u-owner',
    createdByName: 'Nadeem Younis',
    parentId: null,
    status: 'archived',
    createdAt: new Date(Date.now() - 180_000_000).toISOString(),
    completedAt: new Date(Date.now() - 60_000_000).toISOString(),
  },
  {
    id: 't-9',
    title: 'Clean scanner tips',
    notes: '',
    dueDate: isoDay(-3),
    assigneeId: 'st-6',
    createdById: 'u-tech',
    createdByName: 'Karim Haddad',
    parentId: null,
    status: 'archived',
    createdAt: new Date(Date.now() - 260_000_000).toISOString(),
    completedAt: new Date(Date.now() - 120_000_000).toISOString(),
  },
];

const store = createStore<{ tasks: Task[] }>({ tasks: SEED });

export const useTasks = store.use;

function persist(tasks: Task[]) {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function setTasks(tasks: Task[]) {
  store.set({ tasks });
  persist(tasks);
}

/** Head tasks in display order. Subtasks live under a parent and never count as board items. */
export function visibleTasks(tasks: Task[], predicate: (task: Task) => boolean): Task[] {
  return tasks.filter((task) => task.parentId === null && predicate(task));
}

export function subtasksOf(tasks: Task[], parentId: string): Task[] {
  return tasks.filter((task) => task.parentId === parentId);
}

export function taskById(tasks: Task[], id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}

/**
 * Auth accounts and the staff roster are linked by phone number — the demo
 * signs in with the same phone the roster row carries.
 */
export function staffIdForUser(user: AuthUser | null, staff: StaffMember[]): string | null {
  if (!user) return null;
  const match = staff.find((member) => member.phone === user.phone);
  return match?.id ?? null;
}

/**
 * Edit/delete rights: the creator always manages their own task; managers
 * (lab owner, or staff with the `manageTasks` override) manage everything.
 */
export function canManageTask(task: Task, user: AuthUser | null, isManager: boolean): boolean {
  if (!user) return false;
  return isManager || task.createdById === user.id;
}

export function createTask(draft: TaskDraft, user: AuthUser): Task {
  const tasks = store.get().tasks;
  const task: Task = {
    id: `t-${Date.now().toString(36)}`,
    title: draft.title.trim(),
    notes: draft.notes.trim(),
    dueDate: draft.dueDate,
    assigneeId: draft.assigneeId,
    createdById: user.id,
    createdByName: user.name,
    parentId: draft.parentId ?? null,
    status: 'open',
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  if (task.parentId) {
    // Insert right after the parent so the subtask list stays contiguous.
    const parentIndex = tasks.findIndex((row) => row.id === task.parentId);
    const next = [...tasks];
    next.splice(parentIndex + 1, 0, task);
    setTasks(next);
  } else {
    setTasks([task, ...tasks]);
  }
  return task;
}

export function updateTask(id: string, draft: TaskDraft) {
  setTasks(
    store.get().tasks.map((task) =>
      task.id === id
        ? { ...task, title: draft.title.trim(), notes: draft.notes.trim(), dueDate: draft.dueDate, assigneeId: draft.assigneeId }
        : task
    )
  );
}

export function deleteTask(id: string) {
  // Deleting a head task removes its subtasks with it.
  setTasks(store.get().tasks.filter((task) => task.id !== id && task.parentId !== id));
}

/**
 * Done means archived for managers; anyone else files the task for review so
 * the manager confirms the work before it disappears from the board.
 */
export function completeTask(id: string, isManager: boolean) {
  setTasks(
    store.get().tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            status: isManager ? 'archived' : 'pendingReview',
            completedAt: new Date().toISOString(),
          }
        : task
    )
  );
}

export function confirmTask(id: string) {
  setTasks(
    store.get().tasks.map((task) => (task.id === id ? { ...task, status: 'archived' } : task))
  );
}

/** Back to the board, either from the review queue or from the archive. */
export function reopenTask(id: string) {
  setTasks(
    store.get().tasks.map((task) =>
      task.id === id ? { ...task, status: 'open', completedAt: null } : task
    )
  );
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Reorder a sibling group. `orderedIds` is the current visual order (a subset
 * when a filter is on); `from`/`to` are indexes in that list. Hidden siblings
 * keep their slots so a "Mine" drag never reshuffles someone else's tasks.
 */
export function moveAmong(orderedIds: string[], from: number, to: number) {
  if (orderedIds.length < 2) return;
  const clamped = Math.max(0, Math.min(to, orderedIds.length - 1));
  if (from === clamped || from < 0) return;

  const nextIds = moveItem(orderedIds, from, clamped);
  const tasks = store.get().tasks;
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const first = byId.get(nextIds[0]);
  if (!first) return;

  const parentId = first.parentId;
  const idSet = new Set(nextIds);
  const queue = [...nextIds];

  if (parentId === null) {
    const heads = tasks.filter((task) => task.parentId === null);
    const newHeads = heads.map((head) =>
      idSet.has(head.id) ? byId.get(queue.shift() as string)! : head
    );
    const next: Task[] = [];
    for (const head of newHeads) {
      next.push(head);
      next.push(...tasks.filter((task) => task.parentId === head.id));
    }
    setTasks(next);
    return;
  }

  const children = tasks.filter((task) => task.parentId === parentId);
  const newChildren = children.map((child) =>
    idSet.has(child.id) ? byId.get(queue.shift() as string)! : child
  );
  const next: Task[] = [];
  for (const task of tasks) {
    if (task.parentId === parentId) continue;
    next.push(task);
    if (task.id === parentId) next.push(...newChildren);
  }
  setTasks(next);
}

export async function hydrateTasks() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved) as Task[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      store.set({ tasks: parsed });
    }
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
