import { createClient } from "@supabase/supabase-js";
const PUBLIC_URL = "https://eyvladpojbssdagheujo.supabase.co";
const PUBLIC_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dmxhZHBvamJzc2RhZ2hldWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NjkwMTIsImV4cCI6MjA2MTA0NTAxMn0.IKpGrL1C5J13L36uPxd0JLrr5_hTEZlTtIs85zi3GGU";
export const supabase = createClient(PUBLIC_URL, PUBLIC_KEY);
