export interface RwandaLocation {
  province: string;
  district: string;
  sector?: string;
  latitude: number;
  longitude: number;
}

export interface EmergencyContact {
  service_name: string;
  phone_number: string;
  service_type: string;
  province?: string;
  district?: string;
  is_national: boolean;
}

export interface EmergencyAlert {
  id: string;
  alert_type: "fire" | "flood" | "accident" | "medical" | "crime" | "weather";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location_address: string;
  province: string;
  district: string;
  status: string;
  created_at: string;
  user_name: string;
}

// Rwanda Emergency Numbers
export const RWANDA_EMERGENCY_NUMBERS = {
  POLICE: "112",
  FIRE_RESCUE: "112", 
  MEDICAL: "912",
  RED_CROSS: "+250788177777"
};

// Emergency type translations (English/Kinyarwanda)
export const EMERGENCY_TYPES = {
  fire: {
    en: "Fire Emergency",
    rw: "Ubwoba bw'Umuriro",
    icon: "🔥",
    color: "emergency-fire"
  },
  flood: {
    en: "Flood/Water Emergency", 
    rw: "Ubwoba bw'Amazi/Imyuzure",
    icon: "💧",
    color: "emergency-flood"
  },
  accident: {
    en: "Traffic Accident",
    rw: "Impanuka y'Ibinyabiziga",
    icon: "🚗", 
    color: "emergency-accident"
  },
  medical: {
    en: "Medical Emergency",
    rw: "Ubwoba bw'Ubuvuzi",
    icon: "🏥",
    color: "emergency-medical"
  },
  crime: {
    en: "Security/Crime Alert",
    rw: "Ubwoba bw'Umutekano",
    icon: "🚨",
    color: "emergency-crime"
  },
  weather: {
    en: "Weather Emergency",
    rw: "Ubwoba bw'Ikirere", 
    icon: "⛈️",
    color: "emergency-weather"
  }
};

// Rwanda Provinces
export const RWANDA_PROVINCES = [
  "Kigali City",
  "Northern Province", 
  "Southern Province",
  "Eastern Province",
  "Western Province"
];

// Common Kinyarwanda/English phrases
export const TRANSLATIONS = {
  emergency_report: {
    en: "Report Emergency",
    rw: "Tanga Raporo y'Ubwoba"
  },
  location: {
    en: "Location",
    rw: "Ahantu"
  },
  description: {
    en: "Description", 
    rw: "Ibisobanuro"
  },
  severity: {
    en: "Severity",
    rw: "Ukurikije"
  },
  active_alerts: {
    en: "Active Alerts",
    rw: "Amakuru Akanguka"
  },
  quick_actions: {
    en: "Quick Actions", 
    rw: "Ibikorwa byihuse"
  }
};
