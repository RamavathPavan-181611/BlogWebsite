import chai from 'chai';
import chaiHttp from 'chai-http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../app.js';
import { getJwtSecret } from '../config/auth.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

chai.use(chaiHttp);
const { expect } = chai;

describe('Backend API integration', () => {
  let user;
  let token;

  before(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        'mongodb://127.0.0.1:27017/BlogPlatform_test?directConnection=true&serverSelectionTimeoutMS=2000'
    );
    await Post.deleteMany({});
    await User.deleteMany({});

    user = await User.create({
      name: 'Integration User',
      email: 'integration@example.com',
      password: 'Password123'
    });
    token = jwt.sign({ id: user._id }, getJwtSecret());
  });

  after(async () => {
    await Post.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it('creates a sanitized post with JWT authentication', async () => {
    const response = await chai
      .request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Integration post',
        content: '<script>alert(1)</script>Safe content',
        excerpt: 'Integration excerpt',
        category: 'Travel',
        tags: ['integration']
      });

    expect(response).to.have.status(201);
    expect(response.body.post).to.have.property('category', 'Travel');
    expect(response.body.post.content).to.not.include('<script>');
    expect(response.body.post.author).to.have.property('email', 'integration@example.com');
  });

  it('supports the authenticated my-posts route and bounded pagination', async () => {
    const response = await chai
      .request(app)
      .get('/api/posts/my-posts?limit=999')
      .set('Authorization', `Bearer ${token}`);

    expect(response).to.have.status(200);
    expect(response.body.posts).to.be.an('array');
    expect(response.body.pagination).to.deep.include({ limit: 50, page: 1 });
  });
});