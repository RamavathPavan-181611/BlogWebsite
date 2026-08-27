/* eslint-disable no-undef */
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { exec } from 'child_process';

chai.use(chaiHttp);
const { expect } = chai;

const seedDatabase = () => {
  return new Promise((resolve, reject) => {
    exec('node utils/seed.js', (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

const getUserId = async () => {
  const user = await User.findByEmail('john@example.com');
  return user._id.toString();
};

describe('Post Creation Testing', () => {
  let userId, response;

  it('should create a post with expected response structure and values', async () => {
    await seedDatabase();
    userId = await getUserId();

    const postData = {
      title: 'Test Blog Post',
      content: 'This is a test blog post content with some sample text for testing purposes.',
      excerpt: 'This is a test excerpt',
      category: 'Technology',
      tags: ['test', 'blog', 'sample'],
      readTime: 5
    };

    response = await chai
      .request(app)
      .post('/api/posts')
      .set('x-user-id', userId)
      .send(postData);

    expect(response).to.have.status(201);
    expect(response.body).to.have.property('message', 'Post created successfully');
    expect(response.body).to.have.property('post');

    const post = response.body.post;

    expect(post).to.have.property('title', postData.title);
    expect(post).to.have.property('content', postData.content);
    expect(post).to.have.property('excerpt', postData.excerpt);
    expect(post).to.have.property('category', postData.category);
    expect(post.tags).to.deep.equal(postData.tags);
    expect(post).to.have.property('readTime', postData.readTime);
    expect(post).to.have.property('published', true);
    expect(post).to.have.property('author');

    expect(post.author).to.have.property('_id', userId);
    expect(post.author).to.have.property('name', 'John Doe');
    expect(post.author).to.have.property('email', 'john@example.com');
    expect(post.author).to.have.property('bio');
  }).timeout(10000);

  it('should save the created post to the database', async () => {
    await seedDatabase();
    userId = await getUserId();

    const postData = {
      title: 'Test Blog Post 2',
      content: 'This is a test blog post content with different sample text for testing purposes.',
      excerpt: 'This is another test excerpt',
      category: 'Travel',
      tags: ['testing', 'blogs', 'sample'],
      readTime: 3
    };

    const createResponse = await chai
      .request(app)
      .post('/api/posts')
      .set('x-user-id', userId)
      .send(postData);

    expect(createResponse).to.have.status(201);
    const createdPostId = createResponse.body.post._id;
    const savedPost = await Post.findById(createdPostId);

    expect(savedPost).to.not.be.null;
    expect(savedPost.title).to.equal(postData.title);
    expect(savedPost.content).to.equal(postData.content);
    expect(savedPost.excerpt).to.equal(postData.excerpt);
    expect(savedPost.category).to.equal(postData.category);
    expect(savedPost.tags).to.deep.equal(postData.tags);
    expect(savedPost.readTime).to.equal(postData.readTime);
    expect(savedPost.published).to.equal(true);
    expect(savedPost).to.have.property('author');

    const userPostsResponse = await chai
      .request(app)
      .get('/api/posts/my-posts')
      .set('x-user-id', userId);

    expect(userPostsResponse).to.have.status(200);
    expect(userPostsResponse.body.posts).to.be.an('array');

    const foundPost = userPostsResponse.body.posts.find(p => p._id === createdPostId);
    expect(foundPost).to.not.be.undefined;
    expect(foundPost.title).to.equal(postData.title);
  }).timeout(10000);
});

after(async function () {
  this.timeout(10000);
  await seedDatabase();
});
