import { db } from "@/lib/db";

async function main() {
  console.log("🌱 Seeding database...");

  // Seed blog posts
  const posts = await db.blogPost.createMany({
    data: [
      {
        title: "The Four Noble Truths: A Modern Perspective",
        excerpt:
          "Understanding the foundation of Buddhist philosophy and its relevance in today's fast-paced world.",
        content:
          "The Four Noble Truths form the foundation of Buddhist teaching. They represent the Buddha's understanding of the nature of suffering, its cause, its cessation, and the path leading to its cessation. In our modern world, these ancient truths offer profound guidance for navigating the complexities of contemporary life.\n\nThe First Noble Truth acknowledges the existence of suffering (dukkha). This isn't pessimism—it's realism. By recognizing that dissatisfaction is part of the human experience, we can begin to address it honestly.\n\nThe Second Noble Truth identifies the cause of suffering as craving (tanha). Our constant desire for pleasure, existence, and non-existence creates a cycle of dissatisfaction.\n\nThe Third Noble Truth offers hope: suffering can cease. When we let go of craving, we experience the peace of nibbana.\n\nThe Fourth Noble Truth prescribes the Noble Eightfold Path as the way to end suffering.",
        imageUrl: "/blog/four-noble-truths.jpg",
        category: "Dharma",
        published: true,
      },
      {
        title: "Mindfulness in Daily Practice",
        excerpt:
          "Simple techniques to bring meditation and awareness into your everyday routine.",
        content:
          "Mindfulness doesn't require sitting in a quiet room for hours. It's about bringing full awareness to whatever you're doing, whether eating, walking, or working.\n\nStart with your breath. Notice the sensation of air entering and leaving your nostrils. This simple act anchors you in the present moment.\n\nPractice mindful eating. Before each meal, take a moment to appreciate the food. Notice its colors, smells, and textures. Eat slowly, savoring each bite.\n\nWalking meditation is another powerful practice. Feel each step—your foot lifting, moving, and placing on the ground. The rhythm of walking becomes a meditation in itself.\n\nRemember, mindfulness is not about emptying the mind. It's about observing thoughts without judgment and returning to the present moment with gentleness and patience.",
        imageUrl: "/blog/mindfulness.jpg",
        category: "Meditation",
        published: true,
      },
      {
        title: "The Middle Way: Finding Balance in Extremes",
        excerpt:
          "How the Buddha's teaching on balance can transform our approach to modern challenges.",
        content:
          "The Middle Way (Majjhima Patipada) is the Buddha's revolutionary insight that the path to liberation lies between the extremes of self-indulgence and self-mortification.\n\nIn today's world, we're constantly pulled toward extremes—work too much or not at all, eat too much or restrict ourselves, socialize endlessly or isolate completely. The Middle Way offers a different approach.\n\nThis teaching isn't just about moderation. It's about understanding that truth lies in the balance, in the careful navigation between extremes that don't serve us.\n\nThe Buddha discovered this through his own experience. After years of extreme asceticism that nearly killed him, he realized that a starved body couldn't support the clear mind needed for enlightenment.\n\nApplying the Middle Way today means listening to your body, honoring your needs, and making conscious choices rather than reactive ones.",
        imageUrl: "/blog/middle-way.jpg",
        category: "Philosophy",
        published: true,
      },
      {
        title: "Understanding Karma: Cause and Effect",
        excerpt:
          "A clear explanation of karma and how intentional actions shape our present and future.",
        content:
          "Karma is one of the most misunderstood concepts in Buddhism. It's not fate, destiny, or cosmic punishment. Karma simply means 'action'—specifically, intentional action.\n\nEvery intentional thought, word, and deed creates karma. Wholesome actions rooted in generosity, compassion, and wisdom create positive karma. Unwholesome actions rooted in greed, hatred, and delusion create negative karma.\n\nThe law of karma is the law of cause and effect. Just as a seed planted in fertile soil will grow into a plant, our actions will produce results consistent with their nature.\n\nUnderstanding karma empowers us. We're not victims of circumstance—we're active participants in creating our experience. Each moment offers a new opportunity to act with awareness and compassion.\n\nThis doesn't mean we should obsess over every action. Instead, we cultivate a general orientation toward wholesomeness, trusting that consistent good intentions will bear good fruit.",
        imageUrl: "/blog/karma.jpg",
        category: "Dharma",
        published: true,
      },
      {
        title: "Vesak: Celebrating the Buddha's Life",
        excerpt:
          "The significance of Vesak and how Buddhists around the world honor this sacred day.",
        content:
          "Vesak is the most important festival in the Buddhist calendar. It commemorates three significant events in the Buddha's life: his birth, enlightenment, and passing away—all of which occurred on the full moon day of Vesak.\n\nOn this sacred day, Buddhists gather at temples to observe the Eight Precepts, meditate, and listen to dhamma talks. Devotees make offerings of flowers, incense, and lights to the Buddha.\n\nThe lighting of Vesak lanterns and pandols is a beautiful tradition in Sri Lanka. These illuminate the night, symbolizing the light of wisdom dispelling the darkness of ignorance.\n\nDansalas—free food stalls—are set up along roads as acts of generosity. This practice embodies the Buddhist virtue of dana (giving) and creates a sense of community.\n\nVesak reminds us that enlightenment is possible for all beings. The Buddha was human, and his achievement shows us our own potential for awakening.",
        imageUrl: "/blog/vesak.jpg",
        category: "Tradition",
        published: true,
      },
      {
        title: "Metta Bhavana: Cultivating Loving-Kindness",
        excerpt:
          "Learn the ancient practice of loving-kindness meditation to open your heart to all beings.",
        content:
          "Metta Bhavana, or loving-kindness meditation, is one of the most powerful practices in the Buddhist tradition. It systematically cultivates a heart of unconditional friendliness toward all beings.\n\nThe practice begins with yourself. Sit quietly and repeat phrases like 'May I be happy, may I be healthy, may I be safe, may I live with ease.' Feel the warmth of these wishes in your heart.\n\nNext, extend this wish to a loved one—someone who naturally brings a smile to your face. Then a neutral person, someone you neither like nor dislike. Then a difficult person, someone you have conflict with.\n\nFinally, extend metta to all beings everywhere: 'May all beings be happy, may all beings be healthy, may all beings be safe, may all beings live with ease.'\n\nRegular metta practice reduces anger and anxiety, increases empathy and compassion, and creates a deep sense of connection with all life.",
        imageUrl: "/blog/metta.jpg",
        category: "Meditation",
        published: true,
      },
    ],
  });

  // Seed videos
  const videos = await db.video.createMany({
    data: [
      {
        title: "Introduction to Buddhist Philosophy",
        description:
          "A comprehensive introduction to the core teachings of the Buddha, perfect for beginners.",
        youtubeId: "N0mS7JnW0UI",
        category: "Beginner",
        published: true,
      },
      {
        title: "Guided Meditation for Inner Peace",
        description:
          "A calming guided meditation session to help you find peace and clarity within.",
        youtubeId: "sz7cpV7ERsM",
        category: "Meditation",
        published: true,
      },
      {
        title: "The Life of the Buddha",
        description:
          "Explore the remarkable journey of Siddhartha Gautama from prince to enlightened teacher.",
        youtubeId: "hudbOe3gN3E",
        category: "History",
        published: true,
      },
      {
        title: "Understanding the Five Precepts",
        description:
          "A detailed explanation of the five precepts that form the ethical foundation of Buddhist practice.",
        youtubeId: "9G1CjQ2-NJA",
        category: "Dharma",
        published: true,
      },
      {
        title: "Anapanasati: Breath Meditation",
        description:
          "Learn the Buddha's original method of breath meditation for developing concentration and insight.",
        youtubeId: "steCSLzKbzg",
        category: "Meditation",
        published: true,
      },
      {
        title: "Dhammapada: Verses of the Dhamma",
        description:
          "An exploration of the most beloved Buddhist scripture and its practical wisdom for daily life.",
        youtubeId: "tRJLPj9Y2zU",
        category: "Scripture",
        published: true,
      },
    ],
  });

  console.log(`✅ Seeded ${posts.count} blog posts and ${videos.count} videos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
