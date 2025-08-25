import { EmergencyAlert } from "./rwanda-data";

export interface NotificationSettings {
  browserNotifications: boolean;
  smsAlerts: boolean;
  emailAlerts: boolean;
  radiusKm: number;
  emergencyTypes: string[];
}

export class RwandaNotificationService {
  private settings: NotificationSettings;

  constructor() {
    this.settings = this.loadSettings();
    this.requestNotificationPermission();
  }

  private loadSettings(): NotificationSettings {
    const saved = localStorage.getItem("rwanda-emergency-notifications");
    return saved
      ? JSON.parse(saved)
      : {
          browserNotifications: true,
          smsAlerts: true,
          emailAlerts: false,
          radiusKm: 10,
          emergencyTypes: ["fire", "flood", "accident", "medical", "crime"],
        };
  }

  public saveSettings(settings: NotificationSettings) {
    this.settings = settings;
    localStorage.setItem(
      "rwanda-emergency-notifications",
      JSON.stringify(settings),
    );
  }

  public getSettings(): NotificationSettings {
    return this.settings;
  }

  private async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  public async sendBrowserNotification(
    alert: EmergencyAlert,
    distance?: number,
  ) {
    if (!this.settings.browserNotifications) return;

    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) return;

    const icon = this.getEmergencyIcon(alert.alert_type);
    const urgency =
      alert.severity === "critical"
        ? "BIKOMEYE"
        : alert.severity === "high"
          ? "BYIHUSE"
          : "";

    const title = `🚨 SafeAlert Rwanda ${urgency ? `- ${urgency}` : ""}`;
    const body = `${icon} ${alert.title}\n📍 ${alert.location_address}${distance ? `\n📏 ${distance.toFixed(1)} km` : ""}`;

    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: alert.id,
      requireInteraction: alert.severity === "critical",
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 10 seconds for non-critical alerts
    if (alert.severity !== "critical") {
      setTimeout(() => notification.close(), 10000);
    }
  }

  public async sendSMSAlert(
    phoneNumber: string,
    alert: EmergencyAlert,
    distance?: number,
  ): Promise<boolean> {
    // Mock SMS service - in production, integrate with Rwanda's SMS gateway
    const icon = this.getEmergencyIcon(alert.alert_type);
    const urgency = alert.severity === "critical" ? "BIKOMEYE" : "";

    const message = `SafeAlert Rwanda ${urgency ? `${urgency} ` : ""}${icon} ${alert.title}. Ahantu: ${alert.location_address}${distance ? `. Intera: ${distance.toFixed(1)}km` : ""}. Hamagara 112 ukeneye ubufasha. bit.ly/safealert-rw`;

    console.log(`[MOCK SMS to ${phoneNumber}]: ${message}`);

    // Simulate SMS sending delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.1); // 90% success rate
      }, 1000);
    });
  }

  public shouldNotifyUser(
    alert: EmergencyAlert,
    userLocation?: { lat: number; lng: number },
  ): boolean {
    // Check if user wants this type of emergency
    if (!this.settings.emergencyTypes.includes(alert.alert_type)) {
      return false;
    }

    // Check distance if user location is available
    if (userLocation) {
      const distance = this.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        alert.latitude,
        alert.longitude,
      );
      return distance <= this.settings.radiusKm;
    }

    // If no location, only notify for critical alerts
    return alert.severity === "critical";
  }

  public calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private getEmergencyIcon(type: string): string {
    switch (type) {
      case "fire":
        return "🔥";
      case "flood":
        return "💧";
      case "accident":
        return "🚗";
      case "medical":
        return "🏥";
      case "crime":
        return "🚨";
      case "weather":
        return "⛈️";
      default:
        return "⚠️";
    }
  }

  public async testNotification() {
    const testAlert: EmergencyAlert = {
      id: "test",
      alert_type: "fire",
      severity: "medium",
      title: "Test ya SafeAlert Rwanda",
      description:
        "Iki ni test ya sisitemu yo gutanga amakuru y'ubwoba. Sisitemu irakora.",
      latitude: -1.9441,
      longitude: 30.0619,
      location_address: "Kigali, Rwanda",
      province: "Kigali City",
      district: "Gasabo",
      status: "active",
      created_at: new Date().toISOString(),
      user_name: "Sisitemu ya SafeAlert",
    };

    await this.sendBrowserNotification(testAlert);
    return true;
  }
}

// Export singleton instance
export const notificationService = new RwandaNotificationService();
