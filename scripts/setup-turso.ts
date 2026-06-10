import { createClient } from '@libsql/client'

const TURSO_URL = process.env.DATABASE_URL!
const TURSO_TOKEN = process.env.DATABASE_AUTH_TOKEN || ''

async function main() {
  console.log('🔧 Setting up Turso database schema...')

  const db = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  })

  // Create BlogPost table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS BlogPost (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      imageUrl TEXT,
      category TEXT NOT NULL DEFAULT 'Dharma',
      published INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  console.log('✅ BlogPost table created')

  // Create Video table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Video (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      youtubeId TEXT NOT NULL,
      thumbnail TEXT,
      category TEXT NOT NULL DEFAULT 'Sermon',
      published INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  console.log('✅ Video table created')

  // Create SiteSetting table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS SiteSetting (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL DEFAULT ''
    )
  `)
  console.log('✅ SiteSetting table created')

  // Check if data already exists
  const existingPosts = await db.execute('SELECT COUNT(*) as count FROM BlogPost')
  const existingVideos = await db.execute('SELECT COUNT(*) as count FROM Video')

  if (Number(existingPosts.rows[0].count) > 0 || Number(existingVideos.rows[0].count) > 0) {
    console.log('⚠️  Database already has data. Skipping seed.')
    console.log(`   BlogPost: ${existingPosts.rows[0].count} rows`)
    console.log(`   Video: ${existingVideos.rows[0].count} rows`)
    return
  }

  // Seed blog posts
  console.log('🌱 Seeding blog posts...')
  const posts = [
    {
      id: 'cmq7gjq7c0000q77s4bvi99x5',
      title: 'නමො තස්ස භගවතො අරහතො සම්මා සම්බුද්ධස්ස...',
      excerpt: 'පුරුදු අප කා සතුවත් පවත්නා දෙයකි. පුරුදු හොඳ සහ නරක ලෙස කොටස් දෙකකට බෙදා සාකච්ඡා කළ හැකිය.',
      content: 'පුරුදු අප කා සතුවත් පවත්නා දෙයකි. පුරුදු හොඳ සහ නරක ලෙස කොටස් දෙකකට බෙදා සාකච්ඡා කළ හැකිය. හොඳ පුරුදු වටිනා දේ වන අතර ම, නරක පුරුදු නොවටිනා දෙයකි. බොහෝ කල් සිට හුරු කළ පැවැත්ම හඳුන්වන්නට පාවිච්චි කළ හැකි පදයක් ලෙස "ආසව" (ආශ්‍රව) යන්න හැඳින්විය හැකිය. ඒද හොඳ පුරුදු ලෙස නොව, බොහෝ කල් සිට පුරුදු කළ කෙලෙස් යන අරුතිනි.',
      imageUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEifcGzCqQbMv9jxoum3IsOv2_xP6SSX91bkdN05P49_u41c7-nlPd5J-3mBM19wYchY66ouDhTJh5_C7bIlkD-MNh0VVdxsIPFSBoTzmOKEAnB81xbUCVu0sw0fnP-vTZVGbPfMLjbEqlLVVBj7LWIRk3tbmYHKkD1tyS9X5rumVEGCvCPsDHxiSqjfyjc/s3300/landscape-infrared-nature-digital-art-popular-8k-hdr-desktop-wallpaper-background-images-for-apple-macbook-air-macbook-pro-imac-windows-pc-and-linux-computers-4k-high-resolution-14-03-2025-1741981641-hd-wallpaper.jpg',
      category: 'Dharma',
      published: 1,
    },
    {
      id: 'cmq7gjq7c0001q77sb1iq8ubh',
      title: 'Mindfulness in Daily Practice',
      excerpt: 'Simple techniques to bring meditation and awareness into your everyday routine.',
      content: "Mindfulness doesn't require sitting in a quiet room for hours. It's about bringing full awareness to whatever you're doing, whether eating, walking, or working.\n\nStart with your breath. Notice the sensation of air entering and leaving your nostrils. This simple act anchors you in the present moment.\n\nPractice mindful eating. Before each meal, take a moment to appreciate the food. Notice its colors, smells, and textures. Eat slowly, savoring each bite.\n\nWalking meditation is another powerful practice. Feel each step—your foot lifting, moving, and placing on the ground. The rhythm of walking becomes a meditation in itself.\n\nRemember, mindfulness is not about emptying the mind. It's about observing thoughts without judgment and returning to the present moment with gentleness and patience.",
      imageUrl: '/blog/mindfulness.jpg',
      category: 'Meditation',
      published: 1,
    },
    {
      id: 'cmq7gjq7c0002q77sn5b2s313',
      title: 'The Middle Way: Finding Balance in Extremes',
      excerpt: "How the Buddha's teaching on balance can transform our approach to modern challenges.",
      content: "The Middle Way (Majjhima Patipada) is the Buddha's revolutionary insight that the path to liberation lies between the extremes of self-indulgence and self-mortification.\n\nIn today's world, we're constantly pulled toward extremes—work too much or not at all, eat too much or restrict ourselves, socialize endlessly or isolate completely. The Middle Way offers a different approach.\n\nThis teaching isn't just about moderation. It's about understanding that truth lies in the balance, in the careful navigation between extremes that don't serve us.\n\nThe Buddha discovered this through his own experience. After years of extreme asceticism that nearly killed him, he realized that a starved body couldn't support the clear mind needed for enlightenment.\n\nApplying the Middle Way today means listening to your body, honoring your needs, and making conscious choices rather than reactive ones.",
      imageUrl: '/blog/middle-way.jpg',
      category: 'Philosophy',
      published: 1,
    },
    {
      id: 'cmq7gjq7c0003q77s3tzsjlw6',
      title: 'Understanding Karma: Cause and Effect',
      excerpt: 'A clear explanation of karma and how intentional actions shape our present and future.',
      content: "Karma is one of the most misunderstood concepts in Buddhism. It's not fate, destiny, or cosmic punishment. Karma simply means 'action'—specifically, intentional action.\n\nEvery intentional thought, word, and deed creates karma. Wholesome actions rooted in generosity, compassion, and wisdom create positive karma. Unwholesome actions rooted in greed, hatred, and delusion create negative karma.\n\nThe law of karma is the law of cause and effect. Just as a seed planted in fertile soil will grow into a plant, our actions will produce results consistent with their nature.\n\nUnderstanding karma empowers us. We're not victims of circumstance—we're active participants in creating our experience. Each moment offers a new opportunity to act with awareness and compassion.\n\nThis doesn't mean we should obsess over every action. Instead, we cultivate a general orientation toward wholesomeness, trusting that consistent good intentions will bear good fruit.",
      imageUrl: '/blog/karma.jpg',
      category: 'Dharma',
      published: 1,
    },
    {
      id: 'cmq7gjq7c0004q77spmrz2mw6',
      title: "Vesak: Celebrating the Buddha's Life",
      excerpt: 'The significance of Vesak and how Buddhists around the world honor this sacred day.',
      content: "Vesak is the most important festival in the Buddhist calendar. It commemorates three significant events in the Buddha's life: his birth, enlightenment, and passing away—all of which occurred on the full moon day of Vesak.\n\nOn this sacred day, Buddhists gather at temples to observe the Eight Precepts, meditate, and listen to dhamma talks. Devotees make offerings of flowers, incense, and lights to the Buddha.\n\nThe lighting of Vesak lanterns and pandols is a beautiful tradition in Sri Lanka. These illuminate the night, symbolizing the light of wisdom dispelling the darkness of ignorance.\n\nDansalas—free food stalls—are set up along roads as acts of generosity. This practice embodies the Buddhist virtue of dana (giving) and creates a sense of community.\n\nVesak reminds us that enlightenment is possible for all beings. The Buddha was human, and his achievement shows us our own potential for awakening.",
      imageUrl: '/blog/vesak.jpg',
      category: 'Tradition',
      published: 1,
    },
    {
      id: 'cmq7gjq7c0005q77slom259yw',
      title: 'Metta Bhavana: Cultivating Loving-Kindness',
      excerpt: 'Learn the ancient practice of loving-kindness meditation to open your heart to all beings.',
      content: "Metta Bhavana, or loving-kindness meditation, is one of the most powerful practices in the Buddhist tradition. It systematically cultivates a heart of unconditional friendliness toward all beings.\n\nThe practice begins with yourself. Sit quietly and repeat phrases like 'May I be happy, may I be healthy, may I be safe, may I live with ease.' Feel the warmth of these wishes in your heart.\n\nNext, extend this wish to a loved one—someone who naturally brings a smile to your face. Then a neutral person, someone you neither like nor dislike. Then a difficult person, someone you have conflict with.\n\nFinally, extend metta to all beings everywhere: 'May all beings be happy, may all beings be healthy, may all beings be safe, may all beings live with ease.'\n\nRegular metta practice reduces anger and anxiety, increases empathy and compassion, and creates a deep sense of connection with all life.",
      imageUrl: '/blog/metta.jpg',
      category: 'Meditation',
      published: 1,
    },
  ]

  for (const post of posts) {
    await db.execute({
      sql: `INSERT INTO BlogPost (id, title, excerpt, content, imageUrl, category, published, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [post.id, post.title, post.excerpt, post.content, post.imageUrl, post.category, post.published],
    })
  }
  console.log(`✅ Seeded ${posts.length} blog posts`)

  // Seed videos
  console.log('🌱 Seeding videos...')
  const videos = [
    {
      id: 'cmq7gjq7c0006q77svw4k7e9l',
      title: 'Introduction to Buddhist Philosophy',
      description: 'A comprehensive introduction to the core teachings of the Buddha, perfect for beginners.',
      youtubeId: 'N0mS7JnW0UI',
      category: 'Beginner',
      published: 1,
    },
    {
      id: 'cmq7gjq7c0007q77sfv8j2a4m',
      title: 'Guided Meditation for Inner Peace',
      description: 'A calming guided meditation session to help you find peace and clarity within.',
      youtubeId: 'sz7cpV7ERsM',
      category: 'Meditation',
      published: 1,
    },
    {
      id: 'cmq7gjq7c0008q77s5q9h3b7n',
      title: 'The Life of the Buddha',
      description: 'Explore the remarkable journey of Siddhartha Gautama from prince to enlightened teacher.',
      youtubeId: 'hudbOe3gN3E',
      category: 'History',
      published: 1,
    },
    {
      id: 'cmq7gjq7c0009q77sl4x6c8d2',
      title: 'Understanding the Five Precepts',
      description: 'A detailed explanation of the five precepts that form the ethical foundation of Buddhist practice.',
      youtubeId: '9G1CjQ2-NJA',
      category: 'Dharma',
      published: 1,
    },
    {
      id: 'cmq7gjq7c0010q77sw7y9e5f3',
      title: 'Anapanasati: Breath Meditation',
      description: "Learn the Buddha's original method of breath meditation for developing concentration and insight.",
      youtubeId: 'steCSLzKbzg',
      category: 'Meditation',
      published: 1,
    },
    {
      id: 'cmq7gjq7c0011q77sr2t4g6h8',
      title: 'Dhammapada: Verses of the Dhamma',
      description: 'An exploration of the most beloved Buddhist scripture and its practical wisdom for daily life.',
      youtubeId: 'tRJLPj9Y2zU',
      category: 'Scripture',
      published: 1,
    },
  ]

  for (const video of videos) {
    await db.execute({
      sql: `INSERT INTO Video (id, title, description, youtubeId, category, published, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [video.id, video.title, video.description || null, video.youtubeId, video.category, video.published],
    })
  }
  console.log(`✅ Seeded ${videos.length} videos`)

  // Verify
  const postCount = await db.execute('SELECT COUNT(*) as count FROM BlogPost')
  const videoCount = await db.execute('SELECT COUNT(*) as count FROM Video')
  console.log(`\n🎉 Database ready! ${postCount.rows[0].count} blog posts, ${videoCount.rows[0].count} videos`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
