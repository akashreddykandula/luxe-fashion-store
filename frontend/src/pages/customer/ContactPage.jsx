import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FAQ = [
  { q: 'What is your return policy?', a: 'We offer a 7-day return policy from the date of delivery. Items must be unused, unwashed, and in original packaging with tags attached.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 5–7 business days. Express shipping (2–3 days) is available at checkout for select pincodes.' },
  { q: 'Is free shipping available?', a: 'Yes! We offer free standard shipping on all orders above ₹999.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive an email with tracking details. You can also track it from your Order History page.' },
  { q: 'Can I exchange an item for a different size?', a: 'Yes, we offer exchanges within 7 days of delivery. Raise a return request and mention the size you need.' },
  { q: 'When will I receive my refund?', a: 'Refunds are processed within 5–7 business days after we receive and inspect the returned item.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.send(form);
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us — LUXE Fashion</title>
        <meta name="description" content="Get in touch with LUXE Fashion. We're here to help." />
      </Helmet>

      <div className="pt-24 pb-20">
        {/* Hero */}
        <div className="bg-luxe-black text-white py-16 text-center mb-16">
          <span className="section-tag text-luxe-gold">Get in Touch</span>
          <h1 className="font-display text-4xl font-medium text-white">Contact Us</h1>
          <p className="text-white/60 mt-3 max-w-md mx-auto">Have a question or need help? We're here for you.</p>
        </div>

        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            {/* Contact info */}
            <div>
              <h2 className="font-display text-2xl font-medium mb-8">Get in Touch</h2>
              <div className="space-y-6 mb-10">
                {[
                  { icon: MapPin, title: 'Visit Us', lines: ['123 Fashion Street', 'Bandra West, Mumbai 400050'] },
                  { icon: Phone, title: 'Call Us', lines: ['+91 98765 43210', 'Mon–Sat, 10am–7pm IST'] },
                  { icon: Mail, title: 'Email Us', lines: ['hello@luxe.com', 'We reply within 24 hours'] },
                  { icon: MessageCircle, title: 'WhatsApp', lines: ['+91 98765 43210', 'Quick support via chat'] },
                ].map(({ icon: Icon, title, lines }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-11 h-11 bg-luxe-cream flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-luxe-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-0.5">{title}</p>
                      {lines.map(l => <p key={l} className="text-sm text-luxe-muted">{l}</p>)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Business hours */}
              <div className="bg-luxe-bg-soft p-6">
                <h3 className="text-sm font-medium mb-4">Business Hours</h3>
                <div className="space-y-2 text-sm">
                  {[['Monday – Friday', '10:00 AM – 7:00 PM'], ['Saturday', '10:00 AM – 6:00 PM'], ['Sunday', 'Closed']].map(([day, hrs]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-luxe-muted">{day}</span>
                      <span className={hrs === 'Closed' ? 'text-red-500' : 'text-luxe-black font-medium'}>{hrs}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h2 className="font-display text-2xl font-medium mb-8">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Full Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
                  </div>
                  <div>
                    <label className="input-label">Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Subject</label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-field">
                      <option value="">Select a topic</option>
                      <option>Order Issue</option>
                      <option>Returns & Refunds</option>
                      <option>Product Query</option>
                      <option>Shipping</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="input-label">Message *</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="input-field min-h-[140px] resize-none" placeholder="How can we help you?" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4">
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* FAQ */}
          <div id="faq">
            <div className="text-center mb-10">
              <span className="section-tag">Support</span>
              <h2 className="section-title">Frequently Asked Questions</h2>
            </div>
            <div className="max-w-2xl mx-auto space-y-0 border border-luxe-border">
              {FAQ.map((item, i) => (
                <div key={i} className={`${i < FAQ.length - 1 ? 'border-b border-luxe-border' : ''}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex items-center justify-between w-full px-6 py-4 text-sm font-medium text-left hover:bg-luxe-bg-soft transition-colors"
                  >
                    {item.q}
                    {openFaq === i ? <ChevronUp size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-4 text-sm text-luxe-muted leading-relaxed">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
