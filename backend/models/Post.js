import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Technology',
        'Lifestyle',
        'Travel',
        'Food',
        'Business',
        'Health',
        'Education',
        'Entertainment'
      ]
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    readTime: {
      type: Number,
      default: 5
    },
    published: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'posts'
  }
);

postSchema.index({ published: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, published: 1, createdAt: -1 });

postSchema.statics.findAll = function ({ page = 1, limit = 20, category, search } = {}) {
  const query = { published: true };

  if (category) query.category = category;
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchExpression = new RegExp(escapedSearch, 'i');
    query.$or = [{ title: searchExpression }, { excerpt: searchExpression }];
  }

  return this.find(query)
    .populate('author', 'name email bio')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

postSchema.statics.findByAuthor = function (authorId, { page = 1, limit = 20 } = {}) {
  return this.find({ author: authorId })
    .populate('author', 'name email bio')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

postSchema.statics.findByCategory = function (category) {
  return this.find({ category, published: true })
    .populate('author', 'name email bio')
    .sort({ createdAt: -1 });
};

export default mongoose.model('Post', postSchema);

