'use server'

import { createClient } from "@/utils/supabase/server";

export async function getUserHistory(typeFilter: 'text' | 'image' = 'text') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('user_history')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', typeFilter)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }

  return data;
}

export async function deleteHistoryItem(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  const { error } = await supabase
    .from('user_history')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Segurança: só deleta se for dono

  if (error) throw new Error("Erro ao deletar item");
  
  return { success: true };
}