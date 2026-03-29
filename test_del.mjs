import fs from 'fs';
import { createClient } from "@supabase/supabase-js";
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if(k && v) env[k.trim()] = v.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkRLS() {
  const { data: students, error: err1 } = await supabase.from('students').select('student_id').limit(1);
  if (err1) console.error("Select student error:", err1);
  
  if (students && students.length > 0) {
    const sId = students[0].student_id;
    console.log("Found student:", sId, "Attempting delete...");
    
    // Let's not actually delete a real student if possible, just simulate what error we get.
    // We can insert a fake student and delete it.
    
    const fakeId = "999999999";
    const { error: insErr } = await supabase.from('students').insert({ student_id: fakeId, name: 'Fake', password: 'fake' });
    if(insErr) console.error("Insert fake student error:", insErr);
    
    const { error: delErr } = await supabase.from('students').delete().eq('student_id', fakeId);
    if(delErr) {
        console.error("Delete fake student error:", delErr);
    } else {
        console.log("Delete successful!");
    }
  } else {
    console.log("No students to test with.");
  }
}

checkRLS();
