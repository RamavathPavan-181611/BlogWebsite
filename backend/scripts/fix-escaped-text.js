import mongoose from 'mongoose';
import connectDatabase from '../config/database.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// Reverses the HTML escaping that sanitizeText applied while it used sanitize-html
// with disallowedTagsMode: 'escape'. That path escaped only & < > in text nodes.
// Order matters: &amp; must go last, otherwise a stored "&amp;lt;" unescapes to
// "&lt;" and then to "<", inventing a tag the author never wrote.
const unescape = (value) =>
  value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const ESCAPED = /&amp;|&lt;|&gt;/;

const TARGETS = [
  { model: Post, label: 'Post', fields: ['title', 'content', 'excerpt'], arrayFields: ['tags'] },
  { model: Comment, label: 'Comment', fields: ['content'], arrayFields: [] }
];

const parseArgs = (argv) => {
  const apply = argv.includes('--apply');
  const beforeArg = argv.find((arg) => arg.startsWith('--before='));
  const before = beforeArg ? new Date(beforeArg.slice('--before='.length)) : null;

  if (before && Number.isNaN(before.getTime())) {
    throw new Error(`Invalid --before date: ${beforeArg}`);
  }

  return { apply, before };
};

const preview = (value) => {
  const collapsed = value.replace(/\s+/g, ' ').trim();
  return collapsed.length > 90 ? `${collapsed.slice(0, 90)}...` : collapsed;
};

const buildUpdate = (doc, fields, arrayFields) => {
  const changes = {};

  for (const field of fields) {
    const value = doc[field];
    if (typeof value === 'string' && ESCAPED.test(value)) {
      const next = unescape(value);
      if (next !== value) changes[field] = next;
    }
  }

  for (const field of arrayFields) {
    const value = doc[field];
    if (!Array.isArray(value)) continue;
    if (!value.some((entry) => typeof entry === 'string' && ESCAPED.test(entry))) continue;
    changes[field] = value.map((entry) => (typeof entry === 'string' ? unescape(entry) : entry));
  }

  return changes;
};

const migrate = async () => {
  const { apply, before } = parseArgs(process.argv.slice(2));

  await connectDatabase();
  console.log(apply ? 'Mode: APPLY (documents will be written)' : 'Mode: DRY RUN (no writes, pass --apply to persist)');
  if (before) console.log(`Restricting to documents with updatedAt < ${before.toISOString()}`);

  let totalMatched = 0;
  let totalWritten = 0;

  for (const { model, label, fields, arrayFields } of TARGETS) {
    const allFields = [...fields, ...arrayFields];
    const query = { $or: allFields.map((field) => ({ [field]: ESCAPED })) };
    if (before) query.updatedAt = { $lt: before };

    const docs = await model.find(query).lean();
    const operations = [];

    for (const doc of docs) {
      const changes = buildUpdate(doc, fields, arrayFields);
      if (Object.keys(changes).length === 0) continue;

      operations.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: changes },
          timestamps: false
        }
      });

      for (const [field, next] of Object.entries(changes)) {
        const previous = Array.isArray(doc[field]) ? doc[field].join(', ') : doc[field];
        const updated = Array.isArray(next) ? next.join(', ') : next;
        console.log(`${label} ${doc._id} ${field}`);
        console.log(`  before: ${preview(previous)}`);
        console.log(`  after : ${preview(updated)}`);
      }
    }

    totalMatched += operations.length;
    console.log(`${label}: ${operations.length} document(s) need updating`);

    if (apply && operations.length > 0) {
      const result = await model.bulkWrite(operations, { ordered: false });
      totalWritten += result.modifiedCount;
      console.log(`${label}: ${result.modifiedCount} document(s) updated`);
    }
  }

  console.log(
    apply
      ? `Done. ${totalWritten}/${totalMatched} document(s) updated.`
      : `Done. ${totalMatched} document(s) would be updated. Re-run with --apply to persist.`
  );
};

migrate()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
