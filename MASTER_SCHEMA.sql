-- ==============================================================================
-- MASTER DB SCHEMA SCRIPT (FINAL VERSION)
-- ==============================================================================
-- This script resets the entire public schema and sets up:
-- 1. Tables (user_info, idea_listing, ai_scoring, interactions)
-- 2. Views (marketplace, idea_detail_page)
-- 3. Triggers (auto-create profile on signup)
-- 4. RLS Policies (security)

-- 1. CLEANUP
DROP VIEW IF EXISTS idea_detail_page;
DROP VIEW IF EXISTS marketplace;
DROP TABLE IF EXISTS ai_scoring CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS saves CASCADE;
DROP TABLE IF EXISTS idea_listing CASCADE;
DROP TABLE IF EXISTS user_info CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS shares CASCADE;

-- 2. USER INFO
CREATE TABLE user_info (
    user_id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    email TEXT, -- Added email column for legacy compatibility
    name TEXT,  -- Added name column for legacy compatibility
    avatar_url TEXT,
    profile_picture TEXT, 
    password TEXT, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON user_info FOR SELECT USING (true);
CREATE POLICY "Users update own" ON user_info FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own" ON user_info FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. IDEA LISTING (V4 Schema + Files)
CREATE TABLE idea_listing (
    idea_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Step 1 (Info)
    title TEXT NOT NULL,
    one_line_description TEXT NOT NULL,
    category TEXT NOT NULL, 
    secondary_category TEXT,

    -- Step 2 (Customer Pain - V4)
    pain_who TEXT,
    pain_problem TEXT[], 
    pain_frequency TEXT,

    -- Step 3 (Solutions)
    solution_current TEXT[],
    solution_insufficient TEXT[],
    solution_risks TEXT,

    -- Step 4 (Execution)
    exec_steps TEXT[],
    exec_skills TEXT[],
    exec_risks TEXT,

    -- Step 5 (Growth)
    growth_acquisition TEXT[],
    growth_drivers TEXT,
    growth_expansion TEXT[],

    -- Step 6 (Solution Details)
    sol_what TEXT,
    sol_how TEXT,
    sol_why_better TEXT,

    -- Step 7 (Revenue)
    rev_who_pays TEXT,
    rev_flow TEXT,
    rev_retention TEXT,

    -- Step 8 (Impact)
    impact_who TEXT,
    impact_improvement TEXT,
    impact_scale TEXT,

    -- Documents & Price
    price NUMERIC NOT NULL,
    document_url TEXT NOT NULL, 
    additional_doc_1 TEXT, -- Extra Doc 1
    additional_doc_2 TEXT, -- Extra Doc 2
    additional_doc_3 TEXT  -- Extra Doc 3
);
ALTER TABLE idea_listing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public ideas" ON idea_listing FOR SELECT USING (true);
CREATE POLICY "Users insert own" ON idea_listing FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own" ON idea_listing FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own" ON idea_listing FOR DELETE USING (auth.uid() = user_id);

-- 4. AI SCORING (New 10 Metrics)
CREATE TABLE ai_scoring (
    ai_score_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID REFERENCES idea_listing(idea_id) ON DELETE CASCADE,
    
    -- The 10 Metrics (0-100)
    uniqueness NUMERIC DEFAULT 0,
    customer_pain NUMERIC DEFAULT 0,
    scalability NUMERIC DEFAULT 0,
    product_market_fit NUMERIC DEFAULT 0,
    technical_complexity NUMERIC DEFAULT 0,
    capital_intensity NUMERIC DEFAULT 0,
    market_saturation NUMERIC DEFAULT 0,
    business_model_robustness NUMERIC DEFAULT 0,
    market_growth_rate NUMERIC DEFAULT 0,
    social_value NUMERIC DEFAULT 0,

    -- Auto-calculated Average
    overall_score NUMERIC GENERATED ALWAYS AS (
      (
        COALESCE(uniqueness, 0) + 
        COALESCE(customer_pain, 0) + 
        COALESCE(scalability, 0) + 
        COALESCE(product_market_fit, 0) + 
        COALESCE(technical_complexity, 0) + 
        COALESCE(capital_intensity, 0) + 
        COALESCE(market_saturation, 0) + 
        COALESCE(business_model_robustness, 0) + 
        COALESCE(market_growth_rate, 0) + 
        COALESCE(social_value, 0)
      ) / 10
    ) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT ai_scoring_idea_id_key UNIQUE (idea_id) 
);
ALTER TABLE ai_scoring ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public scores" ON ai_scoring FOR SELECT USING (true);
CREATE POLICY "Users create scores" ON ai_scoring FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update scores" ON ai_scoring FOR UPDATE USING (true);

-- 5. SOCIAL INTERACTIONS
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

CREATE TABLE messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES auth.users(id) NOT NULL,
  recipient_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE TABLE shares (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  idea_id text NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public shares" ON shares FOR SELECT USING (true);
CREATE POLICY "Users create shares" ON shares FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 6. VIEWS (API INTERFACE)

-- Marketplace Card View
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
    u.avatar_url, -- Added for consistency
    u.profile_picture, -- Added for consistency
    i.created_at,
    i.document_url, 
    
    s.ai_score_id,
    COALESCE(s.overall_score, 0) as overall_score,
    COALESCE(s.uniqueness, 0) as uniqueness,
    COALESCE(s.product_market_fit, 0) as viability, -- Mapped for frontend compatibility
    'Analysis Completed' as profitability, 
    
    false as mvp
    
FROM idea_listing i
LEFT JOIN ai_scoring s ON i.idea_id = s.idea_id
LEFT JOIN user_info u ON i.user_id = u.user_id;

-- Detail Page View
CREATE OR REPLACE VIEW idea_detail_page AS
SELECT 
    i.*,
    i.one_line_description as description,
    false as mvp,
    u.username,
    u.full_name, -- Added for detail view compatibility
    u.avatar_url, -- Added for detail view compatibility
    u.profile_picture,
    s.ai_score_id,
    s.overall_score,
    
    -- New 10 Metrics
    s.uniqueness,
    s.customer_pain,
    s.scalability,
    s.product_market_fit,
    s.technical_complexity,
    s.capital_intensity,
    s.market_saturation,
    s.business_model_robustness,
    s.market_growth_rate,
    s.social_value

FROM idea_listing i
LEFT JOIN user_info u ON i.user_id = u.user_id
LEFT JOIN ai_scoring s ON i.idea_id = s.idea_id;

-- 7. AUTO-PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_info (
      user_id, 
      username, 
      full_name, 
      email, 
      name, 
      avatar_url, 
      profile_picture
  )
  VALUES (
    new.id,
    '@' || split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email, -- Explicitly save email
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. RELOAD
NOTIFY pgrst, 'reload schema';
