import { supabase } from "$lib/supabase.js";
import { sessao } from "$lib/conta/Sessao.svelte.js";

export const onboardingRemoto = $state({
  perfil: null,
  trilhas: [],
  carregando: false,
  salvando: false,
  ultimaFalha: null,
});

export async function carregarOnboarding() {
  const sb = supabase();
  if (!sb || !sessao.conectado) return "Entre na conta para continuar.";
  onboardingRemoto.carregando = true;
  onboardingRemoto.ultimaFalha = null;
  try {
    const [perfil, trilhas] = await Promise.all([
      sb.from("perfil").select("onboarding, onboarding_concluido_em").eq("id", sessao.usuario.id).maybeSingle(),
      sb.from("trilha").select("id, rotulo, categoria").order("ordem"),
    ]);
    if (perfil.error || trilhas.error) throw new Error("Não consegui preparar suas escolhas agora.");
    onboardingRemoto.perfil = perfil.data;
    onboardingRemoto.trilhas = trilhas.data ?? [];
    return null;
  } catch (erro) {
    onboardingRemoto.ultimaFalha = erro.message ?? "Não consegui preparar suas escolhas agora.";
    return onboardingRemoto.ultimaFalha;
  } finally {
    onboardingRemoto.carregando = false;
  }
}

export async function salvarOnboarding(respostas) {
  const sb = supabase();
  if (!sb || !sessao.conectado) return "Entre na conta para guardar suas escolhas.";
  onboardingRemoto.salvando = true;
  onboardingRemoto.ultimaFalha = null;
  try {
    const onboarding = {
      versao: 1,
      objetivo: respostas.objetivo ?? null,
      experiencia: respostas.experiencia ?? null,
      tipoCaminho: respostas.tipoCaminho ?? null,
      interesses: respostas.interesses ?? [],
      ritmo: respostas.ritmo ?? null,
    };
    const { error } = await sb.from("perfil").upsert({
      id: sessao.usuario.id,
      onboarding,
      onboarding_concluido_em: new Date().toISOString(),
    }, { onConflict: "id" });
    if (error) throw new Error("Não consegui guardar suas escolhas.");
    onboardingRemoto.perfil = { onboarding, onboarding_concluido_em: new Date().toISOString() };
    return null;
  } catch (erro) {
    onboardingRemoto.ultimaFalha = erro.message ?? "Não consegui guardar suas escolhas.";
    return onboardingRemoto.ultimaFalha;
  } finally {
    onboardingRemoto.salvando = false;
  }
}
