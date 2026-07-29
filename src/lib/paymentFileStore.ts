import { supabase } from "@/integrations/supabase/client";

export interface StorePaymentFileArgs {
  fileName: string;
  content: string;
  contentType?: string;
  fileKind: "bacs_pain001" | "payment_batch_report";
  batchReference?: string;
  paymentIds: string[];
  totalAmount: number;
  currency?: string;
}

export function downloadText(fileName: string, content: string, contentType = "application/xml") {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Uploads a generated payment file to the private payment-files store and registers it. */
export async function storePaymentFile(args: StorePaymentFileArgs) {
  const contentType = args.contentType ?? "application/xml";
  const path = `${new Date().toISOString().slice(0, 10)}/${args.fileName}`;

  const { error: upErr } = await supabase.storage
    .from("payment-files")
    .upload(path, new Blob([args.content], { type: contentType }), {
      contentType,
      upsert: true,
    });
  if (upErr) throw upErr;

  const { data: u } = await supabase.auth.getUser();
  const { error: insErr } = await supabase.from("payment_files").insert({
    file_name: args.fileName,
    file_kind: args.fileKind,
    content_type: contentType,
    storage_path: path,
    batch_reference: args.batchReference ?? null,
    payment_count: args.paymentIds.length,
    total_amount: args.totalAmount,
    currency: args.currency ?? "GBP",
    status: "generated",
    payment_ids: args.paymentIds,
    created_by: u.user?.id ?? null,
  });
  if (insErr) throw insErr;

  return path;
}

export async function downloadStoredPaymentFile(storagePath: string, fileName: string) {
  const { data, error } = await supabase.storage.from("payment-files").download(storagePath);
  if (error) throw error;
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
