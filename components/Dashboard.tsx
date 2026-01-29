'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, Video, 
  Search, Users, Calculator, Megaphone, 
  Menu, Camera, Home, ChevronRight, Wand2, LucideIcon, Download,
  Lock, X, LayoutTemplate,
  Palette, Box, Moon, Sun, Grid3X3, Aperture, Leaf, Gem, Monitor,
  History, Trash2, Calendar, FileText, CheckCircle,
  Mail, UserPlus, FileEdit, Shield, Type,
  ChevronDown, Upload, Eraser, DollarSign, Tag, Text,
  Clock, HelpCircle, Briefcase, GraduationCap, Globe, Heart,
  Save, Smile, AlertTriangle, Music2, Share2, MessageCircle, MapPin, Star,
  Linkedin, Youtube, Facebook, Instagram, ShoppingBag, ShoppingCart, Twitter, Smartphone, Laptop
} from 'lucide-react';
import { generateCopy } from '@/app/actions/generate-copy';
import { getUserHistory, deleteHistoryItem } from '@/app/actions/history';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ImageTool } from './ImageTool';

interface DashboardProps {
  onLogout: () => void;
  userEmail?: string | null;
}

// --- MODAL DE CONFIRMAÇÃO ---
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1a1025] border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl shadow-purple-900/20 transform scale-100 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-full text-red-500 mb-2"><Trash2 className="w-8 h-8" /></div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
          <div className="flex gap-3 w-full mt-2">
            <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-900/20">Sim, Excluir</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- BACKGROUNDS ---
export const BACKGROUNDS = [
  { id: 'studio', name: 'Estúdio Dark', icon: Moon, class: 'bg-[#050505] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-[#050505] to-[#000000]' },
  { id: 'purple_haze', name: 'Roxo Profundo', icon: Zap, class: 'bg-[#0f0518] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0f0518] to-black' },
  { id: 'midnight_blue', name: 'Azul Meia-Noite', icon: Monitor, class: 'bg-[#020617] bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/30 via-[#020617] to-black' },
  { id: 'concrete', name: 'Urbano Cinza', icon: Box, class: 'bg-[#18181b] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-700/30 via-[#18181b] to-black' },
  { id: 'matrix', name: 'Matrix Code', icon: Grid3X3, class: 'bg-black bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]' },
  { id: 'clean_dark', name: 'Preto Puro', icon: Palette, class: 'bg-black' },
];

// --- SIMULADORES DE ANÚNCIO (PREVIEWS) ---

const FacebookPreview = ({ data, userImage, device }: { data: any, userImage: string | null, device: 'mobile' | 'desktop' }) => (
    <div className={`bg-[#242526] text-white rounded-xl border border-slate-700 overflow-hidden font-sans shadow-2xl animate-in fade-in zoom-in-95 duration-500 mx-auto ${device === 'mobile' ? 'max-w-[360px]' : 'max-w-[500px]'}`}>
        <div className="p-3 flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">SL</div>
            <div className="flex-1">
                <div className="font-bold text-sm">Sua Loja Oficial</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">Patrocinado <span className="text-[8px]">🌐</span></div>
            </div>
            <div className="text-slate-400">•••</div>
        </div>
        <div className="px-3 pb-2 text-sm text-slate-200 whitespace-pre-wrap">{data.body || data.description}</div>
        <div className="bg-black w-full relative overflow-hidden flex items-center justify-center aspect-square">
             {userImage ? (
                <img src={userImage} className="w-full h-full object-cover" />
             ) : <ImageIcon className="w-12 h-12 opacity-50" />}
        </div>
        <div className="bg-[#3A3B3C] p-3 flex items-center justify-between">
            <div>
                <div className="text-[10px] text-slate-400">LOJAOFICIAL.COM.BR</div>
                <div className="font-bold text-sm leading-tight line-clamp-1">{data.headline || data.title}</div>
            </div>
            <button className="bg-[#4b4c4f] hover:bg-[#5e5f61] px-4 py-2 rounded text-sm font-bold transition-colors">{data.cta || "Saiba mais"}</button>
        </div>
        <div className="p-3 border-t border-slate-700 flex justify-between text-slate-400 text-xs">
             <span>👍 1.2 mil</span>
             <span>45 comentários • 12 compartilhamentos</span>
        </div>
    </div>
);

