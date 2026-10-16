/*
 * Landing block
 * Full-viewport, no-scroll intro: text on the left, portrait image on the right.
 *
 * Authoring (Google Doc / Word table):
 * | Landing                                   |                 |
 * | Hello World (H1)                          | [silhouette img]|
 * | I'm James (H1)                            |                 |
 * | Bio paragraph                             |                 |
 * | github / linkedin / instagram URLs        |                 |
 * | **View Projects** (bold link = primary)   |                 |
 * | _View Art_ (italic link = secondary)      |                 |
 *
 * Cell order doesn't matter: the picture goes to the media column,
 * everything else goes to the details column.
 */
 
const SOCIAL = {
  github: {
    label: 'GitHub',
    svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  },
  linkedin: {
    label: 'LinkedIn',
    svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  },
  instagram: {
    label: 'Instagram',
    svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2" y="2" width="20" height="20" rx="5.5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="4.6" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="17.6" cy="6.4" r="1.4" fill="currentColor"/></svg>',
  },
};
 
function socialKey(href) {
  try {
    const { hostname } = new URL(href, window.location.href);
    return Object.keys(SOCIAL).find((key) => hostname.includes(key)) || null;
  } catch (e) {
    return null;
  }
}
 
function isSocialParagraph(p) {
  const links = [...p.querySelectorAll('a')];
  return links.length > 0 && links.every((a) => socialKey(a.href));
}
 
export default function decorate(block) {
  // page-level hook: lets landing.css lock the page to one screen
  document.body.classList.add('landing-page');
 
  const details = document.createElement('div');
  details.className = 'landing-details';
  const media = document.createElement('div');
  media.className = 'landing-media';
 
  // flatten all authored cells into the two columns
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    [...cell.children].forEach((el) => {
      if (el.querySelector('picture') || el.tagName === 'PICTURE') media.append(el);
      else details.append(el);
    });
  });
 
  // LCP image: load it right away
  const img = media.querySelector('img');
  if (img) {
    img.loading = 'eager';
    img.setAttribute('fetchpriority', 'high');
  }
 
  // social links: paragraphs that contain only github/linkedin/instagram links
  const social = document.createElement('div');
  social.className = 'landing-social';
  [...details.querySelectorAll(':scope > p')].filter(isSocialParagraph).forEach((p) => {
    p.querySelectorAll('a').forEach((a) => {
      const { label, svg } = SOCIAL[socialKey(a.href)];
      a.className = 'landing-social-link';
      a.setAttribute('aria-label', label);
      a.title = label;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = svg;
      social.append(a);
    });
    if (!social.isConnected) p.replaceWith(social);
    else p.remove();
  });
 
  // CTA buttons (boilerplate already turned lone links into .button)
  const actions = document.createElement('div');
  actions.className = 'landing-actions';
  [...details.querySelectorAll(':scope > .button-container')].forEach((p, i) => {
    if (i === 0) p.before(actions);
    actions.append(p);
  });
 
  block.replaceChildren(details, media);
}
