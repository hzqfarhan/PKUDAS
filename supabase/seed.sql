-- ============================================================================
-- PKU-DAS: Seed Data
-- Run after schema migration
-- ============================================================================

-- Admin user (create via Supabase Auth first, then update profile)
-- Email: admin@pku.uthm.edu.my / Password: admin123

-- After creating auth users via Supabase dashboard or API, update their profiles:

-- Admin
UPDATE profiles SET
  role = 'admin',
  full_name = 'Dr. Siti Aminah',
  phone = '+60127001001'
WHERE email = 'admin@pku.uthm.edu.my';

-- Staff
UPDATE profiles SET
  role = 'staff',
  full_name = 'Nurse Fatimah',
  phone = '+60127001002'
WHERE email = 'staff@pku.uthm.edu.my';

-- Patients
UPDATE profiles SET
  full_name = 'Ahmad bin Ibrahim',
  matrix_no = 'AI220156',
  phone = '+60121234567'
WHERE email = 'ahmad@student.uthm.edu.my';

UPDATE profiles SET
  full_name = 'Nurul Aisyah',
  matrix_no = 'CB220089',
  phone = '+60129876543'
WHERE email = 'nurul@student.uthm.edu.my';

UPDATE profiles SET
  full_name = 'Muhammad Ali',
  matrix_no = 'DF220234',
  phone = '+60125551234'
WHERE email = 'ali@student.uthm.edu.my';

-- Availability Rules (Mon-Fri, 08:00-17:00, 30min slots)
INSERT INTO availability_rules (weekday, start_time, end_time, slot_minutes, active) VALUES
  (1, '08:00', '17:00', 30, TRUE),  -- Monday
  (2, '08:00', '17:00', 30, TRUE),  -- Tuesday
  (3, '08:00', '17:00', 30, TRUE),  -- Wednesday
  (4, '08:00', '17:00', 30, TRUE),  -- Thursday
  (5, '08:00', '17:00', 30, TRUE);  -- Friday

-- Sample blocked slots (lunch break)
INSERT INTO blocked_slots (block_date, start_time, end_time, reason, created_by)
SELECT CURRENT_DATE, '12:00', '13:00', 'Lunch break',
  (SELECT id FROM profiles WHERE email = 'admin@pku.uthm.edu.my');
