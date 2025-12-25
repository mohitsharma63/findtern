import React from 'react';
import { Link } from 'wouter';
import { blogPosts, getBlogPostBySlug, type BlogPost } from '../../data/blogPosts.ts';
import './BlogDetail.css';

export default function BlogDetail({ params }: { params?: { slug?: string } }) {
  const slug = params?.slug;
  const post: BlogPost | undefined = getBlogPostBySlug(slug);

  const related: BlogPost[] = blogPosts.filter((p: BlogPost) => p.slug !== slug).slice(0, 3);

  const calcReadingTime = (p: BlogPost) => {
    const words = [p.title, p.excerpt, ...(p.body || [])]
      .join(' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return { words, minutes };
  };

  const getNavPosts = (currentSlug?: string) => {
    const idx = blogPosts.findIndex((p: BlogPost) => p.slug === currentSlug);
    if (idx < 0) return { prev: null, next: null };
    return {
      prev: idx > 0 ? blogPosts[idx - 1] : null,
      next: idx < blogPosts.length - 1 ? blogPosts[idx + 1] : null,
    };
  };

  if (!post) {
    return (
      <div className="blog-detail-pro">
        <section className="blog-detail-pro__hero">
          <div className="container">
            <div className="blog-detail-pro__breadcrumbs">
              <Link href="/blog">Blogs</Link>
              <span aria-hidden="true">/</span>
              <span>Not found</span>
            </div>
            <h1 className="blog-detail-pro__title">Blog</h1>
          </div>
        </section>

        <section className="blog-detail-pro__body">
          <div className="container">
            <div className="blog-detail-pro__layout">
              <article className="blog-detail-pro__article">
                <p className="blog-detail-pro__excerpt">The blog post you’re looking for doesn’t exist.</p>
                <Link href="/blog" className="blog-detail-pro__btn blog-detail-pro__btnPrimary">Back to Blogs</Link>
              </article>

              <aside className="blog-detail-pro__aside">
                <div className="blog-detail-pro__card">
                  <div className="blog-detail-pro__cardHead">
                    <div className="blog-detail-pro__cardTitle">Related Blogs</div>
                  </div>
                  <div className="blog-detail-pro__related">
                    {related.map((p) => (
                      <Link key={p.slug} className="blog-detail-pro__relatedItem" href={`/blog/${p.slug}`}>
                        <div className="blog-detail-pro__thumb">
                          <img src={p.img} alt="" loading="lazy" decoding="async" />
                        </div>
                        <div>
                          <div className="blog-detail-pro__relatedTitle">{p.title}</div>
                          <div className="blog-detail-pro__relatedMeta">{p.date}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const { minutes } = calcReadingTime(post);
  const { prev, next } = getNavPosts(slug);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(post.title);
  const shareEncodedUrl = encodeURIComponent(shareUrl);

  return (
    <div className="blog-detail-pro">
      <section className="blog-detail-pro__hero">
        <div className="container">
          <div className="blog-detail-pro__breadcrumbs">
            <Link href="/blog">Blogs</Link>
            <span aria-hidden="true">/</span>
            <span>{post.title}</span>
          </div>

          <div className="blog-detail-pro__tag">Blog</div>
          <h1 className="blog-detail-pro__title">{post.title}</h1>
          <div className="blog-detail-pro__meta">
            <span>{post.date}</span>
            <span className="blog-detail-pro__metaDot" aria-hidden="true" />
            <span>{post.author}</span>
          </div>
        </div>
      </section>

      <section className="blog-detail-pro__body">
        <div className="container">
          <div className="blog-detail-pro__layout">
            <article className="blog-detail-pro__article">
              <div className="blog-detail-pro__cover">
                <img src={post.img} alt="" loading="lazy" decoding="async" />
              </div>

              <p className="blog-detail-pro__excerpt">{post.excerpt}</p>

              <div className="blog-detail-pro__content">
                {post.body.map((para: string, idx: number) => (
                  <React.Fragment key={`${post.slug}-${idx}`}>
                    <p>{para}</p>
                    {idx === 0 ? (
                      <blockquote className="blog-detail-pro__quote">
                        {post.excerpt}
                      </blockquote>
                    ) : null}
                  </React.Fragment>
                ))}
              </div>

              <div className="blog-detail-pro__more">
                <div className="blog-detail-pro__infoRow">
                  <div className="blog-detail-pro__pill">{minutes} min read</div>
                  <div className="blog-detail-pro__pill">Updated: {post.date}</div>
                </div>

                <div className="blog-detail-pro__author">
                  <div className="blog-detail-pro__authorAvatar" aria-hidden="true">
                    FT
                  </div>
                  <div className="blog-detail-pro__authorBody">
                    <div className="blog-detail-pro__authorName">{post.author}</div>
                    <div className="blog-detail-pro__authorNote">
                      Practical, no-fluff insights on internships, hiring, and building your career.
                    </div>
                  </div>
                </div>

                <div className="blog-detail-pro__share">
                  <div className="blog-detail-pro__shareTitle">Share this article</div>
                  <div className="blog-detail-pro__shareBtns">
                    <a
                      className="blog-detail-pro__shareBtn"
                      href={`https://wa.me/?text=${shareText}%20${shareEncodedUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                    <a
                      className="blog-detail-pro__shareBtn"
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareEncodedUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      LinkedIn
                    </a>
                    <a
                      className="blog-detail-pro__shareBtn"
                      href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareEncodedUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      X
                    </a>
                  </div>
                </div>

                <div className="blog-detail-pro__nav">
                  {prev ? (
                    <Link className="blog-detail-pro__navCard" href={`/blog/${prev.slug}`}>
                      <div className="blog-detail-pro__navK">Previous</div>
                      <div className="blog-detail-pro__navT">{prev.title}</div>
                    </Link>
                  ) : (
                    <div className="blog-detail-pro__navCard blog-detail-pro__navCard--disabled">
                      <div className="blog-detail-pro__navK">Previous</div>
                      <div className="blog-detail-pro__navT">No previous post</div>
                    </div>
                  )}

                  {next ? (
                    <Link className="blog-detail-pro__navCard" href={`/blog/${next.slug}`}>
                      <div className="blog-detail-pro__navK">Next</div>
                      <div className="blog-detail-pro__navT">{next.title}</div>
                    </Link>
                  ) : (
                    <div className="blog-detail-pro__navCard blog-detail-pro__navCard--disabled">
                      <div className="blog-detail-pro__navK">Next</div>
                      <div className="blog-detail-pro__navT">No next post</div>
                    </div>
                  )}
                </div>
              </div>
            </article>

            <aside className="blog-detail-pro__aside">
              <div className="blog-detail-pro__card">
                <div className="blog-detail-pro__cardHead">
                  <div className="blog-detail-pro__cardTitle">Related Blogs</div>
                </div>
                <div className="blog-detail-pro__related">
                  {related.map((p) => (
                    <Link key={p.slug} className="blog-detail-pro__relatedItem" href={`/blog/${p.slug}`}>
                      <div className="blog-detail-pro__thumb">
                        <img src={p.img} alt="" loading="lazy" decoding="async" />
                      </div>
                      <div>
                        <div className="blog-detail-pro__relatedTitle">{p.title}</div>
                        <div className="blog-detail-pro__relatedMeta">{p.date}</div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="blog-detail-pro__cta">
                  <a className="blog-detail-pro__btn blog-detail-pro__btnPrimary" href="https://web.findtern.in/company/coming-soon" target="_blank" rel="noreferrer">
                    Hire an Intern
                  </a>
                  <a className="blog-detail-pro__btn" href="https://web.findtern.in/intern/signup" target="_blank" rel="noreferrer">
                    Apply for Internship
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
