import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function NewsletterSubscription() {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email) {
      addToast({ type: "warning", message: "Please enter your email address." });
      return;
    }
    
    // Quick validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    addToast({ type: "success", message: "Thank you! You have successfully subscribed to SIA Insights." });
    setEmail("");
  };

  return (
    <article className="newsletter-box">
      <div className="newsletter-text">
        <h3>Subscribe to SIA Insights</h3>
        <p>
          Get weekly course recommendations, tech deep dives, and expert tutorials delivered straight to your inbox.
        </p>
        <div className="newsletter-visual-support" aria-hidden="true">
          <svg viewBox="0 0 200 100" className="newsletter-plane-svg">
            <path
              d="M20 80 L180 20 L80 60 Z"
              fill="none"
              stroke="var(--accent-strong)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M80 60 L110 50 L180 20"
              fill="none"
              stroke="var(--accent-strong)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M80 60 L80 85 L100 70"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M10 90 Q 40 85 20 80 Q 50 60 80 60"
              fill="none"
              stroke="var(--soft-border)"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          </svg>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="newsletter-form-container">
        <div className="newsletter-form-wrapper">
          <input
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-label="Email address for newsletter"
          />
          <button type="submit" className="btn btn-primary">
            Subscribe
          </button>
        </div>
        <span className="newsletter-form-hint">No spam. Unsubscribe at any time.</span>
      </form>
    </article>
  );
}
