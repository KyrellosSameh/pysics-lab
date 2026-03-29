import fs from 'fs';
import { createClient } from "@supabase/supabase-js";
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if(k && v) env[k.trim()] = v.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkFKs() {
  const { data, error } = await supabase.rpc('get_foreign_keys');
  console.log("RPC Error/Result (need to use raw script if this fails):", error, data);
}

checkFKs();
