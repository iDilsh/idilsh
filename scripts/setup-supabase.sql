-- ============================================
-- Pansil Maluwa - Supabase Database Setup
-- Run this SQL in the Supabase SQL Editor
-- ============================================

-- 1. Create BlogPost table
CREATE TABLE IF NOT EXISTS "BlogPost" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT,
  category TEXT NOT NULL DEFAULT 'Dharma',
  published INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT NOW(),
  "updatedAt" TEXT NOT NULL DEFAULT NOW()
);

-- 2. Create Video table
CREATE TABLE IF NOT EXISTS "Video" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  "youtubeId" TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT NOT NULL DEFAULT 'Sermon',
  published INTEGER NOT NULL DEFAULT 1,
  "createdAt" TEXT NOT NULL DEFAULT NOW(),
  "updatedAt" TEXT NOT NULL DEFAULT NOW()
);

-- 3. Create SiteSetting table
CREATE TABLE IF NOT EXISTS "SiteSetting" (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT ''
);

-- 4. Disable RLS (Row Level Security) for server-side access
-- The service_role key bypasses RLS, but let's also allow anon access for read operations
ALTER TABLE "BlogPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteSetting" ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published content
CREATE POLICY "Published blog posts are publicly readable" ON "BlogPost"
  FOR SELECT USING (published = 1);

CREATE POLICY "Published videos are publicly readable" ON "Video"
  FOR SELECT USING (published = 1);

CREATE POLICY "Settings are publicly readable" ON "SiteSetting"
  FOR SELECT USING (true);

