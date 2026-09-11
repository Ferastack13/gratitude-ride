import type { ComponentProps } from "react";
import type Ionicons from "@expo/vector-icons/Ionicons";

type IconName = ComponentProps<typeof Ionicons>["name"];

/** Content for Comfort Ride details only — no fare/booking logic. */
export const COMFORT_RIDE_CONTENT = {
  badge: "Most refined option",
  headline: "Comfort Ride",
  tagline:
    "A more spacious, relaxed ride when you want something above everyday Standard and time-focused Express.",
  highlights: [
    { icon: "star-outline" as IconName, label: "Extra comfort" },
    { icon: "resize-outline" as IconName, label: "Extra space focus" },
    { icon: "snow-outline" as IconName, label: "Air-conditioned" },
    { icon: "person-outline" as IconName, label: "Professional driver" },
  ],
  whatIs:
    "Comfort is Gratitude Ride’s most refined of the three ride options. It’s for passengers who value a calmer, roomier feel over a basic everyday trip or a pickup-speed-focused Express request. You still book the same way — pickup, destination, fare estimate, confirm — then wait for a real driver to accept.",
  whatIsExtra:
    "Compared with Standard, Comfort emphasizes extra space and a more comfortable experience. Compared with Express, it is not positioned as the faster-pickup option; it’s the choice when you prefer a more relaxed journey rather than prioritizing match speed.",
  included: [
    {
      title: "Extra space and comfort focus",
      detail:
        "Oriented toward a more comfortable, roomier feel than a basic Standard trip.",
    },
    {
      title: "Air-conditioned ride",
      detail: "A cooled cabin for a smoother trip once you’re on the way.",
    },
    {
      title: "Professional driver",
      detail: "Matched with an available Gratitude Ride driver near your pickup.",
    },
    {
      title: "Clear fare before confirm",
      detail:
        "Comfort uses a higher local fare estimate than Standard and Express — shown on Plan before you request.",
    },
    {
      title: "Driver details after matching",
      detail: "Once a driver accepts, their information appears on Track.",
    },
    {
      title: "Real-time trip status",
      detail: "Follow each stage from accepted through trip complete.",
    },
    {
      title: "Live driver location",
      detail:
        "After a driver accepts, their location updates on your map — not on this details page.",
    },
  ],
  whyChoose:
    "Choose Comfort when you want the most premium of the three Gratitude Ride options — a more relaxed, comfortable trip without inventing luxury vehicles or extras the app doesn’t support.",
  whyPoints: [
    "When you prefer a more refined option than Standard",
    "When you’d rather prioritize comfort over Express pickup speed",
    "When a longer or more relaxed journey calls for extra space focus",
    "When you still want the same live tracking after a driver accepts",
  ],
  bestFor: [
    "Longer rides",
    "Relaxed journeys",
    "Business trips",
    "Special outings",
    "When you prefer more comfort",
  ],
  experience:
    "Select Comfort, set pickup and destination, review the Comfort estimate on Plan, then confirm. Your request stays pending until a nearby driver accepts. After acceptance you’ll see driver details and live location on Track — the same real-time trip flow as Standard and Express.",
  infoRows: [
    {
      label: "Positioning",
      value:
        "Comfort is the most premium of the three ride types — focused on space and comfort, not guaranteed luxury vehicles.",
    },
    {
      label: "Fare",
      value:
        "Comfort uses the highest local fare multiplier of the three. The estimate appears on Plan before you confirm.",
    },
    {
      label: "Tracking",
      value:
        "Live driver location is available only after a driver accepts. This details page does not show a live map.",
    },
  ],
  specs: [
    { label: "Positioning", value: "Most refined of three" },
    { label: "Focus", value: "Extra space & comfort" },
    { label: "Air conditioning", value: "Included" },
    { label: "Fare estimate", value: "Shown before confirm" },
    { label: "Tracking", value: "Live after driver accepts" },
  ],
  faq: [
    {
      q: "What is Comfort?",
      a: "Comfort is Gratitude Ride’s most refined ride option — focused on a more spacious, comfortable experience while using the same booking and tracking flow as Standard and Express.",
    },
    {
      q: "How is Comfort different from Standard?",
      a: "Standard is the everyday option. Comfort is positioned as a more premium, comfort-focused choice with a higher local fare estimate, still waiting for a real driver to accept before tracking begins.",
    },
    {
      q: "How is Comfort different from Express?",
      a: "Express is oriented toward a quicker pickup when drivers are available. Comfort prioritizes a more relaxed, roomier feel rather than match speed.",
    },
    {
      q: "Is Comfort more expensive?",
      a: "Yes. Comfort uses the highest local fare multiplier among Standard, Express, and Comfort. You’ll see the estimate on Plan before you confirm.",
    },
    {
      q: "How is my fare estimated?",
      a: "After you choose pickup and destination, Plan calculates a local estimate from trip distance and the Comfort ride type.",
    },
    {
      q: "When can I see my driver’s location?",
      a: "Only after a driver accepts your ride. The Comfort details page does not show a live map; Track shows live location once the trip is accepted.",
    },
  ],
  ctaLabel: "Choose Comfort",
} as const;