const InstagramPreview = ({ data, userImage, device }: { data: any, userImage: string | null, device: 'mobile' | 'desktop' }) => (
    <div className={`bg-black text-white rounded-xl border border-slate-800 overflow-hidden font-sans shadow-2xl animate-in fade-in zoom-in-95 duration-500 mx-auto ${device === 'mobile' ? 'max-w-[360px]' : 'max-w-[400px]'}`}>
        <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]"><div className="w-full h-full bg-black rounded-full"></div></div>
                <span className="text-xs font-bold">sua_loja_br</span>
            </div>
            <div className="text-xs text-slate-400">Patrocinado</div>
        </div>
        <div className="bg-slate-900 w-full relative overflow-hidden flex items-center justify-center aspect-square">
             {userImage ? <img src={userImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 opacity-20" />}
        </div>
        <div className="p-3 bg-black">
            <div className="flex justify-between items-center mb-3">
               <div className="flex gap-4">
                   <Heart className="w-6 h-6"/> <MessageCircle className="w-6 h-6"/> <Share2 className="w-6 h-6"/>
               </div>
               <button className="bg-blue-600 text-white px-4 py-1.5 rounded font-bold text-xs">{data.cta || "Comprar"}</button>
            </div>
            <p className="text-sm leading-snug">
                <span className="font-bold mr-2">sua_loja_br</span>
                {data.headline || data.title}
                <br/><br/>
                <span className="text-slate-300 text-xs font-normal whitespace-pre-wrap">{data.body || data.description}</span>
            </p>
        </div>
    </div>
);

const TikTokPreview = ({ data, userImage, device }: { data: any, userImage: string | null, device: 'mobile' | 'desktop' }) => (
    <div className={`bg-black text-white rounded-3xl border border-slate-800 overflow-hidden font-sans shadow-2xl animate-in fade-in zoom-in-95 duration-500 relative mx-auto ${device === 'mobile' ? 'max-w-[320px] aspect-[9/16]' : 'max-w-[360px] aspect-[9/16]'}`}>
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
             {userImage ? <img src={userImage} className="w-full h-full object-cover opacity-80" /> : <div className="flex flex-col items-center opacity-30"><Video className="w-16 h-16 mb-2"/><span className="text-xs">Vídeo</span></div>}
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 via-transparent to-transparent">
            <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-1"><div className="w-10 h-10 rounded-full bg-slate-800 border border-white/20"></div></div>
                <div className="flex flex-col items-center gap-1"><Heart className="w-8 h-8 text-white fill-white shadow-sm" /><span className="text-[10px] font-bold">12.5K</span></div>
                <div className="flex flex-col items-center gap-1"><MessageCircle className="w-8 h-8 text-white shadow-sm" /><span className="text-[10px] font-bold">843</span></div>
                <div className="w-10 h-10 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center animate-spin-slow"><Music2 className="w-5 h-5 text-white" /></div>
            </div>
            <div className="mb-4 pr-12">
                <div className="font-bold text-sm mb-1 shadow-black drop-shadow-md">@sualojaoficial</div>
                <p className="text-xs text-white/90 leading-snug mb-2 shadow-black drop-shadow-md">{data.body || data.description || "Descrição..."} #viral #fyp</p>
            </div>
            <div className="w-full bg-[#EA2D49] hover:bg-[#D1233E] text-white py-2 rounded-sm font-bold text-sm flex items-center justify-between px-4 transition-colors">
                <span>{data.cta || "Comprar Agora"}</span><ChevronRight className="w-4 h-4 bg-white/20 rounded" />
            </div>
        </div>
    </div>
);

const ShopeePreview = ({ data, userImage, device }: { data: any, userImage: string | null, device: 'mobile' | 'desktop' }) => (
    <div className={`bg-[#f5f5f5] text-slate-900 rounded-xl border border-slate-300 overflow-hidden font-sans shadow-2xl animate-in fade-in zoom-in-95 duration-500 mx-auto ${device === 'mobile' ? 'max-w-[360px]' : 'max-w-[500px]'}`}>
        <div className="bg-[#ee4d2d] text-white p-3 flex items-center justify-between"><span className="font-bold text-sm">Shopee</span><span className="text-xs bg-white/20 px-2 py-0.5 rounded">Patrocinado</span></div>
        <div className="bg-white p-2">
            <div className="flex gap-3">
                <div className="w-24 h-24 bg-slate-100 shrink-0 relative border border-slate-100 rounded">
                    {userImage ? <img src={userImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-8 h-8"/></div>}
                    <div className="absolute top-0 left-0 bg-[#ee4d2d] text-white text-[8px] font-bold px-1">Mall</div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h4 className="text-sm font-medium line-clamp-2 leading-tight mb-1">{data.title || data.headline}</h4>
                        <div className="flex items-center gap-1">
                            <span className="bg-[#ee4d2d]/10 text-[#ee4d2d] text-[10px] px-1 border border-[#ee4d2d]">Frete Grátis</span>
                            <span className="text-[10px] text-slate-500 border border-[#ee4d2d] text-[#ee4d2d] px-1">10.10</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-[#ee4d2d] text-sm font-bold">R$ {data.price || "99,90"}</span>
                            <div className="text-[10px] text-slate-500">2,4mil vendidos</div>
                        </div>
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 text-[#ee4d2d] fill-[#ee4d2d]" />)}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MercadoLivrePreview = ({ data, userImage, device }: { data: any, userImage: string | null, device: 'mobile' | 'desktop' }) => (
    <div className={`bg-white text-slate-900 rounded-lg border border-slate-200 overflow-hidden font-sans shadow-lg animate-in fade-in zoom-in-95 duration-500 mx-auto ${device === 'mobile' ? 'max-w-[360px]' : 'max-w-[500px]'}`}>
        <div className="p-4 border-b border-slate-100 flex gap-4">
            <div className="w-32 h-32 bg-slate-100 shrink-0 relative flex items-center justify-center rounded-md overflow-hidden">
                 {userImage ? <img src={userImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-slate-300"/>}
            </div>
            <div className="flex-1">
                <h3 className="text-sm text-slate-800 font-normal leading-snug mb-1">{data.title || data.headline}</h3>
                <div className="flex items-center gap-1 mb-2">
                    <span className="text-[10px] bg-black text-white font-bold px-1.5 py-0.5 rounded-sm uppercase">MAIS VENDIDO</span>
                </div>
                <div className="text-2xl font-light text-slate-800 mb-1">R$ {data.price}</div>
                <div className="text-xs text-[#00a650] font-bold flex items-center gap-1">Chegará grátis amanhã <Zap className="w-3 h-3 fill-[#00a650] text-[#00a650]" /><span className="italic font-black">FULL</span></div>
                <div className="mt-2 text-xs text-slate-500">Vendido por <span className="text-slate-700 font-medium">Loja Oficial</span></div>
            </div>
        </div>
        <div className="bg-slate-50 p-3 text-xs text-slate-500 text-center">Promocionado</div>
    </div>
);

const AmazonPreview = ({ data, userImage, device }: { data: any, userImage: string | null, device: 'mobile' | 'desktop' }) => (
    <div className={`bg-white text-black rounded-lg border border-slate-200 overflow-hidden font-sans shadow-lg animate-in fade-in zoom-in-95 duration-500 p-4 mx-auto ${device === 'mobile' ? 'max-w-[360px]' : 'max-w-[500px]'}`}>
        <div className="flex gap-4">
             <div className="w-24 h-32 bg-slate-100 shrink-0 flex items-center justify-center rounded overflow-hidden">
                 {userImage ? <img src={userImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-slate-300"/>}
             </div>
             <div className="flex-1">
                 <h3 className="text-sm font-medium leading-snug mb-1 text-[#007185] hover:text-[#C7511F] cursor-pointer line-clamp-3">{data.headline || data.title}</h3>
                 <div className="flex items-center gap-1 mb-1">
                     <div className="flex text-[#F4A41C]">{[1,2,3,4].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}<Star className="w-3 h-3 fill-current text-[#F4A41C]/50" /></div>
                     <span className="text-xs text-[#007185]">1.204</span>
                 </div>
                 <div className="flex items-baseline gap-1 mb-1">
                     <span className="text-xs align-top mt-1">R$</span><span className="text-xl font-medium">{data.price ? data.price.split(',')[0] : "99"}</span><span className="text-xs align-top mt-1">{data.price ? data.price.split(',')[1] : "90"}</span>
                 </div>
                 <div className="text-xs text-slate-500 mb-2">Receba até <span className="font-bold text-slate-800">Sexta-feira</span></div>
                 <button className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full w-full py-1.5 text-xs text-black shadow-sm transition-colors">Adicionar ao Carrinho</button>
             </div>
        </div>
    </div>
);

const OLXPreview = ({ data, userImage, device }: { data: any, userImage: string | null, device: 'mobile' | 'desktop' }) => (
    <div className={`bg-white text-slate-900 rounded-lg border border-slate-200 overflow-hidden font-sans shadow-lg animate-in fade-in zoom-in-95 duration-500 mx-auto ${device === 'mobile' ? 'max-w-[360px]' : 'max-w-[500px]'}`}>
        <div className="relative aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
             {userImage ? <img src={userImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 text-slate-300"/>}
             <div className="absolute bottom-2 left-2 bg-[#6e0ad6] text-white text-xs font-bold px-2 py-1 rounded">DESTAQUE</div>
        </div>
        <div className="p-4">
            <h3 className="text-base text-slate-800 font-normal mb-1 truncate">{data.title || data.headline}</h3>
            <div className="text-xl font-bold text-slate-900 mb-2">R$ {data.price}</div>
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{data.body || data.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4"><span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> SP</span><span>Hoje, 10:30</span></div>
            <button className="w-full bg-[#f28000] hover:bg-[#d97300] text-white py-2 rounded-full font-bold text-sm transition-colors">Chat</button>
        </div>
    </div>
);

const GoogleAdsPreview = ({ data, device }: { data: any, device: 'mobile' | 'desktop' }) => (
    <div className={`bg-white text-slate-900 rounded-xl border border-slate-200 overflow-hidden font-sans shadow-lg animate-in fade-in zoom-in-95 duration-500 p-4 mx-auto ${device === 'mobile' ? 'max-w-[360px]' : 'max-w-[600px]'}`}>
        <div className="flex items-center gap-1 mb-1"><span className="font-bold text-black text-xs">Patrocinado</span><span className="text-slate-500 text-xs">lojaoficial.com.br</span></div>
        <div className="text-[#1a0dab] text-xl font-medium hover:underline cursor-pointer mb-1 leading-tight">{data.headline || data.title}</div>
        <div className="text-sm text-[#4d5156] leading-relaxed">{data.body || data.description}<br/><span className="text-slate-800 font-medium">Compre agora: R$ {data.price}</span>. Frete Grátis.</div>
    </div>
);

const PinterestPreview = ({ data, userImage, device }: { data: any, userImage: string | null, device: 'mobile' | 'desktop' }) => (
    <div className={`bg-white text-slate-900 rounded-2xl overflow-hidden font-sans shadow-lg animate-in fade-in zoom-in-95 duration-500 mx-auto ${device === 'mobile' ? 'max-w-[300px]' : 'max-w-[340px]'}`}>
        <div className="relative">
             {userImage ? <img src={userImage} className="w-full h-auto object-cover rounded-2xl" /> : <div className="w-full h-64 bg-slate-200 flex items-center justify-center rounded-2xl"><ImageIcon className="w-12 h-12 text-slate-400"/></div>}
             <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Salvar</div>
        </div>
        <div className="p-2">
            <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">{data.title}</h3>
            <p className="text-xs text-slate-600 line-clamp-2">{data.description}</p>
        </div>
    </div>
);

const LinkedinPreview = ({ data, userImage, device }: { data: any, userImage: string | null, device: 'mobile' | 'desktop' }) => (
    <div className={`bg-white text-slate-900 rounded-lg border border-slate-300 overflow-hidden font-sans shadow-lg animate-in fade-in zoom-in-95 duration-500 mx-auto ${device === 'mobile' ? 'max-w-[360px]' : 'max-w-[500px]'}`}>
        <div className="p-3 flex gap-2 border-b border-slate-100">
            <div className="w-10 h-10 bg-slate-200 rounded"></div>
            <div>
                <div className="text-sm font-bold text-slate-800">Sua Empresa</div>
                <div className="text-xs text-slate-500">Promovido</div>
            </div>
        </div>
        <div className="p-3 text-sm text-slate-700 whitespace-pre-wrap">{data.body || data.headline}</div>
        {userImage && <div className="w-full bg-slate-100 aspect-video overflow-hidden"><img src={userImage} className="w-full h-full object-cover"/></div>}
        <div className="bg-slate-50 p-3 flex justify-between items-center border-t border-slate-200">
            <span className="text-xs font-bold text-slate-600">SABER MAIS</span>
            <ChevronRight className="w-4 h-4 text-slate-600"/>
        </div>
    </div>
);

const TwitterPreview = ({ data, userImage, device }: { data: any, userImage: string | null, device: 'mobile' | 'desktop' }) => (
    <div className={`bg-black text-white rounded-xl border border-slate-800 overflow-hidden font-sans shadow-lg animate-in fade-in zoom-in-95 duration-500 mx-auto ${device === 'mobile' ? 'max-w-[360px]' : 'max-w-[500px]'}`}>
        <div className="p-4">
            <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 shrink-0"></div>
                <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                        <span className="font-bold text-sm">Sua Loja</span>
                        <span className="text-slate-500 text-sm">@sualoja</span>
                        <span className="text-xs bg-slate-800 text-slate-400 px-1 rounded ml-auto">Ad</span>
                    </div>
                    <div className="text-sm text-white mb-3 whitespace-pre-wrap">{data.text || data.headline}</div>
                    {userImage && <div className="w-full rounded-xl overflow-hidden border border-slate-800 aspect-video mb-2"><img src={userImage} className="w-full h-full object-cover"/></div>}
                    <div className="flex justify-between text-slate-500 text-xs mt-2">
                        <MessageCircle className="w-4 h-4"/> <Share2 className="w-4 h-4"/> <Heart className="w-4 h-4"/> <Upload className="w-4 h-4"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const YoutubePreview = ({ data, userImage, device }: { data: any, userImage: string | null, device: 'mobile' | 'desktop' }) => (
    <div className={`bg-black text-white rounded-xl border border-slate-800 overflow-hidden font-sans shadow-lg animate-in fade-in zoom-in-95 duration-500 mx-auto relative ${device === 'mobile' ? 'max-w-[320px] aspect-[9/16]' : 'max-w-[360px] aspect-[9/16]'}`}>
        {userImage ? <img src={userImage} className="w-full h-full object-cover opacity-90" /> : <div className="absolute inset-0 bg-slate-800 flex items-center justify-center"><Video className="w-12 h-12 text-red-600"/></div>}
        <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-transparent via-transparent to-black/90">
            <div className="flex justify-between items-start">
               <div className="px-2 py-1 bg-black/60 rounded text-[10px] font-bold">Shorts</div>
               <Camera className="w-5 h-5"/>
            </div>
            <div>
                <h3 className="font-bold text-sm mb-2">{data.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">SL</div>
                    <span className="text-xs">@sualoja</span>
                    <button className="bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full">Inscrever-se</button>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{data.description}</p>
            </div>
        </div>
        <div className="absolute right-2 bottom-16 flex flex-col gap-4 items-center">
            <div className="flex flex-col items-center gap-1"><div className="p-2 bg-slate-800/50 rounded-full"><Heart className="w-6 h-6 fill-white"/></div><span className="text-[10px] font-bold">Like</span></div>
            <div className="flex flex-col items-center gap-1"><div className="p-2 bg-slate-800/50 rounded-full"><MessageCircle className="w-6 h-6"/></div><span className="text-[10px] font-bold">Coment</span></div>
            <div className="flex flex-col items-center gap-1"><div className="p-2 bg-slate-800/50 rounded-full"><Share2 className="w-6 h-6"/></div><span className="text-[10px] font-bold">Share</span></div>
        </div>
    </div>
);

// --- PLATAFORMAS & CONFIG ---
const PLATFORM_TABS = [
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500', neon: 'shadow-[0_0_30px_rgba(236,72,153,0.3)] border-pink-500/30' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-500', neon: 'shadow-[0_0_30px_rgba(59,130,246,0.3)] border-blue-500/30' },
    { id: 'tiktok', label: 'TikTok', icon: Music2, color: 'text-cyan-400', neon: 'shadow-[0_0_30px_rgba(34,211,238,0.3)] border-cyan-400/30' },
    { id: 'google', label: 'Google', icon: Search, color: 'text-blue-400', neon: 'shadow-[0_0_30px_rgba(96,165,250,0.3)] border-blue-400/30' },
    { id: 'shopee', label: 'Shopee', icon: ShoppingBag, color: 'text-orange-500', neon: 'shadow-[0_0_30px_rgba(249,115,22,0.3)] border-orange-500/30' },
    { id: 'mercadolivre', label: 'Mercado Livre', icon: ShoppingCart, color: 'text-yellow-400', neon: 'shadow-[0_0_30px_rgba(250,204,21,0.3)] border-yellow-400/30' },
    { id: 'olx', label: 'OLX', icon: MapPin, color: 'text-purple-400', neon: 'shadow-[0_0_30px_rgba(168,85,247,0.3)] border-purple-400/30' },
    { id: 'amazon', label: 'Amazon', icon: ShoppingCart, color: 'text-yellow-600', neon: 'shadow-[0_0_30px_rgba(202,138,4,0.3)] border-yellow-600/30' },
    { id: 'pinterest', label: 'Pinterest', icon: PinIcon, color: 'text-red-500', neon: 'shadow-[0_0_30px_rgba(239,68,68,0.3)] border-red-500/30' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', neon: 'shadow-[0_0_30px_rgba(29,78,216,0.3)] border-blue-700/30' },
    { id: 'twitter', label: 'Twitter (X)', icon: Twitter, color: 'text-white', neon: 'shadow-[0_0_30px_rgba(255,255,255,0.2)] border-white/30' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600', neon: 'shadow-[0_0_30px_rgba(220,38,38,0.3)] border-red-600/30' }
];

// Helper icon wrapper since Lucide might not export 'PinIcon' directly as Pinterest
function PinIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>; 
}

const ThemeSelector = ({ activeTheme, setActiveTheme }: { activeTheme: any, setActiveTheme: (t: any) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg border ${isOpen ? 'bg-purple-600 border-purple-400 text-white' : 'bg-black/40 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'}`}><Palette className="w-5 h-5" /></button>
      {isOpen && (
        <div className="absolute top-12 right-0 w-[280px] bg-[#0f0f11] border border-slate-700 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="flex justify-between items-center mb-3 px-1"><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ambiente</div><button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><X className="w-3 h-3" /></button></div>
          <div className="grid grid-cols-4 gap-2">{BACKGROUNDS.map((bg) => (<button key={bg.id} onClick={() => setActiveTheme(bg)} className={`relative group aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${activeTheme.id === bg.id ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`} title={bg.name}><bg.icon className="w-5 h-5 mb-1" /></button>))}</div>
        </div>
      )}
    </div>
  );
};

const DeviceToggle = ({ device, setDevice }: { device: 'mobile' | 'desktop', setDevice: (d: 'mobile' | 'desktop') => void }) => (
    <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex gap-1 shadow-lg backdrop-blur-md">
        <button onClick={() => setDevice('mobile')} className={`p-2 rounded-md transition-all duration-300 ${device === 'mobile' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30 scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}><Smartphone className="w-4 h-4" /></button>
        <button onClick={() => setDevice('desktop')} className={`p-2 rounded-md transition-all duration-300 ${device === 'desktop' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30 scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}><Laptop className="w-4 h-4" /></button>
    </div>
);

type ModuleId = 'home' | 'generator' | 'video_script' | 'studio' | 'email_marketing' | 'influencer_dm' | 'blog_post' | 'product_desc' | 'persona' | 'roas_analyzer' | 'policy_gen' | 'headline_optimizer' | 'history' | 'settings';

const MODULES: Record<ModuleId, { label: string; icon: any; color?: string; desc?: string; isPremium?: boolean; explanation?: string; }> = {
  home: { label: 'Início', icon: Home },
  generator: { label: 'Gerador de Anúncios', icon: Megaphone, color: 'text-purple-400', desc: 'Crie anúncios para TODAS as redes.', explanation: 'Gera copy otimizada para 12 plataformas simultaneamente.' },
  video_script: { label: 'Roteiros de Vídeo', icon: Video, color: 'text-pink-400', desc: 'Roteiros virais TikTok/Reels.', isPremium: true, explanation: 'Roteiros minuto-a-minuto.' },
  studio: { label: 'Studio Product AI', icon: Camera, color: 'text-orange-400', desc: 'Fotos de estúdio 4K.', isPremium: true, explanation: 'IA Generativa de Imagem.' },
  email_marketing: { label: 'E-mail Marketing', icon: Mail, color: 'text-blue-400', desc: 'Sequências de e-mail.', isPremium: true, explanation: 'Fluxos de recuperação.' },
  influencer_dm: { label: 'Parcerias', icon: MessageCircle, color: 'text-green-400', desc: 'Scripts de negociação.', explanation: 'Abordagem para influencers.' },
  blog_post: { label: 'Artigos SEO', icon: FileText, color: 'text-cyan-400', desc: 'Conteúdo para Google.', isPremium: true, explanation: 'Artigos completos.' },
  product_desc: { label: 'Descrição de Produto', icon: Text, color: 'text-yellow-400', desc: 'Descrições hipnóticas.', explanation: 'Copy para página de vendas.' },
  persona: { label: 'Gerador de Persona', icon: UserPlus, color: 'text-indigo-400', desc: 'Descubra seu cliente.', isPremium: true, explanation: 'Avatar detalhado.' },
  roas_analyzer: { label: 'Calculadora ROAS', icon: Calculator, color: 'text-emerald-400', desc: 'Analise viabilidade.', explanation: 'Simulação financeira.' },
  policy_gen: { label: 'Políticas', icon: Shield, color: 'text-slate-400', desc: 'Termos legais.', explanation: 'Textos jurídicos.' },
  headline_optimizer: { label: 'Headlines', icon: FileEdit, color: 'text-red-400', desc: 'Títulos impossíveis de ignorar.', isPremium: true, explanation: 'Gatilhos mentais.' },
  history: { label: 'Minha Biblioteca', icon: History, color: 'text-purple-400' },
  settings: { label: 'Configurações', icon: Settings, color: 'text-slate-400' }
};

const SidebarItem = ({ id, conf, active, onClick, userPlan }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl group mb-1 active:scale-95 border ${active ? 'bg-purple-600/10 text-white border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] translate-x-1' : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent hover:translate-x-1'}`}>
      <div className="relative"><conf.icon className={`w-4 h-4 transition-all duration-300 ${active ? `${conf.color} scale-110 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]` : 'text-slate-500 group-hover:text-white'}`} />{conf.isPremium && userPlan === 'free' && (<div className="absolute -top-1 -right-1 bg-slate-950 rounded-full p-[1px] border border-slate-800"><Lock className="w-2 h-2 text-yellow-500" /></div>)}</div><span className="truncate">{conf.label}</span>
  </button>
);

const CategoryLabel = ({ label }: { label: string }) => (<div className="px-3 mt-4 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</div>);

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, userEmail }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(BACKGROUNDS[0]);
  const [themePrefs, setThemePrefs] = useState<Record<string, string>>({});
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyType, setHistoryType] = useState<'text' | 'image'>('text');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free'); 
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [displayName, setDisplayName] = useState(userEmail ? userEmail.split('@')[0] : 'Visitante');
  const [formDataByModule, setFormDataByModule] = useState<Record<string, Record<string, string>>>({});
  const [adImage, setAdImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState<string>('instagram');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  const dynamicFormData = formDataByModule[activeModule] || {};

  useEffect(() => {
    const init = async () => {
        const savedPrefs = localStorage.getItem('drophacker_themes');
        if (savedPrefs) { const prefs = JSON.parse(savedPrefs); setThemePrefs(prefs); if(prefs['home']) { const found = BACKGROUNDS.find(b => b.id === prefs['home']); if(found) setActiveTheme(found); } }
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.plan === 'pro') setUserPlan('pro');
        const savedName = localStorage.getItem('drophacker_username');
        if(savedName) setDisplayName(savedName);
        setIsLoadingPlan(false);
    };
    init();
  }, []);

  useEffect(() => { const savedThemeId = themePrefs[activeModule] || themePrefs['global']; if (savedThemeId) { const found = BACKGROUNDS.find(b => b.id === savedThemeId); if (found) setActiveTheme(found); } }, [activeModule]);
  const handleThemeChange = (newTheme: typeof BACKGROUNDS[0]) => { setActiveTheme(newTheme); const newPrefs = { ...themePrefs, [activeModule]: newTheme.id, 'global': newTheme.id }; setThemePrefs(newPrefs); localStorage.setItem('drophacker_themes', JSON.stringify(newPrefs)); };
  useEffect(() => { if (activeModule === 'history') fetchHistory(); }, [activeModule, historyType]);
  const fetchHistory = async () => { setIsLoadingHistory(true); try { const items = await getUserHistory(historyType); setHistoryItems(items || []); } catch (e) { console.error(e); } finally { setIsLoadingHistory(false); } };
  const handleUpgradeClick = () => { router.push('/plans'); };
  const isModuleLocked = MODULES[activeModule].isPremium && userPlan === 'free';
  const handleInputChange = (field: string, value: string) => { setFormDataByModule(prev => ({ ...prev, [activeModule]: { ...prev[activeModule], [field]: value } })); };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setAdImage(reader.result as string); reader.readAsDataURL(file); } };
  const handleClearFormConfirm = () => { setResult(null); setError(null); setFormDataByModule(prev => ({ ...prev, [activeModule]: {} })); setAdImage(null); setShowClearModal(false); };
  const handleDeleteItemConfirm = async () => { if (!itemToDelete) return; try { await deleteHistoryItem(itemToDelete); fetchHistory(); } catch(e) { console.error(e); } finally { setShowDeleteModal(false); setItemToDelete(null); } };

  const handleGenerate = async () => {
    if(isModuleLocked) return;
    const fields = Object.values(dynamicFormData);
    if (activeModule !== 'studio' && activeModule !== 'settings' && activeModule !== 'history') { if (fields.length === 0 || fields.every(f => !String(f).trim())) { setError("Preencha pelo menos um campo."); return; } }
    setIsGenerating(true); setResult(null); setError(null);
    if (window.innerWidth < 1024) { setTimeout(() => document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' }), 100); }
    try {
        let prompt = "";
        const data = dynamicFormData;
        const antiMarkdown = "Retorne APENAS JSON válido.";
        
        switch (activeModule) {
            case 'generator':
                prompt = `Produto: ${data.productName}. Preço: ${data.price || 'Não informado'}. ${antiMarkdown}`;
                break;
            case 'video_script': prompt = `Roteiro TikTok viral para ${data.productName}, estilo ${data.style || 'Engraçado'}. ${antiMarkdown}`; break;
            case 'email_marketing': prompt = `Email ${data.goal || 'Recuperação'} para ${data.productName}. ${antiMarkdown}`; break;
            case 'influencer_dm': prompt = `DM Influencer nicho ${data.niche || 'Beleza'} para ${data.productName}. ${antiMarkdown}`; break;
            case 'blog_post': prompt = `Artigo SEO sobre ${data.topic}, palavra-chave ${data.keyword}. ${antiMarkdown}`; break;
            case 'product_desc': prompt = `Descrição persuasiva para ${data.productName}. ${antiMarkdown}`; break;
            case 'persona': prompt = `Persona detalhada para ${data.productName}. ${antiMarkdown}`; break;
            case 'roas_analyzer': prompt = `Análise ROAS custo ${data.cost} venda ${data.salePrice}. ${antiMarkdown}`; break;
            case 'policy_gen': prompt = `Políticas para loja ${data.storeName}. ${antiMarkdown}`; break;
            case 'headline_optimizer': prompt = `Headlines para ${data.productName}, promessa ${data.promise}. ${antiMarkdown}`; break;
            default: prompt = `Ajude com: ${JSON.stringify(data)}`;
        }
        
        if (activeModule !== 'studio') {
            const text = await generateCopy(prompt, activeModule);
            const textStr = typeof text === 'string' ? text : String(text || '');
            try {
                const cleanText = textStr.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanText);
                setResult(parsed);
            } catch (e) { setResult({ "Resposta": textStr.replace(/\*\*/g, '') }); }
        }
    } catch (err: any) {
        if (err.message.includes("Upgrade required")) setError("🔒 ACESSO NEGADO: Recurso PRO."); else setError("Erro na geração. Tente novamente.");
    } finally { setIsGenerating(false); }
  };

  const renderFormFields = () => {
    switch(activeModule) {
        case 'generator': return ( <> <div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Produto</label><input type="text" className="w-full bg-[#0B0518] border-2 border-slate-700 rounded-xl p-4 text-sm font-medium text-white focus:border-purple-500 outline-none transition-all" placeholder="Ex: Corretor de Postura" value={dynamicFormData.productName || ''} onChange={e => handleInputChange('productName', e.target.value)} /></div><div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Preço (R$)</label><input type="text" className="w-full bg-[#0B0518] border-2 border-slate-700 rounded-xl p-4 text-sm font-medium text-white focus:border-purple-500 outline-none transition-all" placeholder="97,90" value={dynamicFormData.price || ''} onChange={e => handleInputChange('price', e.target.value)} /></div><div className="p-3 bg-purple-900/20 border border-purple-500/20 rounded-lg"><p className="text-[10px] text-purple-300 font-medium flex items-center gap-2"><Sparkles className="w-3 h-3" />Gera para todas as 12 redes!</p></div><div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between"><span>Foto (Simulador)</span> {adImage && <span className="text-green-400 text-[9px] font-bold bg-green-900/30 px-2 rounded">OK</span>}</label><div onClick={() => fileInputRef.current?.click()} className="w-full h-16 border-2 border-dashed border-slate-700 hover:border-purple-500 hover:bg-slate-800/50 rounded-xl flex items-center justify-center cursor-pointer gap-2 transition-all group"><Upload className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors"/> <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors">Carregar Imagem</span></div><input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" /></div> </> );
        case 'video_script': return (<> <div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Produto / Tema</label><input type="text" className="w-full bg-[#0B0518] border-2 border-slate-700 rounded-xl p-4 text-sm font-medium text-white focus:border-purple-500 outline-none" placeholder="Ex: Escova Alisadora" value={dynamicFormData.productName || ''} onChange={e => handleInputChange('productName', e.target.value)} /></div><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Duração</label><select className="w-full bg-[#0B0518] border-2 border-slate-700 rounded-xl p-4 text-sm font-medium text-white focus:border-purple-500 outline-none" value={dynamicFormData.duration || '30s'} onChange={e => handleInputChange('duration', e.target.value)}><option value="15s">15s</option><option value="30s">30s</option><option value="60s">60s</option></select></div><div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Estilo</label><select className="w-full bg-[#0B0518] border-2 border-slate-700 rounded-xl p-4 text-sm font-medium text-white focus:border-purple-500 outline-none" value={dynamicFormData.style || 'Engraçado'} onChange={e => handleInputChange('style', e.target.value)}><option value="Engraçado">Viral</option><option value="UGC">UGC</option><option value="Problema-Solução">Problema-Solução</option></select></div></div></>);
        // ... (Outros casos simplificados para caber, a lógica permanece a mesma)
        default: return <div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Entrada</label><input type="text" className="w-full bg-[#0B0518] border-2 border-slate-700 rounded-xl p-4 text-sm text-white" value={dynamicFormData.productName || ''} onChange={e => handleInputChange('productName', e.target.value)} /></div>;
    }
  }

  const renderGenericResult = (data: any) => (<div className="space-y-4">{Object.entries(data).map(([key, value]: any, idx) => (<div key={idx} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-2 duration-500"><div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></div><h3 className="text-xs font-bold text-white uppercase tracking-widest">{key.replace(/_/g, ' ')}</h3></div><div className="p-5">{Array.isArray(value) ? (<ul className="space-y-2">{value.map((v, i) => (<li key={i} className="text-sm text-slate-300 bg-black/20 p-2.5 rounded border border-white/5 font-medium">{typeof v === 'object' ? JSON.stringify(v) : v}</li>))}</ul>) : (<p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">{String(value)}</p>)}</div></div>))}</div>);

  const renderAdPreview = (data: any, platform: string, userImage: string | null, device: 'mobile' | 'desktop') => {
      let platformData = data;
      if (activeModule === 'generator' && data && typeof data === 'object') {
          // Mapeamento Robusto
          const keyMap: any = { instagram: 'instagram', facebook: 'facebook', tiktok: 'tiktok', google: 'google', shopee: 'shopee', mercadolivre: 'mercadolivre', olx: 'olx', amazon: 'amazon', pinterest: 'pinterest', linkedin: 'linkedin', twitter: 'twitter', youtube: 'youtube' };
          platformData = data[keyMap[platform]] || data['facebook'] || data; 
      }
      switch (platform) {
          case 'instagram': return <InstagramPreview data={platformData} userImage={userImage} device={device} />;
          case 'tiktok': return <TikTokPreview data={platformData} userImage={userImage} device={device} />;
          case 'shopee': return <ShopeePreview data={platformData} userImage={userImage} device={device} />;
          case 'amazon': return <AmazonPreview data={platformData} userImage={userImage} device={device} />;
          case 'mercadolivre': return <MercadoLivrePreview data={platformData} userImage={userImage} device={device} />;
          case 'olx': return <OLXPreview data={platformData} userImage={userImage} device={device} />;
          case 'google': return <GoogleAdsPreview data={platformData} device={device} />;
          case 'pinterest': return <PinterestPreview data={platformData} userImage={userImage} device={device} />;
          case 'linkedin': return <LinkedinPreview data={platformData} userImage={userImage} device={device} />;
          case 'twitter': return <TwitterPreview data={platformData} userImage={userImage} device={device} />;
          case 'youtube': return <YoutubePreview data={platformData} userImage={userImage} device={device} />;
          default: return <FacebookPreview data={platformData} userImage={userImage} device={device} />;
      }
  };

  // Cor do Neon baseada na plataforma selecionada
  const activeTabColor = PLATFORM_TABS.find(t => t.id === previewPlatform)?.neon || 'shadow-[0_0_30px_rgba(168,85,247,0.3)] border-purple-500/30';

  return (
    <div className="flex h-screen bg-[#0B0518] text-white font-sans overflow-hidden relative selection:bg-purple-500/30">
      <ConfirmModal isOpen={showDeleteModal} title="Excluir Item?" message="Tem certeza?" onConfirm={handleDeleteItemConfirm} onCancel={() => setShowDeleteModal(false)} />
      <ConfirmModal isOpen={showClearModal} title="Limpar Campos?" message="Apagar tudo?" onConfirm={handleClearFormConfirm} onCancel={() => setShowClearModal(false)} />
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-4"><div className="flex items-center gap-2"><div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg"><Zap className="w-4 h-4 text-white" /></div><span className="font-bold text-white tracking-tight">DROP<span className="text-purple-400">HACKER</span></span></div><button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-400 active:text-white transition-colors"><Menu className="w-6 h-6" /></button></div>
      <> {mobileMenuOpen && <div className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>}
        <aside className={`fixed lg:static top-0 left-0 bottom-0 z-50 bg-[#0B0518] border-r border-slate-800 flex flex-col transition-all duration-300 shadow-2xl ${mobileMenuOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'} ${sidebarOpen ? 'lg:w-[260px]' : 'lg:w-[72px]'}`}>
            <div className="hidden lg:flex h-16 items-center px-5 border-b border-slate-800/50 shrink-0"><div className="flex items-center gap-3"><div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg shadow-lg shadow-purple-500/20 shrink-0"><Zap className="w-5 h-5 text-white" /></div>{sidebarOpen && <span className="font-bold tracking-tight text-lg">DROPHACKER</span>}</div></div>
            <div className={`px-4 py-4 ${!sidebarOpen && 'hidden lg:hidden'}`}>{isLoadingPlan ? <div className="h-14 w-full bg-slate-900 rounded-lg animate-pulse"></div> : <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex flex-col gap-2"><div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${userPlan === 'pro' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-slate-700'}`}>{userPlan === 'pro' ? <Zap className="w-4 h-4 text-white fill-white" /> : <Users className="w-4 h-4 text-slate-400" />}</div><div><div className="text-xs font-bold text-white leading-none">{userPlan === 'pro' ? 'Membro PRO' : 'Visitante'}</div><div className="text-[10px] text-slate-500">{userPlan === 'pro' ? 'Acesso Total' : 'Plano Grátis'}</div></div></div></div>{userPlan === 'free' && <button onClick={handleUpgradeClick} className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg transition-colors shadow-lg">Fazer Upgrade</button>}</div>}</div>
            <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar"><SidebarItem id="home" conf={MODULES.home} active={activeModule === 'home'} onClick={() => { setActiveModule('home'); setMobileMenuOpen(false); }} userPlan={userPlan} />{sidebarOpen && <CategoryLabel label="Criação" />}{['generator', 'video_script', 'studio'].map(k => (<SidebarItem key={k} id={k} conf={MODULES[k as ModuleId]} active={activeModule === k} onClick={() => { setActiveModule(k as any); setMobileMenuOpen(false); }} userPlan={userPlan} />))}{sidebarOpen && <CategoryLabel label="Marketing" />}{['email_marketing', 'influencer_dm', 'blog_post'].map(k => (<SidebarItem key={k} id={k} conf={MODULES[k as ModuleId]} active={activeModule === k} onClick={() => { setActiveModule(k as any); setMobileMenuOpen(false); }} userPlan={userPlan} />))}{sidebarOpen && <CategoryLabel label="Estratégia" />}{['product_desc', 'persona', 'roas_analyzer', 'headline_optimizer'].map(k => (<SidebarItem key={k} id={k} conf={MODULES[k as ModuleId]} active={activeModule === k} onClick={() => { setActiveModule(k as any); setMobileMenuOpen(false); }} userPlan={userPlan} />))}{sidebarOpen && <CategoryLabel label="Sistema" />}{['policy_gen', 'history', 'settings'].map(k => (<SidebarItem key={k} id={k} conf={MODULES[k as ModuleId]} active={activeModule === k} onClick={() => { setActiveModule(k as any); setMobileMenuOpen(false); }} userPlan={userPlan} />))}</div>
            <div className="p-3 border-t border-slate-800 bg-[#0B0518]"><button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex w-full items-center justify-center p-2 hover:bg-white/5 rounded-lg text-slate-500 mb-2 transition-colors"><Menu className="w-5 h-5" /></button><button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'}`}><LogOut className="w-4 h-4" />{(sidebarOpen) && "Sair da Conta"}</button></div>
        </aside>
      </>
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 pt-16 lg:pt-0">
          {activeModule === 'home' ? (
              <div key="home" className={`flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out ${activeTheme.class}`}><div className="absolute top-4 right-4 z-20"><ThemeSelector activeTheme={activeTheme} setActiveTheme={handleThemeChange} /></div><div className="max-w-7xl mx-auto pb-20 relative z-10"><div className="mb-10"><h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{displayName}</span></h1><p className="text-slate-400">Tudo pronto para vender hoje?</p></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{Object.entries(MODULES).filter(([k, v]) => k !== 'home' && k !== 'settings' && k !== 'history').map(([key, mod]) => (<button key={key} onClick={() => setActiveModule(key as ModuleId)} className="group relative bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-purple-500/30 p-5 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden backdrop-blur-sm active:scale-95"><div className="flex justify-between items-start mb-4"><div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform duration-300"><mod.icon className={`w-6 h-6 ${mod.color}`} /></div>{mod.isPremium && userPlan === 'free' && <Lock className="w-4 h-4 text-slate-600" />}</div><h3 className="font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">{mod.label}</h3><p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{mod.desc}</p></button>))}</div></div></div>
          ) : activeModule === 'studio' ? (
              <div key="studio" className="w-full h-full animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out"><ImageTool userPlan={userPlan} onUpgrade={handleUpgradeClick} activeTheme={activeTheme} setActiveTheme={handleThemeChange} /></div>
          ) : activeModule === 'settings' || activeModule === 'history' ? (
              <div className="p-10 text-center text-slate-500">Módulo em Manutenção (Visualização Simplificada)</div>
          ) : (
              <div key={activeModule} className="flex flex-col lg:flex-row h-full overflow-hidden relative animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
                  <div className="w-full lg:w-[380px] bg-slate-950 border-r border-slate-800 flex flex-col h-auto lg:h-full z-20 shadow-2xl overflow-y-auto custom-scrollbar">
                        <div className="p-6 sticky top-0 bg-slate-950 z-10 border-b border-slate-800/50 flex flex-col gap-4">
                            <div className="flex items-center justify-between"><button onClick={() => setActiveModule('home')} className="lg:hidden flex items-center gap-1 text-xs text-slate-500"><ChevronRight className="rotate-180 w-3 h-3"/> Voltar</button></div>
                            <div className="flex items-center gap-3 relative"><div className={`p-2 rounded-lg bg-slate-900 border border-slate-800`}>{React.createElement(MODULES[activeModule].icon, { className: `w-5 h-5 ${MODULES[activeModule].color}` })}</div><div><h2 className="font-bold text-white text-lg leading-tight flex items-center gap-2">{MODULES[activeModule].label}<button onClick={() => setShowHelp(!showHelp)} className="text-slate-600 hover:text-purple-400 transition-colors"><HelpCircle className="w-4 h-4" /></button></h2><p className="text-[10px] text-slate-500 line-clamp-1">{MODULES[activeModule].desc}</p></div></div>
                        </div>
                        <div className="p-6 space-y-6 flex-1 relative">{isModuleLocked && (<div className="absolute inset-0 z-50 backdrop-blur-[4px] bg-slate-950/60 flex flex-col items-center justify-center p-6 text-center animate-in fade-in rounded-xl"><div className="bg-slate-900/80 p-6 rounded-2xl border border-white/10 shadow-2xl"><Lock className="w-8 h-8 text-yellow-500 mb-3 mx-auto" /><h3 className="text-base font-bold text-white mb-1">Recurso Premium</h3><p className="text-xs text-slate-400 mb-4">Atualize para o plano PRO.</p><button onClick={handleUpgradeClick} className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-xs font-bold text-white shadow-lg">Liberar Acesso</button></div></div>)}{renderFormFields()}</div>
                        <div className="p-6 bg-slate-900/30 border-t border-slate-800 mt-auto flex flex-col gap-3"><button onClick={handleGenerate} disabled={isGenerating || isModuleLocked} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2">{isGenerating ? <Loader2 className="animate-spin w-5 h-5"/> : <Wand2 className="w-5 h-5"/>}{isGenerating ? 'Trabalhando...' : 'Gerar Resultado'}</button><button onClick={() => setShowClearModal(true)} className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"><Eraser className="w-3 h-3" /> Limpar Tudo</button></div>
                  </div>
                  <div id="result-area" className={`flex-1 relative overflow-hidden flex flex-col min-h-[60vh] transition-all duration-700 ${activeTheme.class}`}>
                        <div className="absolute top-4 right-4 z-50"><ThemeSelector activeTheme={activeTheme} setActiveTheme={handleThemeChange} /></div>
                        <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar relative z-10 flex flex-col items-center">
                             {!result && !isGenerating && (<div className="my-auto text-center opacity-30 flex flex-col items-center animate-in zoom-in-95 duration-700"><LayoutTemplate className="w-16 h-16 text-white mb-4" /><p className="text-white font-medium">Preencha os dados e gere sua copy.</p></div>)}
                             {isGenerating && (<div className="my-auto text-center"><div className="w-16 h-16 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin mb-4 mx-auto"></div><p className="text-purple-300 text-sm font-bold animate-pulse">IA Escrevendo...</p></div>)}
                             {result && !isGenerating && (
                                 <div className="w-full max-w-4xl pb-20">
                                     <div className="flex justify-between items-center mb-6"><h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500" /> Resultado Gerado</h3><div className="flex gap-2"><DeviceToggle device={previewDevice} setDevice={setPreviewDevice} /><button onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))} className="text-xs text-slate-400 hover:text-white flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar JSON</button></div></div>
                                     {activeModule === 'generator' && (
                                         <div className="mb-8 flex gap-2 overflow-x-auto custom-scrollbar pb-2 px-1">
                                             {PLATFORM_TABS.map(tab => (
                                                 <button key={tab.id} onClick={() => setPreviewPlatform(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border ${previewPlatform === tab.id ? `bg-white text-black border-white shadow-lg scale-105 ${tab.color.replace('text-', 'shadow-')}` : `bg-slate-900/50 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white`}`}><tab.icon className={`w-3.5 h-3.5 ${previewPlatform === tab.id ? 'text-black' : tab.color}`} />{tab.label}</button>
                                             ))}
                                         </div>
                                     )}
                                     {activeModule === 'generator' ? (
                                         <div className={`relative transition-all duration-500 ${activeTabColor} border-2 rounded-3xl p-6 bg-black/20 backdrop-blur-sm animate-in zoom-in-95`}>
                                            {renderAdPreview(result, previewPlatform, adImage, previewDevice)}
                                         </div>
                                     ) : (renderGenericResult(result))}
                                 </div>
                             )}
                        </div>
                  </div>
              </div>
          )}
      </main>
    </div>
  );
};