// AboutPage.jsx
import { Helmet } from 'react-helmet-async';
export function AboutPage() {
  return (
    <>
      <Helmet><title>About Us — LUXE Fashion</title></Helmet>
      <div className="pt-24 pb-20">
        <div className="bg-luxe-black text-white py-20 text-center mb-16">
          <span className="section-tag text-luxe-gold">Our Story</span>
          <h1 className="font-display text-5xl font-medium text-white mt-2">About LUXE</h1>
        </div>
        <div className="page-container">
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
              <div>
                <span className="section-tag">Est. 2020</span>
                <h2 className="section-title mb-4">Crafting Timeless Fashion</h2>
                <p className="text-luxe-muted leading-relaxed mb-4">LUXE was born from a passion for quality and an obsession with detail. We believe that great fashion should be accessible, sustainable, and enduring — pieces you'll reach for again and again, season after season.</p>
                <p className="text-luxe-muted leading-relaxed">Every garment in our collection is carefully considered: from the sourcing of fabrics to the final stitch. We work directly with ethical manufacturers and use responsibly sourced materials wherever possible.</p>
              </div>
              <div className="aspect-square overflow-hidden">
                <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600" alt="LUXE studio" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[['500K+', 'Happy Customers'], ['50+', 'Collections Launched'], ['100%', 'Ethical Sourcing']].map(([num, label]) => (
                <div key={label} className="text-center py-8 border border-luxe-border">
                  <p className="font-display text-4xl font-semibold text-luxe-gold mb-2">{num}</p>
                  <p className="text-sm text-luxe-muted">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-luxe-cream p-10 text-center">
              <span className="section-tag">Our Values</span>
              <h2 className="section-title mb-6">What We Stand For</h2>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                {[
                  { title: 'Quality First', desc: 'We source only the finest fabrics and work with skilled artisans to ensure every piece meets our exacting standards.' },
                  { title: 'Sustainability', desc: 'From recycled packaging to ethical supply chains, we are committed to reducing our environmental footprint.' },
                  { title: 'Inclusivity', desc: 'Fashion is for everyone. We design and size our collections to celebrate and fit diverse body types.' },
                ].map(({ title, desc }) => (
                  <div key={title}>
                    <h3 className="text-sm font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-luxe-muted">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// PrivacyPage.jsx
export function PrivacyPage() {
  return (
    <>
      <Helmet><title>Privacy Policy — LUXE Fashion</title></Helmet>
      <div className="pt-24 pb-20 page-container max-w-3xl">
        <h1 className="font-display text-4xl font-medium mb-3">Privacy Policy</h1>
        <p className="text-luxe-muted text-sm mb-10">Last updated: January 1, 2025</p>
        {[
          { title: '1. Information We Collect', body: 'We collect information you provide when creating an account, placing orders, or contacting us. This includes your name, email, phone number, and shipping address. We also collect browsing data and device information to improve your experience.' },
          { title: '2. How We Use Your Information', body: 'Your information is used to process orders, send transactional emails, provide customer support, improve our services, and send marketing communications (with your consent). We do not sell your personal information to third parties.' },
          { title: '3. Data Security', body: 'We implement industry-standard security measures including SSL encryption, secure payment processing via Razorpay, and regular security audits. Your payment details are never stored on our servers.' },
          { title: '4. Cookies', body: 'We use cookies to enhance browsing, remember preferences, and analyze site traffic. You can control cookies through your browser settings. Disabling cookies may affect some features.' },
          { title: '5. Your Rights', body: 'You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at privacy@luxe.com.' },
          { title: '6. Contact', body: 'For privacy-related queries, email privacy@luxe.com or write to: LUXE Fashion, 123 Fashion Street, Mumbai 400050.' },
        ].map(({ title, body }) => (
          <div key={title} className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{title}</h2>
            <p className="text-luxe-muted leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// TermsPage.jsx
export function TermsPage() {
  return (
    <>
      <Helmet><title>Terms & Conditions — LUXE Fashion</title></Helmet>
      <div className="pt-24 pb-20 page-container max-w-3xl">
        <h1 className="font-display text-4xl font-medium mb-3">Terms & Conditions</h1>
        <p className="text-luxe-muted text-sm mb-10">Last updated: January 1, 2025</p>
        {[
          { title: '1. Acceptance of Terms', body: 'By accessing and using this website, you accept and agree to be bound by these Terms & Conditions and our Privacy Policy.' },
          { title: '2. Product Information', body: 'We strive to display accurate product information including colors and sizes. However, we cannot guarantee that your screen will accurately reflect the actual product color. Sizes may vary slightly.' },
          { title: '3. Pricing', body: 'All prices are in Indian Rupees (INR) and inclusive of GST. We reserve the right to change prices at any time. Orders are charged at the price displayed at the time of purchase.' },
          { title: '4. Order Cancellation', body: 'Orders can be cancelled within 24 hours of placement or before they are shipped, whichever is earlier. Once shipped, cancellations are not possible.' },
          { title: '5. Intellectual Property', body: 'All content on this website, including text, images, logos, and design, is the property of LUXE Fashion and protected by copyright law.' },
          { title: '6. Limitation of Liability', body: 'LUXE Fashion shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products.' },
        ].map(({ title, body }) => (
          <div key={title} className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{title}</h2>
            <p className="text-luxe-muted leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// ReturnsPage.jsx
export function ReturnsPage() {
  return (
    <>
      <Helmet><title>Returns & Refunds — LUXE Fashion</title></Helmet>
      <div className="pt-24 pb-20 page-container max-w-3xl">
        <h1 className="font-display text-4xl font-medium mb-3">Returns & Refunds</h1>
        <p className="text-luxe-muted mb-10">We want you to love everything you buy. If something isn't right, here's how we handle it.</p>
        {[
          { title: 'Return Window', body: 'You have 7 days from the date of delivery to initiate a return. Items must be unused, unwashed, and in original condition with all tags attached.' },
          { title: 'How to Return', body: '1. Log in to your account and go to My Orders.\n2. Select the order and click "Request Return".\n3. Choose the items and provide a reason.\n4. Our team will review and approve within 24–48 hours.\n5. You\'ll receive a pickup confirmation with the scheduled date.' },
          { title: 'Non-Returnable Items', body: 'Innerwear, swimwear, and items marked as "Final Sale" cannot be returned. Custom or personalized items are also non-returnable.' },
          { title: 'Refund Timeline', body: 'Once we receive and inspect your return, refunds are processed within 5–7 business days. The amount will be credited to your original payment method.' },
          { title: 'Exchange Policy', body: 'We accept size exchanges within 7 days. Submit a return request and mention the size you need. Subject to availability.' },
          { title: 'Damaged or Wrong Items', body: 'If you received a damaged or incorrect item, please contact us within 48 hours of delivery at returns@luxe.com with photos. We will arrange a replacement or full refund immediately.' },
        ].map(({ title, body }) => (
          <div key={title} className="mb-8 border-b border-luxe-border pb-8 last:border-0">
            <h2 className="text-lg font-semibold mb-3">{title}</h2>
            <p className="text-luxe-muted leading-relaxed whitespace-pre-line">{body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// NotFoundPage.jsx
import { Link } from 'react-router-dom';
export function NotFoundPage() {
  return (
    <>
      <Helmet><title>404 — Page Not Found</title></Helmet>
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="font-display text-9xl font-semibold text-luxe-cream">404</p>
          <h1 className="font-display text-3xl font-medium mb-3 -mt-4">Page Not Found</h1>
          <p className="text-luxe-muted mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/" className="btn-primary">Go Home</Link>
            <Link to="/shop" className="btn-outline">Shop Now</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
