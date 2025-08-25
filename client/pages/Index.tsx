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
import { MapPin, Phone, AlertTriangle, Flame, Droplets, Car, Users, Clock, Zap } from "lucide-react";

interface EmergencyAlert {
  id: string;
  type: "fire" | "flood" | "accident";
  description: string;
  location: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
  reportedBy: string;
  distance: string;
}

const mockAlerts: EmergencyAlert[] = [
  {
    id: "1",
    type: "fire",
    description: "Building fire reported on 5th floor",
    location: "Downtown Plaza, 123 Main St",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    severity: "critical",
    reportedBy: "Citizen Report",
    distance: "0.8 mi"
  },
  {
    id: "2",
    type: "accident",
    description: "Multi-vehicle collision blocking traffic",
    location: "Highway 101, Mile Marker 15",
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    severity: "high",
    reportedBy: "Traffic Authority",
    distance: "2.1 mi"
  },
  {
    id: "3",
    type: "flood",
    description: "Flash flood warning - road closure",
    location: "River Road & Oak Avenue",
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    severity: "medium",
    reportedBy: "Weather Service",
    distance: "3.5 mi"
  }
];

export default function Index() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(mockAlerts);
  const [isReporting, setIsReporting] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: "",
    description: "",
    location: ""
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Request geolocation on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  }, []);

  const getEmergencyIcon = (type: string) => {
    switch (type) {
      case "fire": return <Flame className="h-4 w-4" />;
      case "flood": return <Droplets className="h-4 w-4" />;
      case "accident": return <Car className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getEmergencyColor = (type: string) => {
    switch (type) {
      case "fire": return "text-emergency-fire bg-red-50 border-red-200";
      case "flood": return "text-emergency-flood bg-blue-50 border-blue-200";
      case "accident": return "text-emergency-accident bg-orange-50 border-orange-200";
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

  const handleReport = () => {
    if (reportForm.type && reportForm.description && reportForm.location) {
      const newAlert: EmergencyAlert = {
        id: Date.now().toString(),
        type: reportForm.type as "fire" | "flood" | "accident",
        description: reportForm.description,
        location: reportForm.location,
        timestamp: new Date(),
        severity: "medium",
        reportedBy: "You",
        distance: "0.0 mi"
      };
      
      setAlerts([newAlert, ...alerts]);
      setReportForm({ type: "", description: "", location: "" });
      setIsReporting(false);
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

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
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">SafeAlert</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Emergency Response Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {userLocation ? "Location: Active" : "Location: Disabled"}
              </div>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Phone className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Call 911</span>
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
                  <span className="text-lg sm:text-xl">Emergency Map</span>
                  <Dialog open={isReporting} onOpenChange={setIsReporting}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Report Emergency
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Report Emergency</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="emergency-type">Emergency Type</Label>
                          <Select value={reportForm.type} onValueChange={(value) => setReportForm({...reportForm, type: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select emergency type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fire">🔥 Fire</SelectItem>
                              <SelectItem value="flood">💧 Flood</SelectItem>
                              <SelectItem value="accident">🚗 Accident</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={reportForm.location}
                            onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
                            placeholder="Enter location or address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={reportForm.description}
                            onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                            placeholder="Describe the emergency situation..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsReporting(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleReport} className="bg-primary hover:bg-primary/90">
                            Submit Report
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0">
                {/* Map Placeholder */}
                <div className="h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center z-10">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Interactive Emergency Map</p>
                    <p className="text-sm text-gray-400">Real-time emergency locations and alerts</p>
                  </div>
                  
                  {/* Simulated map pins */}
                  {alerts.slice(0, 3).map((alert, index) => (
                    <div
                      key={alert.id}
                      className={`absolute ${index === 0 ? 'top-1/4 left-1/3' : index === 1 ? 'top-2/3 right-1/4' : 'top-1/2 left-2/3'}`}
                    >
                      <div className={`p-2 rounded-full shadow-lg ${alert.type === 'fire' ? 'bg-red-500' : alert.type === 'flood' ? 'bg-blue-500' : 'bg-orange-500'} text-white animate-pulse`}>
                        {getEmergencyIcon(alert.type)}
                      </div>
                    </div>
                  ))}
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
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {alerts.map((alert) => (
                  <Alert key={alert.id} className={getEmergencyColor(alert.type)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getEmergencyIcon(alert.type)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-500">{alert.distance}</span>
                          </div>
                          <AlertDescription className="font-medium">
                            {alert.description}
                          </AlertDescription>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {alert.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(alert.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Reported by: {alert.reportedBy}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Alert>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white">
                  <Flame className="h-4 w-4 mr-2" />
                  Report Fire Emergency
                </Button>
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                  <Droplets className="h-4 w-4 mr-2" />
                  Report Flood/Water Emergency
                </Button>
                <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white">
                  <Car className="h-4 w-4 mr-2" />
                  Report Traffic Accident
                </Button>
                <div className="pt-2 border-t">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    View Nearby Volunteers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
