import type { LucideIcon } from "lucide-react";

export interface LandingProps {}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Stat {
  label: string;
  icon: LucideIcon;
  description: string;
}
