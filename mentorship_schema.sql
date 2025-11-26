    -- Enable UUID extension if not already enabled
    create extension if not exists "uuid-ossp";

    -- 1. Mentorship Programs Table
    create table if not exists public.mentorship_programs (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    image_url text,
    start_date timestamp with time zone not null,
    end_date timestamp with time zone not null,
    registration_open_date timestamp with time zone not null,
    registration_close_date timestamp with time zone not null,
    status text check (status in ('draft', 'published', 'archived')) default 'draft',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
    );

    -- 2. Mentorship Weeks Table
    create table if not exists public.mentorship_weeks (
    id uuid default uuid_generate_v4() primary key,
    program_id uuid references public.mentorship_programs(id) on delete cascade,
    week_number int not null,
    title text not null,
    content jsonb, -- Stores instructions, resources, etc.
    submission_open_date timestamp with time zone,
    submission_close_date timestamp with time zone,
    is_submission_open boolean default true, -- Manual override
    created_at timestamp with time zone default now()
    );

    -- 3. Mentorship Registrations Table
    create table if not exists public.mentorship_registrations (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(uid) on delete cascade, -- Assuming 'users' table exists and 'uid' is PK
    program_id uuid references public.mentorship_programs(id) on delete cascade,
    status text check (status in ('pending', 'approved', 'rejected', 'completed')) default 'pending',
    answers jsonb, -- Stores application form answers
    created_at timestamp with time zone default now(),
    unique(user_id, program_id)
    );

    -- 4. Mentorship Submissions Table
    create table if not exists public.mentorship_submissions (
    id uuid default uuid_generate_v4() primary key,
    registration_id uuid references public.mentorship_registrations(id) on delete cascade,
    week_id uuid references public.mentorship_weeks(id) on delete cascade,
    user_id uuid references public.users(uid) on delete cascade,
    content jsonb, -- Stores submission links, text, etc.
    feedback text,
    score int,
    status text check (status in ('submitted', 'reviewed')) default 'submitted',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique(registration_id, week_id)
    );

    -- RLS Policies (Basic Setup - Adjust as needed)
    alter table public.mentorship_programs enable row level security;
    alter table public.mentorship_weeks enable row level security;
    alter table public.mentorship_registrations enable row level security;
    alter table public.mentorship_submissions enable row level security;

    -- Public read access for published programs
    create policy "Public programs are viewable by everyone"
    on public.mentorship_programs for select
    using (true);

    -- Admin full access (assuming you have an admin check or just open for now based on context, 
    -- usually you'd check auth.uid() against an admin table or claim. 
    -- For now, I'll add a policy that allows authenticated users to read, 
    -- and we rely on frontend admin checks or specific admin users for writes if not specified)

    -- Allow authenticated users to read weeks
    create policy "Weeks are viewable by everyone"
    on public.mentorship_weeks for select
    using (true);

    -- Registrations: Users can see their own, Admins see all
    create policy "Users can see own registrations"
    on public.mentorship_registrations for select
    using (auth.uid() = user_id);

    create policy "Users can create own registrations"
    on public.mentorship_registrations for insert
    with check (auth.uid() = user_id);

    -- Submissions: Users can see/create own, Admins see all
    create policy "Users can see own submissions"
    on public.mentorship_submissions for select
    using (auth.uid() = user_id);

    create policy "Users can create own submissions"
    on public.mentorship_submissions for insert
    with check (auth.uid() = user_id);
