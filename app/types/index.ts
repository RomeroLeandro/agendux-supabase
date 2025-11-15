export interface Service {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  is_active_for_auto_agenda?: boolean;
}

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profession_id?: number;
}

export interface AutoAgendaConfig {
  id?: string;
  user_id: string;
  is_active: boolean;
  url_slug: string;
  page_title: string;
  page_description: string;
  max_days_advance: number;
  min_hours_advance: number;
  max_appointments_per_day: number;
  logo_url?: string | null;
  primary_color?: string | null;
  theme?: string | null;
}

export interface WorkHour {
  id?: number;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface FormField {
  id?: number;
  user_id: string;
  field_name: string;
  is_visible: boolean;
  is_required: boolean;
}

export interface Message {
  id: string;
  message: string;
  message_type?:
    | "confirmation"
    | "reminder_1"
    | "reminder_2"
    | "post_appointment"
    | string;
  status?: "sent" | "delivered" | "failed" | "pending" | string;
  recipient?: string;
  sent_at?: string;
  error_message?: string | null;
}

export interface Appointment {
  id: number;
  appointment_datetime: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  duration_minutes?: number;
  google_event_id?: string;
  synced_to_google?: boolean;
  patients: {
    full_name: string;
    phone: string;
  } | null;
  services: {
    name: string;
    duration_minutes?: number;
  } | null;
}

export interface Patient {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  created_at: string;
}
