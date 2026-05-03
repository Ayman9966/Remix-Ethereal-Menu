
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
  status: 'awaiting_approval' | 'pending' | 'preparing' | 'ready' | 'served' | 'ready_to_pickup' | 'picked';
  orderType: 'dine-in' | 'takeaway';
  tableNumber?: number;
  customerPhone?: string;
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
  taxApplyDineIn: boolean;
  taxApplyTakeaway: boolean;
  serviceChargeApplyDineIn: boolean;
  serviceChargeApplyTakeaway: boolean;
  additionalFeeApplyDineIn: boolean;
  additionalFeeApplyTakeaway: boolean;
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
  taxApplyDineIn: true,
  taxApplyTakeaway: true,
  serviceChargeApplyDineIn: true,
  serviceChargeApplyTakeaway: false,
  additionalFeeApplyDineIn: true,
  additionalFeeApplyTakeaway: true,
};

export const defaultCategories: Category[] = [];

export const defaultMenuItems: MenuItem[] = [];

export const sampleOrders: Order[] = [];
