import fs from 'fs';
import { createClient } from "@supabase/supabase-js";
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if(k && v) env[k.trim()] = v.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspectExams() {
  const { data, error } = await supabase
    .from('exams')
    .select('id, session_code, student_id, used, instructor_id')
    .eq('student_id', '4');
    
  console.log("Exam Data for student 4:", JSON.stringify(data, null, 2));
}

inspectExams();
