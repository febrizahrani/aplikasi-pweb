import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = "https://suhskylfwwxjsoyyhikt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aHNreWxmd3d4anNveXloaWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzOTQwNjYsImV4cCI6MjA5ODk3MDA2Nn0.YZmkyNcnxsGmbVhi7WstDplxpo2l3uu1aqljRJk_8QU";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components cannot set cookies
        }
      },
    },
  });
}
