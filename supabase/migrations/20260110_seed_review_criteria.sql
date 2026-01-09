-- Seed review criteria with the 100-point scoring system
-- Total: 100 points across 9 categories

-- Clear existing criteria (if re-running)
DELETE FROM kb_review_criteria WHERE id IS NOT NULL;

-- 1. Quality & Testing (20 points)
INSERT INTO kb_review_criteria (id, name, description, max_points, display_order, category, subcriteria) VALUES
('quality_testing', 'Quality & Testing', 'Evaluation of product quality, lab testing practices, and extraction methods', 20, 1, 'quality_testing', '[{"id": "lab_testing_rigor", "name": "Lab Testing Rigor", "max_points": 5, "description": "Third-party lab testing frequency and comprehensiveness"}, {"id": "potency_accuracy", "name": "Potency Accuracy", "max_points": 5, "description": "CBD content matches label claims"}, {"id": "contaminant_free", "name": "Contaminant Free", "max_points": 5, "description": "Clean results for pesticides, heavy metals, solvents, microbials"}, {"id": "extraction_quality", "name": "Extraction Quality", "max_points": 5, "description": "CO2 or ethanol extraction, not cheap methods"}]'::jsonb);

-- 2. Transparency (15 points)
INSERT INTO kb_review_criteria (id, name, description, max_points, display_order, category, subcriteria) VALUES
('transparency', 'Transparency', 'How open and honest the brand is about their products and practices', 15, 2, 'transparency', '[{"id": "coa_accessibility", "name": "COA Accessibility", "max_points": 4, "description": "COAs easy to find on website"}, {"id": "batch_specific_reports", "name": "Batch-Specific Reports", "max_points": 4, "description": "Each batch has unique lab report"}, {"id": "clear_labeling", "name": "Clear Labeling", "max_points": 4, "description": "Ingredients, CBD amount, THC level clearly shown"}, {"id": "ingredient_disclosure", "name": "Ingredient Disclosure", "max_points": 3, "description": "Full ingredient list, no proprietary blends"}]'::jsonb);

-- 3. Reputation (12 points)
INSERT INTO kb_review_criteria (id, name, description, max_points, display_order, category, subcriteria) VALUES
('reputation', 'Reputation', 'Brand standing in the industry and with customers', 12, 3, 'reputation', '[{"id": "review_scores", "name": "Review Scores", "max_points": 4, "description": "Trustpilot, Google, BBB ratings"}, {"id": "years_in_business", "name": "Years in Business", "max_points": 3, "description": "Established track record"}, {"id": "industry_recognition", "name": "Industry Recognition", "max_points": 3, "description": "Awards, press mentions, certifications"}, {"id": "clean_record", "name": "Clean Record", "max_points": 2, "description": "No FDA warnings, lawsuits, recalls"}]'::jsonb);

-- 4. Value & Pricing (12 points)
INSERT INTO kb_review_criteria (id, name, description, max_points, display_order, category, subcriteria) VALUES
('value_pricing', 'Value & Pricing', 'Overall value proposition and pricing competitiveness', 12, 4, 'value_pricing', '[{"id": "price_per_mg", "name": "Price Per mg", "max_points": 4, "description": "Competitive pricing"}, {"id": "discounts_available", "name": "Discounts Available", "max_points": 3, "description": "Subscribe and save, bulk discounts"}, {"id": "free_shipping", "name": "Free Shipping", "max_points": 3, "description": "Reasonable free shipping threshold"}, {"id": "money_back_guarantee", "name": "Money-Back Guarantee", "max_points": 2, "description": "Satisfaction guarantee offered"}]'::jsonb);

-- 5. Customer Experience (10 points)
INSERT INTO kb_review_criteria (id, name, description, max_points, display_order, category, subcriteria) VALUES
('customer_experience', 'Customer Experience', 'Quality of the customer journey from purchase to delivery', 10, 5, 'customer_experience', '[{"id": "website_usability", "name": "Website Usability", "max_points": 3, "description": "Easy to navigate, find products"}, {"id": "shipping_speed", "name": "Shipping Speed", "max_points": 3, "description": "Fast processing and delivery"}, {"id": "return_policy", "name": "Return Policy", "max_points": 2, "description": "Fair return window"}, {"id": "customer_service", "name": "Customer Service", "max_points": 2, "description": "Responsive support"}]'::jsonb);

-- 6. Product Range (10 points)
INSERT INTO kb_review_criteria (id, name, description, max_points, display_order, category, subcriteria) VALUES
('product_range', 'Product Range', 'Variety and comprehensiveness of product offerings', 10, 6, 'product_range', '[{"id": "format_variety", "name": "Format Variety", "max_points": 3, "description": "Oils, gummies, topicals, capsules"}, {"id": "spectrum_options", "name": "Spectrum Options", "max_points": 3, "description": "Full, broad, isolate available"}, {"id": "strength_options", "name": "Strength Options", "max_points": 2, "description": "Multiple potency levels"}, {"id": "specialty_products", "name": "Specialty Products", "max_points": 2, "description": "Pets, sleep, sport formulas"}]'::jsonb);

-- 7. Certifications (10 points)
INSERT INTO kb_review_criteria (id, name, description, max_points, display_order, category, subcriteria) VALUES
('certifications', 'Certifications', 'Third-party certifications and quality seals', 10, 7, 'certifications', '[{"id": "gmp_certified", "name": "GMP Certified", "max_points": 3, "description": "Good Manufacturing Practice"}, {"id": "usda_organic", "name": "USDA Organic", "max_points": 3, "description": "Certified organic"}, {"id": "third_party_verified", "name": "Third-Party Verified", "max_points": 2, "description": "US Hemp Authority or similar"}, {"id": "other_certifications", "name": "Other Certifications", "max_points": 2, "description": "Vegan, non-GMO, etc."}]'::jsonb);

-- 8. Sourcing (6 points)
INSERT INTO kb_review_criteria (id, name, description, max_points, display_order, category, subcriteria) VALUES
('sourcing', 'Sourcing', 'Hemp source transparency and quality of farming practices', 6, 8, 'sourcing', '[{"id": "hemp_origin_disclosed", "name": "Hemp Origin Disclosed", "max_points": 2, "description": "Transparent about source"}, {"id": "us_grown_hemp", "name": "US-Grown Hemp", "max_points": 2, "description": "Domestic hemp preferred"}, {"id": "farming_practices", "name": "Farming Practices", "max_points": 2, "description": "Organic, sustainable farming"}]'::jsonb);

-- 9. Education (5 points)
INSERT INTO kb_review_criteria (id, name, description, max_points, display_order, category, subcriteria) VALUES
('education', 'Education', 'Educational resources and dosing guidance provided', 5, 9, 'education', '[{"id": "dosing_guidance", "name": "Dosing Guidance", "max_points": 2, "description": "Clear dosing recommendations"}, {"id": "educational_content", "name": "Educational Content", "max_points": 2, "description": "Blog, guides, FAQ"}, {"id": "research_citations", "name": "Research Citations", "max_points": 1, "description": "Links to studies"}]'::jsonb);

-- Verify total points = 100
DO $$
DECLARE
  total_points INTEGER;
BEGIN
  SELECT SUM(max_points) INTO total_points FROM kb_review_criteria;
  IF total_points != 100 THEN
    RAISE EXCEPTION 'Total points should be 100, but got %', total_points;
  END IF;
  RAISE NOTICE 'Review criteria seeded successfully. Total points: %', total_points;
END $$;
