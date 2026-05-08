import { supabase } from "@/integrations/supabase/client";

export type NotificationChannel = "inapp" | "email" | "sms";
export type NotificationSeverity = "info" | "success" | "warning" | "error";

export interface NotifyEvent {
  event_type: string;
  title: string;
  body: string;
  severity?: NotificationSeverity;
  client_id?: string | null;
  email?: string | null;
  phone?: string | null;
  channels?: NotificationChannel[]; // defaults to all three
  metadata?: Record<string, any>;
}

const DEMO_EMAIL = "alex.morgan@example.co.uk";
const DEMO_PHONE = "+44 7700 900123";

/**
 * Fan out a single business event into the notifications table on each
 * requested channel. Email/SMS are MOCKED — we render a realistic preview
 * and store it for the notifications centre, but no real send occurs.
 */
export async function notify(ev: NotifyEvent) {
  const channels = ev.channels ?? ["inapp", "email", "sms"];
  const recipientEmail = ev.email ?? DEMO_EMAIL;
  const recipientPhone = ev.phone ?? DEMO_PHONE;
  const severity = ev.severity ?? "info";

  const rows = channels.map(channel => {
    const recipient =
      channel === "email" ? recipientEmail :
      channel === "sms"   ? recipientPhone : null;

    // SMS messages must be short — render a compact body
    const body = channel === "sms"
      ? `${ev.title}. ${ev.body}`.slice(0, 160)
      : ev.body;

    return {
      client_id: ev.client_id ?? null,
      channel,
      event_type: ev.event_type,
      title: ev.title,
      body,
      severity,
      recipient,
      status: "delivered",
      metadata: {
        ...(ev.metadata ?? {}),
        mock: channel !== "inapp",
        provider: channel === "email" ? "Lovable Emails (mock preview)"
                : channel === "sms"   ? "Twilio (mock preview)"
                : "in-app",
      },
    };
  });

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) console.warn("notify() failed", error);
}

/** Convenience builders so call-sites stay tidy. */
export const Notifications = {
  consentGranted: (bankName: string, clientId?: string) => notify({
    event_type: "consent.granted",
    title: "Open Banking consent granted",
    body: `You connected ${bankName} via Open Banking. Consent is valid for 90 days under PSD2 SCA. You can revoke it any time.`,
    severity: "success",
    client_id: clientId,
    metadata: { bank: bankName },
  }),

  consentExpired: (bankName: string, clientId?: string) => notify({
    event_type: "consent.expired",
    title: "Open Banking consent expired",
    body: `Your ${bankName} consent has expired. Reconnect to keep balances and transactions in sync.`,
    severity: "warning",
    client_id: clientId,
    metadata: { bank: bankName },
  }),

  mandateSigned: (reference: string, amount: number, frequency: string, clientId?: string) => notify({
    event_type: "mandate.signed",
    title: "Direct Debit mandate confirmed",
    body: `Your ${frequency} Direct Debit of £${Number(amount).toLocaleString()} (ref ${reference}) has been signed under the Direct Debit Guarantee. Bacs takes up to 3 working days to activate.`,
    severity: "success",
    client_id: clientId,
    metadata: { reference, amount, frequency },
  }),

  paymentSettled: (amount: number, reference: string, clientId?: string) => notify({
    event_type: "payment.settled",
    title: "Contribution received",
    body: `Your £${Number(amount).toLocaleString()} contribution (${reference}) has settled to your pension. Tax relief will be reclaimed automatically via RAS.`,
    severity: "success",
    client_id: clientId,
    metadata: { reference, amount },
  }),

  kycApproved: (riskScore: number, clientId?: string) => notify({
    event_type: "kyc.approved",
    title: "Identity verified",
    body: `All KYC and AML checks passed (risk score ${riskScore}/100). Your account is fully active and ready to fund.`,
    severity: "success",
    client_id: clientId,
    metadata: { risk_score: riskScore },
  }),

  kycReview: (riskScore: number, reason: string, clientId?: string) => notify({
    event_type: "kyc.review",
    title: "KYC under manual review",
    body: `${reason} An adviser will review your case within 1 business day. Your risk score is ${riskScore}/100.`,
    severity: "warning",
    client_id: clientId,
    metadata: { risk_score: riskScore, reason },
  }),

  kycRejected: (reason: string, clientId?: string) => notify({
    event_type: "kyc.rejected",
    title: "Identity verification declined",
    body: `We were unable to verify your identity. Reason: ${reason}. Please contact support to discuss next steps.`,
    severity: "error",
    client_id: clientId,
    metadata: { reason },
  }),
};
