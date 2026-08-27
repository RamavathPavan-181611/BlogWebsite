import Post from '../models/Post.js';
import mongoose from 'mongoose';
import { sanitizeTags, sanitizeText } from '../utils/sanitize.js';
import { postCategories } from '../middleware/validators.js';
import Comment from '../models/Comment.js';
import Interaction from '../models/Interaction.js';

const getPaging = (query) => ({
  page: Math.max(Number.parseInt(query.page, 10) || 1, 1),
  limit: Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 50)
});

export const getAllPosts = async (req, res) => {
  try {
    const { page, limit } = getPaging(req.query);
    const { category, search } = req.query;

    if (category && !postCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const posts = await Post.findAll({
      page,
      limit,
      category,
      search: typeof search === 'string' ? search.trim().slice(0, 100) : undefined
    });
    res.status(200).json({
      posts,
      pagination: { page, limit, hasMore: posts.length === limit }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(id).populate('author', 'name email bio');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Server error fetching post' });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { page, limit } = getPaging(req.query);
    const posts = await Post.findByAuthor(userId, { page, limit });
    res.status(200).json({
      posts,
      pagination: { page, limit, hasMore: posts.length === limit }
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
};

export const createPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { title, content, excerpt, category, tags, readTime } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!title || !content || !category) {
      return res.status(400).json({
        message: 'Title, content, and category are required'
      });
    }

    const post = new Post({
      title: sanitizeText(title),
      content: sanitizeText(content),
      excerpt: sanitizeText(excerpt),
      category,
      tags: sanitizeTags(tags || []),
      readTime: readTime || Math.ceil(content.split(' ').length / 200),
      author: userId
    });

    await post.save();
    await post.populate('author', 'name email bio');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { title, content, excerpt, category, tags, readTime, published } = req.body;

    if (title) post.title = sanitizeText(title);
    if (content) {
      post.content = sanitizeText(content);
      post.readTime = readTime || Math.ceil(post.content.split(' ').length / 200);
    }
    if (excerpt !== undefined) post.excerpt = sanitizeText(excerpt);
    if (category) post.category = category;
    if (tags !== undefined) post.tags = sanitizeTags(tags);
    if (published !== undefined) post.published = published;

    await post.save();
    await post.populate('author', 'name email bio');

    res.status(200).json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error updating post' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const postExists = await Post.exists({ _id: id });
    if (!postExists) return res.status(404).json({ message: 'Post not found' });

    const comments = await Comment.find({ post: id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const author = req.user?.id;
    if (!author) return res.status(401).json({ message: 'Not authenticated' });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const postExists = await Post.exists({ _id: id });
    if (!postExists) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      post: id,
      author,
      content: sanitizeText(req.body.content)
    });
    await comment.populate('author', 'name email');
    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error creating comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const author = req.user?.id;
    if (!author) return res.status(401).json({ message: 'Not authenticated' });
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== author) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
};

export const getEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid post ID' });
    if (!(await Post.exists({ _id: id }))) return res.status(404).json({ message: 'Post not found' });

    const [likes, bookmarks, userInteractions] = await Promise.all([
      Interaction.countDocuments({ post: id, type: 'like' }),
      Interaction.countDocuments({ post: id, type: 'bookmark' }),
      req.user
        ? Interaction.find({ post: id, user: req.user.id }).select('type -_id')
        : []
    ]);
    const interactionTypes = userInteractions.map((interaction) => interaction.type);
    res.status(200).json({
      likes,
      bookmarks,
      liked: interactionTypes.includes('like'),
      bookmarked: interactionTypes.includes('bookmark')
    });
  } catch (error) {
    console.error('Get engagement error:', error);
    res.status(500).json({ message: 'Server error fetching engagement' });
  }
};

const toggleInteraction = async (req, res, type) => {
  const { id } = req.params;
  const user = req.user?.id;
  if (!user) return res.status(401).json({ message: 'Not authenticated' });
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid post ID' });
  if (!(await Post.exists({ _id: id }))) return res.status(404).json({ message: 'Post not found' });

  const existing = await Interaction.findOne({ post: id, user, type });
  if (existing) {
    await existing.deleteOne();
  } else {
    await Interaction.create({ post: id, user, type });
  }

  const count = await Interaction.countDocuments({ post: id, type });
  res.status(200).json({ type, active: !existing, count });
};

export const toggleLike = (req, res) => toggleInteraction(req, res, 'like');
export const toggleBookmark = (req, res) => toggleInteraction(req, res, 'bookmark');
