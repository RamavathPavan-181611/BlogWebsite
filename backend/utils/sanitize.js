import sanitizeHtml from 'sanitize-html';

export const sanitizeText = (value) => {
  if (typeof value !== 'string') return value;

  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'escape'
  });
};

export const sanitizeTags = (tags) =>
  Array.isArray(tags) ? tags.map(sanitizeText) : tags;