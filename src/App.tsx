import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Calendar,
  Phone,
  Clock,
  MapPin,
  Check,
  Star,
  ArrowRight,
  Send,
  X,
  MessageSquare,
  ChevronDown,
  Menu,
  Scissors,
  Bookmark,
  Activity,
  Award,
  ShieldCheck,
  Heart,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { SERVICES, TESTIMONIALS, GALLERY_ITEMS, FAQS, IMAGES } from "./data";
import { Service, GalleryItem, ChatMessage, AppointmentInput } from "./types";

export default function App() {
  // Navigation states
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Active service Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Gallery zoom state
  const [activeGalleryItem, setActiveGalleryItem] = useState<GalleryItem | null>(null);

  // Booking states
  const [bookingForm, setBookingForm] = useState<AppointmentInput>({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    notes: ""
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedAppointments, setConfirmedAppointments] = useState<any[]>([]);

  // FAQ open states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Floating AI Chatbot states
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "model",
      text: "Hello darling! I am Salon Bhagya's virtual front-desk assistant. I’m here to help you explore pricing for hair blowouts, check our bride packages, find our Kotikawatte address, or quickly guide you inside our booking scheduling. What can I do for you today?",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Track scroll position to update header styling and active navigation tag
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = ["hero", "services", "about", "gallery", "testimonials", "booking"];
      const currentScroll = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (currentScroll >= top && currentScroll < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to chatbot bottom when messages change
  useEffect(() => {
    if (chatbotOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [chatbotMessages, chatbotOpen, isBotTyping]);

  // Load existing bookings on mount just to keep database status live
  useEffect(() => {
    fetch("/api/appointments")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.appointments) {
          setConfirmedAppointments(data.appointments);
        }
      })
      .catch((err) => console.log("Error loading appointments:", err));
  }, [bookingSuccess]);

  // Filtered services
  const filteredServices = selectedCategory === "all"
    ? SERVICES
    : SERVICES.filter((s) => s.category === selectedCategory);

  // Handle Form Change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle Booking Submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitting(true);
    setBookingError(null);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setBookingSuccess(data.appointment);
        // Reset form except personal detail memory for easy subsequent entries
        setBookingForm({
          name: bookingForm.name,
          email: bookingForm.email,
          phone: bookingForm.phone,
          service: "",
          date: "",
          time: "",
          notes: ""
        });
      } else {
        setBookingError(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setBookingError("Error sending reservation request to the server.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Handle Chatbot message send
  const sendChatMessage = async (textToSend?: string) => {
    const rawMessage = textToSend || userInput;
    if (!rawMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: rawMessage,
      timestamp: new Date()
    };

    setChatbotMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setUserInput("");
    setIsBotTyping(true);

    try {
      // Map history into standard format
      const mappedHistory = chatbotMessages
        .filter((m) => m.id !== "welcome-msg")
        .slice(-10) // Limit context window for speed
        .map((m) => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: rawMessage,
          history: mappedHistory
        })
      });
      if (!res.ok) {
        throw new Error("Chat server error");
      }
      const data = await res.json();
      if (!data.reply) {
        throw new Error("No chat reply in server response");
      }
      
      setChatbotMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: data.reply,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error("Chat API error, using secure client-side backup bot:", err);
      
      // Intelligent local keyword-based chatbot response generator
      const getLocalChatResponse = (userMsg: string): string => {
        const text = userMsg.toLowerCase().trim();
        
        if (text.includes("location") || text.includes("address") || text.includes("where") || text.includes("map") || text.includes("find") || text.includes("place") || text.includes("kotikawatte")) {
          return "Our beautiful salon is situated at **No. 120, Kotikawatte Road, Kotikawatte, Sri Lanka** (near Avissawella Road). 🗺️ You can locate us on Google Maps here: https://maps.app.goo.gl/phGErXDydruremw87";
        }
        
        if (text.includes("price") || text.includes("cost") || text.includes("rate") || text.includes("fee") || text.includes("how much") || text.includes("charge")) {
          return "Of course, dear! Here are our average prices:\n\n" +
                 "✨ **Hair Styling:** Trim (Rs. 1,500+), Wash & Blowout (Rs. 2,500+), Updo (Rs. 4,000+)\n" +
                 "✨ **Hair Coloring:** Root touch-up (Rs. 4,500+), Full dye (Rs. 8,500 - 15,000+)\n" +
                 "✨ **Bridal Packages:** Traditional Kandyan / Western Saree drapes from Rs. 45,000 to Rs. 150,000\n" +
                 "✨ **Facials:** Refreshing Clean-up (Rs. 3,000), Dr. Rachel Gold Facial (Rs. 6,500)\n" +
                 "✨ **Threading & Waxing:** Eyebrow thread (Rs. 300), Full legs wax (Rs. 2,500)\n\n" +
                 "You can fill out our secure booking scheduler on the page to lock in your slot!";
        }
        
        if (text.includes("hour") || text.includes("time") || text.includes("open") || text.includes("when") || text.includes("close") || text.includes("day") || text.includes("schedule")) {
          return "We open **Tuesday to Sunday from 9:00 AM to 6:30 PM**. ⏰ We are closed on Mondays. Booking an appointment is highly recommended to secure your preferred slot, dear!";
        }
        
        if (text.includes("hair") || text.includes("cut") || text.includes("style") || text.includes("blow") || text.includes("dry") || text.includes("color") || text.includes("dye") || text.includes("straight") || text.includes("keratin") || text.includes("relax")) {
          return "We offer premium hair treatments! Services include custom stylish trims (Rs. 1,500+), luxury full coloring (Rs. 8,500+), root touch-ups (Rs. 4,500+), and premium Keratin hair restructuring (Rs. 18,000+). Feel free to use our online dynamic booking form!";
        }
        
        if (text.includes("bridal") || text.includes("wedding") || text.includes("bride") || text.includes("saree") || text.includes("dress") || text.includes("kandyan")) {
          return "Congratulations, darling! 👰‍♀️ Safe traditional saree drapes (including Kandyan) and Western wedding styling are our specialties. Our bridal packages range from Rs. 45,000 to Rs. 150,000. Book a bridal consultation today via our booking form!";
        }
        
        if (text.includes("facial") || text.includes("skin") || text.includes("clean") || text.includes("glow") || text.includes("whitening")) {
          return "We do exquisite, eye-safe skin care, dear! Try our basic skin clean-ups for Rs. 3,000 or the deep face brightening/Dr. Rachel Gold facial for Rs. 6,500.";
        }
        
        if (text.includes("manicure") || text.includes("pedicure") || text.includes("nail") || text.includes("mani") || text.includes("pedi") || text.includes("gel")) {
          return "Our mani-pedi treatments are ultra-relaxing and hygienic! A classic Mani-Pedi is Rs. 4,500 and we offer high-durability UV Gel polish for Rs. 2,500.";
        }
        
        if (text.includes("phone") || text.includes("number") || text.includes("contact") || text.includes("whatsapp") || text.includes("call")) {
          return "You can reach us at **+94 77 123 4567** or click 'WhatsApp Us' at the top/bottom of our page to chat with our staff directly! 💬";
        }
        
        if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("sluh") || text.includes("good morning") || text.includes("good afternoon") || text.includes("ayubowan")) {
          return "Hello darling! Ayubowan! I am Salon Bhagya's virtual front-desk beauty bot. Ask me anything about our hair cuts, hair coloring, bridal saree draping packages, pricing, or salon timings! 🌸";
        }
        
        return "I'm having a brief server connection issue, dear, but let me help! Our Salon in Kotikawatte is open Tue-Sun 9:00 AM - 6:30 PM (Closed Mon), pricing starts at Rs. 1,500 for trims, and bridal packages from Rs. 45,000. You can reach us directly on +94 77 123 4567!";
      };

      const localResponse = getLocalChatResponse(rawMessage);
      setChatbotMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: localResponse,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const selectServiceAndScroll = (serviceName: string) => {
    setBookingForm((prev) => ({
      ...prev,
      service: serviceName
    }));
    handleScrollToSection("booking");
  };

  return (
    <div className="min-h-screen relative font-sans text-[#2D2D2D] bg-[#FDFBF7] overflow-x-hidden">

      {/* Elegant drifting gold background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-20">
        {[20, 45, 75].map((leftVal, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#C5A059]/5 filter blur-3xl"
            style={{
              width: `${(i + 1) * 200 + 150}px`,
              height: `${(i + 1) * 200 + 150}px`,
              left: `${leftVal}%`,
              top: `${(i * 30) + 10}%`,
            }}
            animate={{
              x: [0, (i % 2 === 0 ? 30 : -30), 0],
              y: [0, (i % 2 === 0 ? -40 : 40), 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: i * 8 + 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* GLAMOUR TOP NOTIFICATION SLIDE */}
      <div className="bg-[#2D2D2D] text-[#F5F0EB] text-xs py-2.5 px-4 text-center tracking-widest uppercase font-mono font-medium flex items-center justify-center gap-2 border-b border-white/5">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#C5A059]" />
        <span>Grand Bridal & Hair Restructuring Season 2026 — Book your bridal glow consultation today!</span>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? "glass shadow-sm border-b border-white/60 bg-[#FDFBF7]/95"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          
          {/* Logo Brand Representation - Minimalist Elegant */}
          <a href="#hero" className="flex flex-col text-left group">
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider uppercase text-[#2D2D2D] group-hover:text-[#C5A059] transition-colors duration-200">
              Bhagya Salon<span className="text-[#C5A059] font-normal leading-none font-serif italic text-3xl">.</span>
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.25em] text-[#3D332D] uppercase font-mono mt-0.5 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Premium Ladies Salon <span className="hidden sm:inline">• Kotikawatte</span>
            </span>
          </a>

          {/* Desktop Classic Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { id: "services", label: "Our Services" },
              { id: "about", label: "Signature Touch" },
              { id: "gallery", label: "Bespoke Portfolio" },
              { id: "testimonials", label: "Client Love" },
              { id: "booking", label: "Secure Booking" }
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection(link.id);
                }}
                className={`text-sm tracking-widest uppercase font-mono transition-all duration-200 relative py-1.5 cursor-pointer ${
                  activeSection === link.id
                    ? "text-[#C5A059] font-medium scale-105"
                    : "text-[#6E5D53] hover:text-[#2D2D2D]"
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <motion.span
                    layoutId="activeNavLine"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C5A059]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Call to Actions & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/94771234567"
              target="_blank"
              rel="noopener noreferrer"
              id="nav-chat-cta"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase font-semibold text-[#2D2D2D] hover:text-[#C5A059] border border-[#F5F0EB] hover:border-[#C5A059] px-4.5 py-2.5 rounded-full transition-all duration-200 glass"
            >
              <span>WhatsApp Us</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </a>

            <a
              href="#booking"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection("booking");
              }}
              id="nav-booking-cta"
              className="hidden sm:inline-flex bg-[#C5A059] hover:bg-[#B38F48] text-white text-xs font-mono tracking-widest uppercase font-semibold px-5.5 py-3 rounded-full transition-all duration-300 items-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle"
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2.5 rounded-lg border border-[#F5F0EB] text-[#2D2D2D] hover:bg-[#F5F0EB] transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden absolute top-full left-0 right-0 w-full bg-[#FDFBF7]/98 backdrop-blur-md border-b border-[#F5F0EB] shadow-2xl z-50 overflow-y-auto max-h-[80vh]"
            >
              <ul className="px-5 py-6 space-y-3 font-mono text-xs tracking-widest uppercase text-left">
                {[
                  { id: "services", label: "Our Services" },
                  { id: "about", label: "Signature Touch" },
                  { id: "gallery", label: "Bespoke Portfolio" },
                  { id: "testimonials", label: "Client Love" },
                  { id: "booking", label: "Secure Booking" }
                ].map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleScrollToSection(item.id);
                      }}
                      className={`block py-3 px-4 rounded-lg transition-colors cursor-pointer ${
                        activeSection === item.id
                          ? "bg-[#F5F0EB] text-[#C5A059] font-extrabold"
                          : "text-[#6E5D53] hover:bg-white/50 hover:text-[#2D2D2D]"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li className="pt-2 border-t border-[#F5F0EB]" />
                <li className="flex gap-4">
                  <a
                    href="https://wa.me/94771234567"
                    target="_blank"
                    className="flex-1 text-center py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Chat on WhatsApp</span>
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 1. HERO SECTION - ULTRA VISUAL SOPHISTICATED PRESENTATION */}
      <section id="hero" className="relative min-h-[calc(100vh-140px)] flex items-center pt-8 pb-16 lg:py-24 overflow-hidden">
        {/* Abstract Warm Organic Accents BACKGROUND */}
        <div className="absolute top-0 right-0 w-[50%] h-[70%] bg-gradient-to-bl from-[#E9CFCF]/30 to-transparent rounded-bl-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#F5F0EB]/50 blur-3xl rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-[#C5A059]/5 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* TEXT COLUMN */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left max-w-2xl lg:max-w-none">
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F0EB] text-[#3D332D] text-xs font-mono tracking-widest uppercase border border-white/80 shadow-xs glass font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-pulse" />
                <span>BHAGYA SALON • Kotikawatte's Premier Ladies Sanctuary</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#2D2D2D] leading-[1.1] tracking-tight font-medium">
                Luxury Beauty Care <br className="hidden md:inline" />
                <span className="font-serif italic font-normal text-[#C5A059]">That Makes You</span> <br className="hidden md:inline" />
                Feel Exceptionally Confident
              </h1>

              <p className="text-[#3D332D] text-base sm:text-lg leading-relaxed font-normal font-sans">
                Welcome to <strong className="font-semibold text-[#2D2D2D]">Bhagya Salon</strong>,Kotikawatte's finest boutique. Experience world-class ladies’ hair design, exquisite traditional Kandyan bridal drapes, premium organic skin treatments, and custom beauty pampering right in a calm, hygienic, and relaxing oasis in Kotikawatte, Sri Lanka.
              </p>

              {/* CTAs with beautiful icons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a
                  href="#booking"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection("booking");
                  }}
                  id="hero-booking-btn"
                  className="bg-[#C5A059] hover:bg-[#B38F48] text-white text-xs sm:text-sm font-mono tracking-widest uppercase font-bold px-8 py-4 px-10 rounded-full transition-all duration-300 flex items-center justify-center gap-3 group shadow-md hover:shadow-xl hover:scale-[1.03] border border-white/20 cursor-pointer"
                >
                  <span>Book Your Spot Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </a>

                <a
                  href="https://wa.me/94771234567"
                  target="_blank"
                  id="hero-whatsapp-btn"
                  className="bg-white/90 hover:bg-[#F5F0EB] text-[#2D2D2D] text-xs sm:text-sm font-mono tracking-widest uppercase font-bold px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-3 border border-white shadow-xs hover:border-[#C5A059] glass"
                >
                  <Phone className="w-4 h-4 text-[#C5A059]" />
                  <span>WhatsApp Consultant</span>
                </a>
              </div>

              {/* Dynamic stats row representing trust factors */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-10 border-t border-[#F5F0EB]">
                {[
                  { value: "12+", label: "Years Experience" },
                  { value: "1,200+", label: "Kandyan brides" },
                  { value: "5.0★", label: "Facebook Reviews" }
                ].map((stat, idx) => (
                  <div key={idx} className="text-left">
                    <span className="block font-serif text-2xl sm:text-3xl font-bold text-[#C5A059]">{stat.value}</span>
                    <span className="text-[10px] sm:text-xs tracking-wider uppercase font-mono text-[#3D332D] font-bold block mt-1">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ART WORK COLUMN WITH CUSTOM GENERATED IMAGE OFFSET LAYOUT */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              
              {/* Decorative Frame */}
              <div className="absolute inset-0 border border-[#C5A059]/30 translate-x-4 translate-y-4 rounded-2xl -z-10" />

              {/* Glowing Ambient light background */}
              <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-72 h-72 bg-[#C5A059]/10 blur-3xl rounded-full" />

              {/* Large Hero image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] sm:aspect-square bg-[#F5F0EB]">
                <img
                  src={IMAGES.hero}
                  alt="Salon Bhagya Luxurious boutique interior space in Kotikawatte"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Embedded Glass Overlay Info Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl border border-white/60 shadow-lg glass">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#2D2D2D]">Bhagya Salon</h4>
                      <p className="text-xs text-[#3D332D] font-mono mt-0.5 mt-1 flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                        No. 120, Kotikawatte Rd, Sri Lanka
                      </p>
                    </div>
                    <div className="bg-[#2D2D2D] text-white p-2.5 rounded-full">
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                    </div>
                  </div>
                  
                  <div className="mt-3.5 pt-3 border-t border-white/50 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#3D332D] font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      Open Tue - Sun
                    </span>
                    <span className="text-emerald-600 font-semibold">Active & Serving</span>
                  </div>
                </div>
              </div>
              
              {/* Aesthetic Floating Gold Brush badge */}
              <div className="absolute -top-4 -right-4 bg-white text-[#2D2D2D] p-4.5 rounded-full shadow-lg border border-white/60 hidden md:block glass">
                <Award className="w-6 h-6 text-[#C5A059] animate-spin" style={{ animationDuration: '10s' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION - WELL SEPARATED LUXURY SHOWCASE WITH CUSTOM FILTERS */}
      <section id="services" className="py-20 sm:py-28 bg-[#FDFBF7] text-[#2D2D2D] relative border-b border-[#F5F0EB]/60">
        <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[#C5A059] tracking-[0.25em] uppercase font-mono text-xs block font-bold">
              OUR CUSTOM COUTRE MENU
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#2D2D2D]">
              Bespoke Services & Transparent Estimates
            </h2>
            <div className="h-[2px] w-20 bg-[#C5A059] mx-auto mt-6" />
            <p className="text-[#6E5D53] text-sm sm:text-base font-light">
              Each session uses internationally certified organic cosmetics and represents the peak combination of modern beauty techniques, strict hygiene, and personalized pampering.
            </p>
          </div>

          {/* Filter Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
            {[
              { id: "all", label: "Show All" },
              { id: "hair", label: "Hair & Styling" },
              { id: "bridal", label: "Bridals & Glamour" },
              { id: "skin", label: "Skin & Spa" },
              { id: "beauty", label: "Feminine Care" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full border text-xs tracking-widest uppercase font-mono transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#C5A059] border-[#C5A059] text-white font-semibold shadow-lg shadow-[#C5A059]/15"
                    : "border-[#F5F0EB] text-[#6E5D53] hover:border-[#C5A059] hover:text-[#2D2D2D] glass"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Core Services Grid with custom visual cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, idx) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  id={`service-${service.id}`}
                  className={`border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 group hover:translate-y-[-4px] hover:shadow-xl hover:shadow-[#C5A059]/15 ${
                    idx % 2 === 0
                      ? "glass border-white text-[#2D2D2D] bg-white/95"
                      : "bg-white/80 border-[#F5F0EB] text-[#2D2D2D] shadow-xs"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Bespoke Category Card Cover Image */}
                    <div className="relative h-40 rounded-xl overflow-hidden shadow-xs group-hover:shadow-md transition-shadow">
                      <img
                        src={
                          service.category === "hair"
                            ? IMAGES.hair
                            : service.category === "bridal"
                            ? IMAGES.bridal
                            : service.category === "skin"
                            ? IMAGES.facial
                            : "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600"
                        }
                        alt={service.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 text-[10px] tracking-widest font-mono text-white bg-[#C5A059] border border-[#C5A059]/30 px-2.5 py-1 rounded-md font-bold uppercase">
                        {service.category === "hair" ? "Hair Couture" : service.category === "bridal" ? "Royal Bridal" : service.category === "skin" ? "Hydra Skincare" : "Bespoke Care"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] tracking-widest font-mono text-[#C5A059] uppercase bg-white/85 border border-[#F5F0EB] px-2 py-0.5 rounded-md font-extrabold shadow-2xs">
                        {service.category.toUpperCase()}
                      </span>
                      <span className="text-xs text-[#2D2D2D] font-mono flex items-center gap-1 font-bold">
                        <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                        {service.duration}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#2D2D2D] group-hover:text-[#C5A059] transition-colors duration-200">
                      {service.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#3D332D] leading-relaxed font-normal">
                      {service.description}
                    </p>

                    <ul className="space-y-1.5 pt-2">
                      {service.features.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className="text-xs text-[#3D332D] flex items-start gap-2 font-medium">
                          <Check className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5 font-bold" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] tracking-wider uppercase font-mono text-[#8C7B70] block">Starting Price</span>
                      <span className="font-serif text-base font-semibold text-[#C5A059]">{service.price}</span>
                    </div>
                    <button
                      onClick={() => selectServiceAndScroll(service.name)}
                      className="text-[#C5A059] hover:text-white bg-transparent hover:bg-[#C5A059] p-2.5 rounded-full border border-[#C5A059] transition-all duration-300 pointer-events-auto cursor-pointer"
                      aria-label="Secure online booking slot"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Quick Consultation Promo Box */}
          <div className="mt-16 bg-white/80 border border-[#F5F0EB] glass rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto shadow-md">
            <div className="text-left space-y-2">
              <h4 className="font-serif text-xl sm:text-2xl text-[#2D2D2D] font-bold">Need custom advice or special home visits?</h4>
              <p className="text-[#3D332D] text-xs sm:text-sm font-normal leading-relaxed">
                We design bespoke packages matching your family wedding theme, custom budgets, and group requirements.
              </p>
            </div>
            <a
              href="https://wa.me/94771234567"
              target="_blank"
              className="bg-[#C5A059] hover:bg-[#B38F48] text-white text-xs font-mono tracking-widest uppercase font-bold py-4 px-8 rounded-full transition-all duration-300 shrink-0 shadow-lg hover:scale-105"
            >
              Consult with Bhagya via WhatsApp
            </a>
          </div>

        </div>
      </section>

      {/* 3. ABOUT SECTION - STORY & BRAND TRUTH */}
      <section id="about" className="py-20 sm:py-28 bg-[#FDFBF7] relative overflow-hidden">
        {/* Aesthetic absolute grids */}
        <div className="absolute top-1/2 -translate-y-1/2 right-1/4 w-[500px] h-[500px] bg-[#E9CFCF]/25 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* IMAGE COMPOSITIONS */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300">
                  <img
                    src={IMAGES.bridal}
                    alt="Salon Bhagya Bridal kandyan Saree Drape Model"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="bg-white/50 border border-white/60 p-6 rounded-2xl text-center space-y-2 glass">
                  <Award className="w-8 h-8 text-[#C5A059] mx-auto" />
                  <span className="block text-2xl font-serif text-[#2D2D2D] font-semibold">12+</span>
                  <span className="block text-[10px] tracking-widest uppercase text-[#3D332D] font-mono font-bold">Years local trust & expertise</span>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="bg-[#2D2D2D] text-white p-6 rounded-2xl text-center space-y-2 shadow-lg">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <span className="block text-lg font-serif font-bold">100% Secure</span>
                  <span className="block text-[10px] tracking-wider text-[#F5F0EB] uppercase font-mono font-semibold">Premium hygiene materials used</span>
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300">
                  <img
                    src={IMAGES.facial}
                    alt="Facial skincare spa and organic herbal care at Salon Bhagya"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* CONTENT SPACE */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
              <div className="space-y-2">
                <span className="text-[#C5A059] tracking-[0.25em] uppercase font-mono text-xs block font-bold">ABOUT BHAGYA SALON</span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2D2D2D]">
                  The Signature Story of Beauty, Grace & Absolute Comfort
                </h2>
                <div className="h-[2px] w-14 bg-[#C5A059] mt-4" />
              </div>

              <p className="text-[#3D332D] leading-relaxed font-normal text-base sm:text-lg">
                Nestled directly in the busy heart of Kotikawatte, Sri Lanka, <strong className="font-semibold text-[#2D2D2D]">Bhagya Salon</strong> has been transforming everyday ladies into radiant spectacles for over a decade. We believe that true beauty care shouldn’t just satisfy your reflection—it must soothe your mind, rest your spirits, and protect your body’s health. We strictly serve ladies only inside our relaxing space.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 pt-2">
                {[
                  {
                    icon: <Award className="text-[#C5A059]" />,
                    title: "Experienced Master Stylists",
                    text: "Our team consists of trained beauty specialists specializing in Kandyan saree settings, complex hair colors, and treatments."
                  },
                  {
                    icon: <ShieldCheck className="text-[#C5A059]" />,
                    title: "Medical-Grade Hygiene",
                    text: "Your health is central! All metal brushes, combs, scissors, and massage instruments undergo high-temperature UV sterilization before every service."
                  },
                  {
                    icon: <Heart className="text-[#C5A059]" />,
                    title: "Relaxing Boutique Environment",
                    text: "Escape the external heat and noises. Unwind inside optimized air-conditioned interiors featuring sweet ambient scents and soft tea service."
                  },
                  {
                    icon: <Briefcase className="text-[#C5A059]" />,
                    title: "Bespoke Personalized Consultation",
                    text: "We avoid cookie-cutter plans. You sit with our lead artist to check your facial profile, hair porosity, and skin shade before we touch any product."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#F5F0EB] rounded-lg shrink-0 border border-white/45 glass">
                        {item.icon}
                      </div>
                      <h4 className="font-serif text-base font-bold text-[#2D2D2D]">{item.title}</h4>
                    </div>
                    <p className="text-[13px] sm:text-xs text-[#3D332D] leading-relaxed font-normal pl-11">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-6">
                <a
                  href="#booking"
                  className="bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-mono tracking-widest uppercase font-semibold px-8 py-3.5 rounded-full transition-all duration-300 flex items-center gap-2 shadow-sm"
                >
                  <span>Book Consult</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                  <Star className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                  <Star className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                  <Star className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                  <Star className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                  <span className="text-xs font-mono text-[#8C7B70] uppercase tracking-wider ml-1">5.0 Star Rated Salon</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 4. SOCIAL PROOF & HAPPY CLIENTS STANDARDS */}
      <section id="testimonials" className="py-20 sm:py-28 bg-[#F5F0EB]/40 relative border-y border-[#F5F0EB]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-[#C5A059] tracking-[0.25em] uppercase font-mono text-xs block font-bold">CLIENT TESTIMONIALS & TRUST</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#2D2D2D]">What Our Happy Ladies Say</h2>
            <div className="h-[2px] w-12 bg-[#C5A059] mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                id={`testimonial-${t.id}`}
                className="bg-white/75 border border-white/60 p-8 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 group glass"
              >
                <div className="space-y-4">
                  
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                    ))}
                  </div>

                  {/* Body Text */}
                  <p className="text-[#3D332D] text-[15px] sm:text-base leading-relaxed font-normal italic font-sans bg-[#F9F7F5] p-3 rounded-lg border border-[#F5F0EB]">
                    "{t.text}"
                  </p>

                </div>

                <div className="pt-6 mt-6 border-t border-[#F5F0EB] flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-[#2D2D2D]">{t.name}</h3>
                    <p className="text-[10px] uppercase tracking-wider font-mono text-[#3D332D] mt-0.5 font-bold">
                      {t.role} — <span className="text-emerald-700 font-extrabold">{t.subText || "Service Client"}</span>
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#3D332D] font-bold">{t.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof trust statistics row */}
          <div className="mt-16 bg-[#2D2D2D] border border-white/10 rounded-2xl p-8 sm:p-12 text-white shadow-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y divide-[#505050] md:divide-y-0 md:divide-x divide-white/10">
              <div className="space-y-1">
                <span className="block font-serif text-4xl font-normal text-[#C5A059]">98%</span>
                <span className="block text-[10px] tracking-widest text-[#F5F0EB] uppercase font-mono pt-1">Repeat Customer Rate</span>
              </div>
              <div className="space-y-1 pt-6 md:pt-0">
                <span className="block font-serif text-4xl font-normal text-[#C5A059]">5.0 / 5</span>
                <span className="block text-[10px] tracking-widest text-[#F5F0EB] uppercase font-mono pt-1">Facebook Client Score</span>
              </div>
              <div className="space-y-1 pt-6 md:pt-0">
                <span className="block font-serif text-4xl font-normal text-[#C5A059]">5,000+</span>
                <span className="block text-[10px] tracking-widest text-[#F5F0EB] uppercase font-mono pt-1">Delighted Local Clients</span>
              </div>
              <div className="space-y-1 pt-6 md:pt-0">
                <span className="block font-serif text-4xl font-normal text-[#C5A059]">100%</span>
                <span className="block text-[10px] tracking-widest text-[#F5F0EB] uppercase font-mono pt-1">Hygienic Sterility Standard</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. PORTFOLIO / GALLERY */}
      <section id="gallery" className="py-20 sm:py-28 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-4">
            <div className="text-left space-y-2">
              <span className="text-[#C5A059] tracking-[0.25em] uppercase font-mono text-xs block font-bold">BESPOKE DESIGN SHOWCASE</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#2D2D2D] font-medium">Bhagya Salon Beauty Gallery</h2>
              <div className="h-[2px] w-12 bg-[#C5A059] mt-3" />
            </div>
            <p className="text-[#3D332D] text-sm max-w-md font-normal leading-relaxed">
              Explore authentic high-resolution snapshots of our latest hairstyles, bridal saree dressings, and glowing bridal transformations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveGalleryItem(item)}
                id={`gallery-item-${item.id}`}
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl aspect-[4/3] bg-[#F5F0EB] cursor-pointer transition-all duration-300"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Ambient dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6" />

                {/* Floating tags */}
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/60 text-[10px] font-mono uppercase tracking-widest text-[#2D2D2D] glass">
                  {item.category}
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="font-serif text-base font-bold tracking-wide">{item.title}</h3>
                  <p className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider mt-1">Tap to fullscreen view</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FULL-SCREEN IMMERSIVE GALLERY ZOOM DIALOG */}
      <AnimatePresence>
        {activeGalleryItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2D2D2D]/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <button
              onClick={() => setActiveGalleryItem(null)}
              className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors cursor-pointer"
              id="close-gallery-dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-4xl w-full bg-white/95 backdrop-blur-md glass border border-white/60 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video relative rounded-t-2xl overflow-hidden bg-black/10">
                <img
                  src={activeGalleryItem.image}
                  alt={activeGalleryItem.title}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 text-left space-y-2 bg-[#FDFBF7]/45 backdrop-blur-sm">
                <span className="text-xs text-[#C5A059] tracking-widest font-mono uppercase bg-white/60 border border-white/60 px-2.5 py-1 rounded-md glass">
                  {activeGalleryItem.category}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2D2D2D] pt-2">{activeGalleryItem.title}</h3>
                <p className="text-xs text-[#6E5D53] leading-relaxed">
                  Captured live at Salon Bhagya. For hair transformations or bridal consultations with identical results, please book our designers online.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={() => {
                      selectServiceAndScroll(activeGalleryItem.title);
                      setActiveGalleryItem(null);
                    }}
                    className="bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-mono tracking-widest uppercase font-semibold px-6 py-3 rounded-full transition-all shadow-md cursor-pointer"
                  >
                    Select service and book slot
                  </button>
                  <button
                    onClick={() => setActiveGalleryItem(null)}
                    className="border border-[#F5F0EB] hover:bg-[#F5F0EB]/50 text-[#2D2D2D] text-xs font-mono tracking-widest uppercase font-semibold px-6 py-3 rounded-full transition-colors cursor-pointer"
                  >
                    Close image
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. BOOKING AND CONTACT SECTION - DIRECT FORM SUBMIT TO SERVER */}
      <section id="booking" className="py-20 sm:py-28 bg-[#FDFBF7] border-t border-[#F5F0EB]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* CONTACT CARD COLUMN */}
            <div className="lg:col-span-5 space-y-8 text-left">
              <div className="space-y-3">
                <span className="text-[#C5A059] tracking-[0.25em] uppercase font-mono text-xs block font-bold">SECURE AN EXPERT</span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#2D2D2D] font-light leading-tight">
                  Reach Out or Confirm <br />Your Session Spot
                </h2>
                <div className="h-[2px] w-12 bg-[#C5A059] mt-3" />
                <p className="text-[#6E5D53] text-xs sm:text-sm font-light leading-relaxed pt-2">
                  Have questions about custom bridal dressing, hair coloring, or straightening prices? Phone us directly, browse our active working schedules, or drop an offline ticket here.
                </p>
              </div>

              {/* Grid of contact details */}
              <div className="space-y-4">
                
                <div className="bg-white/70 border border-white/60 p-5 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-all glass">
                  <div className="p-3 bg-[#F5F0EB] text-[#C5A059] border border-white/50 rounded-xl shrink-0 mt-1 glass">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#2D2D2D]">Our Premium Address</h4>
                    <p className="text-xs text-[#6E5D53] leading-relaxed mt-1">
                      No. 120, Kotikawatte Road, Kotikawatte, Sri Lanka. Located strategically near the Kotikawatte Junction.
                    </p>
                    <a
                      href="https://maps.app.goo.gl/phGErXDydruremw87"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C5A059] hover:text-[#B38F48] font-bold uppercase tracking-wider mt-2.5 hover:underline"
                    >
                      <span>Show on Google Maps</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="bg-white/70 border border-white/60 p-5 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-all glass">
                  <div className="p-3 bg-[#F5F0EB] text-[#C5A059] border border-white/50 rounded-xl shrink-0 mt-1 glass">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#2D2D2D]">Serving Schedule</h4>
                    <ul className="text-xs text-[#6E5D53] leading-relaxed mt-1.5 space-y-1">
                      <li className="flex justify-between gap-6">
                        <span>Tuesday – Sunday:</span>
                        <span className="font-semibold text-[#2D2D2D]">9:00 AM – 6:30 PM</span>
                      </li>
                      <li className="flex justify-between gap-6 text-[#8C7B70]">
                        <span>Mondays:</span>
                        <span className="font-semibold text-rose-500">Closed (Weekly Holiday)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white/70 border border-white/60 p-5 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-all glass">
                  <div className="p-3 bg-[#F5F0EB] text-[#C5A059] border border-white/50 rounded-xl shrink-0 mt-1 glass">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#2D2D2D]">Call Office Back-desk</h4>
                    <p className="text-xs text-[#6E5D53] leading-relaxed mt-1">
                      Contact us on voice lines for custom group inquiries:
                    </p>
                    <p className="text-sm font-bold text-[#2D2D2D] font-mono mt-1">+94 77 123 4567</p>
                  </div>
                </div>

              </div>

              {/* EMBEDDED MAP DUMMY DECORATION & FACEBOOK LINK */}
              <div className="bg-[#2D2D2D] text-white p-6 rounded-2xl space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif text-sm">Join Our Community</h4>
                  <span className="text-[10px] tracking-widest uppercase font-mono text-[#C5A059] font-bold">Active Daily</span>
                </div>
                <p className="text-[11px] text-[#D0C2B6] leading-relaxed">
                  Join our official Facebook page to check live wedding dresses, view transformation videos and see seasonal discounts!
                </p>
                <a
                  href="https://www.facebook.com/BhagyaSalon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-white/10 hover:bg-[#C5A059] hover:text-white text-white font-mono text-xs uppercase tracking-widest py-3 rounded-lg border border-white/10 transition-colors"
                >
                  Visit Facebook Page
                </a>
              </div>

            </div>

            {/* FORM CONTAINER WITH INTERACTIVE BOOKING SUCCESS DETAILS */}
            <div className="lg:col-span-7 bg-white/75 border border-white/60 p-8 sm:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 glass">
              
              <AnimatePresence mode="wait">
                {bookingSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center space-y-6 py-6"
                    id="booking-ticket"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200 glass">
                      <Check className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl font-semibold text-[#2D2D2D]">Appointment Spot Confirmed!</h3>
                      <p className="text-xs text-[#6E5D53]">
                        We have reserved your temporary beauty slot. Our receptionist will call your mobile number to confirm before your arrival!
                      </p>
                    </div>

                    {/* CONFIRMATION SLIP CARD */}
                    <div className="bg-white/60 backdrop-blur-sm border-2 border-dashed border-[#F5F0EB]/80 p-6 rounded-xl text-left space-y-4 relative overflow-hidden glass">
                      {/* Decorative punch holes */}
                      <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 bg-[#FDFBF7] rounded-full border-r border-[#F5F0EB]/60" />
                      <div className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 bg-[#FDFBF7] rounded-full border-l border-[#F5F0EB]/60" />

                      <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-[#F5F0EB] text-[#6E5D53]">
                        <span>TICKET ID: <span className="text-[#2D2D2D] font-bold">{bookingSuccess.id}</span></span>
                        <span className="text-emerald-600 font-bold uppercase tracking-wider">Confirmed Slot</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-[#8C7B70] uppercase font-mono block">Client Name</span>
                          <span className="text-[#2D2D2D] font-semibold block mt-0.5">{bookingSuccess.name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8C7B70] uppercase font-mono block">Handphone</span>
                          <span className="text-[#2D2D2D] font-bold block mt-0.5">{bookingSuccess.phone}</span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-white/50">
                          <span className="text-[10px] text-[#8C7B70] uppercase font-mono block">Selected Treatment Service</span>
                          <span className="text-sm font-serif text-[#2D2D2D] font-semibold mt-0.5">{bookingSuccess.service}</span>
                        </div>
                        <div className="pt-2 border-t border-white/50">
                          <span className="text-[10px] text-[#8C7B70] uppercase font-mono block">Scheduled Date</span>
                          <span className="text-[#2D2D2D] font-semibold block mt-0.5">{bookingSuccess.date}</span>
                        </div>
                        <div className="pt-2 border-t border-white/50">
                          <span className="text-[10px] text-[#8C7B70] uppercase font-mono block">Expected Time</span>
                          <span className="text-[#2D2D2D] font-semibold block mt-0.5">{bookingSuccess.time}</span>
                        </div>
                      </div>

                      {bookingSuccess.notes && (
                        <div className="pt-3 border-t border-[#F5F0EB]/60 text-xs text-[#6E5D53]">
                          <span className="text-[10px] text-[#8C7B70] uppercase font-mono block">Custom Request</span>
                          <p className="italic mt-0.5 font-light">"{bookingSuccess.notes}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <button
                        onClick={() => setBookingSuccess(null)}
                        className="flex-1 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-mono tracking-widest uppercase font-semibold py-3.5 rounded-full transition-colors cursor-pointer"
                      >
                        Book another appointment
                      </button>
                      <a
                        href="https://wa.me/94771234567"
                        target="_blank"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono tracking-widest uppercase font-semibold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Send Ticket to WhatsApp</span>
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-6 text-left" id="appointment-booking-form">
                    
                    <div className="border-b border-[#F5F0EB]/80 pb-4">
                      <h3 className="font-serif text-xl font-bold text-[#2D2D2D]">Bespoke Booking Scheduling Filter</h3>
                      <p className="text-xs text-[#6E5D53] mt-1">Please fill in details. We do not require credit-card numbers. Pure offline transparency.</p>
                    </div>

                    {bookingError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4.5 py-3.5 rounded-xl flex items-start gap-3.5 font-mono"
                      >
                        <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-600" />
                        <div className="space-y-0.5 text-left">
                          <p className="font-bold uppercase tracking-wider text-[10px]">Scheduling Error</p>
                          <p className="text-[#622929] leading-relaxed font-sans">{bookingError}</p>
                        </div>
                      </motion.div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-6">
                      
                      {/* Name Field */}
                      <div className="space-y-1.5">
                        <label htmlFor="name-input" className="text-[10px] tracking-widest font-mono uppercase font-bold text-[#C5A059]">Your Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          id="name-input"
                          value={bookingForm.name}
                          onChange={handleFormChange}
                          placeholder="e.g. Priyanthi Perera"
                          required
                          className="w-full px-4 py-3 rounded-lg border border-[#F5F0EB] bg-white/70 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 text-xs transition-colors"
                        />
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-1.5">
                        <label htmlFor="phone-input" className="text-[10px] tracking-widest font-mono uppercase font-bold text-[#C5A059]">Srilankan Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone-input"
                          value={bookingForm.phone}
                          onChange={handleFormChange}
                          placeholder="e.g. 077 123 4567"
                          required
                          className="w-full px-4 py-3 rounded-lg border border-[#F5F0EB] bg-white/70 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 text-xs transition-colors"
                        />
                      </div>

                      {/* Email Optional */}
                      <div className="space-y-1.5">
                        <label htmlFor="email-input" className="text-[10px] tracking-widest font-mono uppercase font-bold text-[#C5A059]">Email Address (Optional)</label>
                        <input
                          type="email"
                          name="email"
                          id="email-input"
                          value={bookingForm.email}
                          onChange={handleFormChange}
                          placeholder="e.g. priyanthi@gmail.com"
                          className="w-full px-4 py-3 rounded-lg border border-[#F5F0EB] bg-white/70 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 text-xs transition-colors"
                        />
                      </div>

                      {/* Service Dropdown */}
                      <div className="space-y-1.5">
                        <label htmlFor="service-select" className="text-[10px] tracking-widest font-mono uppercase font-bold text-[#C5A059]">Select Service Category *</label>
                        <select
                          name="service"
                          id="service-select"
                          value={bookingForm.service}
                          onChange={handleFormChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-[#F5F0EB] bg-white/70 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 text-xs transition-colors text-[#2D2D2D] h-[42px] cursor-pointer"
                        >
                          <option value="">-- Choose Treatment --</option>
                          {SERVICES.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name} ({s.price})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Scheduled Date */}
                      <div className="space-y-1.5">
                        <label htmlFor="date-input" className="text-[10px] tracking-widest font-mono uppercase font-bold text-[#C5A059]">Desired Date *</label>
                        <input
                          type="date"
                          name="date"
                          id="date-input"
                          value={bookingForm.date}
                          onChange={handleFormChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-[#F5F0EB] bg-white/70 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 text-xs transition-colors text-[#2D2D2D] cursor-pointer"
                        />
                      </div>

                      {/* Scheduled Time */}
                      <div className="space-y-1.5">
                        <label htmlFor="time-select" className="text-[10px] tracking-widest font-mono uppercase font-bold text-[#C5A059]">Preferred Appointment Time *</label>
                        <select
                          name="time"
                          id="time-select"
                          value={bookingForm.time}
                          onChange={handleFormChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-[#F5F0EB] bg-white/70 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 text-xs transition-colors h-[42px] cursor-pointer text-[#2D2D2D]"
                        >
                          <option value="">-- Choose Hour Spot --</option>
                          <option value="09:00 AM">09:00 AM (Early slot)</option>
                          <option value="10:30 AM">10:30 AM</option>
                          <option value="12:00 PM">12:00 PM</option>
                          <option value="01:30 PM">01:30 PM</option>
                          <option value="03:00 PM">03:00 PM</option>
                          <option value="04:30 PM">04:30 PM</option>
                          <option value="05:30 PM">05:30 PM (Late slot)</option>
                        </select>
                      </div>

                    </div>

                    {/* Notes text area */}
                    <div className="space-y-1.5">
                      <label htmlFor="notes-area" className="text-[10px] tracking-widest font-mono uppercase font-bold text-[#C5A059]">Custom Skin/Hair Conditions or Bridal Notes</label>
                      <textarea
                        name="notes"
                        id="notes-area"
                        rows={3}
                        value={bookingForm.notes}
                        onChange={handleFormChange}
                        placeholder="State if you want particular home arrival services, organic hair paints, or other details..."
                        className="w-full px-4 py-3 rounded-lg border border-[#F5F0EB] bg-white/70 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 text-xs transition-colors resize-none"
                      />
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      id="submit-booking-button"
                      className="w-full bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-mono text-xs tracking-widest uppercase font-bold py-4.5 rounded-lg transition-all duration-300 shadow-md flex items-center justify-center gap-2 border border-transparent disabled:opacity-50 cursor-pointer"
                    >
                      {bookingSubmitting ? (
                        <span>Processing Spot Reservation...</span>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          <span>Reserve Beauty Spot Online</span>
                        </>
                      )}
                    </button>

                  </form>
                )}
              </AnimatePresence>
              
              {/* INTERACTIVE APPOINTMENTS LIVE TICKER WIDGET */}
              {confirmedAppointments.length > 0 && (
                <div className="mt-8 pt-6 border-t border-[#F5F0EB] text-left">
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="text-[11px] font-mono tracking-widest uppercase text-[#8C7B70] flex items-center gap-1.5 font-bold">
                      <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                      Live verified appointments today
                    </h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      {confirmedAppointments.length} Booked
                    </span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {confirmedAppointments.slice(-3).reverse().map((apt, idx) => (
                      <div key={idx} className="bg-white/80 border border-white/60 p-2.5 rounded-lg text-xs flex justify-between items-center glass shadow-xs">
                        <div>
                          <span className="font-semibold text-[#2D2D2D]">{apt.name.substring(0, 15)}{apt.name.length > 15 ? '...' : ''}</span>
                          <span className="text-[#6E5D53] font-mono text-[10px] ml-2">— {apt.service}</span>
                        </div>
                        <span className="font-mono text-[10px] bg-[#F5F0EB] text-[#2D2D2D] px-2 py-0.5 rounded border border-white/50">
                          {apt.date} @ {apt.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS SECTION */}
      <section className="py-20 sm:py-28 bg-[#FCFAF6] border-t border-[#F5F0EB]/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <span className="text-[#C5A059] tracking-[0.25em] uppercase font-mono text-xs block font-bold">CLEAR YOUR CONCERNS</span>
            <h2 className="font-serif text-3xl font-light text-[#2D2D2D]">Frequently Asked Questions</h2>
            <div className="h-[2px] w-12 bg-[#C5A059] mx-auto mt-4" />
          </div>

          <div className="space-y-4 text-left">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="bg-white/70 border border-white/60 rounded-xl overflow-hidden transition-all duration-300 glass hover:shadow-md"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex justify-between items-center gap-4 hover:bg-white/40 transition-colors text-left cursor-pointer"
                >
                  <span className="font-serif text-sm sm:text-base font-semibold text-[#2D2D2D]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#C5A059] shrink-0 transition-transform duration-300 ${
                      openFaqIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                
                {openFaqIndex === index && (
                  <div className="px-6 pb-5 pt-3 text-xs sm:text-sm text-[#3D332D] leading-relaxed font-normal border-t border-white/50 bg-[#FBF9F6]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAJESTIC LUXURY FOOTER */}
      <footer className="bg-[#2D2D2D] text-[#EADFCF] pt-20 pb-12 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/10">
            
            <div className="space-y-4 text-left">
              <h3 className="font-serif text-xl font-semibold tracking-wider text-white uppercase">
                Bhagya Salon<span className="text-[#C5A059]">.</span>
              </h3>
              <p className="text-xs text-[#D0C2B6] leading-relaxed font-light">
                Premium boutique beauty space providing luxurious hair cuts, color highlights, wedding sarees, facials and absolute hygienic safety standards in Kotikawatte, Sri Lanka.
              </p>
              <div className="flex gap-4 pt-2">
                <a
                  href="https://www.facebook.com/BhagyaSalon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 hover:bg-[#C5A059] hover:text-[#2D2D2D] p-2.5 rounded-full border border-white/10 transition-colors"
                  aria-label="Salon Bhagya on Facebook"
                >
                  <Star className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <h4 className="font-serif text-sm text-white font-semibold uppercase tracking-wider">Quick Services Menu</h4>
              <ul className="text-xs space-y-2.5 font-light text-[#D0C2B6]">
                <li><a href="#services" className="hover:text-white transition-colors">Hair Couture & Blowouts</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Premium Hair Coloring</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Traditional Kandyan Bridals</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Organic Gold Facial</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Herbal Spa Mani-Pedi</a></li>
              </ul>
            </div>

            <div className="space-y-4 text-left">
              <h4 className="font-serif text-sm text-white font-semibold uppercase tracking-wider">Salon Location Details</h4>
              <p className="text-xs text-[#D0C2B6] leading-relaxed font-light">
                No. 120, Kotikawatte Road, <br />
                Kotikawatte, Sri Lanka. <br />
                Near the main junction.
              </p>
              <p className="text-xs text-white font-semibold font-mono">
                Phone: +94 77 123 4567
              </p>
            </div>

            <div className="space-y-4 text-left flex flex-col items-start">
              <h4 className="font-serif text-sm text-white font-semibold uppercase tracking-wider">Hours of Operation</h4>
              <p className="text-xs text-[#D0C2B6] leading-relaxed font-light">
                Tuesdays to Sundays: <br />
                <span className="font-semibold text-white">9:00 AM – 6:30 PM</span>
              </p>
              <p className="text-xs leading-relaxed font-mono font-bold text-rose-300">
                Closed on Mondays
              </p>
              <a
                href="#booking"
                className="bg-[#C5A059] hover:bg-[#B38F48] text-white text-[10px] font-mono tracking-widest uppercase font-bold py-2.5 px-5 rounded-md transition-colors"
              >
                Secure spot now
              </a>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-left text-[11px] font-mono text-[#A2948A]">
            <p>© {new Date().getFullYear()} Salon Bhagya. All Rights Reserved. Ladies boutique beauty care.</p>
            <div className="flex gap-6">
              <span>Hygienically Certified</span>
              <span>•</span>
              <a href="https://maps.app.goo.gl/phGErXDydruremw87" target="_blank" className="hover:text-[#C5A059] transition-all">Google Maps Location</a>
              <span>•</span>
              <a href="https://www.facebook.com/BhagyaSalon" target="_blank" className="hover:text-[#C5A059] transition-all">Facebook Feed</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 7. FLOATING AI CHATBOT INTEGRATION - ELEGANT CHAT ASSISTANT WITH TYPING EFFECT */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Floating Circle Launcher Button */}
        <button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          id="chatbot-launcher-button"
          aria-label="Open beauty chatbot"
          className="bg-[#2D2D2D] hover:bg-[#C5A059] text-white p-4.5 rounded-full shadow-2xl transition-all duration-300 relative group flex items-center justify-center hover:scale-105 active:scale-95 border border-[#C5A059]/30 cursor-pointer"
        >
          {chatbotOpen ? (
            <X className="w-5.5 h-5.5" />
          ) : (
            <>
              <MessageSquare className="w-5.5 h-5.5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </>
          )}
        </button>

        {/* Extended conversational dialog window */}
        <AnimatePresence>
          {chatbotOpen && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="bg-white/95 border border-white/80 rounded-2xl shadow-2xl w-[calc(100vw-32px)] sm:w-[385px] h-[480px] sm:h-[520px] mb-4 flex flex-col overflow-hidden relative glass"
              id="beauty-chatbot-dialog"
            >
              
              {/* Chatheader block with gold gradients */}
              <div className="bg-[#2D2D2D] p-4 flex items-center justify-between text-white border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-[#C5A059]/25 flex items-center justify-center border border-[#C5A059] glass">
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                    </div>
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#2D2D2D]" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-serif text-sm font-semibold text-white">Bhagya's Advisor</h4>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-emerald-400">Online & Artificial intelligence</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setChatbotOpen(false)}
                  className="text-[#D0C2B6] hover:text-white cursor-pointer"
                  aria-label="Hide panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat log body scroll area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFBF7]/40">
                {chatbotMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed text-left ${
                        msg.role === "user"
                          ? "bg-[#2D2D2D] text-white rounded-br-none shadow-sm"
                          : "bg-white/75 border border-white/60 text-[#2D2D2D] rounded-bl-none shadow-xs glass"
                      }`}
                    >
                      {/* Simple custom markdown renderer fallback */}
                      <span className="whitespace-pre-wrap">{msg.text}</span>
                      
                      <div className={`text-[8px] font-mono mt-1.5 ${
                        msg.role === "user" ? "text-white/50 text-right" : "text-[#8C7B70] text-left"
                      }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* BOT TYPING INDICATOR */}
                {isBotTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/75 border border-white/60 rounded-2xl rounded-bl-none px-4 py-3.5 flex items-center gap-1.5 text-xs text-[#8C7B70] shadow-xs glass">
                      <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>

              {/* QUICK CHIP OPTIONS TO SEND IMMEDIATELY */}
              <div className="p-2 bg-[#FCFAF6]/60 border-t border-white/50 flex flex-wrap gap-1.5 justify-start glass">
                {[
                  "Bridal Saree Packages",
                  "Hair Treatments Pricing",
                  "Location Address",
                  "Opening Hours"
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendChatMessage(chip)}
                    className="text-[10px] bg-white/70 hover:bg-white border border-white/50 text-[#6E5D53] py-1 px-2.5 rounded-full font-mono transition-all hover:border-[#C5A059] active:scale-95 cursor-pointer max-w-full truncate glass"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input form submission fields */}
              <div className="p-3 bg-white/80 border-t border-white/60 flex items-center gap-2 glass">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Ask about price list, wedding makeup..."
                  className="flex-1 bg-white/50 border border-white/40 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/10 rounded-full px-4.5 py-2.5 text-xs focus:outline-none text-[#2D2D2D] h-[38px]"
                  id="chatbot-inline-input"
                />
                
                <button
                  onClick={() => sendChatMessage()}
                  className="bg-[#2D2D2D] hover:bg-[#C5A059] text-white p-2.5 rounded-full transition-colors flex items-center justify-center shrink-0 shadow-md h-[38px] w-[38px] cursor-pointer"
                  aria-label="Send query"
                  id="chatbot-send-button"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
