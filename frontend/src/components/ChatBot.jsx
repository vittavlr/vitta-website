import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../api';

function buildReply(text, { services, contact }) {
  const q = text.toLowerCase();

  const matchedService = services.find((s) => q.includes(s.title.toLowerCase()) || q.includes(s.slug.replace('-', ' ')));
  if (matchedService) {
    return {
      text: `${matchedService.title}: ${matchedService.short_description}`,
      link: matchedService.slug === 'real-estate' ? '/listings' : `/services/${matchedService.slug}`,
      linkLabel: 'View details',
    };
  }

  if (/propert|listing|house|flat|villa|plot/.test(q)) {
    return { text: 'You can browse our current property listings here.', link: '/listings', linkLabel: 'View listings' };
  }
  if (/phone|call|number/.test(q)) {
    return { text: contact.phone ? `You can reach us at ${contact.phone}.` : 'Phone details are on our Contact page.', link: '/contact', linkLabel: 'Contact page' };
  }
  if (/email|mail/.test(q)) {
    return { text: contact.email ? `You can email us at ${contact.email}.` : 'Email details are on our Contact page.', link: '/contact', linkLabel: 'Contact page' };
  }
  if (/address|office|location|where/.test(q)) {
    return { text: 'Our office is in Vellore, Tamil Nadu. Full details and a map are on our Contact page.', link: '/contact', linkLabel: 'Contact page' };
  }
  if (/hi|hello|hey/.test(q)) {
    return { text: "Hello! I'm the VITTA assistant. Ask me about our services, listings, or how to reach us." };
  }
  if (/thank/.test(q)) {
    return { text: "You're welcome! Anything else I can help with?" };
  }
  if (/enquir|contact form|apply|interested/.test(q)) {
    return { text: 'You can submit an inquiry and our team will get back to you within 24 hours.', link: '/enquire', linkLabel: 'Open enquiry form' };
  }

  return {
    text: "I'm not sure about that one — for anything specific, our team can help directly.",
    link: '/enquire',
    linkLabel: 'Send an enquiry',
  };
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm the VITTA assistant. Ask me about our services, listings, or how to reach us." },
  ]);
  const [input, setInput] = useState('');
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [data, setData] = useState({ services: [], contact: {} });
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    Promise.all([api.getServices().catch(() => []), api.getPublicContact().catch(() => ({}))]).then(
      ([services, contact]) => setData({ services, contact })
    );
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const speak = (text) => {
    if (!speakEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  };

  const send = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { from: 'user', text }]);
    setInput('');

    setTimeout(() => {
      const reply = buildReply(text, data);
      setMessages((prev) => [...prev, { from: 'bot', ...reply }]);
      speak(reply.text);
    }, 350);
  };

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((prev) => [...prev, { from: 'bot', text: 'Voice input is not supported in this browser — try typing instead.' }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.08 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gradient-to-b from-goldlight to-gold shadow-lg flex items-center justify-center text-white text-2xl"
        aria-label="Chat with VITTA assistant"
      >
        {open ? '✕' : '💬'}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 z-40 w-[92vw] max-w-sm h-[70vh] max-h-[520px] card p-0 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/40">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="font-serif text-lg leading-none">VITTA Assistant</p>
                  <p className="text-xs text-bronze/50">Ask me anything</p>
                </div>
              </div>
              <button
                onClick={() => setSpeakEnabled(!speakEnabled)}
                title={speakEnabled ? 'Turn off voice replies' : 'Turn on voice replies'}
                className={`text-xs rounded-full px-3 py-1.5 border ${speakEnabled ? 'bg-gold/10 border-gold text-gold' : 'border-bronze/20 text-bronze/50'}`}
              >
                {speakEnabled ? '🔊 Voice on' : '🔇 Voice off'}
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.from === 'user' ? 'bg-gold text-white' : 'bg-fawn text-bronze/90'}`}>
                    <p>{m.text}</p>
                    {m.link && (
                      <Link to={m.link} onClick={() => setOpen(false)} className="text-xs font-semibold underline mt-1 inline-block">
                        {m.linkLabel || 'View'} →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-white/40">
              <button
                type="button"
                onClick={startListening}
                title="Speak your question"
                className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm border ${listening ? 'bg-red-100 border-red-300 animate-pulse' : 'border-bronze/20 bg-white/70'}`}
              >
                🎤
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                className="flex-1 rounded-full border border-bronze/20 bg-white/70 px-4 py-2 text-sm outline-none focus:border-gold"
              />
              <button type="submit" className="btn-primary text-sm py-2 px-4">Send</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
