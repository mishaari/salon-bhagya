import { Service, Testimonial, GalleryItem } from "./types";

// Import our generated assets
import salonHeroImg from "./assets/images/salon_hero_1779540746093.png";
import brideModelImg from "./assets/images/bride_model_1779540764737.png";
import hairStylingImg from "./assets/images/hair_styling_1779540783559.png";
import facialCareImg from "./assets/images/facial_care_1779540802428.png";

export const IMAGES = {
  hero: salonHeroImg,
  bridal: brideModelImg,
  hair: hairStylingImg,
  facial: facialCareImg,
};

export const SERVICES: Service[] = [
  {
    id: "hair-cut",
    name: "Hair Cutting & Couture Styling",
    category: "hair",
    price: "Rs. 1,500 - 4,500+",
    description: "Personalized hair styling of master designers that aligns with your face structure and personal aesthetic.",
    duration: "45 mins",
    features: ["Hair Wash & Conditioning", "Precision Fringe or Custom Layer Cut", "Professional Volume Blow-Dry", "Tips on Hair Maintenance"]
  },
  {
    id: "hair-color",
    name: "Premium Multi-Dimensional Coloring",
    category: "hair",
    price: "Rs. 8,500 - 18,000+",
    description: "Exquisite balayage, ombre, full highlights, or soft root touches using international organic pigments.",
    duration: "120 mins",
    features: ["Ammonia-free gentle lighteners", "Custom shade formulation", "Deep hydrating post-color lock", "UV shield protection mist"]
  },
  {
    id: "bridal-saree",
    name: "Royal Kandyan & Western Bridal Dressing",
    category: "bridal",
    price: "Rs. 45,000 - 120,000+",
    description: "Our signature service. Masterfully crafted traditional Kandyan saree drapes or western gown settings.",
    duration: "180 mins",
    features: ["Flawless 16-hour HD glowing makeup", "Elegant floral/jewelry hair-ups", "Saree draping & security pin-ups", "Pre-bridal glowing facial included"]
  },
  {
    id: "facial-skin",
    name: "Radiant Gold & Hydrating Skin Treatment",
    category: "skin",
    price: "Rs. 3,500 - 8,500+",
    description: "Revitalize tired cells, reduce active blemishes, and infuse high-potency gold botanical essences.",
    duration: "60 mins",
    features: ["Deep pore steam purification", "Micro-exfoliation dead layer scrub", "Hydrating natural gold firming mask", "Ice-roller facial lymphatic massage"]
  },
  {
    id: "threading-waxing",
    name: "Feminine Threading & Soothing Waxing",
    category: "beauty",
    price: "Rs. 300 - 2,500+",
    description: "Painless hair removal that results in ultra-smooth finishing, calibrated carefully for delicate skin.",
    duration: "20 mins",
    features: ["Eyebrow shape styling", "Full face hair clearance", "Antibacterial tea-tree oil application", "Cool lavender compress massage"]
  },
  {
    id: "manicure-pedicure",
    name: "Luxurious Herbal Spa Mani & Pedi",
    category: "beauty",
    price: "Rs. 4,500+",
    description: "Detoxify your hands and feet inside our warm herbal sea salt baths, finished with custom base designs.",
    duration: "75 mins",
    features: ["Dead skin pumice wash", "Nail filing, shaping and cuticle care", "Moisturizing almond massage cream", "Non-chip UV LED Gel polish coat"]
  },
  {
    id: "makeup-special",
    name: "Stunning Lehenga & Party Makeup",
    category: "bridal",
    price: "Rs. 5,000 - 12,000+",
    description: "Steal the show at family gatherings, homecoming parties, or corporate events with elegant camera-ready glow.",
    duration: "60 mins",
    features: ["Premium oil-control primers", "False lash styling & setting", "Contour and blush highlight alignment", "Locking mist setting spray"]
  },
  {
    id: "hair-keratin",
    name: "Keratin Deep Care & Relaxing Therapy",
    category: "hair",
    price: "Rs. 15,000 - 25,000+",
    description: "Tame frizzy locks, restore cuticle integrity, and add a glassy, mirror-like straight shimmer for up to six months.",
    duration: "150 mins",
    features: ["Intense hair cleansing prep wash", "Infusing thermal liquid keratin block", "Flat-iron heat lock technique", "Free chemical-free home maintenance guide"]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Nisansala Jayawardene",
    role: "Verified Bride",
    rating: 5,
    text: "Salon Bhagya made my big day absolutely magical! Their Kandyan Saree draping is flawless and the HD bridal makeup stayed completely perfect from morning to night. Highly recommend their bridal packages to any Sri Lankan bride!",
    subText: "Homecoming Ceremony - Colombo",
    date: "2 weeks ago"
  },
  {
    id: "t2",
    name: "Malkanthi Silva",
    role: "Regular Client",
    rating: 5,
    text: "I come here monthly for my organic gold facial and hair blowouts. The environment in Kotikawatte is exceptionally hygienic, very peaceful, and the team always welcomes you like dear family. Absolute luxury!",
    subText: "Skin & Hair Care Monthly",
    date: "1 month ago"
  },
  {
    id: "t3",
    name: "Sanduni Wijerathna",
    role: "Hair Transformation Client",
    rating: 5,
    text: "Decided to get a Keratin Hair Treatment and balayage highlights at Salon Bhagya. My hair has never felt so silky-soft and healthy before. They are modern, precise, and use premium products. Worth every single rupee!",
    subText: "Full Balayage + Keratin",
    date: "3 weeks ago"
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    title: "Luxurious Master Salon Space",
    category: "Salon Interior",
    image: salonHeroImg
  },
  {
    id: "g2",
    title: "Signature Kandyan Bridal Dressing",
    category: "Bridal Saree & Dress",
    image: brideModelImg
  },
  {
    id: "g3",
    title: "Glamorous Party Evening Makeup",
    category: "Flawless Makeup",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "g4",
    title: "Perfect Volume Haircut & Blowout",
    category: "Hair Styles",
    image: hairStylingImg
  },
  {
    id: "g5",
    title: "Dr. Rachel Deep Cleansing Whitening",
    category: "Skin Treatments",
    image: facialCareImg
  },
  {
    id: "g6",
    title: "Exquisite Gold Shimmer Bridal Eyeshadow",
    category: "Flawless Makeup",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600"
  }
];

export const FAQS = [
  {
    q: "Where is Salon Bhagya located?",
    a: "We are located at No. 120, Kotikawatte Road, Kotikawatte, Sri Lanka. It is a highly central location close to the Kotikawatte Junction with easy bus access and ample parking."
  },
  {
    q: "Are your services exclusively for ladies?",
    a: "Yes, Salon Bhagya is a premium ladies-only boutique beauty salon, providing a secure, comfortable, and highly relaxing hygienic space for women to unleash their authentic glow."
  },
  {
    q: "Do I need to book an appointment beforehand?",
    a: "While walk-ins are welcome for simple cuts or threading, we highly recommend booking an appointment online or via WhatsApp to guarantee zero waiting time and personalized premium attention."
  },
  {
    q: "What brands of beauty and skin products do you use?",
    a: "We exclusively utilize internationally certified high-end products such as L'Oréal Professional, Keune, Janet, and Dr. Rachel, ensuring maximum safety for all hair and skin types."
  },
  {
    q: "Can I customize a bridal dressing package?",
    a: "Absolutely! We specialize in custom-tailored bridal packages designed around your wedding budget, theme, event location, and headcount. Contact us today for a free expert consultation!"
  }
];
