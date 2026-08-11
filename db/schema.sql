-- MedTrack schema — mirrors the shapes used in src/lib/mockData.js exactly,
-- so switching src/lib/api.js from mock to real queries is a straight swap.
-- Run this against Netlify DB (Postgres/Neon) when we connect the backend.

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

create table users (
  id              uuid primary key default gen_random_uuid(),
  -- Netlify Identity user id (sub claim from the JWT) links here once auth is connected.
  identity_id     text unique,
  display_name    text not null,
  email           text not null unique,
  is_patient      boolean not null default false,
  is_caretaker    boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Many-to-many: a caretaker can watch multiple patients, a patient can have
-- multiple caretakers.
create table patient_caretaker_links (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references users(id) on delete cascade,
  caretaker_id    uuid not null references users(id) on delete cascade,
  status          text not null default 'active' check (status in ('pending', 'active')),
  created_at      timestamptz not null default now(),
  unique (patient_id, caretaker_id)
);

create table invites (
  id              uuid primary key default gen_random_uuid(),
  from_user_id    uuid not null references users(id) on delete cascade,
  method          text not null check (method in ('email', 'code')),
  target_email    text,
  code            text unique,
  status          text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at      timestamptz not null default now()
);

create table medications (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references users(id) on delete cascade,
  name            text not null,
  type            text not null check (type in ('pill', 'drops', 'capsule', 'other')),
  dosage          text,
  instructions    text,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- `schedule_label` is a human-readable summary (e.g. "Every 8 hours",
-- "Daily at 8:00 AM and 8:00 PM") derived from the structured schedule_*
-- columns below and stored denormalized, so display never needs to
-- reformat structured fields client-side (see src/lib/scheduleUtils.js).
alter table medications add column schedule_label text;
alter table medications add column other_type_label text; -- elaboration when type = 'other'
alter table medications add column schedule_type text check (schedule_type in ('daily', 'interval', 'as_needed'));
alter table medications add column schedule_times time[]; -- schedule_type = 'daily'
alter table medications add column schedule_interval_hours smallint; -- schedule_type = 'interval'
alter table medications add column schedule_start_time time; -- schedule_type = 'interval'
alter table medications add column schedule_as_needed_gap_hours smallint; -- schedule_type = 'as_needed', optional

create table dose_logs (
  id              uuid primary key default gen_random_uuid(),
  medication_id   uuid not null references medications(id) on delete cascade,
  scheduled_for   timestamptz not null,
  taken_at        timestamptz,
  status          text not null default 'upcoming'
                    check (status in ('upcoming', 'due', 'overdue', 'taken', 'skipped')),
  -- Status held just before this dose was marked taken, so marking it
  -- "not taken" again can restore it instead of guessing from the clock.
  previous_status text check (previous_status in ('upcoming', 'due', 'overdue', 'skipped')),
  created_at      timestamptz not null default now()
);

create index idx_medications_patient on medications(patient_id) where active;
create index idx_dose_logs_medication on dose_logs(medication_id);
create index idx_links_patient on patient_caretaker_links(patient_id);
create index idx_links_caretaker on patient_caretaker_links(caretaker_id);
create index idx_invites_code on invites(code) where status = 'pending';

-- Dose status is expected to be recomputed periodically (upcoming -> due ->
-- overdue) once a scheduled function is added in a later phase. For MVP,
-- status is set directly by the API (e.g. on mark-as-taken).
