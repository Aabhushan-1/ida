-- Run this script in your Supabase SQL Editor to update the database schema for the new features.

-- 1. Add 'category' column to 'idea_listing' table
ALTER TABLE idea_listing ADD COLUMN IF NOT EXISTS category text;

-- 2. Update 'marketplace' view to include 'category', 'mvp', and 'document_url'
DROP VIEW IF EXISTS marketplace;
CREATE VIEW marketplace AS
SELECT
    il.idea_id as marketplace_id,
    il.idea_id,
    ais.ai_score_id,
    il.title,
    il.description,
    ais.uniqueness,
    ais.viability,
    ais.profitability,
    il.price,
    il.category, -- Newly added
    il.mvp,      -- Newly added for filtering
    il.document_url, -- Newly added for filtering (to check if docs exist)
    ui.username,
    il.created_at,
    ais.overall_score
FROM idea_listing il
JOIN ai_scoring ais ON il.idea_id = ais.idea_id
JOIN user_info ui ON il.user_id = ui.user_id;

-- 3. Update 'idea_detail_page' view to include 'category' (already has mvp/docs)
DROP VIEW IF EXISTS idea_detail_page;
CREATE VIEW idea_detail_page AS
SELECT
  il.idea_id as idea_detail_id,
  il.idea_id,
  ais.ai_score_id,
  il.title,
  il.description,
  ais.uniqueness,
  ais.demand,
  ais.problem_impact,
  ais.profitability,
  ais.viability,
  ais.scalability,
  ais.overall_score,
  il.price,
  ui.username,
  il.mvp,
  il.mvp_type,
  il.digital_mvp,
  il.physical_mvp_image,
  il.physical_mvp_video,
  il.document_url,
  il.additional_doc_1,
  il.additional_doc_2,
  il.additional_doc_3,
  il.category, -- Newly added column
  il.created_at,
  il.updated_at
FROM idea_listing il
JOIN ai_scoring ais ON il.idea_id = ais.idea_id
JOIN user_info ui ON il.user_id = ui.user_id;
