import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = "https://suhskylfwwxjsoyyhikt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aHNreWxmd3d4anNveXloaWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzOTQwNjYsImV4cCI6MjA5ODk3MDA2Nn0.YZmkyNcnxsGmbVhi7WstDplxpo2l3uu1aqljRJk_8QU";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
