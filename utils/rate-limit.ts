// Simple In-Memory Rate Limiter for Server Actions
// Em produção com Vercel/Serverless, o ideal seria usar Redis (Upstash).
// Para este setup, usamos um Map em memória que funciona bem para prevenir loops de scripts imediatos.

type RateLimitRecord = {
  count: number;
  lastRequest: number;
};

const rateLimitMap = new Map<string, RateLimitRecord>();

const WINDOW_SIZE_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requisições por minuto

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(userId);

  if (!record) {
    rateLimitMap.set(userId, { count: 1, lastRequest: now });
    return true;
  }

  // Se passou a janela de tempo, reseta
  if (now - record.lastRequest > WINDOW_SIZE_MS) {
    rateLimitMap.set(userId, { count: 1, lastRequest: now });
    return true;
  }

  // Se ainda está na janela, verifica o limite
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Bloqueado
  }

  // Incrementa
  record.count += 1;
  return true; // Permitido
}