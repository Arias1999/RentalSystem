import { redirect } from 'next/navigation';

type BookingRouteProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Keep /booking/[id] as the public booking URL while reusing the existing,
 * authenticated vehicle detail/booking flow at /cars/[id].
 */
export default async function VehicleBookingRoute({ params, searchParams }: BookingRouteProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const safeId = encodeURIComponent(id);
  const forwarded = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') forwarded.set(key, value);
    else if (Array.isArray(value)) value.forEach(item => forwarded.append(key, item));
  }

  forwarded.set('book', '1');
  const queryString = forwarded.toString();
  redirect(`/cars/${safeId}${queryString ? `?${queryString}` : ''}`);
}
