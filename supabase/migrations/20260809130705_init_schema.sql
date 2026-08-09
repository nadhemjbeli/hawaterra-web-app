-- HAWATERRA V0.1 schema: plant_species, cultivar, plant, observation, plant_photo
-- See ARCHITECTURE.md for the full design rationale.

create table plant_species (
  id uuid primary key default gen_random_uuid(),
  common_name text not null,
  scientific_name text,
  created_at timestamptz not null default now()
);

create table cultivar (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references plant_species(id) on delete restrict,
  name text not null,
  notes text,
  created_at timestamptz not null default now(),
  constraint cultivar_species_name_key unique (species_id, name),
  constraint cultivar_id_species_id_key unique (id, species_id)
);

create table plant (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  code text not null,
  species_id uuid not null references plant_species(id) on delete restrict,
  cultivar_id uuid,
  source text,
  acquired_at date,
  planted_at date,
  propagation_method text,
  location text,
  container_liters numeric,
  status text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plant_user_code_key unique (user_id, code),
  constraint plant_id_user_id_key unique (id, user_id),
  constraint plant_container_liters_check
    check (container_liters is null or container_liters >= 0),
  constraint plant_status_check check (status in (
    'cutting', 'rooting', 'growing', 'flowering', 'fruiting',
    'dormant', 'stressed', 'sick', 'dead', 'archived'
  )),
  constraint plant_cultivar_species_fk foreign key (cultivar_id, species_id)
    references cultivar(id, species_id)
);

create table observation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  plant_id uuid not null,
  type text not null,
  notes text not null,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint observation_type_check check (type in (
    'general', 'growth', 'rooting', 'flowering', 'fruiting', 'pest',
    'disease', 'pruning', 'transplant', 'propagation', 'weather_damage'
  )),
  constraint observation_plant_user_fk foreign key (plant_id, user_id)
    references plant(id, user_id) on delete cascade,
  constraint observation_id_plant_id_key unique (id, plant_id)
);

create table plant_photo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  plant_id uuid not null,
  observation_id uuid,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now(),
  constraint plant_photo_plant_user_fk foreign key (plant_id, user_id)
    references plant(id, user_id) on delete cascade,
  constraint plant_photo_observation_plant_fk foreign key (observation_id, plant_id)
    references observation(id, plant_id) on delete set null (observation_id)
);

create index observation_plant_user_idx on observation (plant_id, user_id);
create index plant_photo_plant_user_idx on plant_photo (plant_id, user_id);

-- keep plant.updated_at accurate on every update
create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger plant_set_updated_at
before update on plant
for each row
execute function set_updated_at();

-- Row Level Security
alter table plant_species enable row level security;
alter table cultivar enable row level security;
alter table plant enable row level security;
alter table observation enable row level security;
alter table plant_photo enable row level security;

-- plant_species / cultivar: shared reference data, readable/insertable by any
-- authenticated user (there is a single account in V0.1)
create policy "plant_species_select" on plant_species
  for select using (auth.uid() is not null);
create policy "plant_species_insert" on plant_species
  for insert with check (auth.uid() is not null);

create policy "cultivar_select" on cultivar
  for select using (auth.uid() is not null);
create policy "cultivar_insert" on cultivar
  for insert with check (auth.uid() is not null);

-- plant: owned data. Select/insert/update only — hard delete is not a V0.1 feature.
create policy "plant_select_own" on plant
  for select using (user_id = auth.uid());
create policy "plant_insert_own" on plant
  for insert with check (user_id = auth.uid());
create policy "plant_update_own" on plant
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- observation: owned data. Select/insert only — editing/deleting observations
-- is not a V0.1 feature.
create policy "observation_select_own" on observation
  for select using (user_id = auth.uid());
create policy "observation_insert_own" on observation
  for insert with check (user_id = auth.uid());

-- plant_photo: owned data. Select/insert only, same reasoning as observation.
create policy "plant_photo_select_own" on plant_photo
  for select using (user_id = auth.uid());
create policy "plant_photo_insert_own" on plant_photo
  for insert with check (user_id = auth.uid());

-- Seed data: first species/cultivar needed for the DF-001 success criterion.
-- scientific_name left null rather than guess at an unverified taxonomy.
with species as (
  insert into plant_species (common_name)
  values ('Dragon Fruit')
  returning id
)
insert into cultivar (species_id, name)
select id, 'Royal Red' from species;
