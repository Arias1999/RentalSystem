'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Activity, ArrowDownRight, ArrowUpRight, CalendarDays, CarFront, CircleDollarSign, Clock3, LayoutDashboard, LogOut, Plus, RefreshCw, Search, ShieldAlert, Trash2, Users, Pencil, X, MapPin, Radio, MessageCircle, Send } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { logout } from '@/lib/auth';

const VehicleMap = dynamic(() => import('@/components/MapView'), { ssr: false });

type Booking = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  car_name: string;
  car_type: string;
  pickup_location: string;
  dropoff_location: string | null;
  pickup_date: string;
  dropoff_date: string;
  total_price: number | null;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Returned';
  created_at: string;
};

type Profile = { id: string; full_name: string; created_at: string };
type CarRow = { id: number; name: string; category: string; transmission: string; seats: number; fuel: string; daily_rate: number; image_url: string; available: boolean; description: string; features: string[] };
type VehicleLocation = { car_id: number; latitude: number; longitude: number; recorded_at: string; speed_kph: number | null; heading: number | null };
type CustomerMessage = { id: string; customer_id: string; customer_name: string; customer_email: string; customer_phone: string | null; message: string; admin_reply: string | null; created_at: string; replied_at: string | null };
type CarForm = Omit<CarRow, 'id'>;
type Tab = 'Overview' | 'Bookings' | 'Customers' | 'Fleet' | 'Tracking' | 'Messages';
const emptyCar: CarForm = { name: '', category: 'Sedan', transmission: 'Automatic', seats: 5, fuel: 'Gasoline', daily_rate: 0, image_url: '', available: true, description: '', features: [] };

