import { createClient } from '@supabase/supabase-js'

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
if (!supabaseUrl.startsWith('http')) supabaseUrl = 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getPublicUrl(projectId: string, fileName: string) {
  const { data } = supabase.storage
    .from('void-archive')
    .getPublicUrl(`${projectId}/${fileName}`)
  return data.publicUrl
}
