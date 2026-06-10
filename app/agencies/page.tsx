import { supabase } from '../supabase';
import Link from 'next/link';
import { Building2, ArrowRight, Star } from 'lucide-react';

export default async function AgenciesPage() {
  const { data: agencies } = await supabase
    .from('partners')
    .select(`
      *,
      properties (id)
    `);

  return (
    <main className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">
            <Star size={12} fill="currentColor"/> Verified Partner Network
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            The <span className="text-blue-600 not-italic">Agency</span> Hub.
          </h1>
          <p className="text-slate-500 mt-6 text-xl max-w-2xl font-medium mx-auto md:mx-0">
            Connecting you with the world's leading real estate firms utilizing immersive 3D technology.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agencies?.map((agency) => (
            <Link 
              key={agency.id} 
              href={`/agencies/${agency.id}`}
              className="group bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all border border-slate-100 flex flex-col items-center text-center"
            >
              <div className="h-20 w-full mb-8 flex items-center justify-center">
                {agency.logo_url ? (
                  <img src={agency.logo_url} className="h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" alt={agency.name} />
                ) : (
                  <Building2 size={48} className="text-slate-200" />
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">{agency.name}</h2>
              <p className="text-blue-600 font-bold text-sm tracking-widest uppercase">
                {agency.properties?.length || 0} Active Listings
              </p>
              
              <div className="mt-8 px-8 py-4 bg-slate-900 rounded-full text-[10px] font-black text-white group-hover:bg-blue-600 transition-all flex items-center gap-2 uppercase tracking-widest">
                Browse Portfolio <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}