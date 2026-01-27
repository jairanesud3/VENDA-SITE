import React from 'react';
import { BrainCircuit, Camera, ShieldCheck } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section className="py-24 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
            A <span className="text-purple-500 glow-text">"ARMA SECRETA"</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Por que os top players estão migrando para nossa plataforma.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Feature 1 */}
          <div className="reveal delay-100 flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
              <BrainCircuit className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors">Copywriting Hipnótico</h3>
            <p className="text-slate-400">
              Textos focados em dor, desejo e gatilhos mentais que forçam a leitura até o final.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="reveal delay-200 flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-pink-400 transition-colors">Imagens 100% Reais</h3>
            <p className="text-slate-400">
              Mostre seu produto sendo usado por pessoas reais em qualquer cenário (sem precisar contratar modelos).
            </p>
          </div>

          {/* Feature 3 */}
          <div className="reveal delay-300 flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-green-400 transition-colors">Filtro Anti-Bloqueio</h3>
            <p className="text-slate-400">
              Criativos feitos especificamente para passar nas políticas rígidas do Facebook e TikTok.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};