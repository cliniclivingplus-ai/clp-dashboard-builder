-- v29: add HbA1c (glycated hemoglobin) to blood.marker_guidance — a very
-- common test that was falling through to the generic Hemoglobin/anemia
-- guidance row via a substring-matching bug ("Hb" is a substring of
-- "HbA1c" too), producing a clinically wrong "indicating anemia" rationale
-- for what's actually a glycemic-control marker. Now has its own row.

insert into blood.marker_guidance (marker_name, synonyms, direction, condition_label, explanation, recommended_actions) values
('HbA1c', array['Glycated Hemoglobin', 'Hemoglobin A1c', 'HbA1c/Total'], 'high', 'Elevated HbA1c (prediabetes/diabetes range)',
  'HbA1c reflects average blood glucose over the past 2-3 months. An elevated result indicates sustained higher blood sugar levels, raising risk for prediabetes or diabetes and related complications over time.',
  'Reduce refined carbohydrate and added sugar intake, prioritize fiber and protein at each meal, and add regular physical activity to improve insulin sensitivity. Flag for a fasting glucose/OGTT follow-up with the treating doctor to confirm the diagnosis.');
