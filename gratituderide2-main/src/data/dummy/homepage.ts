import type {
  FAQ,
  Feature,
  PricingTier,
  Service,
  Testimonial,
} from "@/types";

export const trustedCompanies = [
  { name: "Flutterwave", logo: "FW" },
  { name: "Paystack", logo: "PS" },
  { name: "Kuda Bank", logo: "KB" },
  { name: "Jumia", logo: "JM" },
  { name: "GTBank", logo: "GT" },
  { name: "Shoprite", logo: "SR" },
  { name: "Konga", logo: "KG" },
  { name: "Andela", logo: "AD" },
];

export const features: Feature[] = [
  {
    id: "1",
    title: "Lightning-Fast Delivery",
    description:
      "Express deliveries completed within 60 minutes across major cities. Real-time tracking keeps you in control.",
    icon: "Zap",
  },
  {
    id: "2",
    title: "Verified Riders",
    description:
      "Every rider undergoes thorough background checks, ID verification, and training before joining our fleet.",
    icon: "ShieldCheck",
  },
  {
    id: "3",
    title: "Live GPS Tracking",
    description:
      "Watch your package move in real-time on the map. Get instant updates at every milestone.",
    icon: "MapPin",
  },
  {
    id: "4",
    title: "Secure Payments",
    description:
      "Pay seamlessly with Paystack. Card, bank transfer, or wallet — your choice, always protected.",
    icon: "CreditCard",
  },
  {
    id: "5",
    title: "In-App Chat",
    description:
      "Direct messaging with your rider. Coordinate pickups, share instructions, stay connected.",
    icon: "MessageCircle",
  },
  {
    id: "6",
    title: "Insurance Coverage",
    description:
      "Every delivery is insured up to ₦500,000. Your packages are protected from pickup to drop-off.",
    icon: "Package",
  },
];

export const howItWorks = [
  {
    step: 1,
    title: "Book Your Delivery",
    description:
      "Enter pickup and delivery addresses, describe your package, and choose your preferred delivery speed.",
    icon: "PackagePlus",
  },
  {
    step: 2,
    title: "Rider Assigned",
    description:
      "A verified rider near you accepts your order. Track their arrival to the pickup location live.",
    icon: "UserCheck",
  },
  {
    step: 3,
    title: "Package Picked Up",
    description:
      "Your rider collects the package, confirms details, and begins the express journey to destination.",
    icon: "Truck",
  },
  {
    step: 4,
    title: "Delivered & Rated",
    description:
      "Receive your package, confirm delivery, and rate your experience. It's that simple.",
    icon: "CheckCircle2",
  },
];

export const coverageCities = [
  {
    city: "Lagos",
    areas: 45,
    riders: 1200,
    avgDelivery: "45 min",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    description:
      "From Victoria Island to Ikeja, we cover every corner of Lagos with unmatched speed.",
  },
  {
    city: "Abuja",
    areas: 28,
    riders: 650,
    avgDelivery: "50 min",
    image:
      "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80",
    description:
      "Serving the capital city with premium express delivery across all districts.",
  },
  {
    city: "Port Harcourt",
    areas: 22,
    riders: 480,
    avgDelivery: "55 min",
    image:
      "https://images.unsplash.com/photo-1494412574643-ff11b5a2ec63?w=800&q=80",
    description:
      "The Garden City gets garden-fresh delivery speeds. Fast, reliable, always on time.",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Adaeze Okonkwo",
    role: "E-commerce Founder",
    company: "StyleHub NG",
    avatar: "https://ui-avatars.com/api/?name=Adaeze+Okonkwo&background=16a34a&color=fff&size=128",
    rating: 5,
    content:
      "Gratitude Ride transformed our last-mile delivery. Our customers in Lagos now receive orders same-day. The tracking feature alone has cut our support tickets by 60%.",
    city: "Lagos",
  },
  {
    id: "2",
    name: "Emeka Nwosu",
    role: "Operations Manager",
    company: "TechFlow Africa",
    avatar: "https://ui-avatars.com/api/?name=Emeka+Nwosu&background=facc15&color=000&size=128",
    rating: 5,
    content:
      "We switched from three different courier services to Gratitude Ride for our Abuja office. One platform, consistent quality, and riders who actually show up on time.",
    city: "Abuja",
  },
  {
    id: "3",
    name: "Blessing Amadi",
    role: "Restaurant Owner",
    company: "Pepper Pot Kitchen",
    avatar: "https://ui-avatars.com/api/?name=Blessing+Amadi&background=16a34a&color=fff&size=128",
    rating: 5,
    content:
      "Hot food needs hot delivery. Gratitude Ride understands urgency. Our Port Harcourt customers get their meals fresh, and the in-app chat helps riders find tricky addresses.",
    city: "Port Harcourt",
  },
  {
    id: "4",
    name: "Tunde Bakare",
    role: "Freelance Designer",
    avatar: "https://ui-avatars.com/api/?name=Tunde+Bakare&background=262626&color=fff&size=128",
    rating: 5,
    content:
      "I send design proofs and printed materials to clients daily. Gratitude Ride's express option means I can promise same-day delivery and actually deliver on that promise.",
    city: "Lagos",
  },
];

