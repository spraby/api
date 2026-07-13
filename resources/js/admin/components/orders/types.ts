import type { Audit, DeliveryStatus, FinancialStatus, OrderStatus } from '@/types/models';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  id: number;
  title: string;
  variant_title: string;
  description: string | null;
  quantity: number;
  price: string;
  final_price: string;
  image_url: string | null;
}

export interface ShippingCustomerSetting {
  key: string;
  name: string;
  type?: string;
  value: string | string[];
}

export interface OrderShipping {
  id: number;
  name: string;
  phone: string;
  note: string;
  shipping_method_id: number | null;
  shipping_method_name: string | null;
  customer_settings: ShippingCustomerSetting[];
}

export interface AvailableShippingMethod {
  id: number;
  name: string;
  customer_settings: ShippingCustomerSetting[];
}

export interface AuditUser {
  id: number;
  name: string;
  email: string;
}

export interface AuditData extends Omit<Audit, 'user'> {
  user: AuditUser | null;
}

export interface OrderShowData {
  id: number;
  name: string;
  status: OrderStatus;
  delivery_status: DeliveryStatus;
  financial_status: FinancialStatus;
  note: string | null;
  status_url: string;
  // Финансовый снапшот заказа; null во всех — старый заказ (считаем из позиций).
  // shipping_price null при заполненном total — «стоимость согласуется»
  subtotal: string | null;
  discount_total: string | null;
  shipping_price: string | null;
  total: string | null;
  created_at: string;
  updated_at: string;
  customer: Customer | null;
  order_items: OrderItem[];
  order_shippings: OrderShipping[];
}

export type TFunction = (key: string) => string;
