import { createClient } from "@supabase/supabase-js";

export type Tenant = {
  org_id: string;
  host: string;
};

const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY;

// Org default que Comet creó
const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

function getHostFromRequest(request: Request): string {
  const xfHost = request.headers.get("x-forwarded-host");
  const host = (xfHost || request.headers.get("host") || "").toLowerCase();
  return host.split(":")[0]; // quita puerto
}

export async function resolveTenant(request: Request): Promise<Tenant> {
  const host = getHostFromRequest(request) || "unknown-host";

  // Cliente público (solo lectura)
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("domains")
    .select("org_id")
    .eq("host", host)
    .maybeSingle();

  if (error) {
    // fallback silencioso
    return { org_id: DEFAULT_ORG_ID, host };
  }

  return { org_id: data?.org_id ?? DEFAULT_ORG_ID, host };
}
