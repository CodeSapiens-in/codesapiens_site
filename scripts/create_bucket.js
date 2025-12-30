
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Try to find the service role key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY) in .env');
    process.exit(1);
}

if (supabaseKey === process.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('WARNING: Using ANON key. Bucket creation might fail due to RLS. Please add SUPABASE_SERVICE_ROLE_KEY to .env for admin access.');
} else {
    console.log('Using Service Role Key for admin access.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
    console.log('Attempting to create "user-uploads" bucket...');

    const { data, error } = await supabase.storage.createBucket('user-uploads', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('Bucket "user-uploads" already exists.');
        } else {
            console.error('Error creating bucket:', error);
            if (error.message.includes('violates row-level security')) {
                console.error('\nCRITICAL: RLS Violation. You are likely using the ANON key.');
                console.error('To fix this, you must either:');
                console.error('1. Add SUPABASE_SERVICE_ROLE_KEY=your_service_role_key to your .env file');
                console.error('2. Or create the "user-uploads" bucket manually in the Supabase Dashboard.');
            }
        }
    } else {
        console.log('Bucket "user-uploads" created successfully:', data);
    }
}

createBucket();
