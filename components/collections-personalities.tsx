import Image from 'next/image';
import Link from 'next/link';

const worlds = [
  {
    key: 'puppy',
    title: 'Puppy Pals',
    copy: 'Playful puppy companions ready for cuddles and everyday adventures.',
    href: '/shop?collection=puppy-pals',
    image: '/assets/collections/personalities/puppy-pals.webp',
    alt: 'Two puppy plush companions nestled in pastel clouds',
  },
  {
    key: 'kitty',
    title: 'Kitty Corner',
    copy: 'Curious, cosy feline friends with plenty of personality.',
    href: '/shop?collection=kitty-corner',
    image: '/assets/collections/personalities/kitty-corner.webp',
    alt: 'Two kitten plush companions nestled in pastel clouds',
  },
  {
    key: 'fantasy',
    title: 'Fantasy Friends',
    copy: 'Whimsical companions made for imaginations big and small.',
    href: '/shop?collection=fantasy-friends',
    image: '/assets/collections/personalities/fantasy-friends.webp',
    alt: 'Unicorn and dragon plush companions nestled in pastel clouds',
  },
] as const;

export function CollectionsPersonalities() {
  return (
    <section className="personalities" aria-labelledby="personalities-title">
      <div className="personalities__halo personalities__halo--pink" aria-hidden="true" />
      <div className="personalities__halo personalities__halo--blue" aria-hidden="true" />
      <div className="personalities__cloud personalities__cloud--left" aria-hidden="true" />
      <div className="personalities__cloud personalities__cloud--right" aria-hidden="true" />
      <header className="personalities__header">
        <span className="personalities__eyebrow">THERE&apos;S MORE TO LOVE</span>
        <h2 id="personalities-title"><span>Meet More</span><em>Little Personalities.</em></h2>
        <p>From playful pups to curious kittens and magical companions,<br className="personalities__wide-break" /> there&apos;s always another SoftHaven friend waiting to be found.</p>
      </header>
      <div className="personalities__worlds">
        {worlds.map((world) => (
          <article className={`personality personality--${world.key}`} key={world.key}>
            <div className="personality__art">
              <Image src={world.image} alt={world.alt} fill sizes="(max-width: 760px) 92vw, 48vw" />
            </div>
            <div className="personality__copy">
              <h3>{world.title}</h3>
              <p>{world.copy}</p>
              <Link href={world.href}>Explore this collection <span aria-hidden="true">→</span></Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}