import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  MessageCircle,
  Package,
  PackagePlus,
  ShieldCheck,
  Truck,
  UserCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Zap,
  ShieldCheck,
  MapPin,
  CreditCard,
  MessageCircle,
  Package,
  PackagePlus,
  UserCheck,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || Package;
}
