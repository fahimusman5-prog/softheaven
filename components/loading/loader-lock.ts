/** Shared across nested Suspense fallbacks; unlock only after the last real wait clears. */
const active = new Set<HTMLElement>();
let restore = () => {};
function designatePrimary() {
  const primary = active.values().next().value;
  active.forEach(node => {
    node.toggleAttribute('data-loader-secondary', node !== primary);
    if (node !== primary) node.setAttribute('aria-hidden', 'true');
    else node.removeAttribute('aria-hidden');
  });
}
export function acquireLoaderLock(node: HTMLElement) {
  if (!active.size) {
    const html = document.documentElement;
    const overflow = html.style.overflow;
    const gutter = html.style.scrollbarGutter;
    if (innerWidth > html.clientWidth) html.style.scrollbarGutter = 'stable';
    html.style.overflow = 'hidden';
    const siblings: Array<{ element: HTMLElement; inert: boolean }> = [];
    let branch = node;
    while (branch.parentElement) {
      for (const sibling of Array.from(branch.parentElement.children)) {
        if (sibling !== branch && sibling instanceof HTMLElement && !sibling.matches('[data-softhaven-loader]')) {
          siblings.push({ element:sibling, inert:sibling.inert });
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
      if (branch === document.body) break;
    }
    restore = () => {
      html.style.overflow = overflow;
      html.style.scrollbarGutter = gutter;
      siblings.forEach(({ element, inert }) => { element.inert = inert; });
    };
  }
  active.add(node);
  designatePrimary();
  return () => {
    active.delete(node);
    designatePrimary();
    if (active.size) return false;
    restore();
    restore = () => {};
    return true;
  };
}
