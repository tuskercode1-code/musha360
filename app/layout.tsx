'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useRouter } from 'next/navigation';
import LoadingScreen from './loading-screen';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
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
    router.push('/');
    router.refresh();
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <title>Musha360 | Immersive Property Discovery</title>
        <meta name="description" content="Step inside Residential, Commercial and Industrial listings with 3D walkthroughs." />
      </head>
      <body className={`${inter.className} bg-white text-slate-900`}>
        <LoadingScreen />

        <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 flex items-center">
              MUSHA<span className="text-blue-600">360</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <Link href="/agencies" className="hover:text-blue-600 transition-colors">Agencies</Link>
              
              {user ? (
                <>
                  <Link href="/admin/dashboard" className="text-slate-900 hover:text-blue-600">Dashboard</Link>
                  <button onClick={handleLogout} className="text-red-500 hover:text-red-600">Log Out</button>
                  <Link 
                    href="/admin/add-property" 
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-blue-600 transition-all shadow-md active:scale-95"
                  >
                    Add Listing
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/#listings" className="hover:text-blue-600 transition-colors">Listings</Link>
                  <Link href="/login" className="hover:text-blue-600 transition-colors border-l pl-8 border-slate-200">Agent Login</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}