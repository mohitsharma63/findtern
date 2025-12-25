import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import './Header.css';
import logo from '@assets/logo.jpg';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 992) setIsMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const navLinkClass = (href: string) => `nav-link ${location === href ? 'active' : ''}`;

  return (
    <header className="header header-v2">
      <div className="container header-v2__inner">
        <Link href="/" className="logo" aria-label="Findtern Home">
          <img className="logo__img" src={logo} alt="Findtern" />
        </Link>

        <button
          type="button"
          className="header-v2__toggle"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          <span className="header-v2__toggleBars" aria-hidden="true" />
        </button>

        <nav
          id="primary-navigation"
          className={`nav header-v2__nav ${isMenuOpen ? 'active' : ''}`}
        >
          <Link href="/" onClick={closeMenu} className={navLinkClass("/")}>Home</Link>
          <Link href="/about" onClick={closeMenu} className={navLinkClass("/about")}>About</Link>
          <Link href="/pricing" onClick={closeMenu} className={navLinkClass("/pricing")}>Pricing</Link>
          <Link href="/blog" onClick={closeMenu} className={navLinkClass("/blog")}>Blog</Link>
          <Link href="/contact" onClick={closeMenu} className={navLinkClass("/contact")}>Contact Us</Link>
          <Link href="/faq" onClick={closeMenu} className={navLinkClass("/faq")}>FAQ</Link>
          <div className="nav-buttons ms-3">
            <Link className="btn-employer btn btn-outline-primary me-2" href="/employer/signup" onClick={closeMenu}>For Employers</Link>
            <Link className="btn-intern btn btn-primary" href="/intern/signup" onClick={closeMenu}>For Interns</Link>
          </div>
        </nav>
      </div>
    </header>
  );
 }
