import DOMPurify from 'dompurify';

/**
 * Sanitize HTML to prevent XSS attacks.
 * Allows rich content tags needed for articles/services while stripping scripts.
 */
export const sanitizeHtml = (html) => {
  if (typeof html !== 'string' || !html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i', 'u',
      'br', 'hr', 'img', 'blockquote', 'code', 'pre',
      'div', 'span', 'section', 'article', 'aside',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'figure', 'figcaption', 'sup', 'sub', 'mark',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'class', 'id', 'target', 'rel',
      'style', 'title', 'loading', 'width', 'height',
      'colspan', 'rowspan', 'itemProp', 'itemScope', 'itemType',
      'data-testid',
    ],
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: false,
  });
};
