import { supabase } from "./supabase";

export async function nextQuoteNumber() {
  const year = new Date().getFullYear();
  const { count } = await supabase.from("Quote").select("*", { count: "exact", head: true }).like("number", `SAB-${year}-%`);
  return `SAB-${year}-${String((count || 0) + 1).padStart(6, "0")}`;
}

export async function nextWarrantyNumber() {
  const year = new Date().getFullYear();
  const { count } = await supabase.from("Warranty").select("*", { count: "exact", head: true }).like("number", `GAR-${year}-%`);
  return `GAR-${year}-${String((count || 0) + 1).padStart(6, "0")}`;
}