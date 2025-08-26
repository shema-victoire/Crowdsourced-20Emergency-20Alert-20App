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
  RED_CROSS: "+250788177777",
};

// Emergency type translations (English/Kinyarwanda)
export const EMERGENCY_TYPES = {
  fire: {
    en: "Fire Emergency",
    rw: "Ubwoba bw'Umuriro",
    icon: "🔥",
    color: "emergency-fire",
  },
  flood: {
    en: "Flood/Water Emergency",
    rw: "Ubwoba bw'Amazi/Imyuzure",
    icon: "💧",
    color: "emergency-flood",
  },
  accident: {
    en: "Traffic Accident",
    rw: "Impanuka y'Ibinyabiziga",
    icon: "🚗",
    color: "emergency-accident",
  },
  medical: {
    en: "Medical Emergency",
    rw: "Ubwoba bw'Ubuvuzi",
    icon: "🏥",
    color: "emergency-medical",
  },
  crime: {
    en: "Security/Crime Alert",
    rw: "Ubwoba bw'Umutekano",
    icon: "🚨",
    color: "emergency-crime",
  },
  weather: {
    en: "Weather Emergency",
    rw: "Ubwoba bw'Ikirere",
    icon: "⛈️",
    color: "emergency-weather",
  },
};

// Rwanda Provinces
export const RWANDA_PROVINCES = [
  "Kigali City",
  "Northern Province",
  "Southern Province",
  "Eastern Province",
  "Western Province",
];

// Comprehensive Kinyarwanda/English translations
export const TRANSLATIONS = {
  // App Title & Headers
  app_title: {
    en: "SafeAlert Rwanda",
    rw: "SafeAlert Rwanda",
  },
  app_subtitle: {
    en: "Emergency Response Platform",
    rw: "Urubuga rwo kwihangana n'ubwoba",
  },
  emergency_map_title: {
    en: "Emergency Map - Rwanda",
    rw: "Ikarita y'Ubwoba - Rwanda",
  },

  // Main Actions
  emergency_report: {
    en: "Report Emergency",
    rw: "Tanga Raporo y'Ubwoba",
  },
  call_emergency: {
    en: "Call 112",
    rw: "Hamagara 112",
  },
  share_location: {
    en: "Share Location",
    rw: "Sangira Ahantu",
  },
  stop_sharing: {
    en: "Stop Sharing",
    rw: "Hagarika",
  },

  // Form Labels
  location: {
    en: "Location",
    rw: "Ahantu",
  },
  description: {
    en: "Description",
    rw: "Ibisobanuro",
  },
  severity: {
    en: "Severity",
    rw: "Ukurikije",
  },
  province: {
    en: "Province",
    rw: "Intara",
  },
  district: {
    en: "District",
    rw: "Akarere",
  },
  title: {
    en: "Title",
    rw: "Umutwe",
  },
  emergency_type: {
    en: "Emergency Type",
    rw: "Ubwoko bw'Ubwoba",
  },
  phone_number: {
    en: "Phone Number",
    rw: "Numero ya telefoni",
  },
  full_name: {
    en: "Full Name",
    rw: "Amazina yawe yose",
  },

  // Alerts & Lists
  active_alerts: {
    en: "Active Alerts",
    rw: "Amakuru Akanguka",
  },
  no_active_alerts: {
    en: "No active alerts",
    rw: "Nta makuru ahari",
  },
  quick_actions: {
    en: "Quick Actions",
    rw: "Ibikorwa byihuse",
  },
  emergency_contacts: {
    en: "Emergency Contacts",
    rw: "Aho wahita ukisha",
  },

  // Map Legend
  map_legend: {
    en: "Legend",
    rw: "Ibimenyetso",
  },
  fire: {
    en: "Fire",
    rw: "Umuriro",
  },
  flood: {
    en: "Flood",
    rw: "Imyuzure",
  },
  accident: {
    en: "Accident",
    rw: "Impanuka",
  },
  medical: {
    en: "Medical",
    rw: "Ubuvuzi",
  },
  security: {
    en: "Security",
    rw: "Umutekano",
  },

  // Form Actions
  submit_report: {
    en: "Submit Report",
    rw: "Ohereza Raporo",
  },
  cancel: {
    en: "Cancel",
    rw: "Bireke",
  },
  save: {
    en: "Save",
    rw: "Bika",
  },
  close: {
    en: "Close",
    rw: "Funga",
  },

  // Authentication
  login_register: {
    en: "Login / Register",
    rw: "Kwinjira / Kwiyandikisha",
  },
  login: {
    en: "Login",
    rw: "Kwinjira",
  },
  register: {
    en: "Register",
    rw: "Kwiyandikisha",
  },
  logout: {
    en: "Logout",
    rw: "Gusohoka",
  },
  auth_banner_text: {
    en: "Login or register to submit emergency reports",
    rw: "Injira cyangwa wiyandikishe kugira ngo ushobore gutanga raporo z'ubwoba",
  },

  // Location & Status
  your_location: {
    en: "Your Location",
    rw: "Ahantu hawe",
  },
  current_location: {
    en: "Current Location",
    rw: "Ahantu h'ubu",
  },
  location_unknown: {
    en: "Location: Unknown",
    rw: "Ahantu: Ntagaragara",
  },
  location_found: {
    en: "Location: Found",
    rw: "Ahantu: Gakondo",
  },

  // Time
  just_now: {
    en: "Just now",
    rw: "Vuba vuba",
  },
  minutes_ago: {
    en: "minutes ago",
    rw: "iminota ishize",
  },
  hours_ago: {
    en: "hours ago",
    rw: "amasaha ashize",
  },

  // Loading & Status Messages
  loading: {
    en: "Loading SafeAlert Rwanda data...",
    rw: "Gukusanya amakuru ya SafeAlert Rwanda...",
  },
  sending_sms: {
    en: "Sending SMS...",
    rw: "Kuraguza SMS...",
  },
  verification_text: {
    en: "We will send you a verification code at",
    rw: "Tuzagukohereza kode yo kwemeza kuri",
  },

  // Placeholders
  select_emergency_type: {
    en: "Select emergency type",
    rw: "Hitamo ubwoko bw'ubwoba",
  },
  select_province: {
    en: "Select province",
    rw: "Hitamo intara",
  },
  select_district: {
    en: "Select district",
    rw: "Hitamo akarere",
  },
  enter_title: {
    en: "Enter emergency title",
    rw: "Andika umutwe w'ubwoba",
  },
  enter_location: {
    en: "Where the emergency occurred (e.g., KG 15 Ave, Kimisagara)",
    rw: "Aho ubwoba bwabaye (Urugero: KG 15 Ave, Kimisagara)",
  },
  describe_emergency: {
    en: "Describe the emergency...",
    rw: "Sobanura ubwoba bwose...",
  },
  phone_placeholder: {
    en: "+250 788 123 456",
    rw: "+250 788 123 456",
  },

  // Misc
  test_notifications: {
    en: "Test Notifications",
    rw: "Test Amakuru",
  },
  get_directions: {
    en: "Get Directions",
    rw: "Inzira",
  },
  welcome_user: {
    en: "Welcome",
    rw: "Muraho",
  },
  no_account_register: {
    en: "No account? Register",
    rw: "Ntufite konti? Kwiyandikisha",
  },
  have_account_login: {
    en: "Have account? Login",
    rw: "Ufite konti? Kwinjira",
  },
  sms_verification_info: {
    en: "You will receive an SMS to verify your phone",
    rw: "Uzakira ubutumwa bwa SMS kugira ngo wemeze telefoni yawe",
  },
};
