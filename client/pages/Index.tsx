import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Phone,
  AlertTriangle,
  Flame,
  Droplets,
  Car,
  Users,
  Clock,
  Zap,
  Shield,
  Plus,
  Moon,
  Sun,
  Share2,
  Navigation,
} from "lucide-react";
import { useTheme } from "next-themes";
import RwandaEmergencyMap from "@/components/RwandaEmergencyMap";
import {
  EmergencyAlert,
  EmergencyContact,
  RwandaLocation,
  RWANDA_EMERGENCY_NUMBERS,
  EMERGENCY_TYPES,
  RWANDA_PROVINCES,
  TRANSLATIONS,
} from "@/lib/rwanda-data";
import { notificationService } from "@/lib/notifications";
import { locationSharingService } from "@/lib/location-sharing";

export default function Index() {
  const { theme, setTheme } = useTheme();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([]);
  const [rwandaLocations, setRwandaLocations] = useState<RwandaLocation[]>([]);
  const [isReporting, setIsReporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "rw">("en");
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [showLocationShare, setShowLocationShare] = useState(false);
  const [reportForm, setReportForm] = useState({
    alert_type: "",
    severity: "medium",
    title: "",
    description: "",
    location_address: "",
    province: "",
    district: "",
    latitude: 0,
    longitude: 0,
  });
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    fetchInitialData();
    requestGeolocation();

    // Set up periodic checking for new alerts (every 30 seconds)
    const alertInterval = setInterval(() => {
      checkForNewAlerts();
    }, 30000);

    return () => clearInterval(alertInterval);
  }, []);

  // Monitor for new alerts and send notifications
  useEffect(() => {
    if (alerts.length > 0 && userLocation) {
      // Check the latest alert for notification
      const latestAlert = alerts[0];
      const alertTime = new Date(latestAlert.created_at);
      const now = new Date();
      const minutesAgo = (now.getTime() - alertTime.getTime()) / 60000;

      // Only notify for alerts within the last 2 minutes
      if (
        minutesAgo <= 2 &&
        notificationService.shouldNotifyUser(latestAlert, userLocation)
      ) {
        const distance = notificationService.calculateDistance(
          userLocation.lat,
          userLocation.lng,
          latestAlert.latitude,
          latestAlert.longitude,
        );
        notificationService.sendBrowserNotification(latestAlert, distance);

        // Auto-offer location sharing for critical nearby emergencies
        if (latestAlert.severity === "critical" && distance <= 1) {
          setShowLocationShare(true);
        }
      }
    }
  }, [alerts, userLocation]);

  // Check if currently sharing location
  useEffect(() => {
    setIsLocationSharing(locationSharingService.isLocationSharing());
  }, []);

  const checkForNewAlerts = async () => {
    try {
      const response = await fetch("/api/alerts");
      const data = await response.json();

      if (data.success && data.alerts.length > 0) {
        // Check if there are any new alerts
        const currentAlertIds = alerts.map((alert) => alert.id);
        const newAlerts = data.alerts.filter(
          (alert: EmergencyAlert) => !currentAlertIds.includes(alert.id),
        );

        if (newAlerts.length > 0) {
          setAlerts(data.alerts);
        }
      }
    } catch (error) {
      console.error("Error checking for new alerts:", error);
    }
  };

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);

      // Fetch alerts, emergency contacts, and Rwanda locations
      const [alertsRes, contactsRes, locationsRes] = await Promise.all([
        fetch("/api/alerts"),
        fetch("/api/emergency-contacts"),
        fetch("/api/rwanda-locations"),
      ]);

      const [alertsData, contactsData, locationsData] = await Promise.all([
        alertsRes.json(),
        contactsRes.json(),
        locationsRes.json(),
      ]);

      if (alertsData.success) {
        setAlerts(alertsData.alerts);
      }

      if (contactsData.success) {
        setEmergencyContacts(contactsData.contacts);
      }

      if (locationsData.success) {
        setRwandaLocations(locationsData.locations);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          // Update form with user location
          setReportForm((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.log("Location access denied:", error);
          // Default to Kigali coordinates if location denied
          setReportForm((prev) => ({
            ...prev,
            latitude: -1.9441,
            longitude: 30.0619,
          }));
        },
      );
    }
  };

  const getEmergencyIcon = (type: string) => {
    const emergencyType = EMERGENCY_TYPES[type as keyof typeof EMERGENCY_TYPES];
    return emergencyType?.icon || "⚠️";
  };

  const getEmergencyColor = (type: string) => {
    switch (type) {
      case "fire":
        return "text-red-700 bg-red-50 border-red-200";
      case "flood":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "accident":
        return "text-orange-700 bg-orange-50 border-orange-200";
      case "medical":
        return "text-green-700 bg-green-50 border-green-200";
      case "crime":
        return "text-purple-700 bg-purple-50 border-purple-200";
      case "weather":
        return "text-gray-700 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
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
    const distance = R * c;
    return `${distance.toFixed(1)} km`;
  };

  const handleReport = async () => {
    if (
      reportForm.alert_type &&
      reportForm.title &&
      reportForm.description &&
      reportForm.location_address
    ) {
      try {
        const response = await fetch("/api/alerts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...reportForm,
            user_id: null, // For now, we'll allow anonymous reports
          }),
        });

        if (response.ok) {
          // Refresh alerts after successful submission
          await fetchInitialData();
          setReportForm({
            alert_type: "",
            severity: "medium",
            title: "",
            description: "",
            location_address: "",
            province: "",
            district: "",
            latitude: userLocation?.lat || -1.9441,
            longitude: userLocation?.lng || 30.0619,
          });
          setIsReporting(false);
        }
      } catch (error) {
        console.error("Error submitting alert:", error);
      }
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const minutes = Math.floor((now.getTime() - alertTime.getTime()) / 60000);

    if (minutes < 1) return "Vuba vuba"; // "Just now" in Kinyarwanda
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getProvinceDistricts = (province: string) => {
    return rwandaLocations
      .filter((loc) => loc.province === province)
      .map((loc) => loc.district)
      .filter((district, index, arr) => arr.indexOf(district) === index);
  };

  const handleCall911 = () => {
    window.open(`tel:${RWANDA_EMERGENCY_NUMBERS.POLICE}`, "_self");
  };

  const handleStartLocationSharing = async (emergencyType?: string) => {
    try {
      const shareId = await locationSharingService.startLocationSharing(
        emergencyType,
        "Emergency location sharing activated",
      );
      if (shareId) {
        setIsLocationSharing(true);
        setShowLocationShare(false);

        // Show sharing options
        const confirmed = confirm(
          language === "en"
            ? "Location sharing started! Share with family via WhatsApp or SMS?"
            : "Gusangira ahantu byatangiye! Sangira n'umuryango binyuze kuri WhatsApp cyangwa SMS?",
        );

        if (confirmed) {
          locationSharingService.shareViaWhatsApp(shareId);
        }
      }
    } catch (error) {
      console.error("Failed to start location sharing:", error);
      alert(
        language === "en"
          ? "Failed to access your location"
          : "Ntabwo byashobokaga kubona ahantu hawe",
      );
    }
  };

  const handleStopLocationSharing = () => {
    locationSharingService.stopAllLocationSharing();
    setIsLocationSharing(false);
  };

  const t = (key: keyof typeof TRANSLATIONS) => {
    return TRANSLATIONS[key][language];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 text-primary mx-auto mb-4">
            ⚡
          </div>
          <p className="text-gray-600">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  {t("app_title")}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {t("app_subtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "rw" : "en")}
                className="text-xs"
              >
                🌐 {language === "en" ? "RW" : "EN"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-xs"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {isLocationSharing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopLocationSharing}
                  className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <Navigation className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {t("stop_sharing")}
                  </span>
                  <span className="sm:hidden">📍</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartLocationSharing()}
                  className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Share2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {t("share_location")}
                  </span>
                  <span className="sm:hidden">📍</span>
                </Button>
              )}

              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4" />
                {userLocation ? t("location_found") : t("location_unknown")}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:border-red-800 dark:text-red-300"
                onClick={handleCall911}
              >
                <Phone className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("call_emergency")}</span>
                <span className="sm:hidden">112</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card className="h-[400px] sm:h-[500px] lg:h-[600px]">
              <CardHeader className="pb-4">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-lg sm:text-xl">
                    {t("emergency_map_title")}
                  </span>
                  <Dialog open={isReporting} onOpenChange={setIsReporting}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        {t("emergency_report")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-auto">
                      <DialogHeader>
                        <DialogTitle>{t("emergency_report")}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="emergency-type">
                            {t("emergency_type")}
                          </Label>
                          <Select
                            value={reportForm.alert_type}
                            onValueChange={(value) =>
                              setReportForm({
                                ...reportForm,
                                alert_type: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("select_emergency_type")} />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(EMERGENCY_TYPES).map(
                                ([key, type]) => (
                                  <SelectItem key={key} value={key}>
                                    {type.icon} {type[language]}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="province">{t("province")}</Label>
                          <Select
                            value={reportForm.province}
                            onValueChange={(value) =>
                              setReportForm({
                                ...reportForm,
                                province: value,
                                district: "",
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("select_province")} />
                            </SelectTrigger>
                            <SelectContent>
                              {RWANDA_PROVINCES.map((province) => (
                                <SelectItem key={province} value={province}>
                                  {province}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {reportForm.province && (
                          <div>
                            <Label htmlFor="district">{t("district")}</Label>
                            <Select
                              value={reportForm.district}
                              onValueChange={(value) =>
                                setReportForm({
                                  ...reportForm,
                                  district: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t("select_district")} />
                              </SelectTrigger>
                              <SelectContent>
                                {getProvinceDistricts(reportForm.province).map(
                                  (district) => (
                                    <SelectItem key={district} value={district}>
                                      {district}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <Label htmlFor="title">{t("title")}</Label>
                          <Input
                            id="title"
                            value={reportForm.title}
                            onChange={(e) =>
                              setReportForm({
                                ...reportForm,
                                title: e.target.value,
                              })
                            }
                            placeholder={t("enter_title")}
                          />
                        </div>

                        <div>
                          <Label htmlFor="location">{t("location")}</Label>
                          <Input
                            id="location"
                            value={reportForm.location_address}
                            onChange={(e) =>
                              setReportForm({
                                ...reportForm,
                                location_address: e.target.value,
                              })
                            }
                            placeholder={t("enter_location")}
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">
                            {t("description")}
                          </Label>
                          <Textarea
                            id="description"
                            value={reportForm.description}
                            onChange={(e) =>
                              setReportForm({
                                ...reportForm,
                                description: e.target.value,
                              })
                            }
                            placeholder={t("describe_emergency")}
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsReporting(false)}
                          >
                            {t("cancel")}
                          </Button>
                          <Button
                            onClick={handleReport}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {t("submit_report")}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0">
                <RwandaEmergencyMap
                  alerts={alerts}
                  userLocation={userLocation}
                  onLocationSelect={(lat, lng, address) => {
                    setReportForm((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      location_address: address,
                    }));
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Alerts Feed */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  {t("active_alerts")} ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {t("no_active_alerts")}
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <Alert
                      key={alert.id}
                      className={getEmergencyColor(alert.alert_type)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                          <span className="text-lg">
                            {getEmergencyIcon(alert.alert_type)}
                          </span>
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <Badge
                                className={getSeverityColor(alert.severity)}
                                variant="secondary"
                              >
                                {alert.severity.toUpperCase()}
                              </Badge>
                              {userLocation && (
                                <span className="text-xs text-gray-500">
                                  {calculateDistance(
                                    userLocation.lat,
                                    userLocation.lng,
                                    alert.latitude,
                                    alert.longitude,
                                  )}
                                </span>
                              )}
                            </div>
                            <AlertDescription className="font-medium text-sm sm:text-base">
                              {alert.title}
                            </AlertDescription>
                            <p className="text-sm text-gray-600">
                              {alert.description}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                  {alert.location_address}
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(alert.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {alert.province} - {alert.district}
                              {alert.user_name &&
                                ` • Byatanzwe na: ${alert.user_name}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  {t("quick_actions")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(EMERGENCY_TYPES).map(([key, type]) => (
                  <Button
                    key={key}
                    className="w-full justify-center sm:justify-start text-sm"
                    style={{
                      backgroundColor:
                        key === "fire"
                          ? "#dc2626"
                          : key === "flood"
                            ? "#1d4ed8"
                            : key === "accident"
                              ? "#f59e0b"
                              : key === "medical"
                                ? "#16a34a"
                                : "#6b21a8",
                    }}
                    onClick={() => {
                      setReportForm({ ...reportForm, alert_type: key });
                      setIsReporting(true);
                    }}
                  >
                    <span className="mr-2">{type.icon}</span>
                    <span className="hidden sm:inline">{type[language]}</span>
                    <span className="sm:hidden">{type.icon}</span>
                  </Button>
                ))}

                <div className="pt-2 border-t space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-center sm:justify-start text-sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">
                      {t("emergency_contacts")}
                    </span>
                    <span className="sm:hidden">📞</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-center sm:justify-start text-sm text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => notificationService.testNotification()}
                  >
                    <span className="mr-2">🔔</span>
                    <span className="hidden sm:inline">{t("test_notifications")}</span>
                    <span className="sm:hidden">🔔</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            {emergencyContacts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {t("emergency_contacts")}
                </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {emergencyContacts
                    .filter((contact) => contact.is_national)
                    .slice(0, 4)
                    .map((contact, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm font-medium">
                          {contact.service_name}
                        </span>
                        <a
                          href={`tel:${contact.phone_number}`}
                          className="text-primary hover:underline"
                        >
                          {contact.phone_number}
                        </a>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
