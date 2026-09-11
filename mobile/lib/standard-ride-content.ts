import type { ComponentProps } from "react";
import type Ionicons from "@expo/vector-icons/Ionicons";

type IconName = ComponentProps<typeof Ionicons>["name"];

/** Content for Standard Ride details only — no fare/booking logic. */
export const STANDARD_RIDE_CONTENT = {
  badge: "Everyday ride",
  headline: "Standard Ride",
  tagline:
    "Reliable everyday rides designed to keep you comfortable and moving.",
  highlights: [
    { icon: "snow-outline" as IconName, label: "Air-conditioned" },
    { icon: "car-outline" as IconName, label: "Comfortable" },
    { icon: "person-outline" as IconName, label: "Professional driver" },
    { icon: "navigate-outline" as IconName, label: "Live trip tracking" },
  ],
  included: [
    {
      title: "Air-conditioned vehicle",
      detail: "A cooled cabin for everyday trips around town.",
    },
    {
      title: "Comfortable seating",
      detail: "A straightforward, comfortable ride without premium upcharges.",
    },
    {
      title: "Professional driver",
      detail: "Matched with an available Gratitude Ride driver near your pickup.",
    },
    {
      title: "Door-to-door pickup",
      detail: "Choose your pickup and destination, then confirm when ready.",
    },
    {
      title: "Driver details after matching",
      detail: "Once a driver accepts, you can see their information on Track.",
    },
    {
      title: "Real-time trip status",
      detail: "Follow each stage from accepted through trip complete.",
    },
    {
      title: "Live driver location",
      detail:
        "After a driver accepts your ride, their location updates on your map.",
    },
    {
      title: "Estimated fare before confirm",
      detail: "See a local fare estimate on Plan before you request the ride.",
    },
  ],
  whyChoose:
    "Standard is made for everyday trips when you want a comfortable and dependable ride without paying for a premium experience.",
  whyPoints: [
    "Comfort for normal day-to-day travel",
    "Reliable matching with nearby drivers",
    "Straightforward booking from pickup to drop-off",
    "A balanced option between speed and cost",
  ],
  bestFor: [
    "Going to work",
    "Going to school",
    "Shopping",
    "Appointments",
    "Visiting friends and family",
    "Everyday trips around town",
  ],
  experience:
    "Your ride starts with a pickup at your chosen location. Once a driver accepts your request, you’ll see the driver’s details and can track the trip in real time until you arrive.",
  infoRows: [
    {
      label: "Pickup",
      value: "Based on available drivers near your location.",
    },
    {
      label: "Fare",
      value: "Estimated on Plan from your trip distance — shown before confirm.",
    },
    {
      label: "Tracking",
      value:
        "Live driver location is available after a driver accepts the ride.",
    },
  ],
  specs: [
    { label: "Air conditioning", value: "Included" },
    { label: "Seating", value: "Comfortable everyday" },
    { label: "Ride type", value: "Everyday ride" },
    { label: "Driver", value: "Professional driver" },
    { label: "Tracking", value: "Real-time after accept" },
  ],
  faq: [
    {
      q: "What is Standard Ride?",
      a: "Standard is Gratitude Ride’s everyday ride option, designed for passengers who want a comfortable and dependable trip around town.",
    },
    {
      q: "Is Standard Ride air-conditioned?",
      a: "Yes. Standard rides are described as air-conditioned everyday vehicles for typical trips.",
    },
    {
      q: "Who is Standard Ride best for?",
      a: "It’s best for work, school, shopping, appointments, visiting people, and other everyday trips when you don’t need Express or Comfort.",
    },
    {
      q: "Can I track my driver?",
      a: "Yes. After a driver accepts your ride, you can see trip status and the driver’s live location on the Track screen.",
    },
    {
      q: "Will I see the fare before confirming?",
      a: "Yes. On the Plan screen you’ll see an estimated fare based on your pickup, destination, and selected ride type before you confirm.",
    },
    {
      q: "How does driver matching work?",
      a: "After you confirm, your request stays pending until a nearby available driver accepts. Finding Driver waits for a real accept — it doesn’t invent a driver.",
    },
  ],
  ctaLabel: "Choose Standard",
} as const;
