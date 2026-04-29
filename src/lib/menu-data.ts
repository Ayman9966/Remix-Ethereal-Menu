
import truffleBurrata from '@/assets/food/truffle-burrata-AnIoGG_y.jpg';
import wagyuRibeye from '@/assets/food/wagyu-ribeye-C7XWrtrx.jpg';
import panSearedSalmon from '@/assets/food/pan-seared-salmon-VHkwaYHH.jpg';
import lobsterLinguine from '@/assets/food/lobster-linguine-fusSzLku.jpg';
import truffleCarbonara from '@/assets/food/truffle-carbonara-DpkiKGyV.jpg';
import tiramisu from '@/assets/food/tiramisu-FFr4LMXu.jpg';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image?: string;
  available: boolean;
  preparationTime: number; // minutes
  archived?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
  archived?: boolean;
}

export interface Order {
  id: string;
  orderNumber: number;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'ready_to_pickup' | 'picked';
  orderType: 'dine-in' | 'takeaway';
  tableNumber?: number;
  createdAt: Date;
  updatedAt: Date;
  total: number;
  subtotal?: number;
  taxAmount?: number;
  serviceChargeAmount?: number;
  additionalFeeAmount?: number;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface WaiterCall {
  id: string;
  tableNumber: number;
  createdAt: Date;
  acknowledged: boolean;
}

export interface BrandSettings {
  restaurantName: string;
  tagline: string;
  accentColor: string;
  logoUrl?: string;
  heroImageUrl?: string;
  onlineOrderingEnabled: boolean;
  showPrepTime: boolean;
  menuScale: number;
  currency: string;
  totalTables: number;
  orderingMode: 'dine-in' | 'takeaway' | 'both';
  boardBackgroundColor: string;
  boardCycleSeconds: number;
  boardColumns: number;
  boardShowPhotos: boolean;
  boardShowPrice: boolean;
  boardShowDescription: boolean;
  boardShowPrepTime: boolean;
  nextOrderNumber: number;
  autoPrintInvoice: boolean;
  invoiceSize: '58mm' | '80mm';
  // Tax & Fees
  taxEnabled: boolean;
  taxRate: number;
  taxType: 'percentage' | 'fixed';
  serviceChargeEnabled: boolean;
  serviceChargeRate: number;
  serviceChargeType: 'percentage' | 'fixed';
  additionalFeeEnabled: boolean;
  additionalFeeName: string;
  additionalFeeAmount: number;
  additionalFeeType: 'percentage' | 'fixed';
}

export const defaultBrand: BrandSettings = {
  restaurantName: "Savor",
  tagline: "Modern Dining, Redefined",
  accentColor: "#426564",
  onlineOrderingEnabled: true,
  showPrepTime: true,
  menuScale: 90,
  currency: "$",
  totalTables: 20,
  orderingMode: 'both',
  boardBackgroundColor: '#0a0d13',
  boardCycleSeconds: 15,
  boardColumns: 3,
  boardShowPhotos: true,
  boardShowPrice: true,
  boardShowDescription: true,
  boardShowPrepTime: true,
  nextOrderNumber: 1,
  autoPrintInvoice: false,
  invoiceSize: '80mm',
  taxEnabled: false,
  taxRate: 0,
  taxType: 'percentage',
  serviceChargeEnabled: false,
  serviceChargeRate: 0,
  serviceChargeType: 'percentage',
  additionalFeeEnabled: false,
  additionalFeeName: 'Processing Fee',
  additionalFeeAmount: 0,
  additionalFeeType: 'fixed',
};

export const defaultCategories: Category[] = [
  { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Appetizers', icon: '🥗', order: 1 },
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Main Course', icon: '🍽️', order: 2 },
  { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Pasta', icon: '🍝', order: 3 },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Desserts', icon: '🍰', order: 4 },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Beverages', icon: '🥤', order: 5 },
];

export const defaultMenuItems: MenuItem[] = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Truffle Burrata', description: 'Creamy burrata with black truffle, heirloom tomatoes & basil oil', price: 16.50, categoryId: '550e8400-e29b-41d4-a716-446655440000', image: truffleBurrata, available: true, preparationTime: 10 },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: 'Grilled Octopus', description: 'Charred octopus, smoked paprika, crispy potatoes & chimichurri', price: 18.00, categoryId: '550e8400-e29b-41d4-a716-446655440000', available: true, preparationTime: 15 },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', name: 'Wagyu Ribeye', description: '12oz A5 wagyu, roasted garlic butter, seasonal vegetables', price: 58.00, categoryId: '550e8400-e29b-41d4-a716-446655440001', image: wagyuRibeye, available: true, preparationTime: 25 },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', name: 'Pan-Seared Salmon', description: 'Atlantic salmon, lemon beurre blanc, asparagus & wild rice', price: 32.00, categoryId: '550e8400-e29b-41d4-a716-446655440001', image: panSearedSalmon, available: true, preparationTime: 20 },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', name: 'Herb Roasted Chicken', description: 'Free-range chicken, rosemary jus, roasted root vegetables', price: 28.00, categoryId: '550e8400-e29b-41d4-a716-446655440001', available: true, preparationTime: 22 },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', name: 'Lobster Linguine', description: 'Fresh lobster, cherry tomatoes, white wine & garlic', price: 36.00, categoryId: '550e8400-e29b-41d4-a716-446655440004', image: lobsterLinguine, available: true, preparationTime: 18 },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', name: 'Truffle Carbonara', description: 'Guanciale, pecorino, egg yolk, black truffle shavings', price: 24.00, categoryId: '550e8400-e29b-41d4-a716-446655440004', image: truffleCarbonara, available: true, preparationTime: 15 },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', name: 'Tiramisu', description: 'Classic Italian, mascarpone, espresso-soaked ladyfingers', price: 14.00, categoryId: '550e8400-e29b-41d4-a716-446655440002', image: tiramisu, available: true, preparationTime: 5 },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', name: 'Crème Brûlée', description: 'Tahitian vanilla, caramelized sugar crust', price: 12.00, categoryId: '550e8400-e29b-41d4-a716-446655440002', available: true, preparationTime: 5 },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', name: 'Sparkling Water', description: 'San Pellegrino, 750ml', price: 6.00, categoryId: '550e8400-e29b-41d4-a716-446655440003', available: true, preparationTime: 1 },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', name: 'Craft Lemonade', description: 'House-made with lavender & fresh mint', price: 8.00, categoryId: '550e8400-e29b-41d4-a716-446655440003', available: true, preparationTime: 3 },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Espresso Martini', description: 'Vodka, fresh espresso, coffee liqueur, vanilla', price: 16.00, categoryId: '550e8400-e29b-41d4-a716-446655440003', available: true, preparationTime: 5 },
];

