import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, AlertTriangle, Flame, Droplets, Car, Users, Clock, Zap, Shield, Plus } from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const RwandaEmergencyMap = dynamic(() => import('@/components/RwandaEmergencyMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 text-green-600 mx-auto mb-2">🗺️</div>
        <p className="text-gray-600">Gukusanya ikarita ya Rwanda...</p>
      </div>
    </div>
  ),
});
import { 
  EmergencyAlert, 
  EmergencyContact, 
  RwandaLocation,
  RWANDA_EMERGENCY_NUMBERS,
  EMERGENCY_TYPES,
  RWANDA_PROVINCES,
  TRANSLATIONS 
} from "@/lib/rwanda-data";

export default function Index() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [rwandaLocations, setRwandaLocations] = useState<RwandaLocation[]>([]);
  const [isReporting, setIsReporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<'en' | 'rw'>('en');
  const [reportForm, setReportForm] = useState({
    alert_type: "",
    severity: "medium",
    title: "",
    description: "",
    location_address: "",
    province: "",
    district: "",
    latitude: 0,
    longitude: 0
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchInitialData();
    requestGeolocation();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch alerts, emergency contacts, and Rwanda locations
      const [alertsRes, contactsRes, locationsRes] = await Promise.all([
        fetch('/api/alerts'),
        fetch('/api/emergency-contacts'),
        fetch('/api/rwanda-locations')
      ]);

      const [alertsData, contactsData, locationsData] = await Promise.all([
        alertsRes.json(),
        contactsRes.json(), 
        locationsRes.json()
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
      console.error('Error fetching data:', error);
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
            lng: position.coords.longitude
          });
          // Update form with user location
          setReportForm(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.log("Location access denied:", error);
          // Default to Kigali coordinates if location denied
          setReportForm(prev => ({
            ...prev,
            latitude: -1.9441,
            longitude: 30.0619
          }));
        }
      );
    }
  };

  const getEmergencyIcon = (type: string) => {
    const emergencyType = EMERGENCY_TYPES[type as keyof typeof EMERGENCY_TYPES];
    return emergencyType?.icon || "⚠️";
  };

  const getEmergencyColor = (type: string) => {
    switch (type) {
      case "fire": return "text-red-700 bg-red-50 border-red-200";
      case "flood": return "text-blue-700 bg-blue-50 border-blue-200";
      case "accident": return "text-orange-700 bg-orange-50 border-orange-200";
      case "medical": return "text-green-700 bg-green-50 border-green-200";
      case "crime": return "text-purple-700 bg-purple-50 border-purple-200";
      case "weather": return "text-gray-700 bg-gray-50 border-gray-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-600 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return `${distance.toFixed(1)} km`;
  };

  const handleReport = async () => {
    if (reportForm.alert_type && reportForm.title && reportForm.description && reportForm.location_address) {
      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...reportForm,
            user_id: null // For now, we'll allow anonymous reports
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
            longitude: userLocation?.lng || 30.0619
          });
          setIsReporting(false);
        }
      } catch (error) {
        console.error('Error submitting alert:', error);
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
      .filter(loc => loc.province === province)
      .map(loc => loc.district)
      .filter((district, index, arr) => arr.indexOf(district) === index);
  };

  const handleCall911 = () => {
    window.open(`tel:${RWANDA_EMERGENCY_NUMBERS.POLICE}`, '_self');
  };

  const t = (key: keyof typeof TRANSLATIONS) => {
    return TRANSLATIONS[key][language];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 text-primary mx-auto mb-4">⚡</div>
          <p className="text-gray-600">Gukusanya amakuru ya SafeAlert Rwanda...</p>
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
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">SafeAlert Rwanda</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {language === 'en' ? 'Emergency Response Platform' : 'Urubuga rwo kwihangana n\'ubwoba'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'rw' : 'en')}
                className="text-xs"
              >
                {language === 'en' ? 'Kinyarwanda' : 'English'}
              </Button>
              
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {userLocation ? "Ahantu: Gakondo" : "Ahantu: Ntagaragara"}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                onClick={handleCall911}
              >
                <Phone className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Hamagara 112</span>
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
                    {language === 'en' ? 'Emergency Map - Rwanda' : 'Ikarita y\'Ubwoba - Rwanda'}
                  </span>
                  <Dialog open={isReporting} onOpenChange={setIsReporting}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('emergency_report')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-auto">
                      <DialogHeader>
                        <DialogTitle>{t('emergency_report')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="emergency-type">Ubwoko bw'Ubwoba</Label>
                          <Select value={reportForm.alert_type} onValueChange={(value) => setReportForm({...reportForm, alert_type: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Hitamo ubwoko bw'ubwoba" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(EMERGENCY_TYPES).map(([key, type]) => (
                                <SelectItem key={key} value={key}>
                                  {type.icon} {type[language]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="province">Intara</Label>
                          <Select value={reportForm.province} onValueChange={(value) => setReportForm({...reportForm, province: value, district: ""})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Hitamo intara" />
                            </SelectTrigger>
                            <SelectContent>
                              {RWANDA_PROVINCES.map((province) => (
                                <SelectItem key={province} value={province}>{province}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {reportForm.province && (
                          <div>
                            <Label htmlFor="district">Akarere</Label>
                            <Select value={reportForm.district} onValueChange={(value) => setReportForm({...reportForm, district: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Hitamo akarere" />
                              </SelectTrigger>
                              <SelectContent>
                                {getProvinceDistricts(reportForm.province).map((district) => (
                                  <SelectItem key={district} value={district}>{district}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <Label htmlFor="title">Umutwe</Label>
                          <Input
                            id="title"
                            value={reportForm.title}
                            onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                            placeholder="Andika umutwe w'ubwoba"
                          />
                        </div>

                        <div>
                          <Label htmlFor="location">{t('location')}</Label>
                          <Input
                            id="location"
                            value={reportForm.location_address}
                            onChange={(e) => setReportForm({...reportForm, location_address: e.target.value})}
                            placeholder="Aho ubwoba bwabaye (Urugero: KG 15 Ave, Kimisagara)"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">{t('description')}</Label>
                          <Textarea
                            id="description"
                            value={reportForm.description}
                            onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                            placeholder="Sobanura ubwoba bwose..."
                            className="min-h-[100px]"
                          />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsReporting(false)}>
                            Bireke
                          </Button>
                          <Button onClick={handleReport} className="bg-primary hover:bg-primary/90">
                            Ohereza Raporo
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0">
                {/* Map Placeholder with Rwanda outline */}
                <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center z-10">
                    <MapPin className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-gray-700 font-medium">
                      {language === 'en' ? 'Rwanda Emergency Map' : 'Ikarita y\'Ubwoba - Rwanda'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {language === 'en' ? 'Real-time emergency locations' : 'Amakuru y\'ubwoba mu gihe nyacyo'}
                    </p>
                  </div>
                  
                  {/* Simulated Rwanda map pins */}
                  {alerts.slice(0, 5).map((alert, index) => {
                    const positions = [
                      'top-1/3 left-1/2', // Kigali area
                      'top-1/4 left-1/3', // Northern
                      'top-2/3 left-1/3', // Southern
                      'top-1/2 right-1/4', // Eastern
                      'top-1/2 left-1/4'  // Western
                    ];
                    
                    return (
                      <div
                        key={alert.id}
                        className={`absolute ${positions[index] || 'top-1/2 left-1/2'}`}
                      >
                        <div className={`p-2 rounded-full shadow-lg animate-pulse text-white ${
                          alert.alert_type === 'fire' ? 'bg-red-500' : 
                          alert.alert_type === 'flood' ? 'bg-blue-500' : 
                          alert.alert_type === 'accident' ? 'bg-orange-500' :
                          alert.alert_type === 'medical' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}>
                          <span className="text-sm">{getEmergencyIcon(alert.alert_type)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Feed */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  {t('active_alerts')} ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {language === 'en' ? 'No active alerts' : 'Nta makuru ahari'}
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <Alert key={alert.id} className={getEmergencyColor(alert.alert_type)}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                          <span className="text-lg">{getEmergencyIcon(alert.alert_type)}</span>
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                                {alert.severity.toUpperCase()}
                              </Badge>
                              {userLocation && (
                                <span className="text-xs text-gray-500">
                                  {calculateDistance(userLocation.lat, userLocation.lng, alert.latitude, alert.longitude)}
                                </span>
                              )}
                            </div>
                            <AlertDescription className="font-medium text-sm sm:text-base">
                              {alert.title}
                            </AlertDescription>
                            <p className="text-sm text-gray-600">{alert.description}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{alert.location_address}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(alert.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {alert.province} - {alert.district}
                              {alert.user_name && ` • Byatanzwe na: ${alert.user_name}`}
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
                  {t('quick_actions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(EMERGENCY_TYPES).map(([key, type]) => (
                  <Button 
                    key={key}
                    className="w-full justify-center sm:justify-start text-sm"
                    style={{ backgroundColor: key === 'fire' ? '#dc2626' : key === 'flood' ? '#1d4ed8' : key === 'accident' ? '#f59e0b' : key === 'medical' ? '#16a34a' : '#6b21a8' }}
                    onClick={() => {
                      setReportForm({...reportForm, alert_type: key});
                      setIsReporting(true);
                    }}
                  >
                    <span className="mr-2">{type.icon}</span>
                    <span className="hidden sm:inline">{type[language]}</span>
                    <span className="sm:hidden">{type.icon}</span>
                  </Button>
                ))}
                
                <div className="pt-2 border-t">
                  <Button variant="outline" className="w-full justify-center sm:justify-start text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">
                      {language === 'en' ? 'Emergency Contacts' : 'Aho wahita ukisha'}
                    </span>
                    <span className="sm:hidden">Telefoni</span>
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
                    Aho wahita ukisha
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {emergencyContacts.filter(contact => contact.is_national).slice(0, 4).map((contact, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{contact.service_name}</span>
                      <a href={`tel:${contact.phone_number}`} className="text-primary hover:underline">
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
