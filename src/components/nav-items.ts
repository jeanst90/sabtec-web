import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldCheck,
  Package,
  BarChart3,
  Wrench,
  Sparkles,
  FileSpreadsheet,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Painel", shortLabel: "Início", icon: LayoutDashboard },
  { href: "/customers", label: "Clientes", shortLabel: "Clientes", icon: Users },
  { href: "/quotes", label: "Orçamentos", shortLabel: "Orçamentos", icon: FileText },
  { href: "/warranties", label: "Garantias", shortLabel: "Garantias", icon: ShieldCheck },
  { href: "/catalog", label: "Catálogo", shortLabel: "Catálogo", icon: Package },
  { href: "/analytics", label: "Análises", shortLabel: "Análises", icon: BarChart3 },
  { href: "/maintenance", label: "Manutenção", shortLabel: "Manutenção", icon: Wrench },
  { href: "/ai", label: "Assistente IA", shortLabel: "IA", icon: Sparkles },
  { href: "/reports", label: "Relatórios", shortLabel: "Relatórios", icon: FileSpreadsheet },
  { href: "/feedback", label: "Avaliações", shortLabel: "Avaliações", icon: MessageSquare },
  { href: "/settings", label: "Configurações", shortLabel: "Config.", icon: Settings },
];

/** Items shown in the mobile bottom bar (excluding the center FAB). */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  NAV_ITEMS[0], // dashboard
  NAV_ITEMS[2], // quotes
  NAV_ITEMS[3], // warranties
  NAV_ITEMS[1], // customers
];
