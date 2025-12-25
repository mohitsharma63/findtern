import React, { useState } from 'react';
import useReveal from '../../hooks/useReveal.ts';

export default function Pricing() {
  useReveal();

  const pricingTestimonials = [
    {
      quote:
        '"What stood out about Findtern was the quality of interns. The aptitude tests and AI interviews gave us confidence in hiring candidates who were a great fit. We also appreciated the transparency in their ratings and evaluation process!"',
      title: 'Quality Interns, No Guesswork',
      name: 'Rishi P., COO,',
      company: 'MancarI',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    },
    {
      quote:
        '"The hiring flow was seamless and fast. Pre-vetted profiles and clear scoring made it easy to shortlist the right interns."',
      title: 'Seamless & Fast Hiring',
      name: 'Ananya S., Founder,',
      company: 'BuildBloom',
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=256&q=80',
    },
    {
      quote:
        '"Findtern helped us reduce screening time drastically. The recommendations were accurate and we hired with confidence."',
      title: 'Time Saver for Teams',
      name: 'Karan M., HR Manager,',
      company: 'Northpeak',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    },
  ];

  const [activePricingTestimonial, setActivePricingTestimonial] = useState(0);
  const t = pricingTestimonials[activePricingTestimonial];

  const prev = () => {
    setActivePricingTestimonial((i) => (i - 1 + pricingTestimonials.length) % pricingTestimonials.length);
  };

  const next = () => {
    setActivePricingTestimonial((i) => (i + 1) % pricingTestimonials.length);
  };

  return (
    <>
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

      <section className="pricing-ready-v1 reveal reveal--up">
        <div className="container">
          <h2>Ready to get <span>Started</span></h2>
          <a className="pricing-ready-v1__btn" href="https://web.findtern.in/company/coming-soon" target="_blank" rel="noreferrer">
            Let’s make hiring simple!
          </a>
        </div>
      </section>

      <section className="pricing-happy-v1 reveal reveal--up">
        <div className="container">
          <h2>Happy <span>Faces</span></h2>
          <div className="pricing-happy-v1__wrap">
            <button type="button" className="pricing-happy-v1__nav pricing-happy-v1__nav--left" onClick={prev} aria-label="Previous testimonial">
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="pricing-happy-v1__card" role="group" aria-label="Testimonial">
              <div className="pricing-happy-v1__avatar">
                <img src={t.avatar} alt="Reviewer" loading="lazy" />
              </div>
              <div className="pricing-happy-v1__stars" aria-label="5 star rating">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <p className="pricing-happy-v1__quote">{t.quote}</p>
              <div className="pricing-happy-v1__title">{t.title}</div>
              <div className="pricing-happy-v1__name">{t.name}</div>
              <div className="pricing-happy-v1__company">{t.company}</div>
            </div>

            <button type="button" className="pricing-happy-v1__nav pricing-happy-v1__nav--right" onClick={next} aria-label="Next testimonial">
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