export const pricingTiers: PricingTier[] = [
  {
    id: "standard",
    name: "Standard",
    description: "Reliable delivery within 3-4 hours",
    base_price: 1500,
    per_km: 150,
    features: [
      "3-4 hour delivery window",
      "Real-time GPS tracking",
      "In-app chat with rider",
      "Basic insurance (₦100,000)",
      "Email notifications",
    ],
  },
  {
    id: "express",
    name: "Express",
    description: "Premium delivery within 60 minutes",
    base_price: 2500,
    per_km: 200,
    features: [
      "60-minute delivery guarantee",
      "Priority rider assignment",
      "Live GPS tracking",
      "In-app chat with rider",
      "Full insurance (₦500,000)",
      "SMS & push notifications",
      "Photo proof of delivery",
    ],
    is_popular: true,
  },
  {
    id: "business",
    name: "Business",
    description: "Volume delivery for enterprises",
    base_price: 1200,
    per_km: 120,
    features: [
      "Custom delivery SLAs",
      "Dedicated account manager",
      "Bulk booking dashboard",
      "API integration",
      "Monthly invoicing",
      "Priority support 24/7",
      "Custom insurance limits",
      "Analytics & reporting",
    ],
  },
];

export const faqs: FAQ[] = [
  {
    id: "1",
    question: "How fast is express delivery?",
    answer:
      "Express deliveries are completed within 60 minutes in Lagos, 50 minutes in Abuja, and 55 minutes in Port Harcourt. These are average times based on standard distances within city limits.",
    category: "delivery",
  },
  {
    id: "2",
    question: "What cities do you operate in?",
    answer:
      "We currently operate in Lagos, Abuja, and Port Harcourt. We're expanding to Ibadan, Kano, and Enugu in 2026. Join our newsletter to be notified when we launch in your city.",
    category: "coverage",
  },
  {
    id: "3",
    question: "How do I track my package?",
    answer:
      "Every delivery comes with a unique tracking ID. Enter it on our Track Package page or in your dashboard to see real-time location, rider details, and estimated arrival time.",
    category: "tracking",
  },
  {
    id: "4",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major debit/credit cards, bank transfers, and USSD payments through Paystack. Business accounts can also pay via monthly invoicing.",
    category: "payment",
  },
  {
    id: "5",
    question: "Are my packages insured?",
    answer:
      "Yes. Standard deliveries include ₦100,000 insurance coverage. Express deliveries include up to ₦500,000. Business accounts can arrange custom insurance limits.",
    category: "insurance",
  },
  {
    id: "6",
    question: "How do I become a rider?",
    answer:
      "Visit our Become a Rider page, complete the registration form, upload required documents (ID, driver's license, vehicle registration), and pass our verification process. Most riders are approved within 48 hours.",
    category: "riders",
  },
];

export const services: Service[] = [
  {
    id: "express",
    title: "Express Delivery",
    description: "Premium 60-minute delivery for urgent packages",
    icon: "Zap",
    features: [
      "60-minute guarantee",
      "Priority rider matching",
      "Live tracking",
      "Photo proof of delivery",
    ],
    starting_price: 2500,
  },
  {
    id: "same-day",
    title: "Same-Day Delivery",
    description: "Reliable delivery within the same business day",
    icon: "Clock",
    features: [
      "3-4 hour window",
      "Flexible scheduling",
      "Real-time updates",
      "Affordable rates",
    ],
    starting_price: 1500,
  },
  {
    id: "scheduled",
    title: "Scheduled Delivery",
    description: "Plan ahead with date and time slot selection",
    icon: "Calendar",
    features: [
      "Choose date & time",
      "Recurring deliveries",
      "Calendar integration",
      "Reminder notifications",
    ],
    starting_price: 1200,
  },
  {
    id: "bulk",
    title: "Bulk & Business",
    description: "Enterprise solutions for high-volume senders",
    icon: "Building2",
    features: [
      "Volume discounts",
      "API access",
      "Dedicated support",
      "Custom SLAs",
    ],
    starting_price: 1000,
  },
];

export const stats = [
  { label: "Deliveries Completed", value: "500K+" },
  { label: "Active Riders", value: "2,300+" },
  { label: "Cities Covered", value: "3" },
  { label: "Customer Rating", value: "4.9★" },
];
