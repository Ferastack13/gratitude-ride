import type { ComponentProps } from "react";
import type Ionicons from "@expo/vector-icons/Ionicons";

type IconName = ComponentProps<typeof Ionicons>["name"];

/** Content for Express Ride details only — no fare/booking logic. */
export const EXPRESS_RIDE_CONTENT = {
  badge: "Faster when available",
  headline: "Express Ride",
  tagline:
    "A more responsive ride option when time matters and nearby drivers are available.",
  highlights: [
    { icon: "flash-outline" as IconName, label: "Faster option" },
    { icon: "snow-outline" as IconName, label: "Air-conditioned" },
    { icon: "car-outline" as IconName, label: "Comfortable journey" },
    { icon: "navigate-outline" as IconName, label: "Real-time updates" },
  ],
  whatIs:
    "Express is Gratitude Ride’s upgraded everyday option for passengers who want a quicker start to their trip when drivers are nearby. It uses the same trusted booking flow as Standard — pickup, destination, fare estimate, and live tracking after a driver accepts — with matching tuned for a more responsive pickup when the network allows it.",
  whatIsExtra:
    "Choose Express when you’d rather not wait as long as a typical Standard request, while still getting clear trip status and driver details once someone accepts. Availability still depends on drivers near you — Express does not invent a driver or guarantee a specific arrival time.",
  included: [
    {
      title: "Responsive matching",
      detail:
        "Matching is oriented toward a quicker pickup when nearby drivers are online.",
    },
    {
      title: "Air-conditioned ride",
      detail: "A cooled cabin for a comfortable trip once you’re on the way.",
    },
    {
      title: "Professional driver",
      detail: "You’re matched with an available Gratitude Ride driver near pickup.",
    },
    {
      title: "Fare estimate before confirm",
      detail:
        "See an Express-priced estimate on Plan before you request the ride.",
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
        "After a driver accepts, their location updates on your map — not before.",
    },
  ],
  whyChoose:
    "Choose Express when time matters more than a basic everyday fare — for example when you’re heading to work, an appointment, or an errand and want a more responsive option than Standard.",
  whyPoints: [
    "When you want a faster pickup option if drivers are nearby",
    "When you prefer an upgraded choice from Standard",
    "When schedule pressure makes waiting less ideal",
    "When you still want the same live tracking after a driver accepts",
  ],
  bestFor: [
    "Busy schedules",
    "Work trips",
    "Appointments",
    "Important errands",
    "When you want a faster option",
  ],
  experience:
    "Select Express, choose pickup and destination, review your estimate on Plan, then confirm. Your request stays pending until a nearby driver accepts. After acceptance you’ll see driver details and live location on Track — the same real-time flow as other Gratitude Ride trips.",
  infoRows: [
    {
      label: "Pickup",
      value:
        "Depends on nearby available drivers. Express aims for a quicker match when possible — it is not a guaranteed arrival time.",
    },
    {
      label: "Fare",
      value:
        "Express uses a higher local fare multiplier than Standard. The estimate is shown on Plan before you confirm.",
    },
    {
      label: "Tracking",
      value:
        "Live driver location becomes available only after a driver accepts your ride.",
    },
  ],
  specs: [
    { label: "Positioning", value: "Faster option vs Standard" },
    { label: "Air conditioning", value: "Included" },
    { label: "Driver", value: "Professional driver" },
    { label: "Fare estimate", value: "Shown before confirm" },
    { label: "Tracking", value: "Live after driver accepts" },
  ],
  faq: [
    {
      q: "What is Express?",
      a: "Express is Gratitude Ride’s more responsive ride option — the same booking and tracking experience as Standard, with matching oriented toward a quicker pickup when drivers are available nearby.",
    },
    {
      q: "Is Express different from Standard?",
      a: "Yes. Express is positioned as a faster option when available and uses a higher local fare estimate than Standard. Both still wait for a real driver to accept before tracking begins.",
    },
    {
      q: "Is Express more expensive than Standard?",
      a: "Yes. On Plan, Express uses a higher fare multiplier than Standard for the same trip distance. You’ll see the estimate before you confirm.",
    },
    {
      q: "How is my fare estimated?",
      a: "After you set pickup and destination, Plan calculates a local estimate from trip distance and your selected ride type — including Express pricing.",
    },
    {
      q: "When can I see my driver’s location?",
      a: "Only after a driver accepts your ride. The Express details page does not show a live map; Track shows live location once the trip is accepted.",
    },
    {
      q: "Can I cancel my ride?",
      a: "While your request is still pending (Finding Driver), you can cancel from the Track screen. After a driver has accepted, use the trip controls available in the active trip experience.",
    },
  ],
  ctaLabel: "Choose Express",
} as const;
