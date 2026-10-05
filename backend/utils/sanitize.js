const HTML_TAG = /<\/?[a-zA-Z][^>]*>/g;

// Tags are stripped rather than escaped. Every read path escapes on output —
// React text nodes for titles, excerpts and comments, and formatContent before
// dangerouslySetInnerHTML — so escaping here too would double-encode `&`.
export const sanitizeText = (value) => {
  if (typeof value !== 'string') return value;

  let stripped = value;
  let previous;

  do {
    previous = stripped;
    stripped = stripped.replace(HTML_TAG, '');
  } while (stripped !== previous);

  return stripped;
};

export const sanitizeTags = (tags) =>
  Array.isArray(tags) ? tags.map(sanitizeText) : tags;