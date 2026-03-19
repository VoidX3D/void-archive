import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getPublicUrl(projectId: string, fileName: string) {
  const { data } = supabase.storage
    .from('void-archive')
    .getPublicUrl(`${projectId}/${fileName}`)
  return data.publicUrl
}
