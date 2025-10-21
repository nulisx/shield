-- Create profiles table for storing user data
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  profile_picture TEXT NOT NULL,
  bio TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is a demo)
CREATE POLICY "Allow all operations on profiles" ON profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert initial user data
INSERT INTO profiles (username, display_name, profile_picture, bio) VALUES
  ('dismayings', 'dismayings', 'https://files.catbox.moe/nfwlfl.png', 'A mysterious figure in the digital realm.'),
  ('turk', 'TuRk', 'https://files.catbox.moe/odxzi6.png', 'A mysterious figure in the digital realm.'),
  ('akane', 'akane', 'https://files.catbox.moe/nlsbjl.png', 'A mysterious figure in the digital realm.'),
  ('zurf', 'zurf', 'https://files.catbox.moe/vx0tpn.png', 'A mysterious figure in the digital realm.'),
  ('demise', 'demise', 'https://files.catbox.moe/6092n9.png', 'A mysterious figure in the digital realm.'),
  ('gothic', 'gothic', 'https://files.catbox.moe/cdg3go.png', 'A mysterious figure in the digital realm.')
ON CONFLICT (username) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  profile_picture = EXCLUDED.profile_picture,
  bio = EXCLUDED.bio,
  updated_at = NOW();
