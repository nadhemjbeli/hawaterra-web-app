# HAWATERRA

HAWATERRA is a real agriculture + software project and a professional portfolio project.

The goal is to build software I actually use to manage my experimental farm.

## Product Identity

HAWATERRA is multi-crop, not a Dragon Fruit application. Dragon Fruit
(DF-001, used below as the concrete V0.1 test case) is one real experiment
among several the farm tracks — it must never define the core architecture.
The generic Plant model is the core entity; crop-specific data belongs in
future specialized modules, not on Plant itself.

See `HAWATERRA_SPEC.md` for the full multi-crop domain model, environmental
monitoring direction, and roadmap.

## Current Priority

We are currently building V0.1 only.

V0.1 must allow me to:

1. Log in
2. Create plants
3. View plants
4. Edit plants
5. Open a plant details page
6. Add observations
7. Upload plant photos
8. Use the app comfortably from a phone

First real success criterion:

Create:

DF-001
Species: Dragon Fruit
Cultivar: Royal Red

Then open DF-001 and add a real observation.

## Stack

Use:

- TypeScript
- Next.js
- React
- PostgreSQL
- Supabase for database/auth/storage
- Tailwind CSS

Prefer one repository.

## Engineering Principles

Prefer simple, working and maintainable software.

Do not overengineer.

Do not introduce unless explicitly requested:

- microservices
- Kubernetes
- event-driven architecture
- multitenancy
- Stripe
- ecommerce
- native mobile apps
- AI features

Before modifying code:

1. inspect the existing files
2. understand the current architecture
3. reuse existing utilities/components
4. make the smallest useful change
5. avoid unrelated refactoring
6. validate inputs
7. explain how I can test the change

Never invent existing files, functions, tables or architecture without inspecting the repository.

## Database

Use relational PostgreSQL modeling and foreign keys.

For V0.1 the main entities are:

- PlantSpecies
- Cultivar
- Plant
- Observation
- PlantPhoto

Do not create future tables until they are needed.

## UX

The application will often be used beside real plants.

Design mobile-first:

- large touch targets
- minimal typing
- quick forms
- easy photo upload
- simple navigation
- responsive pages

## Future Features

These are NOT current tasks.

Later versions may add:

- watering
- fertilization
- propagation
- external weather API
- ESP32 sensors
- environmental charts
- flowering
- pollination
- fruit/harvest tracking
- expenses
- public farm journal

Do not implement these while V0.1 is unfinished.

## Architecture

Read `ARCHITECTURE.md` for the approved V0.1 technical architecture: folder
structure, database schema, RLS policies, authentication flow, storage
design, and implementation milestones. This is the authoritative technical
reference once implementation starts — keep it updated if a decision
changes.

## Detailed Specification

Read `HAWATERRA_SPEC.md` for the complete product specification and
roadmap. As of this writing, that file is a broken stub and is not yet a
valid requirements source — do not invent requirements from it.

## Decision Rule

When choosing between:

A. something technically impressive but complicated

B. something useful on my farm this week

choose B.