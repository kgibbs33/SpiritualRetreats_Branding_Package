/**
 * Server-only Supabase secret key (admin client). Do not import from client components.
 */

/** Runtime lookup so build-time env substitution does not freeze `undefined` for Docker-only secrets. */
function serverEnv(name: string): string | undefined {
  return process.env[name];
}

export function getSupabaseSecretKey(): string {
  const key =
    serverEnv("SUPABASE_SECRET_KEY") ?? serverEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) {
    throw new Error(
      "Missing Supabase secret key: set SUPABASE_SECRET_KEY (preferred) or SUPABASE_SERVICE_ROLE_KEY (legacy)"
    );
  }
  return key;
}
