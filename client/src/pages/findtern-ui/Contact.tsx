import React, { useId, useMemo, useState } from 'react';

export default function Contact() {
  const formId = useId();
  const [status, setStatus] = useState('idle');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const ids = useMemo(
    () => ({
      firstName: `${formId}-firstName`,
      lastName: `${formId}-lastName`,
      email: `${formId}-email`,
      phone: `${formId}-phone`,
      subject: `${formId}-subject`,
      message: `${formId}-message`,
    }),
    [formId]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('success');
  };

  return (
    <div className="contact-v5">
      <section className="contact-v5__hero">
        <div className="container">
          <div className="contact-v5__heroInner">
            <h1 className="contact-v5__title">Contact Us</h1>
            <p className="contact-v5__subtitle">
              Tell us what you need. We usually respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-v5__section">
        <div className="container">
          <div className="contact-v5__grid">
            <aside className="contact-v5__aside" aria-label="Contact information">
              <div className="contact-v5__asideCard">
                <h2 className="contact-v5__asideTitle">Get in Touch</h2>
                <div className="contact-v5__infoList">
                  <a className="contact-v5__infoItem" href="mailto:admin@findtern.in">
                    <span className="contact-v5__infoIcon" aria-hidden="true">
                      <i className="fa-solid fa-envelope"></i>
                    </span>
                    <span>
                      <span className="contact-v5__infoLabel">Email</span>
                      <span className="contact-v5__infoValue">admin@findtern.in</span>
                    </span>
                  </a>

                  <a className="contact-v5__infoItem" href="tel:+918000000000">
                    <span className="contact-v5__infoIcon" aria-hidden="true">
                      <i className="fa-solid fa-phone"></i>
                    </span>
                    <span>
                      <span className="contact-v5__infoLabel">Phone</span>
                      <span className="contact-v5__infoValue">+91 80000 00000</span>
                    </span>
                  </a>

                  <div className="contact-v5__infoItem contact-v5__infoItem--static">
                    <span className="contact-v5__infoIcon" aria-hidden="true">
                      <i className="fa-solid fa-location-dot"></i>
                    </span>
                    <span>
                      <span className="contact-v5__infoLabel">Address</span>
                      <span className="contact-v5__infoValue contact-v5__muted">
                        Findtern, India
                      </span>
                    </span>
                  </div>

                  <div className="contact-v5__infoItem contact-v5__infoItem--static">
                    <span className="contact-v5__infoIcon" aria-hidden="true">
                      <i className="fa-solid fa-clock"></i>
                    </span>
                    <span>
                      <span className="contact-v5__infoLabel">Business Hours</span>
                      <span className="contact-v5__infoValue contact-v5__muted">
                        Monday – Friday: 9:00 AM – 7:00 PM
                      </span>
                      <span className="contact-v5__infoValue contact-v5__muted">
                        Saturday – Sunday: Closed
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            <div className="contact-v5__panel">
              <form className="contact-v5__form" onSubmit={onSubmit} aria-describedby={status === 'success' ? `${formId}-status` : undefined}>
                <div className="contact-v5__formHead">
                  <div className="contact-v5__formTitle">Send us a Message</div>
                  <div className="contact-v5__formSub">Fields marked * are required.</div>
                </div>

                {status === 'success' && (
                  <div id={`${formId}-status`} className="contact-v5__notice" role="status">
                    Thanks! Your message is ready to be sent. (This demo form doesn’t submit to a server.)
                  </div>
                )}

                <div className="contact-v5__fields">
                  <div className="contact-v5__field">
                    <label htmlFor={ids.firstName} className="contact-v5__label">
                      First Name <span className="contact-v5__required">*</span>
                    </label>
                    <input
                      id={ids.firstName}
                      className="contact-v5__input"
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={onChange}
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  <div className="contact-v5__field">
                    <label htmlFor={ids.lastName} className="contact-v5__label">
                      Last Name <span className="contact-v5__required">*</span>
                    </label>
                    <input
                      id={ids.lastName}
                      className="contact-v5__input"
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={onChange}
                      autoComplete="family-name"
                      required
                    />
                  </div>

                  <div className="contact-v5__field">
                    <label htmlFor={ids.email} className="contact-v5__label">
                      Email Address <span className="contact-v5__required">*</span>
                    </label>
                    <input
                      id={ids.email}
                      className="contact-v5__input"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="contact-v5__field">
                    <label htmlFor={ids.phone} className="contact-v5__label">
                      Phone Number
                    </label>
                    <input
                      id={ids.phone}
                      className="contact-v5__input"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      autoComplete="tel"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="contact-v5__field">
                  <label htmlFor={ids.subject} className="contact-v5__label">
                    Subject
                  </label>
                  <input
                    id={ids.subject}
                    className="contact-v5__input"
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={onChange}
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div className="contact-v5__field">
                  <label htmlFor={ids.message} className="contact-v5__label">
                    Message
                  </label>
                  <textarea
                    id={ids.message}
                    className="contact-v5__input contact-v5__textarea"
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    rows={5}
                    placeholder="Tell us a bit more..."
                  />
                </div>

                <div className="contact-v5__actions">
                  <button type="submit" className="contact-v5__submit">
                    Send message
                  </button>
                
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
