'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useRouter } from 'next/navigation';
import LoadingScreen from './loading-screen';
import { Menu, X, Plus } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <title>Musha360 | 3D Property Discovery</title>
      </head>
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        <LoadingScreen />

        {/* PREMIUM GLASSMOPHISM HEADER */}
        <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-xl border-b border-white/20 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
            
            {/* LOGO */}
            <Link href="/" className="relative z-[110] flex items-center">
              <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900">
                MUSHA<span className="text-blue-600">360</span>
              </span>
            </Link>
            
            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-10">
              <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-colors">Home</Link>
              <Link href="/agencies" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-colors">Agencies</Link>
              <Link href="/#listings" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-colors">Listings</Link>
              
              {user ? (
                <div className="flex items-center gap-6 border-l pl-8 border-slate-200">
                  <Link href="/admin/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Dashboard</Link>
                  <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Exit</button>
                  <Link href="/admin/add-property" className="bg-slate-900 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl">
                    Add Listing
                  </Link>
                </div>
              ) : (
                <Link href="/login" className="bg-slate-900 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl">
                  Agent Login
                </Link>
              )}
            </div>

            {/* MOBILE MENU TOGGLE */}
            <button 
              className="md:hidden relative z-[110] p-2 text-slate-900" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* MOBILE OVERLAY MENU */}
          <div className={`fixed inset-0 bg-white z-[105] transition-transform duration-500 ease-in-out flex flex-col p-10 pt-32 gap-8 ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
             <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter uppercase italic">Home</Link>
             <Link href="/agencies" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter uppercase italic">Agencies</Link>
             <Link href="/#listings" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter uppercase italic">Inventory</Link>
             
             <div className="mt-auto space-y-4">
               {user ? (
                 <>
                   <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-blue-600 font-bold uppercase tracking-widest text-xs">Admin Dashboard</Link>
                   <Link href="/admin/add-property" onClick={() => setIsMenuOpen(false)} className="w-full bg-slate-900 text-white py-6 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest">
                     <Plus size={20}/> New Listing
                   </Link>
                   <button onClick={handleLogout} className="w-full text-red-500 font-bold uppercase tracking-widest text-xs py-4">Sign Out</button>
                 </>
               ) : (
                 <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full bg-slate-900 text-white py-6 rounded-2xl flex items-center justify-center font-black uppercase tracking-widest">
                   Agent Login
                 </Link>
               )}
             </div>
          </div>
        </nav>

        {/* We remove the pt-20 here so the background flows behind the nav */}
        <div className="">
          {children}
        </div>
      </body>
    </html>
  );
}