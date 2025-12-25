import React from 'react';
import { Link } from 'wouter';
import useReveal from '../../hooks/useReveal.ts';
import { blogPosts, type BlogPost } from '../../data/blogPosts.ts';

export default function Blog() {
  useReveal();

  return (
    <div className="blog-page-v2">
      <section className="blog-hero-v2">
        <div className="container">
          <h1>Blogs</h1>
          <p className="blog-hero-v2__sub">Insights, tips, and updates from Findtern.</p>
        </div>
      </section>

      <section className="blog-grid-v2 reveal reveal--up">
        <div className="container">
          <div className="blog-grid-v2__grid">
            {blogPosts.map((p: BlogPost) => (
              <article key={p.slug} className="blog-card-v2 tilt-3d">
                <div className="blog-card-v2__img">
                  <img src={p.img} alt="" loading="lazy" />
                </div>
                <h3 className="blog-card-v2__title">{p.title}</h3>
                <p className="blog-card-v2__excerpt">{p.excerpt}</p>
                <Link className="blog-card-v2__btn" href={`/blog/${p.slug}`} aria-label="Read more">
                  Read More
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
