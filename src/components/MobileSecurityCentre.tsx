import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Fingerprint, CheckCircle2, XCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function MobileSecurityCentre() {
  const [pushPerm, setPushPerm] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);

  useEffect(() => {
    if ("Notification" in window) setPushPerm(Notification.permission);
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
        .then((ok) => setBiometricSupported(!!ok))
        .catch(() => setBiometricSupported(false));
    }
    setBiometricRegistered(!!localStorage.getItem("airgead.webauthn.credId"));
    setSubscribed(!!localStorage.getItem("airgead.push.subscribed"));
  }, []);

  const enablePush = async () => {
    if (!("Notification" in window)) {
      toast.error("Push notifications not supported by this browser");
      return;
    }
    const perm = await Notification.requestPermission();
    setPushPerm(perm);
    if (perm !== "granted") {
      toast.error("Notification permission declined");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification("Pension Navigator", {
        body: "Notifications enabled. We'll alert you on contributions, transfers and reviews.",
        icon: "/favicon.ico",
      });
      localStorage.setItem("airgead.push.subscribed", "1");
      setSubscribed(true);
      toast.success("Push notifications enabled");
    } catch (e) {
      toast.error("Could not enable push");
    }
  };

  const sendTest = async () => {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification("Test notification", {
      body: "Your monthly contribution of £450 has been processed.",
      icon: "/favicon.ico",
    });
  };

  const registerBiometric = async () => {
    if (!biometricSupported) return toast.error("Biometric auth not supported");
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Pension Navigator" },
          user: { id: userId, name: "demo@airgead.co.uk", displayName: "Demo Client" },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
          attestation: "none",
        },
      }) as PublicKeyCredential | null;
      if (cred) {
        localStorage.setItem("airgead.webauthn.credId", cred.id);
        setBiometricRegistered(true);
        toast.success("Biometric login registered");
      }
    } catch (e: any) {
      toast.error(e?.message || "Biometric registration cancelled");
    }
  };

  const verifyBiometric = async () => {
    const credId = localStorage.getItem("airgead.webauthn.credId");
    if (!credId) return toast.error("Register a credential first");
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const res = await navigator.credentials.get({
        publicKey: {
          challenge,
          userVerification: "required",
          timeout: 60000,
          allowCredentials: [{ type: "public-key", id: Uint8Array.from(atob(credId.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)) }],
        },
      });
      if (res) toast.success("Biometric verified ✓");
    } catch (e: any) {
      toast.error(e?.message || "Verification failed");
    }
  };

  const Pill = ({ ok, children }: { ok: boolean; children: React.ReactNode }) =>
    ok ? (
      <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 gap-1">
        <CheckCircle2 className="h-3 w-3" /> {children}
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" /> {children}</Badge>
    );

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-3xl">
      <header className="flex items-center gap-3">
        <Smartphone className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Mobile Security Centre</h1>
          <p className="text-sm text-muted-foreground">Push notifications and biometric sign-in for the mobile app.</p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Push notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Permission:</span>
            <Pill ok={pushPerm === "granted"}>{pushPerm}</Pill>
            <Pill ok={subscribed}>{subscribed ? "Subscribed" : "Not subscribed"}</Pill>
          </div>
          <p className="text-sm text-muted-foreground">
            Get alerts on contributions, KYC events, transfer milestones, drawdown payments and annual review reminders.
          </p>
          <div className="flex gap-2">
            <Button onClick={enablePush} disabled={pushPerm === "granted" && subscribed}>Enable notifications</Button>
            <Button variant="outline" onClick={sendTest} disabled={pushPerm !== "granted"}>Send test</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Fingerprint className="h-4 w-4" /> Biometric sign-in (WebAuthn)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Device:</span>
            <Pill ok={biometricSupported}>{biometricSupported ? "Supported" : "Not available"}</Pill>
            <Pill ok={biometricRegistered}>{biometricRegistered ? "Registered" : "Not registered"}</Pill>
          </div>
          <p className="text-sm text-muted-foreground">
            Use Face ID, Touch ID, or Windows Hello to sign in without a password. Credentials never leave your device.
          </p>
          <div className="flex gap-2">
            <Button onClick={registerBiometric} disabled={!biometricSupported || biometricRegistered}>Register biometric</Button>
            <Button variant="outline" onClick={verifyBiometric} disabled={!biometricRegistered}>Test sign-in</Button>
            {biometricRegistered && (
              <Button variant="ghost" onClick={() => { localStorage.removeItem("airgead.webauthn.credId"); setBiometricRegistered(false); toast("Credential removed"); }}>
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
