-- v28: seed blood.marker_guidance with the markers actually present across
-- the coach's 5 sample reports, as a concrete starting set (expandable
-- later as more report types are seen). Each row is deliberately specific
-- and non-hedging in its explanation/recommended_actions — Groq's job at
-- recommendation time is only to write a short connecting rationale
-- referencing the patient's real value, never to invent this content.

insert into blood.marker_guidance (marker_name, synonyms, direction, condition_label, explanation, recommended_actions) values
('Hemoglobin', array['Hb', 'HGB', 'Haemoglobin'], 'low', 'Anemia',
  'Low hemoglobin means the blood is carrying less oxygen than it should, which shows up as fatigue, breathlessness on exertion, and pallor.',
  'Increase iron-rich foods (red meat, lentils, leafy greens) alongside a vitamin C source to aid absorption; confirm with the coach whether iron studies and a supplement are warranted, and rule out an ongoing source of blood loss (e.g. heavy menstrual bleeding) with the treating doctor.'),

('Hematocrit', array['PCV', 'Packed Cell Volume', 'HCT'], 'low', 'Anemia',
  'A low proportion of red blood cells by volume, consistent with anemia and usually moving alongside a low hemoglobin.',
  'Same management as low hemoglobin: iron-rich diet, address the underlying cause, and recheck alongside a full iron panel.'),

('MCV', array['Mean Corpuscular Volume'], 'low', 'Microcytic anemia',
  'Red blood cells that are smaller than normal, the classic pattern seen in iron deficiency (or, less commonly, thalassemia trait).',
  'Prioritize an iron panel (serum iron, ferritin, TIBC) to distinguish iron deficiency from a thalassemia trait before recommending iron supplementation.'),

('MCH', array['Mean Corpuscular Hemoglobin'], 'low', 'Microcytic anemia',
  'Each red blood cell is carrying less hemoglobin than normal, moving alongside a low MCV in iron-deficiency-pattern anemia.',
  'Same workup as low MCV: confirm iron status before supplementing, and increase dietary iron and vitamin C together.'),

('RDW-CV', array['Red Cell Distribution Width', 'RDW'], 'high', 'Anisocytosis (mixed red cell sizes)',
  'Red blood cells vary more in size than normal, a pattern commonly seen early in iron deficiency or with a mixed nutritional deficiency (iron plus B12/folate).',
  'Check both iron studies and B12/folate levels rather than assuming a single cause, and correct whichever deficiency is confirmed.'),

('HbA2', array['Hemoglobin A2'], 'low', 'Reduced HbA2 (often iron-deficiency related)',
  'A reduced HbA2 peak on hemoglobin electrophoresis is commonly caused by iron deficiency itself, which can mask an underlying thalassemia trait until iron status is corrected.',
  'Correct the iron deficiency first, then repeat the hemoglobin electrophoresis for an accurate read, per standard lab guidance.'),

('Zinc', array['Serum Zinc', 'Zn'], 'low', 'Zinc deficiency',
  'Zinc is a cofactor for many enzymes and supports immune function, wound healing, and taste/smell; low levels are often diet-related or due to high-fiber/phytate intake blocking absorption.',
  'Add zinc-rich foods (meat, shellfish, seeds, legumes) and consider spacing high-fiber meals away from a zinc supplement if one is used, since phytates in fiber reduce zinc absorption.'),

('Free Testosterone', array['Testosterone Free', 'Free T'], 'high', 'Elevated free testosterone',
  'In women, elevated free testosterone is commonly associated with hyperandrogenism, often alongside PCOS, and can present with irregular cycles, acne, or excess hair growth.',
  'Flag for clinical correlation with cycle history and other PCOS markers (LH:FSH ratio, insulin resistance) with the treating doctor; dietary support typically focuses on insulin sensitivity (lower refined carbohydrate load, regular activity).');