const statusStyle: Record<Booking['status'], { bg: string; color: string }> = {
  Pending: { bg: '#fff7df', color: '#9a6700' },
  Confirmed: { bg: '#e8f5ee', color: '#1a6b3c' },
  Cancelled: { bg: '#fff0ef', color: '#b42318' },
  Returned: { bg: '#eaf2ff', color: '#2868b2' },
};

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('Overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [cars, setCars] = useState<CarRow[]>([]);
  const [vehicleLocations, setVehicleLocations] = useState<VehicleLocation[]>([]);
  const [customerMessages, setCustomerMessages] = useState<CustomerMessage[]>([]);
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [trackingError, setTrackingError] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [carForm, setCarForm] = useState<CarForm>(emptyCar);
  const [editingCarId, setEditingCarId] = useState<number | null>(null);
  const [carDialogOpen, setCarDialogOpen] = useState(false);
  const [savingCar, setSavingCar] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    setAccessDenied(false);
    const supabase = getSupabaseBrowserClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      router.replace('/login?next=%2Fadmin');
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('full_name, role').eq('id', authData.user.id).maybeSingle();
    if (profileError) {
      setError(profileError.message.includes('role')
        ? 'Admin setup is not complete. Run the admin dashboard migration in Supabase SQL Editor.'
        : profileError.message);
      setLoading(false);
      return;
    }
    if (profile?.role !== 'admin') {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    setAdminName(profile.full_name || authData.user.email || 'Admin');
    const [bookingResult, customerResult, carsResult] = await Promise.all([
      supabase.from('bookings').select('id, customer_name, customer_email, customer_phone, car_name, car_type, pickup_location, dropoff_location, pickup_date, dropoff_date, total_price, status, created_at').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }),
      supabase.from('cars').select('id, name, category, transmission, seats, fuel, daily_rate, image_url, available, description, features').order('id'),
    ]);
    if (bookingResult.error || customerResult.error || carsResult.error) {
      setError(bookingResult.error?.message || customerResult.error?.message || carsResult.error?.message || 'Could not load dashboard data.');
    } else {
      setBookings((bookingResult.data || []) as Booking[]);
      setCustomers((customerResult.data || []) as Profile[]);
      setCars((carsResult.data || []) as CarRow[]);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const loadVehicleLocations = useCallback(async () => {
    setTrackingLoading(true);
    setTrackingError('');
    const { data, error: locationError } = await getSupabaseBrowserClient()
      .from('vehicle_locations')
      .select('car_id, latitude, longitude, recorded_at, speed_kph, heading')
      .order('recorded_at', { ascending: false });
    if (locationError) setTrackingError(locationError.message);
    else setVehicleLocations((data || []) as VehicleLocation[]);
    setTrackingLoading(false);
  }, []);

  useEffect(() => {
    if (tab !== 'Tracking') return;
    void loadVehicleLocations();
    const interval = window.setInterval(() => void loadVehicleLocations(), 30000);
    return () => window.clearInterval(interval);
  }, [tab, loadVehicleLocations]);

  const loadCustomerMessages = useCallback(async () => {
    setMessagesLoading(true);
    const { data, error: queryError } = await getSupabaseBrowserClient().from('customer_messages')
      .select('id, customer_id, customer_name, customer_email, customer_phone, message, admin_reply, created_at, replied_at')
      .order('created_at', { ascending: false });
    if (queryError) setMessagesError(queryError.message);
    else {
      setMessagesError('');
      setCustomerMessages((data || []) as CustomerMessage[]);
    }
    setMessagesLoading(false);
  }, []);

  useEffect(() => {
    if (tab !== 'Messages') return;
    void loadCustomerMessages();
    const interval = window.setInterval(() => void loadCustomerMessages(), 20000);
    return () => window.clearInterval(interval);
  }, [tab, loadCustomerMessages]);

  const saveMessageReply = async (message: CustomerMessage) => {
    const reply = (messageDrafts[message.id] ?? message.admin_reply ?? '').trim();
    if (!reply) { setMessagesError('Write a reply before sending.'); return; }
    setBusyId(message.id);
    setMessagesError('');
    const repliedAt = new Date().toISOString();
    const { error: replyError } = await getSupabaseBrowserClient().from('customer_messages')
      .update({ admin_reply: reply, replied_at: repliedAt }).eq('id', message.id);
    if (replyError) setMessagesError(replyError.message);
    else setCustomerMessages(current => current.map(item => item.id === message.id ? { ...item, admin_reply: reply, replied_at: repliedAt } : item));
    setBusyId('');
  };

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return bookings;
    return bookings.filter(booking => [booking.customer_name, booking.customer_email, booking.car_name, booking.pickup_location, booking.status]
      .some(value => value?.toLowerCase().includes(query)));
  }, [bookings, search]);

  const updateStatus = async (id: string, status: Booking['status']) => {
    setBusyId(id);
    setError('');
    const { error: updateError } = await getSupabaseBrowserClient().from('bookings').update({ status }).eq('id', id);
    if (updateError) setError(updateError.message);
    else setBookings(current => current.map(booking => booking.id === id ? { ...booking, status } : booking));
    setBusyId('');
  };

  const openCarDialog = (car?: CarRow) => {
    setEditingCarId(car?.id ?? null);
    setCarForm(car ? { name: car.name, category: car.category, transmission: car.transmission, seats: car.seats, fuel: car.fuel, daily_rate: Number(car.daily_rate), image_url: car.image_url, available: car.available, description: car.description, features: car.features || [] } : emptyCar);
    setCarDialogOpen(true);
  };

  const saveCar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingCar(true);
    setError('');
    const supabase = getSupabaseBrowserClient();
    const result = editingCarId === null
      ? await supabase.from('cars').insert({ ...carForm, id: Math.max(0, ...cars.map(car => car.id)) + 1 })
      : await supabase.from('cars').update(carForm).eq('id', editingCarId);
    if (result.error) setError(result.error.message);
    else { setCarDialogOpen(false); await loadDashboard(); }
    setSavingCar(false);
  };

  const deleteCar = async (car: CarRow) => {
    if (!window.confirm(`Delete ${car.name} from the fleet? Existing bookings will keep their saved car details.`)) return;
    setError('');
    const { error: deleteError } = await getSupabaseBrowserClient().from('cars').delete().eq('id', car.id);
    if (deleteError) setError(deleteError.message);
    else setCars(current => current.filter(item => item.id !== car.id));
  };

  const pending = bookings.filter(booking => booking.status === 'Pending').length;
  const confirmed = bookings.filter(booking => booking.status === 'Confirmed').length;
  const revenue = bookings.filter(booking => booking.status === 'Confirmed').reduce((sum, booking) => sum + Number(booking.total_price || 0), 0);

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7f8', color: '#182533' }}>
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand">Drive<span>Easy</span><small>ADMIN CONSOLE</small></Link>
        <div className="admin-nav-label">WORKSPACE</div>
        {(['Overview', 'Bookings', 'Customers', 'Fleet', 'Tracking', 'Messages'] as Tab[]).map((item, index) => {
          const Icon = [LayoutDashboard, CalendarDays, Users, CarFront, MapPin, MessageCircle][index];
          return <button key={item} className={`admin-nav-item ${tab === item ? 'active' : ''}`} onClick={() => setTab(item)}><Icon size={18} />{item}{item === 'Bookings' && pending > 0 && <span className="admin-nav-count">{pending}</span>}</button>;
        })}
        <div className="admin-sidebar-bottom"><div className="admin-user-avatar">{adminName.slice(0, 1).toUpperCase()}</div><div className="admin-user-copy"><strong>{adminName}</strong><span>Administrator</span></div><button aria-label="Sign out" title="Sign out" className="admin-icon-button" onClick={async () => { await logout(); router.replace('/login'); }}><LogOut size={17} /></button></div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar"><div className="admin-breadcrumb">DriveEasy <span>/</span> {tab}</div><div className="admin-top-actions"><span className="admin-live"><i /> Live data</span><button className="admin-refresh" onClick={() => void loadDashboard()} disabled={loading}><RefreshCw size={15} className={loading ? 'admin-spin' : ''} /> Refresh</button></div></header>
        <div className="admin-content">
          {accessDenied ? <div className="admin-message"><ShieldAlert size={28} color="#b42318" /><h1>Admin access required</h1><p>Your account does not have the admin role. Ask the project owner to grant your account access using the setup SQL instructions.</p><Link href="/" className="btn-primary">Back to website</Link></div>
            : error && !bookings.length && !loading ? <div className="admin-message"><ShieldAlert size={28} color="#b42318" /><h1>Dashboard setup needed</h1><p>{error}</p><button className="admin-refresh" onClick={() => void loadDashboard()}>Try again</button></div>
            : <>
              <div className="admin-heading-row"><div><div className="admin-eyebrow">DRIVEEASY OPERATIONS</div><h1>{tab === 'Overview' ? 'Dashboard overview' : tab}</h1><p>Welcome back, {adminName}. Here’s what’s happening with your rentals.</p></div><div className="admin-date"><CalendarDays size={16} /> {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</div></div>
              {error && <div className="admin-inline-error">{error}</div>}
              {tab !== 'Customers' && <div className="admin-stat-grid">
                <StatCard icon={<CalendarDays size={19} />} label="Total bookings" value={bookings.length.toLocaleString()} note={`${pending} awaiting review`} color="#1a6b3c" pale="#e8f5ee" />
                <StatCard icon={<Clock3 size={19} />} label="Pending requests" value={pending.toLocaleString()} note="Need your attention" color="#a66a00" pale="#fff7df" />
                <StatCard icon={<CarFront size={19} />} label="Confirmed rentals" value={confirmed.toLocaleString()} note="Approved bookings" color="#2868b2" pale="#eaf2ff" />
                <StatCard icon={<CircleDollarSign size={19} />} label="Confirmed revenue" value={`₱${revenue.toLocaleString()}`} note="From confirmed bookings" color="#7047b8" pale="#f2edff" />
              </div>}

              {tab === 'Messages' ? <MessagesPanel messages={customerMessages} loading={messagesLoading} error={messagesError} drafts={messageDrafts} busyId={busyId} onDraftChange={(id, value) => setMessageDrafts(current => ({ ...current, [id]: value }))} onReply={saveMessageReply} onRefresh={() => void loadCustomerMessages()} />
              : tab === 'Tracking' ? <TrackingPanel cars={cars} locations={vehicleLocations} loading={trackingLoading} error={trackingError} onRefresh={() => void loadVehicleLocations()} />
              : tab === 'Customers' ? <section className="admin-panel"><PanelHeader title="Customers" subtitle={`${customers.length} registered accounts`} /><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>CUSTOMER</th><th>ACCOUNT ID</th><th>JOINED</th><th>ROLE</th></tr></thead><tbody>{customers.map(customer => <tr key={customer.id}><td><div className="admin-customer"><div className="admin-customer-avatar">{(customer.full_name || 'C').slice(0, 1).toUpperCase()}</div><strong>{customer.full_name || 'Customer'}</strong></div></td><td className="admin-muted">{customer.id.slice(0, 8)}…</td><td>{formatDate(customer.created_at)}</td><td><span className="admin-status" style={{ background: '#e8f5ee', color: '#1a6b3c' }}>Customer</span></td></tr>)}</tbody></table>{!loading && customers.length === 0 && <EmptyRows text="No customer accounts found." />}{loading && <EmptyRows text="Loading customers…" />}</div></section>
                : tab === 'Fleet' ? <section className="admin-panel"><PanelHeader title="Fleet management" subtitle={`${cars.length} vehicles in your inventory`} action={<button className="admin-add-button" onClick={() => openCarDialog()}><Plus size={16} /> Add vehicle</button>} /><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>VEHICLE</th><th>CATEGORY</th><th>TRANSMISSION</th><th>SEATS</th><th>DAILY RATE</th><th>AVAILABILITY</th><th>ACTIONS</th></tr></thead><tbody>{cars.map(car => <tr key={car.id}><td><div className="admin-car-cell">{car.image_url ? <img src={car.image_url} alt="" /> : <div className="admin-car-placeholder"><CarFront size={18} /></div>}<div><strong>{car.name}</strong><span className="admin-subline">ID #{car.id}</span></div></div></td><td>{car.category}</td><td>{car.transmission}</td><td>{car.seats}</td><td><strong>₱{Number(car.daily_rate).toLocaleString()}</strong></td><td><span className="admin-status" style={car.available ? statusStyle.Confirmed : statusStyle.Cancelled}>{car.available ? 'Available' : 'Unavailable'}</span></td><td><div className="admin-car-actions"><button aria-label={`Edit ${car.name}`} title="Edit vehicle" onClick={() => openCarDialog(car)}><Pencil size={15} /></button><button aria-label={`Delete ${car.name}`} title="Delete vehicle" onClick={() => void deleteCar(car)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table>{loading && <EmptyRows text="Loading vehicles…" />}{!loading && cars.length === 0 && <EmptyRows text="No vehicles in the fleet." />}</div></section>
                : <section className="admin-panel"><PanelHeader title={tab === 'Overview' ? 'Recent bookings' : 'All bookings'} subtitle={tab === 'Overview' ? 'Latest rental requests from your customers' : `${bookings.length} total requests`} action={tab === 'Overview' ? <button className="admin-text-link" onClick={() => setTab('Bookings')}>View all bookings <ArrowUpRight size={15} /></button> : undefined} /><div className="admin-toolbar"><label className="admin-search"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search customer, car, or status" /></label><span className="admin-result-count">{filteredBookings.length} results</span></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>BOOKING</th><th>CUSTOMER</th><th>VEHICLE</th><th>DATES</th><th>TOTAL</th><th>STATUS</th><th /></tr></thead><tbody>{(tab === 'Overview' ? filteredBookings.slice(0, 6) : filteredBookings).map(booking => <tr key={booking.id}><td><strong className="admin-booking-id">#{booking.id.slice(0, 8)}</strong><span className="admin-subline">{formatDate(booking.created_at)}</span></td><td><strong>{booking.customer_name || 'Customer'}</strong><span className="admin-subline">{booking.customer_email || '—'}</span></td><td><strong>{booking.car_name}</strong><span className="admin-subline">{booking.car_type}</span></td><td><strong>{formatShortDate(booking.pickup_date)} – {formatShortDate(booking.dropoff_date)}</strong><span className="admin-subline">{booking.pickup_location}</span></td><td><strong>{booking.total_price == null ? '—' : `₱${Number(booking.total_price).toLocaleString()}`}</strong></td><td><span className="admin-status" style={statusStyle[booking.status]}>{booking.status}</span></td><td><select aria-label={`Update booking ${booking.id} status`} value={booking.status} disabled={busyId === booking.id} onChange={event => void updateStatus(booking.id, event.target.value as Booking['status'])} className="admin-status-select"><option>Pending</option><option>Confirmed</option><option>Returned</option><option>Cancelled</option></select></td></tr>)}</tbody></table>{loading && <EmptyRows text="Loading bookings…" />}{!loading && filteredBookings.length === 0 && <EmptyRows text="No bookings found in Supabase yet." />}</div></section>}
              <footer className="admin-footnote"><Activity size={14} /> Dashboard information is loaded securely from your Supabase project.</footer>
            </>}
        </div>
      </section>
      {carDialogOpen && <div className="admin-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setCarDialogOpen(false); }}><section className="admin-car-dialog" role="dialog" aria-modal="true" aria-labelledby="car-dialog-title"><div className="admin-dialog-header"><div><h2 id="car-dialog-title">{editingCarId === null ? 'Add vehicle' : 'Edit vehicle'}</h2><p>Update the vehicle information shown in your fleet.</p></div><button className="admin-dialog-close" aria-label="Close dialog" onClick={() => setCarDialogOpen(false)}><X size={19} /></button></div><form onSubmit={saveCar} className="admin-car-form"><label>Vehicle name<input required value={carForm.name} onChange={event => setCarForm(current => ({ ...current, name: event.target.value }))} placeholder="e.g. Toyota Vios" /></label><div className="admin-form-grid"><label>Category<select value={carForm.category} onChange={event => setCarForm(current => ({ ...current, category: event.target.value }))}>{['Sedan', 'Hatchback', 'SUV', 'MPV', 'Van', 'Luxury', 'Economy'].map(item => <option key={item}>{item}</option>)}</select></label><label>Transmission<select value={carForm.transmission} onChange={event => setCarForm(current => ({ ...current, transmission: event.target.value }))}><option>Automatic</option><option>Manual</option></select></label></div><div className="admin-form-grid"><label>Seats<input required type="number" min="1" max="99" value={carForm.seats} onChange={event => setCarForm(current => ({ ...current, seats: Number(event.target.value) }))} /></label><label>Fuel<select value={carForm.fuel} onChange={event => setCarForm(current => ({ ...current, fuel: event.target.value }))}><option>Gasoline</option><option>Diesel</option><option>Electric</option></select></label></div><label>Daily rate (₱)<input required type="number" min="0" step="0.01" value={carForm.daily_rate} onChange={event => setCarForm(current => ({ ...current, daily_rate: Number(event.target.value) }))} /></label><label>Image URL<input type="url" value={carForm.image_url} onChange={event => setCarForm(current => ({ ...current, image_url: event.target.value }))} placeholder="https://…" /></label><label>Description<textarea rows={3} value={carForm.description} onChange={event => setCarForm(current => ({ ...current, description: event.target.value }))} /></label><label>Features <span>(comma separated)</span><input value={carForm.features.join(', ')} onChange={event => setCarForm(current => ({ ...current, features: event.target.value.split(',').map(item => item.trim()).filter(Boolean) }))} placeholder="Air conditioning, Bluetooth" /></label><label className="admin-availability"><input type="checkbox" checked={carForm.available} onChange={event => setCarForm(current => ({ ...current, available: event.target.checked }))} /> Available for booking</label>{error && <p className="admin-form-error" role="alert">{error}</p>}<div className="admin-dialog-actions"><button type="button" className="admin-cancel-button" onClick={() => setCarDialogOpen(false)}>Cancel</button><button type="submit" className="admin-add-button" disabled={savingCar}>{savingCar ? 'Saving…' : editingCarId === null ? 'Create vehicle' : 'Save changes'}</button></div></form></section></div>}
      <style>{adminStyles}</style>
    </main>
  );
}

function MessagesPanel({ messages, loading, error, drafts, busyId, onDraftChange, onReply, onRefresh }: {
  messages: CustomerMessage[];
  loading: boolean;
  error: string;
  drafts: Record<string, string>;
  busyId: string;
  onDraftChange: (id: string, value: string) => void;
  onReply: (message: CustomerMessage) => void;
  onRefresh: () => void;
}) {
  return <section className="admin-panel">
    <PanelHeader title="Customer messages" subtitle={`${messages.length} conversations`} action={<button className="admin-refresh" onClick={onRefresh} disabled={loading}><RefreshCw size={15} className={loading ? 'admin-spin' : ''} /> Refresh</button>} />
    <div style={{ padding: 20, display: 'grid', gap: 16 }}>
      {error && <p role="alert" className="admin-inline-error">{error}</p>}
      {loading && messages.length === 0 ? <EmptyRows text="Loading customer messages…" /> : messages.length === 0 ? <EmptyRows text="No customer messages yet." /> : messages.map(message => (
        <article key={message.id} style={{ border: '1px solid #e8edef', borderRadius: 10, padding: 16, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div><strong style={{ color: '#1b2c38' }}>{message.customer_name}</strong><div style={{ color: '#78858d', fontSize: '.75rem', marginTop: 4 }}>{message.customer_email}{message.customer_phone ? ` · ${message.customer_phone}` : ''}</div></div>
            <small style={{ color: '#849098' }}>{new Date(message.created_at).toLocaleString()}</small>
          </div>
          <p style={{ color: '#354650', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{message.message}</p>
          {message.admin_reply && <div style={{ borderLeft: '3px solid #1a6b3c', background: '#e8f5ee', padding: '10px 12px', borderRadius: '0 7px 7px 0' }}><strong style={{ color: '#1a6b3c', fontSize: '.75rem' }}>Your previous reply</strong><p style={{ whiteSpace: 'pre-wrap', margin: '5px 0 0', color: '#263943', fontSize: '.84rem' }}>{message.admin_reply}</p></div>}
          <label style={{ display: 'grid', gap: 6, color: '#53636c', fontSize: '.75rem', fontWeight: 700 }}>Reply to customer
            <textarea rows={3} maxLength={5000} value={drafts[message.id] ?? message.admin_reply ?? ''} onChange={event => onDraftChange(message.id, event.target.value)} placeholder="Write a response…" style={{ width: '100%', resize: 'vertical', padding: 10, border: '1px solid #dfe5e8', borderRadius: 7, color: '#263943', font: 'inherit', fontWeight: 400 }} />
          </label>
          <div><button className="admin-add-button" onClick={() => onReply(message)} disabled={busyId === message.id}><Send size={14} /> {busyId === message.id ? 'Sending…' : message.admin_reply ? 'Update reply' : 'Send reply'}</button></div>
        </article>
      ))}
    </div>
  </section>;
}

function TrackingPanel({ cars, locations, loading, error, onRefresh }: { cars: CarRow[]; locations: VehicleLocation[]; loading: boolean; error: string; onRefresh: () => void }) {
  const latestByCar = new Map<number, VehicleLocation>();
  for (const location of [...locations].sort((a, b) => Date.parse(b.recorded_at) - Date.parse(a.recorded_at))) {
    if (!latestByCar.has(location.car_id)) latestByCar.set(location.car_id, location);
  }
  const mapLocations = [...latestByCar.entries()].map(([carId, location]) => ({
    name: cars.find(car => car.id === carId)?.name || `Vehicle #${carId}`,
    address: `${Number(location.latitude).toFixed(5)}, ${Number(location.longitude).toFixed(5)} · Updated ${new Date(location.recorded_at).toLocaleString()}`,
    lat: Number(location.latitude), lng: Number(location.longitude),
  }));
  return <section className="admin-tracking-layout">
    <section className="admin-panel admin-track-map-panel"><PanelHeader title="Vehicle locations" subtitle="Latest GPS location for each fleet vehicle" action={<button className="admin-refresh" onClick={onRefresh} disabled={loading}><RefreshCw size={15} className={loading ? 'admin-spin' : ''} /> Refresh</button>} />
      {error ? <div className="admin-tracking-empty"><Radio size={25} /><strong>Tracker data is not available</strong><span>{error.includes('vehicle_locations') ? 'Apply the vehicle tracking migration in Supabase to enable this view.' : error}</span></div>
        : mapLocations.length ? <div className="admin-tracking-map"><VehicleMap key={mapLocations.map(location => `${location.name}:${location.lat}:${location.lng}`).join('|')} locations={mapLocations} /></div>
        : <div className="admin-tracking-empty"><MapPin size={25} /><strong>{loading ? 'Checking vehicle trackers…' : 'No vehicle locations received'}</strong><span>Each vehicle will appear on the map when its GPS tracker sends a location update.</span></div>}
    </section>
    <section className="admin-panel"><PanelHeader title="Fleet trackers" subtitle={`${cars.length} vehicles · ${latestByCar.size} reporting location`} />
      {cars.length ? <div className="admin-tracker-list">{cars.map(car => { const location = latestByCar.get(car.id); return <article className="admin-tracker-row" key={car.id}><div className="admin-tracker-icon"><CarFront size={18} /></div><div className="admin-tracker-info"><strong>{car.name}</strong><span>{location ? `${Number(location.latitude).toFixed(5)}, ${Number(location.longitude).toFixed(5)}${location.speed_kph == null ? '' : ` · ${location.speed_kph} km/h`}` : 'Waiting for GPS signal'}</span></div><span className={`admin-tracker-status ${location ? 'online' : ''}`}><i />{location ? 'Tracking' : 'No signal'}</span><small>{location ? new Date(location.recorded_at).toLocaleString() : '—'}</small></article>; })}</div> : <EmptyRows text="No vehicles in the fleet." />}
    </section>
  </section>;
}
function StatCard({ icon, label, value, note, color, pale }: { icon: React.ReactNode; label: string; value: string; note: string; color: string; pale: string }) {
  return <article className="admin-stat-card"><div className="admin-stat-top"><span>{label}</span><span className="admin-stat-icon" style={{ color, background: pale }}>{icon}</span></div><strong className="admin-stat-value">{value}</strong><span className="admin-stat-note"><ArrowDownRight size={14} />{note}</span></article>;
}

function PanelHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="admin-panel-header"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>;
}

function EmptyRows({ text }: { text: string }) { return <div className="admin-empty"><CalendarDays size={22} /><span>{text}</span></div>; }
function formatDate(value: string) { return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
function formatShortDate(value: string) { return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }

const adminStyles = `
.admin-sidebar{position:fixed;inset:0 auto 0 0;width:246px;background:#102230;color:#fff;padding:28px 16px 16px;display:flex;flex-direction:column;z-index:10}.admin-brand{font-size:1.5rem;font-weight:900;color:#fff;line-height:1.15;padding:0 12px 34px}.admin-brand span{color:#4bb476}.admin-brand small{display:block;margin-top:8px;font-size:.62rem;letter-spacing:.17em;color:#90a3af}.admin-nav-label{font-size:.65rem;font-weight:800;letter-spacing:.14em;color:#708592;padding:0 12px 12px}.admin-nav-item{height:44px;width:100%;display:flex;align-items:center;gap:12px;padding:0 12px;border-radius:8px;background:none;color:#aebdc6;text-align:left;font-size:.88rem;margin-bottom:4px}.admin-nav-item.active,.admin-nav-item:hover{background:#1d3545;color:#fff}.admin-nav-item.active{box-shadow:inset 3px 0 #4bb476}.admin-nav-count{margin-left:auto;border-radius:20px;background:#315d48;color:#fff;padding:2px 8px;font-size:.68rem}.admin-sidebar-bottom{display:flex;align-items:center;gap:10px;border-top:1px solid #29404e;padding:17px 5px 3px;margin-top:auto}.admin-user-avatar,.admin-customer-avatar{height:34px;width:34px;border-radius:50%;display:grid;place-items:center;background:#d8eee1;color:#1a6b3c;font-weight:800;flex:none}.admin-user-copy{min-width:0;display:grid;flex:1}.admin-user-copy strong{font-size:.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.admin-user-copy span{font-size:.68rem;color:#92a5b0}.admin-icon-button{background:transparent;color:#9aabb5;padding:7px}.admin-main{margin-left:246px;min-height:100vh}.admin-topbar{height:68px;border-bottom:1px solid #e7ebed;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 38px}.admin-breadcrumb{font-size:.82rem;color:#677681}.admin-breadcrumb span{color:#bdc5ca;padding:0 9px}.admin-top-actions{display:flex;align-items:center;gap:20px}.admin-live{display:flex;align-items:center;gap:7px;font-size:.75rem;color:#66757f}.admin-live i{height:7px;width:7px;border-radius:50%;background:#32a366;box-shadow:0 0 0 3px #e4f4ea}.admin-refresh{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #dfe5e8;border-radius:7px;padding:8px 12px;color:#354650;font-size:.78rem;font-weight:650}.admin-refresh:disabled{opacity:.6}.admin-content{max-width:1440px;padding:34px 38px 28px;margin:0 auto}.admin-heading-row{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:26px;gap:20px}.admin-eyebrow{font-size:.65rem;letter-spacing:.14em;color:#1a6b3c;font-weight:800;margin-bottom:7px}.admin-heading-row h1{font-size:1.75rem;letter-spacing:-.035em;color:#122331}.admin-heading-row p{color:#78858d;font-size:.84rem;margin-top:5px}.admin-date{display:flex;align-items:center;gap:8px;color:#65747d;font-size:.76rem;background:#fff;border:1px solid #e4e9eb;border-radius:8px;padding:9px 12px}.admin-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;margin-bottom:24px}.admin-stat-card,.admin-panel{background:#fff;border:1px solid #e8edef;border-radius:11px;box-shadow:0 3px 12px rgba(20,39,52,.025)}.admin-stat-card{padding:18px 19px}.admin-stat-top{display:flex;align-items:center;justify-content:space-between;color:#78858d;font-size:.75rem}.admin-stat-icon{height:35px;width:35px;display:grid;place-items:center;border-radius:9px}.admin-stat-value{display:block;font-size:1.55rem;letter-spacing:-.04em;margin:12px 0 4px;color:#182a36}.admin-stat-note{display:flex;align-items:center;gap:3px;color:#87939a;font-size:.68rem}.admin-stat-note svg{color:#1a6b3c}.admin-panel{overflow:hidden}.admin-panel-header{display:flex;align-items:center;justify-content:space-between;padding:19px 21px 16px;border-bottom:1px solid #edf0f1;gap:15px}.admin-panel-header h2{font-size:.94rem;color:#1b2c38}.admin-panel-header p{font-size:.72rem;color:#849098;margin-top:3px}.admin-text-link{display:flex;align-items:center;gap:6px;color:#1a6b3c;background:transparent;font-weight:700;font-size:.75rem}.admin-toolbar{padding:13px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #edf0f1}.admin-search{display:flex;align-items:center;gap:8px;color:#89959d;border:1px solid #e3e8ea;border-radius:7px;padding:8px 10px;width:min(340px,75%)}.admin-search input{outline:none;border:0;width:100%;font:inherit;font-size:.76rem;color:#263944}.admin-result-count{font-size:.7rem;color:#87939a}.admin-table-scroll{overflow-x:auto}.admin-table{width:100%;border-collapse:collapse;min-width:800px;text-align:left}.admin-table th{padding:12px 16px;background:#fafbfb;color:#909ba1;font-size:.61rem;letter-spacing:.1em;font-weight:800;white-space:nowrap}.admin-table td{padding:14px 16px;border-top:1px solid #f0f2f3;font-size:.76rem;color:#384852;vertical-align:middle}.admin-table tbody tr:hover{background:#fcfdfd}.admin-table td strong{font-size:.75rem;color:#263943;font-weight:700}.admin-booking-id{font-variant-numeric:tabular-nums}.admin-subline{display:block;color:#929da3;font-size:.67rem;margin-top:3px;white-space:nowrap}.admin-status{display:inline-flex;padding:5px 9px;border-radius:20px;font-size:.66rem;font-weight:750;white-space:nowrap}.admin-status-select{background:#fff;border:1px solid #e3e8ea;border-radius:6px;padding:6px 8px;color:#596971;font-size:.68rem}.admin-customer{display:flex;align-items:center;gap:9px;min-width:140px}.admin-customer-avatar{height:30px;width:30px;font-size:.75rem}.admin-muted{color:#87939a!important;font-family:monospace;font-size:.69rem!important}.admin-empty{display:flex;align-items:center;justify-content:center;gap:10px;padding:38px 12px;color:#929da3;font-size:.8rem}.admin-footnote{display:flex;align-items:center;gap:7px;color:#99a3a9;font-size:.68rem;margin-top:17px}.admin-inline-error{background:#fff1f0;border:1px solid #ffd1cc;color:#a52a20;padding:10px 13px;border-radius:8px;font-size:.78rem;margin-bottom:15px}.admin-message{min-height:65vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;max-width:440px;margin:auto}.admin-message h1{font-size:1.5rem;margin:15px 0 7px}.admin-message p{font-size:.85rem;color:#74818a;margin-bottom:20px}.admin-spin{animation:admin-spin .9s linear infinite}@keyframes admin-spin{to{transform:rotate(360deg)}}.admin-add-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 13px;border-radius:7px;background:#1a6b3c;color:#fff;font-size:.75rem;font-weight:700}.admin-add-button:disabled{opacity:.6}.admin-car-cell{display:flex;align-items:center;gap:10px;min-width:190px}.admin-car-cell img,.admin-car-placeholder{width:55px;height:38px;border-radius:6px;object-fit:cover;background:#edf3ef}.admin-car-placeholder{display:grid;place-items:center;color:#1a6b3c}.admin-car-actions{display:flex;gap:5px}.admin-car-actions button{display:grid;place-items:center;width:30px;height:30px;background:#f5f7f7;color:#53636c;border-radius:6px}.admin-car-actions button:last-child{color:#b42318}.admin-modal-backdrop{position:fixed;inset:0;z-index:30;background:rgba(9,22,31,.58);display:grid;place-items:center;padding:18px}.admin-car-dialog{background:#fff;border-radius:14px;width:min(560px,100%);max-height:92vh;overflow:auto;box-shadow:0 20px 70px rgba(0,0,0,.25)}.admin-dialog-header{display:flex;justify-content:space-between;align-items:flex-start;padding:22px 24px 16px;border-bottom:1px solid #edf0f1}.admin-dialog-header h2{font-size:1.05rem;color:#182a36}.admin-dialog-header p{font-size:.76rem;color:#87939a;margin-top:4px}.admin-dialog-close{background:transparent;color:#64737b;padding:2px}.admin-car-form{display:grid;gap:13px;padding:20px 24px 24px}.admin-car-form label{display:grid;gap:5px;font-size:.72rem;font-weight:700;color:#53636c}.admin-car-form label span{font-weight:400;color:#94a0a6}.admin-car-form input:not([type=checkbox]),.admin-car-form select,.admin-car-form textarea{width:100%;padding:9px 10px;border:1px solid #dfe5e8;border-radius:7px;background:#fff;color:#263943;font:inherit;font-size:.8rem;outline-color:#1a6b3c}.admin-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.admin-car-form .admin-availability{display:flex;align-items:center;gap:8px}.admin-availability input{accent-color:#1a6b3c}.admin-dialog-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:4px}.admin-cancel-button{padding:9px 13px;border:1px solid #dfe5e8;border-radius:7px;color:#52626b;background:#fff;font-size:.75rem;font-weight:700}.admin-form-error{color:#b42318;font-size:.75rem}.admin-spin{animation:admin-spin .9s linear infinite}@keyframes admin-spin{to{transform:rotate(360deg)}}.admin-tracking-layout{display:grid;gap:18px}.admin-tracking-map{height:390px;padding:12px}.admin-tracking-empty{min-height:235px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;padding:28px;text-align:center;color:#829099}.admin-tracking-empty svg{color:#1a6b3c}.admin-tracking-empty strong{color:#293b46;font-size:.9rem}.admin-tracking-empty span{max-width:430px;font-size:.75rem;line-height:1.55}.admin-tracker-list{padding:0 20px}.admin-tracker-row{display:grid;grid-template-columns:38px minmax(150px,1fr) auto auto;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid #edf0f1}.admin-tracker-row:last-child{border-bottom:0}.admin-tracker-icon{width:36px;height:36px;border-radius:9px;display:grid;place-items:center;background:#e8f5ee;color:#1a6b3c}.admin-tracker-info{display:grid;gap:4px;min-width:0}.admin-tracker-info strong{font-size:.77rem;color:#263943}.admin-tracker-info span,.admin-tracker-row small{font-size:.68rem;color:#849098}.admin-tracker-status{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:18px;background:#f1f3f4;color:#7e898f;font-size:.65rem;font-weight:700;white-space:nowrap}.admin-tracker-status i{width:6px;height:6px;border-radius:50%;background:#9ba5aa}.admin-tracker-status.online{background:#e8f5ee;color:#1a6b3c}.admin-tracker-status.online i{background:#1a9a55}.admin-tracker-row small{white-space:nowrap}@media(max-width:680px){.admin-tracking-map{height:300px;padding:8px}.admin-tracker-row{grid-template-columns:36px minmax(100px,1fr) auto}.admin-tracker-row small{grid-column:2/-1;margin-top:-7px}.admin-track-map-panel .admin-panel-header{align-items:flex-start}.admin-track-map-panel .admin-panel-header .admin-refresh{padding:7px;font-size:.7rem}}@media(max-width:1050px){.admin-sidebar{width:205px}.admin-main{margin-left:205px}.admin-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.admin-content{padding:28px 22px}}
`;
