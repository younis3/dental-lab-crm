import type { LocalizedText } from '@/lib/i18n';

/**
 * Demo courier board. Stops hang off a relative day slot (0 = today) instead of
 * a calendar date, so the run never empties out as time passes. Rows are built
 * from fixed pools with index arithmetic rather than `Math.random`, so every
 * launch shows the same board.
 */

export type DeliveryKind = 'drop' | 'pickup';

export type Driver = {
  id: string;
  name: string;
  /** Roster swatch, also used for the avatar. */
  color: string;
  phone: string;
  vehicle: LocalizedText;
  region: LocalizedText;
};

export type DeliveryStop = {
  id: string;
  driverId: string;
  /** 0 = today, 1 = tomorrow … kept relative so the demo never expires. */
  day: number;
  orderId: string;
  patient: string;
  clinic: string;
  city: LocalizedText;
  street: LocalizedText;
  houseNumber: number;
  /** `HH:MM`, always rendered left-to-right. */
  time: string;
  kind: DeliveryKind;
  /** Cases in the bag for this stop. */
  cases: number;
  urgent: boolean;
};

/** Sunday through Thursday — the lab's delivery week. */
export const DELIVERY_DAYS = 5;

export const DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Sami Nasser',
    color: '#5B7BE0',
    phone: '052-418-7730',
    vehicle: { en: 'Van · 42-118-53', he: 'מסחרית · 42-118-53' },
    region: { en: 'North', he: 'צפון' },
  },
  {
    id: 'drv-2',
    name: 'Yossi Peretz',
    color: '#3F8A6E',
    phone: '053-207-4461',
    vehicle: { en: 'Scooter · 91-704-22', he: 'קטנוע · 91-704-22' },
    region: { en: 'Tel Aviv & centre', he: 'תל אביב והמרכז' },
  },
  {
    id: 'drv-3',
    name: 'Rami Khoury',
    color: '#B4822F',
    phone: '054-882-1096',
    vehicle: { en: 'Van · 27-355-84', he: 'מסחרית · 27-355-84' },
    region: { en: 'Jerusalem & south', he: 'ירושלים והדרום' },
  },
];

const CITY = {
  haifa: { en: 'Haifa', he: 'חיפה' },
  acre: { en: 'Acre', he: 'עכו' },
  nazareth: { en: 'Nazareth', he: 'נצרת' },
  karmiel: { en: 'Karmiel', he: 'כרמיאל' },
  tiberias: { en: 'Tiberias', he: 'טבריה' },
  telAviv: { en: 'Tel Aviv', he: 'תל אביב' },
  ramatGan: { en: 'Ramat Gan', he: 'רמת גן' },
  herzliya: { en: 'Herzliya', he: 'הרצליה' },
  netanya: { en: 'Netanya', he: 'נתניה' },
  petahTikva: { en: 'Petah Tikva', he: 'פתח תקווה' },
  jerusalem: { en: 'Jerusalem', he: 'ירושלים' },
  beersheba: { en: 'Beersheba', he: 'באר שבע' },
  ashdod: { en: 'Ashdod', he: 'אשדוד' },
  ashkelon: { en: 'Ashkelon', he: 'אשקלון' },
  rishon: { en: 'Rishon LeZion', he: 'ראשון לציון' },
} satisfies Record<string, LocalizedText>;

const STREETS: LocalizedText[] = [
  { en: 'Herzl St', he: 'רחוב הרצל' },
  { en: 'Ben Gurion Blvd', he: 'שדרות בן גוריון' },
  { en: 'HaNassi Ave', he: 'שדרות הנשיא' },
  { en: 'Jaffa St', he: 'רחוב יפו' },
  { en: 'Weizmann St', he: 'רחוב ויצמן' },
  { en: 'HaAtzmaut St', he: 'רחוב העצמאות' },
  { en: 'Sokolov St', he: 'רחוב סוקולוב' },
  { en: 'Allenby St', he: 'רחוב אלנבי' },
];

/** Clinic and city travel together so a driver never leaves their region. */
type Destination = { clinic: string; city: LocalizedText };

