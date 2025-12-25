import React from 'react';
import { Link } from 'wouter';
import logo from '@assets/logo.jpg';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <div className="site-footer__logo">
              <img className="site-footer__logoImg" src={logo} alt="Findtern" />
            </div>
            <p className="site-footer__tagline">
              Your gateway to skilled interns, effortlessly. Hire pre-vetted interns at unbeatable prices and build your future workforce today!
            </p>
            <div className="site-footer__cta">
              <a className="site-footer__btn" href="https://web.findtern.in/company/coming-soon" target="_blank" rel="noreferrer">
                <i className="fa-solid fa-briefcase" aria-hidden="true"></i>
                Hire an Intern
              </a>
              <a className="site-footer__btn site-footer__btn--outline" href="https://web.findtern.in/intern/signup" target="_blank" rel="noreferrer">
                <i className="fa-solid fa-user-plus" aria-hidden="true"></i>
                Register For Internship
              </a>
            </div>
          </div>

          <div className="site-footer__col">
            <h4>Quick Links</h4>
            <ul className="site-footer__links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h4>Legal Links</h4>
            <ul className="site-footer__links">
              <li><Link href="/terms-and-conditions">Terms and Conditions</Link></li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h4>Resources</h4>
            <ul className="site-footer__links">
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
            <div className="site-footer__social">
              <a href="https://www.facebook.com/people/Findtern/61579381094708/" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/findtern.in/" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
              <a href="https://x.com/Findtern" target="_blank" rel="noreferrer" aria-label="X"><i className="fa-brands fa-x-twitter"></i></a>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>2025 @ FINDTERN. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
