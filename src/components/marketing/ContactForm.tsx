import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const ContactSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(80),
  lastName: z.string().trim().min(1, "Required").max(80),
  email: z.string().trim().email("Please enter a valid email").max(255),
  firm: z.string().trim().min(1, "Required").max(160),
  message: z.string().trim().max(2000, "Please keep under 2000 characters").optional(),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof ContactSchema>, string>>;

export function ContactForm() {
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", firm: "", message: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "error"; message?: string }>({ kind: "idle" });
  const honeypotRef = useRef<HTMLInputElement>(null);
  const renderedAt = useRef<number>(Date.now());

  useEffect(() => { renderedAt.current = Date.now(); }, []);

  const update = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: "idle" });
    const parsed = ContactSchema.safeParse(values);
    if (!parsed.success) {
      const fe: FieldErrors = {};
      for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (v && v[0]) fe[k as keyof FieldErrors] = v[0];
      }
      setErrors(fe);
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("marketing-lead", {
        body: {
          ...parsed.data,
          message: parsed.data.message ?? "",
          website: honeypotRef.current?.value ?? "",
          elapsedMs: Date.now() - renderedAt.current,
          source: "site/contact",
        },
      });
      if (error) throw error;
      if (data && (data as any).ok === false) throw new Error((data as any).error || "Submission failed");
      setStatus({ kind: "ok", message: "Thanks — we'll be in touch within one business day." });
      setValues({ firstName: "", lastName: "", email: "", firm: "", message: "" });
    } catch (err) {
      console.error("Contact form error", err);
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong. Please try again or email hello@airgead.co.uk.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (status.kind === "ok") {
    return (
      <Card>
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-secondary/15 grid place-items-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-secondary" />
          </div>
          <h3 className="text-xl font-semibold">Message received</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">{status.message}</p>
          <Button variant="outline" className="mt-6" onClick={() => setStatus({ kind: "idle" })}>
            Send another message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a demo</CardTitle>
        <CardDescription>We'll respond within one business day.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {/* Honeypot — hidden from real users */}
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] top-[-9999px] h-0 w-0 opacity-0 pointer-events-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" error={errors.firstName}>
              <input
                value={values.firstName} onChange={update("firstName")}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoComplete="given-name" maxLength={80}
              />
            </Field>
            <Field label="Last name" error={errors.lastName}>
              <input
                value={values.lastName} onChange={update("lastName")}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoComplete="family-name" maxLength={80}
              />
            </Field>
          </div>

          <Field label="Work email" error={errors.email}>
            <input
              type="email" value={values.email} onChange={update("email")}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoComplete="email" maxLength={255}
            />
          </Field>

          <Field label="Firm" error={errors.firm}>
            <input
              value={values.firm} onChange={update("firm")}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoComplete="organization" maxLength={160}
            />
          </Field>

          <Field label="What would you like to see?" error={errors.message} hint={`${values.message.length}/2000`}>
            <textarea
              rows={4} value={values.message} onChange={update("message")}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={2000}
            />
          </Field>

          {status.kind === "error" && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{status.message}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>) : "Request demo"}
          </Button>

          <p className="text-xs text-muted-foreground">
            By submitting, you agree we may contact you about Pension Navigator. We never share your details.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium">{label}</label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </div>
  );
}
