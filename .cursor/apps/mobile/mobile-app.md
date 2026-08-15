# Product Requirements Document (PRD) & Mobile Execution Plan
**Project:** Doctor Mobile App for Dental Laboratory Communication  
**Target Stack:** Expo (React Native), TypeScript, NativeWind (Tailwind CSS), React Navigation / Expo Router, TanStack Query, Zustand, React Hook Form, Zod.

---

## 📌 Architecture & Design Guidelines
- **UI & UX Aesthetic:** Clean, modern iOS/Android native feel. Subtle card shadows, haptic feedback on interactions, responsive touch targets, and dark/light mode support.
- **Backend Architecture:** Mobile Frontend-only initially. All data calls pass through a simulated local storage layer using `AsyncStorage` / `expo-sqlite` and TanStack Query with artificial latency (300-500ms).
- **Type Safety:** Strict TypeScript interfaces and Zod schemas shared across screens and state hooks.

---

## 🎯 STEP-BY-STEP IMPLEMENTATION PLAN

Execute each sub-task sequentially. Do not move to the next task until the current task is verified and passing.

---

### Phase 1: Expo Setup & Authentication Flow

#### Sub-Task 1.1: Project Scaffolding & Directory Setup
- [ ] Initialize Expo app with TypeScript template:
  - `@/types` (TypeScript definitions)
  - `@/lib/schemas` (Zod schemas)
  - `@/lib/storage` (AsyncStorage mock utilities)
  - `@/store` (Zustand state stores)
  - `@/components/ui` (Reusable NativeWind primitives)
  - `@/components/navigation` (Tabs, Stack headers)
  - `@/app` or `@/screens` (Expo Router screens)
- [ ] Install core dependencies: `nativewind`, `lucide-react-native`, `@tanstack/react-query`, `zustand`, `@react-native-async-storage/async-storage`, `react-hook-form`, `@hookform/resolvers`, `zod`, `expo-haptics`.

#### Sub-Task 1.2: Authentication Store & Navigation Guard
- [ ] Create `@/store/useAuthStore.ts` using Zustand to store:
  - `user`: `{ id, name, clinicName, phone, role } | null`
  - `isAuthenticated`: `boolean`
  - `token`: `string | null`
  - Actions: `login()`, `logout()`, `verifyOtp()`
- [ ] Implement `AsyncStorage` persistence for user session data.
- [ ] Implement layout protection using Expo Router's `(app)` and `(auth)` group stack guards.

#### Sub-Task 1.3: Two-Step Mobile Login Screen (`app/(auth)/login.tsx`)
- [ ] Build clean mobile authentication screen layout using `KeyboardAvoidingView`.
- [ ] **Step 1 Form:** Phone Number + Password (React Hook Form + Zod).
  - Include a prominent **"Fill Demo Credentials"** button that populates:
    - Phone: `+1 (555) 019-2834`
    - Password: `DentalLab2026!`
- [ ] **Step 2 Form:** 4-Digit OTP Verification.
  - Customized 4-box PIN input component with auto-focus and auto-submit on 4th digit (Demo OTP: `1234`).
  - Trigger native Alert or Toast showing the demo code `1234`.
- [ ] Redirect to `(app)/(tabs)/dashboard` upon successful OTP entry.

---

### Phase 2: Core Mobile Shell & Storage Mock Engine

#### Sub-Task 2.1: AsyncStorage Mock Database (`/lib/storage`)
- [ ] Create seed data file `@/lib/storage/seedData.ts` populated with realistic data for:
  - **Orders:** 10+ jobs across stages (*Received*, *In Production*, *Quality Check*, *Out for Courier*, *Delivered*). Include tooth numbers, shade, STL files, patient name, and return schedule alerts.
  - **Messages:** Chat threads per order + general lab support chat with unread counters and priority tags.
  - **Financials:** Invoices, receipts, total balance, spend metrics.
  - **Courier Requests:** Pickup history, supply orders, delivery notes.
- [ ] Build helper utility `@/lib/storage/db.ts` to read/write `AsyncStorage` keys and reset to seed data if empty.

#### Sub-Task 2.2: Mobile Tab Bar & Screen Headers
- [ ] Create bottom tab navigator (`app/(app)/(tabs)/_layout.tsx`):
  - Tabs with icons: Dashboard, Inbox, Chat, Financials, Courier.
  - Native header showing Doctor profile badge, clinic switcher modal, and dark mode toggle.

---

### Phase 3: Mobile Feature Screens Implementation

#### Sub-Task 3.1: Dashboard Screen (`dashboard.tsx`)
- [ ] Build swipeable/scrollable summary cards for Active Jobs, Pending Invoices, Unread Messages, and Courier Pickups.
- [ ] Build **Alerts & Exceptions Banner** notifying of schedule delays or required action.
- [ ] Build **Work Status Summary Progress Bar** showing distribution of active cases.
- [ ] Add **Floating / Quick Action Buttons**: "New Order Request", "Request Courier Pickup".
- [ ] Add "Brosh Dental Reviews" guides & professional opinions link block.

#### Sub-Task 3.2: Inbox Live Screen (`inbox.tsx`)
- [ ] Build virtualized list (`FlatList`) displaying all clinic orders.
- [ ] Order Item Card: Order ID, Patient Name, Work Type, Stage Badge, Schedule Return Alert Date, Favorite Star toggle.
- [ ] Implement top search bar and filter chip carousel (Stage, Date Range, Priority Favorites).

#### Sub-Task 3.3: Order Details & Work Stages (`orders/[id].tsx`)
- [ ] Build order status timeline visualizer (Vertical/Horizontal step pipeline).
- [ ] Build spec card (Material, tooth numbers, shade guide, doctor notes).
- [ ] Build **Media & File Picker**: Upload photos/scans directly from camera roll or files app.
- [ ] Add quick bottom bar to launch chat directly tied to this order.

#### Sub-Task 3.4: Chat System (`chat/index.tsx` & `chat/[id].tsx`)
- [ ] Build mobile message list view using `FlatList` with `inverted` layout.
- [ ] Support photo attachment picker and image preview modal.
- [ ] Support message priority tagging (*High Priority*, *Action Required*).
- [ ] Implement simulated automated response from lab technician when a message is sent.

#### Sub-Task 3.5: Financial Reports Screen (`financials.tsx`)
- [ ] Build summary cards: Outstanding Balance, Monthly Spend, Paid Invoices.
- [ ] Build filterable invoice/ledger list with PDF preview action sheet.

#### Sub-Task 3.6: Courier & Packaging Screen (`courier.tsx`)
- [ ] Build **Pickup Request Form** in a Bottom Sheet Modal (`@gorhom/bottom-sheet`):
  - Pickup date, impression count, driver special notes.
- [ ] Build delivery tracker card and historical pickup log.

#### Sub-Task 3.7: Analytics Screen (`analytics.tsx`)
- [ ] Integrate React Native SVG charts (`react-native-wagmi-charts` or `react-native-gifted-charts`) for:
  - Monthly order volume trends.
  - Lab turnaround speed metrics.
