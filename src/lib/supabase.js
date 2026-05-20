import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iofbuiyvnxhqkanvkcem.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZmJ1aXl2bnhocWthbnZrY2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNTQzNzQsImV4cCI6MjA5NDgzMDM3NH0.hr4WDLM8jQlDbEZgl_qQC7DttbW6n_m_NT2A9hM5iJk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
