import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // In-memory appointments cache
  const appointments: any[] = [];

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API Endpoint: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasAi: !!ai });
  });

  // API Endpoint: Submit appointment
  app.post("/api/appointments", (req, res) => {
    const { name, email, phone, service, date, time, notes } = req.body;
    if (!name || !phone || !service || !date || !time) {
      return res.status(400).json({ error: "Please fill in all required booking fields." });
    }
    const newAppointment = {
      id: "APT-" + Math.floor(Math.random() * 100000),
      name,
      email: email || "N/A",
      phone,
      service,
      date,
      time,
      notes: notes || "",
      status: "Confirmed",
      createdAt: new Date().toISOString()
    };
    appointments.push(newAppointment);
    res.status(201).json({ success: true, appointment: newAppointment });
  });

  // API Endpoint: Get list
  app.get("/api/appointments", (req, res) => {
    res.json({ appointments });
  });

  // API Endpoint: AI Chatbot assistant
  app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!ai) {
      // Warm elegant fallback if owner hasn't placed API key yet
      return res.json({
        reply: "Hello darling! I am Salon Bhagya's personal assistant. Since the Gemini API key is not fully configured in settings yet, let me share our key details: We are situated at No. 120, Kotikawatte Road, Kotikawatte, Sri Lanka. We open Tuesday to Sunday from 9:00 AM to 6:30 PM. We do bridal Kandyan dresses, luxurious hair coloring, soothing facials, and stunning hair styles. How can I help you today?",
      });
    }

    try {
      const salonInstruction = `You are "Bhagya's Beauty Assistant", a highly professional, polite, warm and feminine virtual receptionist for Salon Bhagya, a luxury ladies' beauty salon located in Kotikawatte, Sri Lanka.
Treat all customers with extreme respect (using warm greetings like "dear" or "darling" where appropriate in Sri Lankan culture, but keeping it professional). Assist them with their pricing, beauty options, location, opening hours, bridal packages, and lead them towards booking.

Crucial Details:
- Location / Address: No. 120, Kotikawatte Road, Kotikawatte, Sri Lanka. It is easily reachable from the main junction or around Avissawella Road.
- Google Maps URL: https://maps.app.goo.gl/phGErXDydruremw87
- Facebook Profile: https://www.facebook.com/BhagyaSalon
- Hours of Operation: Tue - Sun (9:00 AM - 6:30 PM). Closed on Monday.
- Contact Details: Mobile: +94 77 123 4567, or tap our active WhatsApp links on the website.
- Services & Average Pricing:
  1. Hair Cutting & Styling: Stylish Trim (Rs. 1,500+), Hair Wash & Blowout (Rs. 2,500+), Salon Bun / Updo (Rs. 4,000+).
  2. Hair Coloring: Root touch-up (Rs. 4,500+), Full luxury dye (Rs. 8,500 - 15,000+), Ombre/Balayage (Rs. 12,000+).
  3. Bridal Dressing: Exquisite Kandyan Saree drape, Western Bridal dress, or modern home-coming designs. Bridal packages start from Rs. 45,000 up to Rs. 150,000.
  4. Facials & Skin Care: Refreshing face clean-up (Rs. 3,000), Dr. Rachel Gold Radiant facial (Rs. 6,500), Premium whitening treatment (Rs. 8,000).
  5. Threading & Waxing: Painless design eyebrow thread (Rs. 300), Upper lip threading (Rs. 200), Full legs wax (Rs. 2,500).
  6. Manicure & Pedicure: Classic cleansing mani-pedi with massage (Rs. 4,500), UV Gel polish application (Rs. 2,500).
  7. Makeup Services: Professional day makeup (Rs. 5,000), Gorgeous party evening makeup (Rs. 8,500).
  8. Keratin / treatments: Professional Keratin Hair Treatment (Rs. 18,000+), Smooth Relaxing (Rs. 15,000+), Hair Spa mask deep-care (Rs. 4,000).

Operational instructions:
- Keep answers delightful, helpful, and concise (under 4 lines of text).
- Use lists for multiple numbers or prices.
- Politely prompt the visitor to fill out the Appointment Booking Form on-page or tap 'WhatsApp Us' for instant bookings!`;

      const contents = [];
      if (Array.isArray(history)) {
        for (const step of history) {
          contents.push({
            role: step.role === "user" ? "user" : "model",
            parts: [{ text: step.text }]
          });
        }
      }

      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: salonInstruction,
          temperature: 0.7,
        }
      });

      res.json({ reply: response.text || "I'm happy to help you with our services. Would you like to book a blowout or wedding dress consult?" });
    } catch (err: any) {
      console.error(err);
      res.json({ reply: "I'm having a small connection issue, dear! But Salon Bhagya is open Tue-Sun 9AM - 6:30PM. You can reach us on +94 77 123 4567 or submit our booking form to secure your spot!" });
    }
  });

  // Serve Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server compiled & running on port ${PORT}`);
  });
}

startServer();
