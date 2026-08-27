import connectDatabase from '../config/database.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { users } from '../data/users.js';
import { posts } from '../data/posts.js';

const seedDatabase = async () => {
  await connectDatabase();

  await Post.deleteMany({});
  await User.deleteMany({});

  const createdUsers = await User.create(users);
  const postsWithAuthors = posts.map((post, index) => ({
    ...post,
    // The source data is arranged in author groups: John, Sarah, Mike, then Emma.
    author: createdUsers[index < 3 ? 0 : index < 5 ? 1 : index < 7 ? 2 : 3]._id
  }));

  await Post.insertMany(postsWithAuthors);
  console.log(`Seeded ${createdUsers.length} users and ${postsWithAuthors.length} posts`);
};

seedDatabase()
  .catch((error) => {
    console.error('Database seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = (await import('mongoose')).default;
    await mongoose.disconnect();
  });
