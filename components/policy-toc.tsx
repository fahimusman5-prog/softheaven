'use client';
import { useEffect, useState } from 'react';
export function PolicyToc({ sections }: { sections: { id: string; title: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-12% 0px -65% 0px' });
    sections.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [sections]);
  return <nav className="care-toc" aria-label="On this page"><h2>On this page</h2><ol>{sections.map((s,i) => <li key={s.id}><a href={'#'+s.id} aria-current={active === s.id ? 'location' : undefined}><span>{String(i+1).padStart(2,'0')}</span>{s.title}</a></li>)}</ol></nav>;
}
