import React, { useState } from 'react';
import { Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      errs.name = 'Please provide your name.';
    }
    if (!formData.contact.trim()) {
      errs.contact = 'Please provide your phone number or email.';
    }
    if (!formData.message.trim()) {
      errs.message = 'Please include a message or inquiry details.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate real client submission state prepared for backend integration
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', contact: '', message: '' });
    }, 600);
  };

  return (
    <section id="contact" className="py-24 bg-[#15171c] relative border-t border-stone-800 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
            GET IN TOUCH
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Contact Dragon Wok
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Have a question about our menu, reservations, or catering? Reach out directly or send us an inquiry.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Direct Details Side */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Call Us Card */}
            <div className="bg-[#181a20] rounded-xl border border-stone-800 p-6 sm:p-8">
              <div className="w-12 h-12 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-1">
                Call Us
              </h3>
              <a
                href="tel:03100968734"
                className="font-serif-brand text-2xl font-bold text-white hover:text-amber-400 transition-colors block mb-2"
              >
                0310 0968734
              </a>
              <p className="text-sm text-stone-400">
                Direct restaurant line for instant orders, questions, and takeaway preparation.
              </p>
            </div>

            {/* Visit Us Card */}
            <div className="bg-[#181a20] rounded-xl border border-stone-800 p-6 sm:p-8">
              <div className="w-12 h-12 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-[#b91c1c]" />
              </div>
              <h3 className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-1">
                Visit Us
              </h3>
              <p className="font-serif-brand text-xl font-bold text-white mb-2">
                Jadoon Plaza Phase 1, Mandian, Abbottabad
              </p>
              <p className="text-sm text-stone-400">
                Khyber Pakhtunkhwa, Pakistan. Open daily 12:00 PM onwards.
              </p>
            </div>

          </div>

          {/* Contact Form Side */}
          <div className="lg:col-span-7 bg-[#181a20] rounded-2xl border border-stone-800 p-8 sm:p-10 shadow-xl">
            <h3 className="font-serif-brand text-2xl font-bold text-white mb-2">
              Send an Inquiry
            </h3>
            <p className="text-xs text-stone-400 mb-6">
              Fill in your details below. For urgent food orders, please call directly at <a href="tel:03100968734" className="text-amber-400 hover:underline">0310 0968734</a>.
            </p>

            {submitted ? (
              <div className="bg-stone-900/90 border border-emerald-500/40 rounded-xl p-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-serif-brand text-xl font-bold text-white">
                  Message Prepared
                </h4>
                <p className="text-sm text-stone-300 max-w-md mx-auto">
                  Thank you! Your message details have been received. Since this is frontend-connected, for immediate order confirmation please dial our direct line: <strong className="text-amber-400">0310 0968734</strong>.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-5 py-2 text-xs uppercase font-semibold text-stone-300 hover:text-white bg-stone-800 rounded-md"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-2"
                  >
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    className={`w-full bg-stone-900 border rounded-lg px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 transition-all ${
                      errors.name
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-stone-800 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                  />
                  {errors.name && (
                    <p className="flex items-center gap-1 text-xs text-rose-400 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Phone or Email */}
                <div>
                  <label
                    htmlFor="contact-info"
                    className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-2"
                  >
                    Phone / Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-info"
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="e.g. 0300 1234567 or email@domain.com"
                    aria-required="true"
                    aria-invalid={!!errors.contact}
                    className={`w-full bg-stone-900 border rounded-lg px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 transition-all ${
                      errors.contact
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-stone-800 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                  />
                  {errors.contact && (
                    <p className="flex items-center gap-1 text-xs text-rose-400 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.contact}</span>
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-2"
                  >
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you'd like to ask or reserve..."
                    aria-required="true"
                    aria-invalid={!!errors.message}
                    className={`w-full bg-stone-900 border rounded-lg px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 transition-all resize-y ${
                      errors.message
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-stone-800 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                  />
                  {errors.message && (
                    <p className="flex items-center gap-1 text-xs text-rose-400 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white py-3.5 px-6 rounded-md font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending...' : 'Submit Inquiry'}</span>
                  </button>
                  <p className="text-[11px] text-stone-500 text-center mt-3">
                    Form is ready for API backend dispatch. No personal data shared externally.
                  </p>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
