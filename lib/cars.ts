export interface Car {
  id: number;
  name: string;
  category: string;
  transmission: 'Automatic' | 'Manual';
  seats: number;
  fuel: 'Gasoline' | 'Diesel' | 'Electric';
  price: number; // PHP per day
  image: string;
  available: boolean;
  description: string;
  features: string[];
}

export const ALL_CARS: Car[] = [
  {
    id: 1,
    name: 'Toyota Vios',
    category: 'Sedan',
    transmission: 'Automatic',
    seats: 5,
    fuel: 'Gasoline',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
    available: true,
    description: 'The Toyota Vios is a reliable and fuel-efficient sedan perfect for city drives and long road trips across South Cebu.',
    features: ['Air Conditioning', 'Bluetooth Audio', 'Backup Camera', 'USB Charging', 'Keyless Entry'],
  },
  {
    id: 2,
    name: 'Toyota Wigo',
    category: 'Hatchback',
    transmission: 'Automatic',
    seats: 5,
    fuel: 'Gasoline',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    available: true,
    description: 'Compact and easy to maneuver, the Toyota Wigo is ideal for solo travelers and couples exploring South Cebu on a budget.',
    features: ['Air Conditioning', 'Bluetooth Audio', 'USB Charging', 'Fuel Efficient'],
  },
  {
    id: 3,
    name: 'Mitsubishi Mirage',
    category: 'Hatchback',
    transmission: 'Manual',
    seats: 5,
    fuel: 'Gasoline',
    price: 1600,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',
    available: true,
    description: 'The Mitsubishi Mirage offers excellent fuel economy and a smooth ride, great for budget-conscious travelers.',
    features: ['Air Conditioning', 'USB Charging', 'Fuel Efficient', 'Compact Size'],
  },
  {
    id: 4,
    name: 'Toyota Innova',
    category: 'MPV',
    transmission: 'Automatic',
    seats: 7,
    fuel: 'Diesel',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
    available: true,
    description: 'Spacious and powerful, the Toyota Innova is the go-to choice for family trips and barkada outings around South Cebu.',
    features: ['Air Conditioning', 'Bluetooth Audio', 'Backup Camera', '7 Seats', 'Large Trunk'],
  },
  {
    id: 5,
    name: 'Toyota Fortuner',
    category: 'SUV',
    transmission: 'Automatic',
    seats: 7,
    fuel: 'Diesel',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    available: true,
    description: 'Built for adventure, the Toyota Fortuner handles mountain roads and rough terrain with ease — perfect for Osmeña Peak and Kawasan Falls.',
    features: ['4x4 Capable', 'Air Conditioning', 'Bluetooth Audio', 'Backup Camera', '7 Seats', 'Roof Rails'],
  },
  {
    id: 6,
    name: 'Honda City',
    category: 'Sedan',
    transmission: 'Automatic',
    seats: 5,
    fuel: 'Gasoline',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    available: true,
    description: 'Stylish and comfortable, the Honda City is a premium sedan offering a smooth and enjoyable driving experience across Cebu.',
    features: ['Air Conditioning', 'Bluetooth Audio', 'Backup Camera', 'Lane Assist', 'Sunroof'],
  },
];

export const CATEGORIES = ['All', 'Sedan', 'Hatchback', 'SUV', 'MPV'];
export const TRANSMISSIONS = ['All', 'Automatic', 'Manual'];
export const FUELS = ['All', 'Gasoline', 'Diesel'];