export const sampleOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 1,
    orderType: 'dine-in',
    tableNumber: 3,
    status: 'preparing',
    createdAt: new Date(Date.now() - 12 * 60000),
    updatedAt: new Date(Date.now() - 12 * 60000),
    total: 74.50,
    items: [
      { menuItem: defaultMenuItems[0], quantity: 1 },
      { menuItem: defaultMenuItems[3], quantity: 1 },
      { menuItem: defaultMenuItems[7], quantity: 1 },
      { menuItem: defaultMenuItems[10], quantity: 2 },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: 2,
    orderType: 'dine-in',
    tableNumber: 7,
    status: 'pending',
    createdAt: new Date(Date.now() - 3 * 60000),
    updatedAt: new Date(Date.now() - 3 * 60000),
    total: 82.00,
    items: [
      { menuItem: defaultMenuItems[1], quantity: 1 },
      { menuItem: defaultMenuItems[5], quantity: 1 },
      { menuItem: defaultMenuItems[8], quantity: 2 },
    ],
  },
  {
    id: 'ord-3',
    orderNumber: 3,
    orderType: 'takeaway',
    tableNumber: 12,
    status: 'ready',
    createdAt: new Date(Date.now() - 25 * 60000),
    updatedAt: new Date(Date.now() - 25 * 60000),
    total: 106.00,
    items: [
      { menuItem: defaultMenuItems[2], quantity: 1 },
      { menuItem: defaultMenuItems[6], quantity: 2 },
    ],
  },
];
