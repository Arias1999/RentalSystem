export interface Booking {
  id: string;
  car: string;
  carType: string;
  carImage: string;
  pickup: string;
  pickupDate: string;
  pickupTime: string;
  dropDate: string;
  dropTime: string;
  option: string;
  dropoff?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  dailyRate?: number;
  rentalDays?: number;
  totalPrice?: number;
  promoCode?: string;
  discountAmount?: number;
  subtotal?: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Returned';
  createdAt: string;
}

const KEY = 'driveeasy_bookings';

export function getBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function saveBooking(b: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking {
  const booking: Booking = { ...b, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'Pending' };
  const all = getBookings();
  localStorage.setItem(KEY, JSON.stringify([booking, ...all]));
  return booking;
}

export function cancelBooking(id: string): void {
  const all = getBookings().map(b => b.id === id ? { ...b, status: 'Cancelled' as const } : b);
  localStorage.setItem(KEY, JSON.stringify(all));
}
