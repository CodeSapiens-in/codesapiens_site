
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findResumeBucket() {
    console.log('Fetching a user with a resume_url...');

    const { data, error } = await supabase
        .from('users')
        .select('resume_url')
        .not('resume_url', 'is', null)
        .limit(1);

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    if (data && data.length > 0) {
        const url = data[0].resume_url;
        console.log('Found resume URL:', url);

        // Extract bucket name
        // URL format: https://PROJECT_ID.supabase.co/storage/v1/object/public/BUCKET_NAME/path/to/file
        const match = url.match(/\/storage\/v1\/object\/public\/([^\/]+)\//);
        if (match && match[1]) {
            console.log('Identified Bucket Name:', match[1]);
        } else {
            console.log('Could not extract bucket name from URL.');
        }
    } else {
        console.log('No users found with a resume_url.');
    }
}

findResumeBucket();
