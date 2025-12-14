-- ==============================================================================
-- COMPLETE DATABASE RESET SCRIPT (V4 COMPATIBLE)
-- ==============================================================================
-- This script resets the database to match the "Granular 7-Section Analysis"
-- found in SellIdea.tsx (V4).
-- ==============================================================================

-- 1. DROP EVERYTHING (Clean Slate)
DROP VIEW IF EXISTS idea_detail_page;
DROP VIEW IF EXISTS marketplace;
DROP TABLE IF EXISTS ai_scoring CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS saves CASCADE;
DROP TABLE IF EXISTS idea_listing CASCADE;
DROP TABLE IF EXISTS user_info CASCADE; 

-- 2. CREATE USER_INFO
CREATE TABLE user_info (
    user_id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    profile_picture TEXT, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON user_info FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON user_info FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON user_info FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. CREATE IDEA_LISTING (V4 Granular Schema)
CREATE TABLE idea_listing (
    idea_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Page 1: Idea Info
    title TEXT NOT NULL,
    one_line_description TEXT NOT NULL,
    category TEXT NOT NULL, 
    secondary_category TEXT,

    -- Page 2: Customer Pain
    pain_who TEXT,
    pain_problem TEXT[], -- Array of strings
    pain_frequency TEXT,

    -- Page 3: Current Solutions
    solution_current TEXT[],
    solution_insufficient TEXT[],
    solution_risks TEXT,

    -- Page 4: Execution Steps
    exec_steps TEXT[],
    exec_skills TEXT[],
    exec_risks TEXT,

    -- Page 5: Growth Plan
    growth_acquisition TEXT[],
    growth_drivers TEXT,
    growth_expansion TEXT[],

    -- Page 6: Solution Details
    sol_what TEXT,
    sol_how TEXT,
    sol_why_better TEXT,

    -- Page 7: Revenue Plan
    rev_who_pays TEXT,
    rev_flow TEXT,
    rev_retention TEXT,

    -- Page 8: Impact
    impact_who TEXT,
    impact_improvement TEXT,
    impact_scale TEXT,

    -- Documents & Price
    price NUMERIC NOT NULL,
    document_url TEXT NOT NULL, 
    additional_doc_1 TEXT,
    additional_doc_2 TEXT,
    additional_doc_3 TEXT
);

ALTER TABLE idea_listing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public ideas" ON idea_listing FOR SELECT USING (true);
CREATE POLICY "Users insert own ideas" ON idea_listing FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ideas" ON idea_listing FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own ideas" ON idea_listing FOR DELETE USING (auth.uid() = user_id);

-- 4. CREATE AI_SCORING (With Unique Constraint)
CREATE TABLE ai_scoring (
    ai_score_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID REFERENCES idea_listing(idea_id) ON DELETE CASCADE,
    uniqueness NUMERIC,
    demand TEXT,
    problem_impact NUMERIC,
    profitability TEXT,
    viability NUMERIC,
    scalability NUMERIC,
    overall_score NUMERIC GENERATED ALWAYS AS (
      (COALESCE(uniqueness, 0) + COALESCE(problem_impact, 0) + COALESCE(viability, 0) + COALESCE(scalability, 0)) / 4
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT ai_scoring_idea_id_key UNIQUE (idea_id) 
);
ALTER TABLE ai_scoring ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public scores" ON ai_scoring FOR SELECT USING (true);
CREATE POLICY "Users create scores" ON ai_scoring FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update scores" ON ai_scoring FOR UPDATE USING (true);

-- 5. CREATE LIKES & SAVES
CREATE TABLE likes (
    like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    idea_id UUID REFERENCES idea_listing(idea_id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, idea_id)
);
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users manage likes" ON likes FOR ALL USING (auth.uid() = user_id);

CREATE TABLE saves (
    save_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    idea_id UUID REFERENCES idea_listing(idea_id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, idea_id)
);
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage saves" ON saves FOR ALL USING (auth.uid() = user_id);

-- 6. CREATE MARKETPLACE VIEW
CREATE OR REPLACE VIEW marketplace AS
SELECT 
    i.idea_id as marketplace_id,
    i.idea_id,
    i.title,
    i.one_line_description as description, 
    i.category,
    i.secondary_category, -- Supported in V4
    i.price,
    i.user_id,
    u.username,
    i.created_at,
    i.document_url, 
    
    -- AI Scores
    s.ai_score_id,
    COALESCE(s.overall_score, 0) as overall_score,
    COALESCE(s.uniqueness, 0) as uniqueness,
    COALESCE(s.viability, 0) as viability,
    COALESCE(s.profitability, 'N/A') as profitability,
    
    -- MVP Flag (Derived: If Sol How or Execution Steps field is populated, assume 'MVP'ish or using Stage if we had it, 
    -- but V4 schema withdrew 'stage' column in favor of granular steps? 
    -- Actually V4 schema above doesn't have 'stage'. Let's check if we should add it back or derive it.)
    -- For now, let's just default false or check if document_url exists (which is required).
    -- Let's say false for now to avoid errors.
    false as mvp
    
FROM idea_listing i
LEFT JOIN ai_scoring s ON i.idea_id = s.idea_id
LEFT JOIN user_info u ON i.user_id = u.user_id;

-- 7. CREATE IDEA DETAIL VIEW
CREATE OR REPLACE VIEW idea_detail_page AS
SELECT 
    i.*,
    -- Map Description
    i.one_line_description as description,
    false as mvp,

    u.username,
    u.profile_picture,
    
    s.ai_score_id,
    s.overall_score,
    s.uniqueness,
    s.demand,
    s.problem_impact,
    s.profitability,
    s.viability,
    s.scalability
    
FROM idea_listing i
LEFT JOIN user_info u ON i.user_id = u.user_id
LEFT JOIN ai_scoring s ON i.idea_id = s.idea_id;

-- 8. FORCE RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
