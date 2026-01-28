import { createClient } from '@/utils/supabase/server'
import React from 'react'

export default async function TestConnectionPage() {
  const supabase = await createClient()
  
  let connectionStatus = 'pending'
  let errorMessage = ''
  let details = ''

  try {
    // Teste 1: Verificar conexão básica e Auth
    const { error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      throw new Error(`Erro de Autenticação: ${authError.message}`)
    }

    // Teste 2: Tentativa de leitura do banco de dados
    // Tentamos ler uma tabela que provavelmente não existe apenas para ver se a conexão bate no DB
    // Se o erro for "relation does not exist" (42P01), significa que CONECTOU, mas a tabela não existe (o que é bom para teste de conexão)
    // Se o erro for de conexão (ex: 500), falhou.
    const { error: dbError, status } = await supabase.from('test_table_check').select('*').limit(1)

    // Status 0 ou 500 geralmente indicam falha de rede/configuração. 
    if (status === 0 || status >= 500) {
      throw new Error(`Erro Crítico de DB: Código ${status}. ${dbError?.message}`)
    }

    connectionStatus = 'success'
  } catch (error: any) {
    connectionStatus = 'error'
    errorMessage = error.message
    details = JSON.stringify(error, null, 2)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-sans bg-slate-950 text-white">
      <div className="max-w-md w-full bg-slate-900 shadow-2xl rounded-xl p-6 border border-slate-800">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Status da Conexão Supabase</h1>

        {connectionStatus === 'success' ? (
          <div className="bg-green-900/30 border border-green-500/50 text-green-400 px-4 py-4 rounded-lg relative text-center">
            <strong className="font-bold block mb-1 text-lg">✓ CONECTADO</strong>
            <span className="block sm:inline text-sm">
              CONEXÃO BEM SUCEDIDA: Banco de Dados Ativo
            </span>
          </div>
        ) : (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-4 rounded-lg relative break-words">
            <strong className="font-bold block mb-1 text-lg">✕ FALHA</strong>
            <span className="block mb-2 font-medium">{errorMessage}</span>
            {details && (
              <pre className="text-xs bg-black/30 p-3 rounded overflow-x-auto border border-white/10 mt-2">
                {details}
              </pre>
            )}
          </div>
        )}

        <div className="mt-8 text-xs text-slate-500 text-center flex flex-col gap-2">
          <div className="flex justify-between border-b border-slate-800 pb-2">
             <span>NEXT_PUBLIC_SUPABASE_URL</span>
             <span>{process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Ausente'}</span>
          </div>
          <div className="flex justify-between pt-1">
             <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
             <span>{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Ausente'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}