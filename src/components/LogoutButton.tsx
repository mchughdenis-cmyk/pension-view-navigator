import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

/**
 * Header-level logout control. Only renders when there is an active Supabase
 * session — keeps the chrome clean on public/marketing routes.
 */
export function LogoutButton() {
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!signedIn) return null;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "Signed out", description: "You have been logged out." });
      navigate("/site", { replace: true });
    } catch (e: any) {
      toast({ title: "Sign-out failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 gap-1.5 text-xs">
      <LogOut className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Sign out</span>
    </Button>
  );
}
