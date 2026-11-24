import {
  AirVent, Blend, Coffee, CookingPot, Fan, Flame, Heater, Microwave, Package, Refrigerator, Snowflake, Tv, Utensils,
  WashingMachine, Wind, Zap, type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  refrigerator: Refrigerator,
  "washing-machine": WashingMachine,
  microwave: Microwave,
  "air-vent": AirVent,
  tv: Tv,
  "cooking-pot": CookingPot,
  fan: Fan,
  coffee: Coffee,
  flame: Flame,
  blend: Blend,
  snowflake: Snowflake,
  heater: Heater,
  utensils: Utensils,
  wind: Wind,
  zap: Zap,
  package: Package,
};

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && CATEGORY_ICONS[name]) || Package;
  return <Icon className={className} aria-hidden />;
}
