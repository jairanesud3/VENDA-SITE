'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Redireciona para o dashboard após sucesso
  return redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    // Opcional: Redirecionar para uma rota específica após confirmar email
    // options: {
    //   emailRedirectTo: `${origin}/auth/callback`,
    // },
  });

  if (error) {
    return { error: error.message };
  }

  // Dependendo da configuração do Supabase, pode logar direto ou pedir confirmação de email.
  // Vamos assumir login direto ou redirecionar para dashboard.
  return redirect("/dashboard");
}