const ROUTES: Record<string, Destination[]> = {
  'drv-1': [
    { clinic: 'Bright Smile Clinic', city: CITY.haifa },
    { clinic: 'Carmel Dental Centre', city: CITY.haifa },
    { clinic: 'Marina Smile Studio', city: CITY.acre },
    { clinic: 'Galilee Dental Care', city: CITY.nazareth },
    { clinic: 'Northgate Dental', city: CITY.karmiel },
    { clinic: 'Kinneret Oral Care', city: CITY.tiberias },
    { clinic: 'Cedar Dental', city: CITY.haifa },
  ],
  'drv-2': [
    { clinic: 'Dentaris Center', city: CITY.telAviv },
    { clinic: 'Rothschild Dental Loft', city: CITY.telAviv },
    { clinic: 'Peak Dental Studio', city: CITY.ramatGan },
    { clinic: 'Marina Implant Centre', city: CITY.herzliya },
    { clinic: 'Aurora Dental Care', city: CITY.netanya },
    { clinic: 'Green Valley Dental', city: CITY.petahTikva },
    { clinic: 'Lumina Dental', city: CITY.telAviv },
  ],
  'drv-3': [
    { clinic: 'Alma Dental Clinic', city: CITY.jerusalem },
    { clinic: 'Crescent Dental', city: CITY.jerusalem },
    { clinic: 'Negev Smile Studio', city: CITY.beersheba },
    { clinic: 'Harbour Dental Group', city: CITY.ashdod },
    { clinic: 'Vista Oral Care', city: CITY.ashkelon },
    { clinic: 'Orchid Family Dental', city: CITY.rishon },
    { clinic: 'Elite Implant Centre', city: CITY.jerusalem },
  ],
};

const PATIENT_NAMES = [
  'Layla Hassan', 'Omar Khalil', 'Maya Cohen', 'Yusuf Amara', 'Sara Mansour', 'Adam Nassar',
  'Noa Levi', 'Karim Haddad', 'Dana Shani', 'Elias Khoury', 'Hala Zoabi', 'Ziad Daher',
  'Rotem Bar', 'Salma Tannous', 'Itai Peretz', 'Nadia Sabbagh', 'Fadi Karam', 'Yara Shami',
  'Tamar Azulay', 'Basel Hijazi', 'Rana Odeh', 'Gil Avraham', 'Sahar Aziz', 'Amir Barakat',
  'Michal Dayan', 'Tarek Younis', 'Shira Mizrahi', 'Rami Salem',
];

/** Runs from 08:30 in 55 minute legs, so a seven stop day ends at 14:00. */
function timeAt(slot: number): string {
  const minutes = 8 * 60 + 30 + slot * 55;
  const hours = Math.floor(minutes / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** 4 – 7 stops, spread so no two drivers share the same daily load. */
function stopCount(driverIndex: number, day: number): number {
  return 4 + ((driverIndex * 5 + day * 3 + 1) % 4);
}

export const DELIVERY_STOPS: DeliveryStop[] = (() => {
  const stops: DeliveryStop[] = [];
  // Runs across the whole board so case numbers and patients never repeat
  // inside a single day's run.
  let serial = 0;

  DRIVERS.forEach((driver, driverIndex) => {
    const destinations = ROUTES[driver.id];

    for (let day = 0; day < DELIVERY_DAYS; day += 1) {
      const count = stopCount(driverIndex, day);

      for (let slot = 0; slot < count; slot += 1) {
        const seed = driverIndex * 37 + day * 13 + slot * 7;
        const destination = destinations[(day * 2 + slot) % destinations.length];

        stops.push({
          id: `stop-${driver.id}-${day}-${slot}`,
          driverId: driver.id,
          day,
          orderId: `ND-${2401 + serial}`,
          patient: PATIENT_NAMES[serial % PATIENT_NAMES.length],
          clinic: destination.clinic,
          city: destination.city,
          street: STREETS[(seed * 3) % STREETS.length],
          houseNumber: 3 + ((seed * 13) % 74),
          time: timeAt(slot),
          kind: seed % 4 === 1 ? 'pickup' : 'drop',
          cases: 1 + (seed % 3),
          urgent: seed % 11 === 3,
        });

        serial += 1;
      }
    }
  });

  return stops;
})();

export function driverById(id: string): Driver | undefined {
  return DRIVERS.find((driver) => driver.id === id);
}
