-- ==============================================================================
-- UPDATE SCHEMA V4
-- Granular 7-Section Analysis Schema
-- ==============================================================================

-- 1. Drop dependent views
DROP VIEW IF EXISTS idea_detail_page;
DROP VIEW IF EXISTS marketplace;

-- 2. Alter idea_listing table
-- We are adding granular columns for every single sub-question.

-- Section 3: Customer Pain
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS pain_who TEXT;                 -- Who has this problem? (Para)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS pain_problem TEXT[];           -- What exactly is the problem? (List)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS pain_frequency TEXT;           -- How often? (Para)

-- Section 4: Current Solutions
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS solution_current TEXT[];       -- How do people solve today? (List)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS solution_insufficient TEXT[];  -- Why insufficient? (List)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS solution_risks TEXT;           -- Risks/limitations? (Para)

-- Section 5: Execution Steps
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS exec_steps TEXT[];             -- Steps to build v1 (List)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS exec_skills TEXT[];            -- Skills/tools required (List)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS exec_risks TEXT;               -- Hardest/risky parts (Para)

-- Section 6: Growth Plan
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS growth_acquisition TEXT[];     -- First users acquisition (List)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS growth_drivers TEXT;           -- What drives growth? (Para)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS growth_expansion TEXT[];       -- Expansion paths (List)

-- Section 7: Solution Details
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS sol_what TEXT;                 -- What is the solution? (Para)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS sol_how TEXT;                  -- How does it work? (Para)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS sol_why_better TEXT;           -- Why is it better? (Para)

-- Section 8: Revenue Plan
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS rev_who_pays TEXT;             -- Who pays? (Para)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS rev_flow TEXT;                 -- Money flow? (Para)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS rev_retention TEXT;            -- Why keep paying? (Para)

-- Section 9: Impact
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS impact_who TEXT;               -- Who benefits? (Para)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS impact_improvement TEXT;       -- Real world improvement? (Para)
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS impact_scale TEXT;             -- Changes at scale? (Para)

-- Clean up V3 arrays if we want to be strict, but keeping them as legacy or droppping if requested "Replace".
-- The prompt says "The current implementation is incorrect and must be replaced."
-- I will drop the V3 blanket columns to avoid confusion.
ALTER TABLE idea_listing DROP COLUMN IF EXISTS customer_pain;
ALTER TABLE idea_listing DROP COLUMN IF EXISTS current_solutions;
ALTER TABLE idea_listing DROP COLUMN IF EXISTS execution_steps;
ALTER TABLE idea_listing DROP COLUMN IF EXISTS growth_plan;
ALTER TABLE idea_listing DROP COLUMN IF EXISTS solution_details;
ALTER TABLE idea_listing DROP COLUMN IF EXISTS revenue_plan;
ALTER TABLE idea_listing DROP COLUMN IF EXISTS impact;

-- 3. Recreate Views

-- Marketplace View (Unchanged mostly, relies on core info)
CREATE OR REPLACE VIEW marketplace AS
SELECT 
    i.idea_id as marketplace_id,
    i.idea_id,
    i.title,
    i.one_line_description as description, 
    i.category,
    i.secondary_category, 
    i.price,
    i.user_id,
    u.username,
    i.created_at,
    i.document_url,
    s.ai_score_id,
    COALESCE(s.overall_score, 0) as overall_score,
    COALESCE(s.uniqueness, 0) as uniqueness,
    COALESCE(s.viability, 0) as viability,
    COALESCE(s.profitability, 'N/A') as profitability,
    false as mvp
FROM idea_listing i
LEFT JOIN ai_scoring s ON i.idea_id = s.idea_id
LEFT JOIN user_info u ON i.user_id::text = u.user_id::text;

-- Idea Detail View
CREATE OR REPLACE VIEW idea_detail_page AS
SELECT 
    i.idea_id,
    i.user_id,
    i.created_at,
    i.updated_at,
     -- Core Info
    i.title,
    i.one_line_description,
    i.category,
    i.secondary_category,
    i.price,
    i.document_url,
    i.additional_doc_1, i.additional_doc_2, i.additional_doc_3,
    
    -- New Granular Fields
    i.pain_who, i.pain_problem, i.pain_frequency,
    i.solution_current, i.solution_insufficient, i.solution_risks,
    i.exec_steps, i.exec_skills, i.exec_risks,
    i.growth_acquisition, i.growth_drivers, i.growth_expansion,
    i.sol_what, i.sol_how, i.sol_why_better,
    i.rev_who_pays, i.rev_flow, i.rev_retention,
    i.impact_who, i.impact_improvement, i.impact_scale,

    -- Joins
    u.username,
    u.profile_picture,
    s.ai_score_id,
    s.overall_score, s.uniqueness, s.demand, s.problem_impact, s.profitability, s.viability, s.scalability,
    
    -- Compat
    i.one_line_description as description,
    false as mvp
FROM idea_listing i
LEFT JOIN user_info u ON i.user_id::text = u.user_id::text
LEFT JOIN ai_scoring s ON i.idea_id = s.idea_id;
