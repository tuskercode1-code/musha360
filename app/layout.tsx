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

        {/* HEADER */}
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${isMenuOpen ? 'bg-white' : 'bg-white/70 backdrop-blur-xl border-b border-white/20'}`}>
          <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
            
            {/* LOGO */}
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="relative z-[110] flex items-center">
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

            {/* MOBILE MENU TOGGLE BUTTON */}
            <button 
              className="md:hidden relative z-[110] p-2 text-slate-900" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* FULL SCREEN MOBILE MENU OVERLAY */}
          {/* Changed to fixed inset-0 to cover the whole screen, added solid bg-white */}
          <div className={`fixed inset-0 bg-white z-[105] transition-transform duration-500 ease-in-out flex flex-col px-10 pt-32 pb-10 gap-8 h-screen w-screen ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
             
             {/* Navigation Links */}
             <div className="flex flex-col gap-6 mt-4">
               <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 border-b border-slate-100 pb-4">Home</Link>
               <Link href="/agencies" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 border-b border-slate-100 pb-4">Agencies</Link>
               <Link href="/#listings" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 border-b border-slate-100 pb-4">Inventory</Link>
             </div>
             
             {/* Authentication Actions */}
             <div className="mt-auto space-y-4">
               {user ? (
                 <>
                   <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-center text-blue-600 font-black uppercase tracking-widest text-xs py-2">
                     Admin Dashboard
                   </Link>
                   <Link href="/admin/add-property" onClick={() => setIsMenuOpen(false)} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] flex items-center justify-center gap-2 font-black uppercase tracking-widest shadow-xl">
                     <Plus size={20}/> New Listing
                   </Link>
                   <button onClick={handleLogout} className="w-full text-red-500 font-black uppercase tracking-widest text-xs py-4">
                     Sign Out
                   </button>
                 </>
               ) : (
                 <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] flex items-center justify-center font-black uppercase tracking-widest shadow-2xl mt-8">
                   Agent Login
                 </Link>
               )}
             </div>
          </div>
        </nav>

        <div>
          {children}
        </div>
      </body>
    </html>
  );
}