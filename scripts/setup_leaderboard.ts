import { Client } from 'pg';

// Supabase PostgeSQL Database Password is required.
// For security, Supabase requires Postgres port 5432 and the db password.
// The user gave me the anon and service_role JWT keys, but I cannot run DDL without the PostgreSQL Database URI.
console.log('To set up the Leaderboard Table, please run the following SQL command in your Supabase SQL Editor:');
console.log(`
CREATE TABLE leaderboard (
    id text PRIMARY KEY,
    username text NOT NULL,
    xp integer DEFAULT 0,
    streak integer DEFAULT 0,
    "avatarUrl" text,
    last_updated timestamp with time zone DEFAULT now()
);

-- Turn off Row Level Security (RLS) entirely so anyone can read/write their scores via the anon key
ALTER TABLE leaderboard DISABLE ROW LEVEL SECURITY;
`);
