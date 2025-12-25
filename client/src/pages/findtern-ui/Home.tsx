import React, { useEffect, useState } from 'react';
import useReveal from '../../hooks/useReveal.ts';

export default function Home() {
  useReveal();

  useEffect(() => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>('.popular-v2__row[data-step]'));
    if (rows.length === 0) return;

    const grid = document.querySelector<HTMLElement>('.popular-v2__grid');
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.popular-v2__node[data-step]'));
    if (!grid || nodes.length === 0) return;

    const setActive = (step: string | number | undefined | null) => {
      const activeStep = Number(step);
      nodes.forEach((n) => {
        const s = Number(n.dataset.step);
        n.classList.toggle('is-active', s === activeStep);
        n.classList.toggle('is-done', s <= activeStep);
        n.classList.toggle('is-upcoming', s > activeStep);
      });

      const activeNode = nodes.find((n) => Number(n.dataset.step) === activeStep);
      if (activeNode) {
        const gridRect = grid.getBoundingClientRect();
        const nodeRect = activeNode.getBoundingClientRect();
        const y = (nodeRect.top - gridRect.top) + nodeRect.height / 2;
        grid.style.setProperty('--popular-v2-progress', `${Math.max(0, Math.round(y))}px`);
      }
    };

    setActive(rows[0]?.dataset?.step);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

        if (visible.length === 0) return;
        const step = (visible[0].target as HTMLElement | null)?.dataset?.step;
        if (step != null) setActive(step);
      },
      {
        root: null,
        threshold: [0.25, 0.4, 0.55, 0.7],
        rootMargin: '-35% 0px -45% 0px',
      }
    );

    rows.forEach((r) => observer.observe(r));
    return () => observer.disconnect();
  }, []);

  const buildUnsplashSrcSet = (baseUrl: string) => {
    const url = new URL(baseUrl);
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('q', '70');
    const mk = (w: number) => {
      const u = new URL(url.toString());
      u.searchParams.set('w', String(w));
      return `${u.toString()} ${w}w`;
    };
    return [480, 768, 1024, 1200].map(mk).join(', ');
  };

  const heroSlides = [
    {
      badgeIcon: 'fa-wand-magic-sparkles',
      badgeText: 'AI-Powered Intern Hiring',
      title: "Finding an intern or internship wasn't that simple.",
      subtitle: 'Findtern can help with:',
      primaryText: 'Find Intern',
      primaryHref: 'https://web.findtern.in/company/signup',
      secondaryText: 'Get Internship',
      secondaryHref: 'https://web.findtern.in/intern/signup',
      image:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2400&q=80',
    },
    {
      badgeIcon: 'fa-user-shield',
      badgeText: 'Pre‑Vetted Candidates',
      title: 'Hire faster with verified profiles & tests.',
      subtitle: 'Shortlist the right fit in minutes.',
      primaryText: 'Start Hiring',
      primaryHref: 'https://web.findtern.in/company/coming-soon',
      secondaryText: 'View Plans',
      secondaryHref: '/pricing',
      image:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2400&q=80',
    },
    {
      badgeIcon: 'fa-chart-simple',
      badgeText: 'Transparent Scoring',
      title: 'Make decisions with the Findtern Score.',
      subtitle: 'A clear view of skills, interview & performance.',
      primaryText: 'See How It Works',
      primaryHref: '/about',
      secondaryText: 'Contact Us',
      secondaryHref: '/contact',
      image:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=2400&q=80',
    },
  ];

  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      setActiveHero((i) => (i + 1) % heroSlides.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [heroSlides.length]);

  const goToHero = (i: number) => setActiveHero(i);
  const prevHero = () => setActiveHero((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  const nextHero = () => setActiveHero((i) => (i + 1) % heroSlides.length);

  const testimonials = [
    {
      quote:
        '"Finding skilled interns used to be a time-consuming task for us. With Findtern, we got access to pre-vetted candidates, making hiring quick and efficient. The AI-driven screening ensured that we found interns who were truly capable. Highly recommended!"',
      title: 'Hassle-Free Intern Hiring',
      name: 'Sulabh Jain, Director,',
      company: 'solitaire Drugs and Pharma Pvt. Ltd.',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    },
    {
      quote:
        '"What stood out about Findtern was the quality of interns. The aptitude tests and AI interviews gave us confidence in hiring candidates who were a great fit. We also appreciated the transparency in their ratings and evaluation process!"',
      title: 'Quality Candidates, Fast',
      name: 'Aarav Mehta, HR Lead,',
      company: 'Growth Labs',
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=256&q=80',
    },
    {
      quote:
        '"We were amazed at how affordable yet effective Findtern is! Within days, we onboarded a highly motivated intern who turned out to be an asset to our team. The platform made it incredibly simple to find the right match."',
      title: 'Affordable & Effective',
      name: 'Neha Sharma, Founder,',
      company: 'Solstice Studio',
      avatar:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
    },
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const current = testimonials[activeTestimonial];

  const prevTestimonial = () => {
    setActiveTestimonial((i) => (i - 1 + testimonials.length) % testimonials.length);
  };

  const nextTestimonial = () => {
    setActiveTestimonial((i) => (i + 1) % testimonials.length);
  };

  return (
    <>
      <section className="hero-slider-v1">
        <div className="hero-slider-v1__viewport">
          {heroSlides.map((s, idx) => {
            const isActive = idx === activeHero;
            return (
              <div
                key={s.title}
                className={`hero-slider-v1__slide ${isActive ? 'is-active' : ''}`}
                style={{ backgroundImage: `url(${s.image})` }}
                aria-hidden={!isActive}
              >
                <div className="hero-slider-v1__overlay" />
                <div className="container hero-slider-v1__inner">
                  <div className="hero-slider-v1__content">
                    <div className="hero-v2__badge">
                      <i className={`fa-solid ${s.badgeIcon}`}></i>
                      {s.badgeText}
                    </div>
                    <h1>{s.title}</h1>
                    <p>{s.subtitle}</p>
                    <div className="hero-v2__cta hero-v2__cta--group">
                      <a className="btn-primary btn btn-lg" href={s.primaryHref} target={s.primaryHref.startsWith('http') ? '_blank' : undefined} rel={s.primaryHref.startsWith('http') ? 'noreferrer' : undefined}>{s.primaryText}</a>
                      <a className="btn btn-outline-light btn-lg" href={s.secondaryHref} target={s.secondaryHref.startsWith('http') ? '_blank' : undefined} rel={s.secondaryHref.startsWith('http') ? 'noreferrer' : undefined}>{s.secondaryText}</a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button type="button" className="hero-slider-v1__nav hero-slider-v1__nav--left" onClick={prevHero} aria-label="Previous slide">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <button type="button" className="hero-slider-v1__nav hero-slider-v1__nav--right" onClick={nextHero} aria-label="Next slide">
            <i className="fa-solid fa-arrow-right"></i>
          </button>

          <div className="hero-slider-v1__dots" role="tablist" aria-label="Hero slides">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`hero-slider-v1__dot ${i === activeHero ? 'is-active' : ''}`}
                onClick={() => goToHero(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-pressed={i === activeHero}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="hero-features-v1 reveal reveal--up">
        <div className="container">
          <div className="hero-features-v1__grid reveal-stagger reveal reveal--up">
            <div className="hero-features-v1__card tilt-3d">
              <div className="hero-features-v1__icon"><i className="fa-solid fa-user-shield"></i></div>
              <div className="hero-features-v1__title">Pre‑Vetted Interns</div>
              <div className="hero-features-v1__text">Handpicked candidates with verified profiles and tests.</div>
            </div>
            <div className="hero-features-v1__card tilt-3d">
              <div className="hero-features-v1__icon"><i className="fa-solid fa-bolt"></i></div>
              <div className="hero-features-v1__title">Faster Hiring</div>
              <div className="hero-features-v1__text">Shortlist the right fit in minutes, not weeks.</div>
            </div>
            <div className="hero-features-v1__card tilt-3d">
              <div className="hero-features-v1__icon"><i className="fa-solid fa-chart-simple"></i></div>
              <div className="hero-features-v1__title">Findtern Score</div>
              <div className="hero-features-v1__text">Simple scoring based on academics, interview & tests.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="partners-v1 reveal reveal--up" aria-label="Our partners">
        <div className="container">
          <div className="partners-v1__inner">
            <div className="partners-v1__title">Our Partners</div>
            <div className="partners-v1__strip" aria-label="Partner logos">
              <div className="partners-v1__item" title="Findtern">
                <div className="partners-v1__logo">
                  <img src="/findtern-logo.png" alt="Findtern" loading="lazy" />
                </div>
                <div className="partners-v1__name">Findtern</div>
              </div>

              <div className="partners-v1__item" title="Google">
                <div className="partners-v1__logo">
                  <img src="https://cdn.simpleicons.org/google" alt="Google" loading="lazy" />
                </div>
                <div className="partners-v1__name">Google</div>
              </div>

              <div className="partners-v1__item" title="Microsoft">
                <div className="partners-v1__logo">
                  <img src="https://cdn.simpleicons.org/microsoft" alt="Microsoft" loading="lazy" />
                </div>
                <div className="partners-v1__name">Microsoft</div>
              </div>

              <div className="partners-v1__item" title="Amazon">
                <div className="partners-v1__logo">
                  <img src="https://cdn.simpleicons.org/amazon" alt="Amazon" loading="lazy" />
                </div>
                <div className="partners-v1__name">Amazon</div>
              </div>

              <div className="partners-v1__item" title="Meta">
                <div className="partners-v1__logo">
                  <img src="https://cdn.simpleicons.org/meta" alt="Meta" loading="lazy" />
                </div>
                <div className="partners-v1__name">Meta</div>
              </div>

              <div className="partners-v1__item" title="Apple">
                <div className="partners-v1__logo">
                  <img src="https://cdn.simpleicons.org/apple" alt="Apple" loading="lazy" />
                </div>
                <div className="partners-v1__name">Apple</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-us-v2 py-5 reveal reveal--up">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="about-us-v2__content">
                <h2 className="about-us-v2__title">About Us</h2>

                <div className="about-us-v2__block">
                  <h3 className="about-us-v2__heading">Simplifying Intern Hiring</h3>
                  <p className="about-us-v2__text">
                    At Findtern, we believe hiring interns should be effortless, not exhausting. That&apos;s why we&apos;ve built a smart platform that connects companies with pre-vetted, skilled interns in just a few clicks.
                  </p>
                </div>

                <div className="about-us-v2__block">
                  <h3 className="about-us-v2__heading">Our Mission</h3>
                  <p className="about-us-v2__text">
                    To bridge the gap between talented interns and forward-thinking companies, making the hiring process faster, smarter, and more efficient.
                  </p>
                </div>

                <div className="about-us-v2__block">
                  <h3 className="about-us-v2__heading">Why Choose Findtern?</h3>
                  <ul className="about-us-v2__list">
                    <li><i className="fa-solid fa-circle-check"></i><strong>Quality Interns</strong> — Handpicked, pre-screened candidates.</li>
                    <li><i className="fa-solid fa-circle-check"></i><strong>AI-Powered Matching</strong> — The right fit, every time.</li>
                    <li><i className="fa-solid fa-circle-check"></i><strong>Seamless Hiring</strong> — From search to selection, all in one place.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-6 mt-5 mt-lg-0">
              <div className="about-us-v2__media">
                <div className="about-us-v2__circle about-us-v2__circle--lg tilt-3d">
                  <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                    alt="Team discussion"
                    loading="lazy"
                  />
                </div>
                <div className="about-us-v2__circle about-us-v2__circle--sm tilt-3d">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                    alt="Intern working"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      <section className="featured-skills featured-skills-v3 reveal reveal--up">
        <div className="container">
          <h2>Featured Skills</h2>
          <div className="featured-skills-v3__grid reveal-stagger reveal reveal--up">
            <a className="featured-skills-v3__card tilt-3d" href="#">
              <div className="featured-skills-v3__icon"><i className="fa-solid fa-pen-nib"></i></div>
              <h3 className="featured-skills-v3__title">Design</h3>
              <div className="featured-skills-v3__meta">
                <span>235 Interns Available</span>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </a>
            <a className="featured-skills-v3__card tilt-3d" href="#">
              <div className="featured-skills-v3__icon"><i className="fa-solid fa-chart-line"></i></div>
              <h3 className="featured-skills-v3__title">Sales</h3>
              <div className="featured-skills-v3__meta">
                <span>756 Interns Available</span>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </a>
            <a className="featured-skills-v3__card tilt-3d" href="#">
              <div className="featured-skills-v3__icon"><i className="fa-solid fa-bullhorn"></i></div>
              <h3 className="featured-skills-v3__title">Marketing</h3>
              <div className="featured-skills-v3__meta">
                <span>140 Interns Available</span>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </a>
            <a className="featured-skills-v3__card tilt-3d" href="#">
              <div className="featured-skills-v3__icon"><i className="fa-solid fa-wallet"></i></div>
              <h3 className="featured-skills-v3__title">Finance</h3>
              <div className="featured-skills-v3__meta">
                <span>325 Interns Available</span>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </a>
            <a className="featured-skills-v3__card tilt-3d" href="#">
              <div className="featured-skills-v3__icon"><i className="fa-solid fa-desktop"></i></div>
              <h3 className="featured-skills-v3__title">Technology</h3>
              <div className="featured-skills-v3__meta">
                <span>436 Interns Available</span>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </a>
            <a className="featured-skills-v3__card tilt-3d" href="#">
              <div className="featured-skills-v3__icon"><i className="fa-solid fa-code"></i></div>
              <h3 className="featured-skills-v3__title">Engineering</h3>
              <div className="featured-skills-v3__meta">
                <span>542 Interns Available</span>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </a>
            <a className="featured-skills-v3__card tilt-3d" href="#">
              <div className="featured-skills-v3__icon"><i className="fa-solid fa-briefcase"></i></div>
              <h3 className="featured-skills-v3__title">Business</h3>
              <div className="featured-skills-v3__meta">
                <span>211 Interns Available</span>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </a>
            <a className="featured-skills-v3__card tilt-3d" href="#">
              <div className="featured-skills-v3__icon"><i className="fa-solid fa-users"></i></div>
              <h3 className="featured-skills-v3__title">Human Resource</h3>
              <div className="featured-skills-v3__meta">
                <span>346 Interns Available</span>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="testimonials happy-faces-v3 reveal reveal--up">
        <div className="container">
          <h2>Happy Faces</h2>
          <div className="happy-faces-v3__wrap">
            <button type="button" className="happy-faces-v3__nav happy-faces-v3__nav--left" onClick={prevTestimonial} aria-label="Previous testimonial">
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="happy-faces-v3__card" role="group" aria-label="Testimonial">
              <div className="happy-faces-v3__avatar">
                <img src={current.avatar} alt="Reviewer" loading="lazy" />
              </div>
              <div className="happy-faces-v3__stars" aria-label="5 star rating">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <p className="happy-faces-v3__quote">{current.quote}</p>
              <div className="happy-faces-v3__title">{current.title}</div>
              <div className="happy-faces-v3__name">{current.name}</div>
              <div className="happy-faces-v3__company">{current.company}</div>
            </div>

            <button type="button" className="happy-faces-v3__nav happy-faces-v3__nav--right" onClick={nextTestimonial} aria-label="Next testimonial">
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>
<section id="popular" className="popular-v2">
        <div className="container">
          <h2>Why We are Most Popular</h2>

          <div className="popular-v2__grid">
            <div className="popular-v2__row" data-step="0">
              <article className="popular-v2__card tilt-3d">
                <div className="popular-v2__img">
                  <img
                    src="https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=768&q=70"
                    srcSet={buildUnsplashSrcSet('https://images.unsplash.com/photo-1526378722484-bd91ca387e72')}
                    sizes="(max-width: 575px) 92vw, (max-width: 991px) 80vw, 520px"
                    alt="Candidate Onboarding"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="popular-v2__label">Candidate's onboarding</div>
                <h3>Candidate Onboarding</h3>
                <p>Interns create their profiles and join the platform.</p>
              </article>

              <div className="popular-v2__center" aria-hidden="true">
                <div className="popular-v2__node" data-step="0"><i className="fa-solid fa-user-plus"></i></div>
              </div>

              <div className="popular-v2__spacer"></div>
            </div>

            <div className="popular-v2__row" data-step="1">
              <div className="popular-v2__spacer"></div>

              <div className="popular-v2__center" aria-hidden="true">
                <div className="popular-v2__node" data-step="1"><i className="fa-solid fa-file-lines"></i></div>
              </div>

              <article className="popular-v2__card tilt-3d">
                <div className="popular-v2__img">
                  <img
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=768&q=70"
                    srcSet={buildUnsplashSrcSet('https://images.unsplash.com/photo-1450101499163-c8848c66ca85')}
                    sizes="(max-width: 575px) 92vw, (max-width: 991px) 80vw, 520px"
                    alt="Academic Verification"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="popular-v2__label">Acedmics</div>
                <h3>Academic Verification</h3>
                <p>They add their academic details, which we verify for authenticity.</p>
              </article>
            </div>

            <div className="popular-v2__row" data-step="2">
              <article className="popular-v2__card tilt-3d">
                <div className="popular-v2__img">
                  <img
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=768&q=70"
                    srcSet={buildUnsplashSrcSet('https://images.unsplash.com/photo-1542744173-8e7e53415bb0')}
                    sizes="(max-width: 575px) 92vw, (max-width: 991px) 80vw, 520px"
                    alt="Interest-Based AI Interview"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="popular-v2__label">AI interview 1</div>
                <h3>Interest-Based AI Interview</h3>
                <p>Candidates specify their interest areas, and our AI conducts a tailored interview.</p>
              </article>

              <div className="popular-v2__center" aria-hidden="true">
                <div className="popular-v2__node" data-step="2"><i className="fa-solid fa-user-check"></i></div>
              </div>

              <div className="popular-v2__spacer"></div>
            </div>

            <div className="popular-v2__row" data-step="3">
              <div className="popular-v2__spacer"></div>

              <div className="popular-v2__center" aria-hidden="true">
                <div className="popular-v2__node" data-step="3"><i className="fa-solid fa-clipboard-check"></i></div>
              </div>

              <article className="popular-v2__card tilt-3d">
                <div className="popular-v2__img">
                  <img
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=768&q=70"
                    srcSet={buildUnsplashSrcSet('https://images.unsplash.com/photo-1551836022-d5d88e9218df')}
                    sizes="(max-width: 575px) 92vw, (max-width: 991px) 80vw, 520px"
                    alt="Aptitude Test"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="popular-v2__label">Aptitude Test 1</div>
                <h3>Aptitude Test</h3>
                <p>All candidates undergo a structured aptitude test.</p>
              </article>
            </div>

            <div className="popular-v2__row" data-step="4">
              <article className="popular-v2__card tilt-3d">
                <div className="popular-v2__img">
                  <img
                    src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=768&q=70"
                    srcSet={buildUnsplashSrcSet('https://images.unsplash.com/photo-1555949963-ff9fe0c870eb')}
                    sizes="(max-width: 575px) 92vw, (max-width: 991px) 80vw, 520px"
                    alt="Coding test"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="popular-v2__label">coding-test</div>
                <h3>Coding test</h3>
                <p>Candidates from coding background undergo a live coding test.</p>
              </article>

              <div className="popular-v2__center" aria-hidden="true">
                <div className="popular-v2__node" data-step="4"><i className="fa-solid fa-laptop-code"></i></div>
              </div>

              <div className="popular-v2__spacer"></div>
            </div>

            <div className="popular-v2__row" data-step="5">
              <div className="popular-v2__spacer"></div>

              <div className="popular-v2__center" aria-hidden="true">
                <div className="popular-v2__node" data-step="5"><i className="fa-solid fa-chart-line"></i></div>
              </div>

              <article className="popular-v2__card tilt-3d">
                <div className="popular-v2__img">
                  <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=768&q=70"
                    srcSet={buildUnsplashSrcSet('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')}
                    sizes="(max-width: 575px) 92vw, (max-width: 991px) 80vw, 520px"
                    alt="Performance Scoring"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="popular-v2__label">Performance Scoring 1</div>
                <h3>Performance Scoring</h3>
                <p>Each intern receives a Findtern Score based on academics, interview, and test results.</p>
              </article>
            </div>

            <div className="popular-v2__row" data-step="6">
              <article className="popular-v2__card tilt-3d">
                <div className="popular-v2__img">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=768&q=70"
                    srcSet={buildUnsplashSrcSet('https://images.unsplash.com/photo-1522071820081-009f0129c71c')}
                    sizes="(max-width: 575px) 92vw, (max-width: 991px) 80vw, 520px"
                    alt="Smart Hiring For Companies"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="popular-v2__label">Smart Hiring 1</div>
                <h3>Smart Hiring for Companies</h3>
                <p>Employers can filter, sort, and select interns based on their Findtern Score, skills, and interests.</p>
              </article>

              <div className="popular-v2__center" aria-hidden="true">
                <div className="popular-v2__node" data-step="6"><i className="fa-solid fa-briefcase"></i></div>
              </div>

              <div className="popular-v2__spacer"></div>
            </div>
          </div>
        </div>
      </section>
       <section className="pricing pricing-v3">
        <div className="pricing-v3__media" aria-hidden="true"></div>
        <div className="pricing-v3__bg" aria-hidden="true"></div>
        <div className="container pricing-v3__inner">
          <h2>Hire an Intern for the Price of a Coffee!</h2>
          <div className="pricing-v3__subtitle">Affordable. Flexible. Transparent.</div>
          <div className="pricing-v3__caption">Findtern makes hiring interns easy and budget-friendly with three simple plans.</div>

          <div className="pricing-v3__card tilt-3d">
            <div className="pricing-v3__tableWrap">
              <table className="pricing-v3__table">
                <thead>
                  <tr>
                    <th className="pricing-v3__head pricing-v3__head--left">Plans</th>
                    <th className="pricing-v3__head">Espresso<br /><span>(Free)</span></th>
                    <th className="pricing-v3__head">Cappuccino<br /><span>($1/hr)</span></th>
                    <th className="pricing-v3__head">Latte<br /><span>($2/hr)</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pricing-v3__rowTitle">Who is it for?</td>
                    <td>Budget-friendly hiring</td>
                    <td>Skilled interns</td>
                    <td>Top-rated talent</td>
                  </tr>
                  <tr>
                    <td className="pricing-v3__rowTitle">Intern Rating</td>
                    <td>⭐ up to 6/10</td>
                    <td>⭐ 6–8/10</td>
                    <td>⭐ 8+/10 (Top-rated)</td>
                  </tr>
                  <tr>
                    <td className="pricing-v3__rowTitle">Per Hiring Charges</td>
                    <td>$0 per hire</td>
                    <td>Free</td>
                    <td>Free</td>
                  </tr>
                  <tr>
                    <td className="pricing-v3__rowTitle">Hourly Rates (monthly)</td>
                    <td>Free</td>
                    <td>$1/hr (160 hrs) <span className="pricing-v3__muted">$1.5/hr (100 hrs)</span></td>
                    <td>$2/hr (160 hrs) <span className="pricing-v3__muted">$2.5/hr (100 hrs)</span></td>
                  </tr>
                  <tr>
                    <td className="pricing-v3__rowTitle">Internship Duration</td>
                    <td>Up to 60 days</td>
                    <td>1–6 months</td>
                    <td>1–6 months</td>
                  </tr>
                  <tr>
                    <td className="pricing-v3__rowTitle">What You Get</td>
                    <td>Basic talent</td>
                    <td>Medium skilled talent</td>
                    <td>Top-rated talent</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="pricing-v3__footnote">* Price Includes GST</div>
          </div>
        </div>
      </section>
      <section className="cta-section cta-v3 reveal reveal--up">
        <div className="container cta-v3__inner">
          <h2>Ready to get <span>Started</span></h2>
          <a className="cta-v3__btn" href="https://web.findtern.in/company/coming-soon" target="_blank" rel="noreferrer">Let’s make hiring simple!</a>
        </div>
        
      </section>
      
      <section className="about-cta-v2 reveal reveal--up">
        <div className="container">
          <div className="about-cta-v2__card">
            <div className="about-cta-v2__left">
              <h2>Start Hiring or Apply Now!</h2>
              <div className="about-cta-v2__buttons">
                <a className="btn btn-light btn-lg" href="https://web.findtern.in/company/coming-soon" target="_blank" rel="noreferrer">
                  <i className="fa-solid fa-briefcase"></i>
                  Hire an Intern
                </a>
                <a className="btn btn-light btn-lg" href="https://web.findtern.in/intern/signup" target="_blank" rel="noreferrer">
                  <i className="fa-solid fa-user-plus"></i>
                  Register For Internship
                </a>
              </div>
            </div>

            <div className="about-cta-v2__right" aria-hidden="true">
              <div className="about-cta-v2__doodles">
                <svg className="about-cta-v2__waves" viewBox="0 0 120 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10c10 0 10 8 20 8s10-8 20-8 10 8 20 8 10-8 20-8 10 8 18 8" stroke="rgba(255,255,255,.75)" strokeWidth="2.6" strokeLinecap="round"/>
                  <path d="M2 22c10 0 10 8 20 8s10-8 20-8 10 8 20 8 10-8 20-8 10 8 18 8" stroke="rgba(255,255,255,.75)" strokeWidth="2.6" strokeLinecap="round"/>
                  <path d="M2 34c10 0 10 8 20 8s10-8 20-8 10 8 20 8 10-8 20-8 10 8 18 8" stroke="rgba(255,255,255,.75)" strokeWidth="2.6" strokeLinecap="round"/>
                </svg>
                <div className="about-cta-v2__spark about-cta-v2__spark--a"></div>
                <div className="about-cta-v2__spark about-cta-v2__spark--b"></div>
                <div className="about-cta-v2__spark about-cta-v2__spark--c"></div>
              </div>

              <div className="about-cta-v2__frame">
                <img
                  className="about-cta-v2__person"
                  src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=900&q=80"
                  alt=""
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
