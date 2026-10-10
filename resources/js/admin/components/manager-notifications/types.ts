export interface ManagerNotificationData {
    id: number;
    key: string;
    name: string;
    description: string | null;
    conditions: Record<string, unknown>;
    send_hour: number;
    enabled: boolean;
}

export interface ManagerNotificationListItem extends ManagerNotificationData {
    deliveries_count: number;
    deliveries_last_30_days_count: number;
}

export interface ManagerNotificationDetails extends ManagerNotificationData {
    conditions_text: string[];
    subject: string | null;
    preheader: string | null;
}

export type EmailStatus = 'pending' | 'processing' | 'sent' | 'failed';

export interface DeliveryData {
    id: number;
    created_at: string | null;
    trigger: 'auto' | 'manual';
    sequence: number | null;
    brand: {id: number; name: string} | null;
    user: {name: string | null; email: string} | null;
    sent_by: string | null;
    email: {id: number; status: EmailStatus} | null;
}

export interface DeliveriesPage {
    items: DeliveryData[];
    has_more: boolean;
}

/** Сколько брендов можно выбрать в одной ручной отправке (как на бэкенде). */
export const MANUAL_SEND_LIMIT = 200;

export interface RecipientData {
    brand_id: number;
    brand_name: string;
    user_name: string | null;
    user_email: string | null;
    sent_today: boolean;
}

/** Час отправки в виде «10:00». */
export function formatHour(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
}
