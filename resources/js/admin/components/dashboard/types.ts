export interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
  units: number;
}

export interface InterestPoint {
  date: string;
  views: number;
  clicks: number;
  add_to_cart: number;
}

export interface DashboardMetrics {
  revenue: number;
  orders: number;
  aov: number;
  units: number;
  views: number;
  add_to_cart: number;
  conversion_view_to_atc: number;
  conversion_view_to_order: number;
}

export interface TopProduct {
  product_id: number;
  title: string;
  category: string | null;
  image_url?: string | null;
  revenue: number;
  orders: number;
  units: number;
  views: number;
  add_to_cart: number;
  conversion: number;
}

export interface InterestGap {
  product_id: number;
  title: string;
  category: string | null;
  image_url?: string | null;
  views: number;
  add_to_cart?: number;
  orders: number;
  revenue?: number;
  conversion?: number;
}

export interface TopConversionPage {
  data: InterestGap[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
    sort: "view_to_cart" | "view_to_order" | "cart_to_order";
    direction: "asc" | "desc";
  };
}
