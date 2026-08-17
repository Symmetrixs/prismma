import { Package, Ticket, Newspaper } from "lucide-react";

export interface ModuleDef {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
}

export interface AccessRecord {
  module_id: number;
  status: string;
  rejection_reason?: string | null;
}

export const moduleIconMap: Record<string, typeof Package> = {
  "asset-tagging": Package,
  ticketing: Ticket,
  "news-editor": Newspaper,
};
