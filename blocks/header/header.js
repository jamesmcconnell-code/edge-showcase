import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
 
/*
 * Header
 * Reads the /nav document and renders:
 *   [round profile photo -> home]           Client Projects   Personal Projects
 *
 * /nav document format:
 *   (profile image)
 *   ---
 *   • Client Projects   (linked to /client-projects)
 *   • Personal Projects (linked to /personal-projects)
 *
 * The image doesn't need its own link; it always goes to the home page.
 */
 
function normalizePath(path) {
  return path.replace(/\/index$/, '/').replace(/(.)\/$/, '$1');
}
 
function isCurrent(href) {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    const here = normalizePath(window.location.pathname);
    const there = normalizePath(url.pathname);
    // exact match, or a child page (e.g. /client-projects/acme)
    return there === here || (there !== '/' && here.startsWith(`${there}/`));
  } catch (e) {
    return false;
  }
}
 
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
 
  block.textContent = '';
  if (!fragment) return;
 
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
 
  // ---- brand: round profile photo linking home ----
  const brand = document.createElement('a');
  brand.className = 'nav-brand';
  brand.href = '/';
  brand.setAttribute('aria-label', 'Home');
 
  const picture = fragment.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.width = 44;
      img.height = 44;
      if (!img.alt) img.alt = '';
    }
    brand.append(picture);
  }
 
  // ---- links: every link in the nav doc that isn't the brand ----
  const list = document.createElement('ul');
  list.className = 'nav-links';
  fragment.querySelectorAll('a[href]').forEach((a) => {
    if (a.querySelector('picture') || !a.textContent.trim()) return;
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.href;
    link.textContent = a.textContent.trim();
    if (isCurrent(a.href)) link.setAttribute('aria-current', 'page');
    if (new URL(a.href, window.location.href).origin !== window.location.origin) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    li.append(link);
    list.append(li);
  });
 
  nav.append(brand, list);
 
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.append(wrapper);
}