-- Allow full access with service_role (no policy needed - service_role bypasses RLS)
-- If you want anon key to work for writes too, add these policies:
-- CREATE POLICY "Allow all operations on BlogPost" ON "BlogPost" FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations on Video" ON "Video" FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations on SiteSetting" ON "SiteSetting" FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed blog posts (only if table is empty)
INSERT INTO "BlogPost" (id, title, excerpt, content, "imageUrl", category, published, "createdAt", "updatedAt") VALUES
('cmq7gjq7c0000q77s4bvi99x5', 'නමො තස්ස භගවතො අරහතො සම්මා සම්බුද්ධස්ස...', 'පුරුදු අප කා සතුවත් පවත්නා දෙයකි. පුරුදු හොඳ සහ නරක ලෙස කොටස් දෙකකට බෙදා සාකච්ඡා කළ හැකිය.', 'පුරුදු අප කා සතුවත් පවත්නා දෙයකි. පුරුදු හොඳ සහ නරක ලෙස කොටස් දෙකකට බෙදා සාකච්ඡා කළ හැකිය. හොඳ පුරුදු වටිනා දේ වන අතර ම, නරක පුරුදු නොවටිනා දෙයකි. බොහෝ කල් සිට හුරු කළ පැවැත්ම හඳුන්වන්නට පාවිච්චි කළ හැකි පදයක් ලෙස "ආසව" (ආශ්‍රව) යන්න හැඳින්විය හැකිය. ඒද හොඳ පුරුදු ලෙස නොව, බොහෝ කල් සිට පුරුදු කළ කෙලෙස් යන අරුතිනි.', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEifcGzCqQbMv9jxoum3IsOv2_xP6SSX91bkdN05P49_u41c7-nlPd5J-3mBM19wYchY66ouDhTJh5_C7bIlkD-MNh0VVdxsIPFSBoTzmOKEAnB81xbUCVu0sw0fnP-vTZVGbPfMLjbEqlLVVBj7LWIRk3tbmYHKkD1tyS9X5rumVEGCvCPsDHxiSqjfyjc/s3300/landscape-infrared-nature-digital-art-popular-8k-hdr-desktop-wallpaper-background-images-for-apple-macbook-air-macbook-pro-imac-windows-pc-and-linux-computers-4k-high-resolution-14-03-2025-1741981641-hd-wallpaper.jpg', 'Dharma', 1, NOW(), NOW()),
('cmq7gjq7c0001q77sb1iq8ubh', 'Mindfulness in Daily Practice', 'Simple techniques to bring meditation and awareness into your everyday routine.', 'Mindfulness doesn''t require sitting in a quiet room for hours. It''s about bringing full awareness to whatever you''re doing, whether eating, walking, or working.

Start with your breath. Notice the sensation of air entering and leaving your nostrils. This simple act anchors you in the present moment.

Practice mindful eating. Before each meal, take a moment to appreciate the food. Notice its colors, smells, and textures. Eat slowly, savoring each bite.

Walking meditation is another powerful practice. Feel each step—your foot lifting, moving, and placing on the ground. The rhythm of walking becomes a meditation in itself.

Remember, mindfulness is not about emptying the mind. It''s about observing thoughts without judgment and returning to the present moment with gentleness and patience.', '/blog/mindfulness.jpg', 'Meditation', 1, NOW(), NOW()),
('cmq7gjq7c0002q77sn5b2s313', 'The Middle Way: Finding Balance in Extremes', 'How the Buddha''s teaching on balance can transform our approach to modern challenges.', 'The Middle Way (Majjhima Patipada) is the Buddha''s revolutionary insight that the path to liberation lies between the extremes of self-indulgence and self-mortification.

In today''s world, we''re constantly pulled toward extremes—work too much or not at all, eat too much or restrict ourselves, socialize endlessly or isolate completely. The Middle Way offers a different approach.

This teaching isn''t just about moderation. It''s about understanding that truth lies in the balance, in the careful navigation between extremes that don''t serve us.

The Buddha discovered this through his own experience. After years of extreme asceticism that nearly killed him, he realized that a starved body couldn''t support the clear mind needed for enlightenment.

Applying the Middle Way today means listening to your body, honoring your needs, and making conscious choices rather than reactive ones.', '/blog/middle-way.jpg', 'Philosophy', 1, NOW(), NOW()),
('cmq7gjq7c0003q77s3tzsjlw6', 'Understanding Karma: Cause and Effect', 'A clear explanation of karma and how intentional actions shape our present and future.', 'Karma is one of the most misunderstood concepts in Buddhism. It''s not fate, destiny, or cosmic punishment. Karma simply means ''action''—specifically, intentional action.

Every intentional thought, word, and deed creates karma. Wholesome actions rooted in generosity, compassion, and wisdom create positive karma. Unwholesome actions rooted in greed, hatred, and delusion create negative karma.

The law of karma is the law of cause and effect. Just as a seed planted in fertile soil will grow into a plant, our actions will produce results consistent with their nature.

Understanding karma empowers us. We''re not victims of circumstance—we''re active participants in creating our experience. Each moment offers a new opportunity to act with awareness and compassion.

This doesn''t mean we should obsess over every action. Instead, we cultivate a general orientation toward wholesomeness, trusting that consistent good intentions will bear good fruit.', '/blog/karma.jpg', 'Dharma', 1, NOW(), NOW()),
('cmq7gjq7c0004q77spmrz2mw6', 'Vesak: Celebrating the Buddha''s Life', 'The significance of Vesak and how Buddhists around the world honor this sacred day.', 'Vesak is the most important festival in the Buddhist calendar. It commemorates three significant events in the Buddha''s life: his birth, enlightenment, and passing away—all of which occurred on the full moon day of Vesak.

On this sacred day, Buddhists gather at temples to observe the Eight Precepts, meditate, and listen to dhamma talks. Devotees make offerings of flowers, incense, and lights to the Buddha.

The lighting of Vesak lanterns and pandols is a beautiful tradition in Sri Lanka. These illuminate the night, symbolizing the light of wisdom dispelling the darkness of ignorance.

Dansalas—free food stalls—are set up along roads as acts of generosity. This practice embodies the Buddhist virtue of dana (giving) and creates a sense of community.

Vesak reminds us that enlightenment is possible for all beings. The Buddha was human, and his achievement shows us our own potential for awakening.', '/blog/vesak.jpg', 'Tradition', 1, NOW(), NOW()),
('cmq7gjq7c0005q77slom259yw', 'Metta Bhavana: Cultivating Loving-Kindness', 'Learn the ancient practice of loving-kindness meditation to open your heart to all beings.', 'Metta Bhavana, or loving-kindness meditation, is one of the most powerful practices in the Buddhist tradition. It systematically cultivates a heart of unconditional friendliness toward all beings.

The practice begins with yourself. Sit quietly and repeat phrases like ''May I be happy, may I be healthy, may I be safe, may I live with ease.'' Feel the warmth of these wishes in your heart.

Next, extend this wish to a loved one—someone who naturally brings a smile to your face. Then a neutral person, someone you neither like nor dislike. Then a difficult person, someone you have conflict with.

Finally, extend metta to all beings everywhere: ''May all beings be happy, may all beings be healthy, may all beings be safe, may all beings live with ease.''

Regular metta practice reduces anger and anxiety, increases empathy and compassion, and creates a deep sense of connection with all life.', '/blog/metta.jpg', 'Meditation', 1, NOW(), NOW());

-- 6. Seed videos
INSERT INTO "Video" (id, title, description, "youtubeId", category, published, "createdAt", "updatedAt") VALUES
('cmq7gjq7c0006q77svw4k7e9l', 'Buddha''s First Teaching: The Sermon That Shook The Cosmos', 'A comprehensive introduction to the core teachings of the Buddha, perfect for beginners.', 'n_LLXINn89M', 'Beginner', 1, NOW(), NOW()),
('cmq7gjq7c0007q77sfv8j2a4m', 'Calm - Ease | Guided Meditation by Thich Nhat Hanh', 'A calming guided meditation session to help you find peace and clarity within.', 'XHvtIcaD194', 'Meditation', 1, NOW(), NOW()),
('cmq7gjq7c0008q77s5q9h3b7n', 'The Buddha''s Last Teachings - Dharma Talk by Jack Kornfield', 'Explore the remarkable journey of Siddhartha Gautama from prince to enlightened teacher.', 'RcCgqwmkzsU', 'History', 1, NOW(), NOW()),
('cmq7gjq7c0009q77sl4x6c8d2', 'How To Be A Good Buddhist | Dhamma Sermons', 'A detailed explanation of the five precepts that form the ethical foundation of Buddhist practice.', 'gCKBLbCbXMw', 'Dharma', 1, NOW(), NOW()),
('cmq7gjq7c0010q77sw7y9e5f3', '10-Minute Guided Meditation for Beginners with a Buddhist Monk', 'Learn the Buddha''s original method of breath meditation for developing concentration and insight.', 'HJVUT0o9y8s', 'Meditation', 1, NOW(), NOW()),
('cmq7gjq7c0011q77sr2t4g6h8', 'Dharma Talk - Awakening to a New Way of Being', 'An exploration of the most beloved Buddhist scripture and its practical wisdom for daily life.', 'A__DcoIZoN4', 'Scripture', 1, NOW(), NOW());

-- 6b. Update existing videos with real YouTube IDs (run this if videos already exist)
UPDATE "Video" SET "youtubeId" = 'n_LLXINn89M', title = 'Buddha''s First Teaching: The Sermon That Shook The Cosmos' WHERE id = 'cmq7gjq7c0006q77svw4k7e9l';
UPDATE "Video" SET "youtubeId" = 'XHvtIcaD194', title = 'Calm - Ease | Guided Meditation by Thich Nhat Hanh' WHERE id = 'cmq7gjq7c0007q77sfv8j2a4m';
UPDATE "Video" SET "youtubeId" = 'RcCgqwmkzsU', title = 'The Buddha''s Last Teachings - Dharma Talk by Jack Kornfield' WHERE id = 'cmq7gjq7c0008q77s5q9h3b7n';
UPDATE "Video" SET "youtubeId" = 'gCKBLbCbXMw', title = 'How To Be A Good Buddhist | Dhamma Sermons' WHERE id = 'cmq7gjq7c0009q77sl4x6c8d2';
UPDATE "Video" SET "youtubeId" = 'HJVUT0o9y8s', title = '10-Minute Guided Meditation for Beginners with a Buddhist Monk' WHERE id = 'cmq7gjq7c0010q77sw7y9e5f3';
UPDATE "Video" SET "youtubeId" = 'A__DcoIZoN4', title = 'Dharma Talk - Awakening to a New Way of Being' WHERE id = 'cmq7gjq7c0011q77sr2t4g6h8';

-- 7. Seed settings
INSERT INTO "SiteSetting" (id, key, value) VALUES
('cs1siteName', 'siteName', 'Pansil Maluwa'),
('cs2siteDescription', 'siteDescription', 'A Buddhist temple website dedicated to sharing the Dharma'),
('cs3heroTitle', 'heroTitle', 'Welcome to Pansil Maluwa'),
('cs4heroSubtitle', 'heroSubtitle', 'Discover the path of wisdom and compassion');
