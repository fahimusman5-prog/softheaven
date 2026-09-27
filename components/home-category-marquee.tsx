const categories = ['Teddy Bear Collection', 'Soft Animal Friends', 'Love & Gifting'];

export function HomeCategoryMarquee() {
  return <div className="home-marquee" role="region" aria-label="Explore the SoftHaven collections">
    <div className="home-marquee__track">
      {[0, 1].map((copy) => <div className="home-marquee__group" key={copy} aria-hidden={copy === 1}>
        {categories.map((category) => <span className="home-marquee__item" key={category}><i aria-hidden="true" />{category}</span>)}
      </div>)}
    </div>
  </div>;
}
