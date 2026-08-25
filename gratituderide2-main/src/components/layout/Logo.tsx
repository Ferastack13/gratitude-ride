import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}

export function Logo({
  className,
  showText = true,
  size = "md",
  variant = "dark",
}: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-lg" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 48, text: "text-2xl" },
  };

  const textColor = variant === "light" ? "text-white" : "text-dark";

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 group", className)}
      aria-label="Gratitude Ride - Home"
    >
      <div className="relative">
        <svg
          width={sizes[size].icon}
          height={sizes[size].icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-110"
          aria-hidden="true"
        >
          <rect
            width="48"
            height="48"
            rx="12"
            className="fill-primary"
          />
          <path
            d="M26 8L14 26H22L20 40L34 20H26L26 8Z"
            fill="url(#bolt-gradient)"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient
              id="bolt-gradient"
              x1="14"
              y1="8"
              x2="34"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#fde047" />
              <stop offset="1" stopColor="#facc15" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 rounded-xl bg-secondary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-bold tracking-tight",
              sizes[size].text,
              textColor
            )}
          >
            Gratitude
          </span>
          <span
            className={cn(
              "font-display font-bold tracking-tight text-primary",
              size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"
            )}
          >
            Ride
          </span>
        </div>
      )}
    </Link>
  );
}
