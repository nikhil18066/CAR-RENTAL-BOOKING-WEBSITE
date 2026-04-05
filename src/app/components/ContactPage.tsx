import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Sparkles, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../lib/api";
import { toast } from "sonner";

const faqs = [
  { q: "How do I book a vehicle?", a: "Use our online booking form or call us directly. We'll confirm your booking within 30 minutes." },
  { q: "Are drivers included?", a: "Yes! All our rentals come with professional, experienced drivers at no extra cost." },
  { q: "What's the cancellation policy?", a: "Free cancellation up to 24 hours before the trip. 50% charge for late cancellations." },
  { q: "Do you offer custom packages?", a: "Absolutely! Contact us with your requirements and we'll create a tailored package." },
  { q: "What payment methods do you accept?", a: "We accept cash, UPI, bank transfers, and all major credit/debit cards." },
];

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.sendContact(form);
      setSubmitted(true);
      toast.success("Message sent successfully!");
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: MapPin, label: "Our Office", value: "Nildhara housing society, 1645, near Sai Baba mandir, MHB Colony, Satpur Colony, Nashik, Maharashtra 422007, India", color: "from-blue-500 to-blue-600", href: "https://maps.google.com/?q=Nildhara+housing+society,+1645,+near+Sai+Baba+mandir,+MHB+Colony,+Satpur+Colony,+Nashik,+Maharashtra+422007,+India" },
    { icon: Phone, label: "Phone", value: "+91 94222 73107", color: "from-green-500 to-green-600", href: "tel:+919422273107" },
    { icon: Mail, label: "Email", value: "kishorsontakke2@gmail.com", color: "from-purple-500 to-purple-600", href: "mailto:kishorsontakke2@gmail.com" },
    { icon: Clock, label: "Working Hours", value: "24/7 Available", color: "from-orange-500 to-orange-600" },
  ];

  return (
    <div className="font-[Inter,system-ui,sans-serif]">
      <section className="relative bg-[#0f0f23] py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-primary/15 text-primary">
              <Sparkles className="h-3 w-3" /> Get in Touch
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Contact Us</h1>
            <p className="text-white/50 max-w-lg">Have questions or need a custom quote? Reach out and we'll get back to you promptly.</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {contactInfo.map((info, i) => (
            <motion.div
              key={info.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                <info.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold mb-1 text-sm font-[Plus_Jakarta_Sans,Inter,sans-serif]">{info.label}</h3>
              {info.href ? (
                <a href={info.href} target={info.href.startsWith("http") ? "_blank" : undefined} rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-sm text-muted-foreground hover:text-primary transition-colors block leading-relaxed">{info.value}</a>
              ) : (
                <p className="text-sm text-muted-foreground">{info.value}</p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-border p-12 text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-extrabold mb-2 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Message Sent!</h3>
                <p className="text-muted-foreground mb-6">Thank you for reaching out. We'll respond within 2 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="text-primary font-bold hover:underline">Send another message</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-border p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-6 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Send Us a Message</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Your Name *</label>
                    <input type="text" required value={form.name} onChange={(e) => update("name", e.target.value)}
                      placeholder="Full name" className="w-full px-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Email *</label>
                    <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)}
                      placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                      placeholder="+91 94222 73107" className="w-full px-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Subject *</label>
                    <input type="text" required value={form.subject} onChange={(e) => update("subject", e.target.value)}
                      placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={(e) => update("message", e.target.value)}
                    placeholder="Tell us about your travel needs..." className="w-full px-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none resize-none" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60">
                  <Send className="h-4 w-4" />
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-border p-6 md:p-8">
              <h3 className="text-lg font-extrabold mb-6 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-border rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/50 transition-colors"
                    >
                      <span className="font-semibold text-sm pr-4">{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
