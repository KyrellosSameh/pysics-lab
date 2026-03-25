import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tuuylmyeeibzncoepgch.supabase.co'
const supabaseKey = 'sb_publishable_YxXwWQwgMogoOk5Y86CHlw_Yvtrr4w8'

export const supabase = createClient(supabaseUrl, supabaseKey)