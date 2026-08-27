import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../app.js';
import { getJwtSecret } from '../config/auth.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

chai.use(chaiHttp);
const { expect } = chai;

describe('Backend API integration', () => {
  let user;
  let token;
  let commentPost;

  before(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        'mongodb://127.0.0.1:27017/BlogPlatform_test?directConnection=true&serverSelectionTimeoutMS=2000'
    );
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await User.deleteMany({});

    user = await User.create({
      name: 'Integration User',
      email: 'integration@example.com',
      password: 'Password123'
    });
    token = jwt.sign({ id: user._id }, getJwtSecret());
    commentPost = await Post.create({
      title: 'Comment test post',
      content: 'This post is used to test comments.',
      category: 'Technology',
      author: user._id
    });
  });

  after(async () => {
    await Post.deleteMany({});
    await Comment.deleteMany({});
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

  it('registers a new account and hashes its password', async () => {
    const response = await chai
      .request(app)
      .post('/api/auth/register')
      .send({
        name: 'New Reader',
        email: 'new-reader@example.com',
        password: 'StrongPassword1!'
      });

    expect(response).to.have.status(201);
    expect(response.body.user).to.not.have.property('password');
    const createdUser = await User.findOne({ email: 'new-reader@example.com' });
    expect(await bcrypt.compare('StrongPassword1!', createdUser.password)).to.equal(true);
  });

  it('reports database readiness through the health endpoint', async () => {
    const response = await chai.request(app).get('/healthz');

    expect(response).to.have.status(200);
    expect(response.body).to.deep.equal({
      status: 'ok',
      database: 'connected'
    });
  });

  it('updates profile information for the authenticated user', async () => {
    const response = await chai
      .request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Integration User',
        bio: 'A profile bio for testing',
        location: 'Chennai, India',
        website: 'https://example.com'
      });

    expect(response).to.have.status(200);
    expect(response.body.user).to.include({
      name: 'Updated Integration User',
      bio: 'A profile bio for testing',
      location: 'Chennai, India',
      website: 'https://example.com'
    });
  });

  it('changes the password only after verifying the current password', async () => {
    const response = await chai
      .request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Password123', newPassword: 'NewPassword123' });

    expect(response).to.have.status(200);
    const updatedUser = await User.findById(user._id);
    expect(await bcrypt.compare('NewPassword123', updatedUser.password)).to.equal(true);
    expect(await bcrypt.compare('Password123', updatedUser.password)).to.equal(false);
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

  it('supports sanitized comment creation, listing, and author deletion', async () => {
    const createResponse = await chai
      .request(app)
      .post(`/api/posts/${commentPost._id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '<script>alert(1)</script>Helpful comment' });

    expect(createResponse).to.have.status(201);
    expect(createResponse.body.comment.content).to.not.include('<script>');
    expect(createResponse.body.comment.author).to.have.property('name', 'Updated Integration User');

    const listResponse = await chai
      .request(app)
      .get(`/api/posts/${commentPost._id}/comments`);
    expect(listResponse).to.have.status(200);
    expect(listResponse.body.comments).to.have.lengthOf(1);

    const deleteResponse = await chai
      .request(app)
      .delete(`/api/posts/comments/${createResponse.body.comment._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteResponse).to.have.status(200);
  });
});