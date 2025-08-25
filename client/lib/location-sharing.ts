export interface LocationShare {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  isActive: boolean;
  emergencyType?: string;
  message?: string;
  contactInfo?: string;
}

export interface LocationSharingSettings {
  shareWithEmergencyServices: boolean;
  shareWithVolunteers: boolean;
  shareWithFamily: boolean;
  radiusMeters: number;
  autoShareOnEmergency: boolean;
  maxSharingDuration: number; // in minutes
}

export class LocationSharingService {
  private watchId: number | null = null;
  private activeShares: Map<string, LocationShare> = new Map();
  private settings: LocationSharingSettings;

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): LocationSharingSettings {
    const saved = localStorage.getItem("rwanda-location-sharing");
    return saved
      ? JSON.parse(saved)
      : {
          shareWithEmergencyServices: true,
          shareWithVolunteers: true,
          shareWithFamily: false,
          radiusMeters: 500,
          autoShareOnEmergency: true,
          maxSharingDuration: 30,
        };
  }

  public saveSettings(settings: LocationSharingSettings) {
    this.settings = settings;
    localStorage.setItem("rwanda-location-sharing", JSON.stringify(settings));
  }

  public getSettings(): LocationSharingSettings {
    return this.settings;
  }

  public async startLocationSharing(
    emergencyType?: string,
    message?: string,
  ): Promise<string | null> {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return null;
    }

    return new Promise((resolve, reject) => {
      const shareId = `share-${Date.now()}`;

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const locationShare: LocationShare = {
            id: shareId,
            userId: "current-user", // Replace with actual user ID
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
            isActive: true,
            emergencyType,
            message,
          };

          this.activeShares.set(shareId, locationShare);
          this.broadcastLocation(locationShare);

          if (this.activeShares.size === 1) {
            resolve(shareId);
          }
        },
        (error) => {
          console.error("Location sharing error:", error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        },
      );

      // Auto-stop sharing after max duration
      setTimeout(
        () => {
          this.stopLocationSharing(shareId);
        },
        this.settings.maxSharingDuration * 60 * 1000,
      );
    });
  }

  public stopLocationSharing(shareId: string) {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    const share = this.activeShares.get(shareId);
    if (share) {
      share.isActive = false;
      this.activeShares.delete(shareId);
    }
  }

  public stopAllLocationSharing() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.activeShares.clear();
  }

  private async broadcastLocation(locationShare: LocationShare) {
    // In production, this would send to emergency services, volunteers, and family
    console.log("Broadcasting location:", locationShare);

    // Mock API call to share location
    try {
      const response = await fetch("/api/share-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationShare),
      });

      if (response.ok) {
        console.log("Location shared successfully");
      }
    } catch (error) {
      console.error("Failed to share location:", error);
    }
  }

  public generateShareLink(shareId: string): string {
    const share = this.activeShares.get(shareId);
    if (!share) return "";

    // Generate a shareable link for family/friends
    const baseUrl = window.location.origin;
    return `${baseUrl}/track/${shareId}`;
  }

  public generateWhatsAppMessage(shareId: string): string {
    const share = this.activeShares.get(shareId);
    if (!share) return "";

    const shareLink = this.generateShareLink(shareId);
    const message = share.emergencyType
      ? `🚨 UBWOBA - ${share.emergencyType}! Ndi ahantu: ${share.latitude.toFixed(6)}, ${share.longitude.toFixed(6)}. Mukurebe ahantu ndi: ${shareLink}. Mufashe 112!`
      : `📍 Ndi ahantu: ${share.latitude.toFixed(6)}, ${share.longitude.toFixed(6)}. Mukurebe: ${shareLink}`;

    return encodeURIComponent(message);
  }

  public shareViaWhatsApp(shareId: string, phoneNumber?: string) {
    const message = this.generateWhatsAppMessage(shareId);
    const url = phoneNumber
      ? `https://wa.me/${phoneNumber}?text=${message}`
      : `https://wa.me/?text=${message}`;

    window.open(url, "_blank");
  }

  public shareViaSMS(shareId: string, phoneNumber?: string) {
    const share = this.activeShares.get(shareId);
    if (!share) return;

    const message = `SafeAlert: Ndi ahantu ${share.latitude.toFixed(6)}, ${share.longitude.toFixed(6)}. ${this.generateShareLink(shareId)}`;
    const url = phoneNumber
      ? `sms:${phoneNumber}?body=${encodeURIComponent(message)}`
      : `sms:?body=${encodeURIComponent(message)}`;

    window.open(url, "_self");
  }

  public getActiveShares(): LocationShare[] {
    return Array.from(this.activeShares.values());
  }

  public isLocationSharing(): boolean {
    return this.activeShares.size > 0;
  }

  public async checkNearbyEmergencies(
    userLat: number,
    userLng: number,
    radiusKm: number = 1,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/alerts?lat=${userLat}&lng=${userLng}&radius=${radiusKm}`,
      );
      const data = await response.json();

      if (data.success && data.alerts.length > 0) {
        // Check if any alerts are critical and within the last 10 minutes
        const recentCriticalAlerts = data.alerts.filter((alert: any) => {
          const alertTime = new Date(alert.created_at);
          const minutesAgo = (Date.now() - alertTime.getTime()) / 60000;
          return alert.severity === "critical" && minutesAgo <= 10;
        });

        return recentCriticalAlerts.length > 0;
      }
    } catch (error) {
      console.error("Error checking nearby emergencies:", error);
    }

    return false;
  }
}

// Export singleton instance
export const locationSharingService = new LocationSharingService();
