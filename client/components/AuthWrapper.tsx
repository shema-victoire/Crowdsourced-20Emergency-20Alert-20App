import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone, User, Shield } from "lucide-react";
import { TRANSLATIONS } from "@/lib/rwanda-data";
import { useLanguage } from "@/lib/language-context";

interface User {
  id: string;
  phone: string;
  name: string;
  isVerified: boolean;
}

interface AuthWrapperProps {
  children: React.ReactNode;
  language?: "en" | "rw";
}

export default function AuthWrapper({ children, language = "en" }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    verificationCode: "",
  });
  const [isVerifying, setIsVerifying] = useState(false);

  // Mock authentication - in production, this would use Stack Auth
  const handleAuth = async () => {
    if (authMode === "signup") {
      // Mock signup
      setIsVerifying(true);
      setTimeout(() => {
        const newUser: User = {
          id: Date.now().toString(),
          phone: formData.phone,
          name: formData.name,
          isVerified: true,
        };
        setUser(newUser);
        setShowAuth(false);
        setIsVerifying(false);
        setFormData({ phone: "", name: "", verificationCode: "" });
      }, 2000);
    } else {
      // Mock signin
      setIsVerifying(true);
      setTimeout(() => {
        const existingUser: User = {
          id: "existing",
          phone: formData.phone,
          name: "User",
          isVerified: true,
        };
        setUser(existingUser);
        setShowAuth(false);
        setIsVerifying(false);
        setFormData({ phone: "", name: "", verificationCode: "" });
      }, 1500);
    }
  };

  const handleSignOut = () => {
    setUser(null);
  };

  const t = (key: keyof typeof TRANSLATIONS) => {
    return TRANSLATIONS[key][language];
  };

  // For now, allow app usage without authentication but show banner
  return (
    <div>
      {/* Authentication status banner */}
      {!user && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-800">
              <Shield className="h-4 w-4" />
              <span className="text-sm">
                {t("auth_banner_text")}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              onClick={() => setShowAuth(true)}
            >
              <User className="h-4 w-4 mr-2" />
              {t("login_register")}
            </Button>
          </div>
        </div>
      )}

      {/* User info banner when authenticated */}
      {user && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800">
              <User className="h-4 w-4" />
              <span className="text-sm">
                {t("welcome_user")}, {user.name} ({user.phone})
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-green-300 text-green-800 hover:bg-green-100"
              onClick={handleSignOut}
            >
              {t("logout")}
            </Button>
          </div>
        </div>
      )}

      {/* Authentication Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              {authMode === "signin"
                ? `${t("login")} - ${t("app_title")}`
                : `${t("register")} - ${t("app_title")}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!isVerifying ? (
              <>
                <div>
                  <Label htmlFor="phone">{t("phone_number")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t("phone_placeholder")}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("sms_verification_info")}
                  </p>
                </div>

                {authMode === "signup" && (
                  <div>
                    <Label htmlFor="name">{t("full_name")}</Label>
                    <Input
                      id="name"
                      placeholder={t("full_name")}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                )}

                <Button
                  onClick={handleAuth}
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={
                    !formData.phone || (authMode === "signup" && !formData.name)
                  }
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {authMode === "signin" ? t("login") : t("register")}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setAuthMode(authMode === "signin" ? "signup" : "signin")
                    }
                    className="text-sm text-primary hover:underline"
                  >
                    {authMode === "signin"
                      ? t("no_account_register")
                      : t("have_account_login")}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 text-primary mx-auto mb-4">
                  📱
                </div>
                <h3 className="font-medium mb-2">{t("sending_sms")}</h3>
                <p className="text-sm text-gray-600">
                  {t("verification_text")} {formData.phone}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Main app content */}
      {children}
    </div>
  );
}
