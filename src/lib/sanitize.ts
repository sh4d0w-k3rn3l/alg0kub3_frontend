import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'blockquote', 'hr',
      'svg', 'path', 'circle', 'rect', 'g', 'text', 'line', 'polyline', 'polygon',
      'defs', 'linearGradient', 'stop', 'clipPath', 'mask',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'style', 'id',
      'data-testid', 'data-src',
      'viewBox', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'x', 'y',
      'rx', 'ry', 'dx', 'dy', 'x1', 'y1', 'x2', 'y2',
      'xmlns', 'xmlns:xlink',
      'points', 'pathLength',
      'stop-color', 'offset',
      'clip-rule', 'fill-rule', 'stroke-linecap', 'stroke-linejoin',
      'transform', 'opacity',
    ],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}
