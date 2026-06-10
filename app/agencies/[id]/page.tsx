import { supabase } from '../../supabase';
import Link from 'next/link';
import { MapPin, Box, ArrowLeft, Building2 } from 'lucide-react';

export default async function AgencyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: agency } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .single();

  const { data: listings } = await supabase
    .from('properties')
    .select(`*, property_media (*)`)
    .eq('partner_id', id);

  if (!agency) return <div className="p-20 text-center font-black uppercase text-slate-400">Agency profile not found.</div>;

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* AGENCY HERO */}
      <section className="bg-slate-900 py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="grid grid-cols-6 gap-4 rotate-12 scale-150">
                {[...Array(30)].map((_, i) => <Building2 key={i} size={120} className="text-white"/>)}
            </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <Link href="/agencies" className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-12 flex items-center gap-2 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Global Network
          </Link>
          
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl mb-10">
             {agency.logo_url ? (
               <img src={agency.logo_url} className="h-16 md:h-24 object-contain" alt={agency.name} />
             ) : (
               <Building2 size={80} className="text-slate-200" />
             )}
          </div>
          
          <h1 className="text-white text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-6">{agency.name}</h1>
          <div className="h-1 w-24 bg-blue-600 rounded-full mb-8"></div>
          <p className="text-slate-400 font-black tracking-[0.4em] uppercase text-xs">Platinum Listing Partner</p>
        </div>
      </section>

      {/* PORTFOLIO GRID */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20">
            <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Inventory <span className="text-blue-600 not-italic">Collection</span></h2>
                <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">Exclusively managed by {agency.name}</p>
            </div>
            <div className="text-slate-900 font-black text-4xl italic">{listings?.length || 0}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
          {listings?.map((property) => {
            const thumbnail = property.property_media?.find((m: any) => m.is_thumbnail)?.url;
            return (
              <Link key={property.id} href={`/property/${property.id}`} className="group block">
                <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-500 border border-slate-100">
                  <img src={thumbnail || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={property.title}/>
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
                      <div className="bg-blue-600 p-1.5 rounded-lg text-white"><Box size={16} /></div>
                      <span className="font-black text-slate-900 text-xs tracking-widest uppercase">Start 3D Tour</span>
                    </div>
                  </div>
                </div>
                <div className="px-4">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">${property.price.toLocaleString()}</h3>
                  <p className="text-xl font-bold text-slate-800 mb-3 tracking-tight leading-none uppercase">{property.title}</p>
                  <p className="text-slate-400 font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                    <MapPin size={16} className="text-blue-600"/> {property.city}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {(!listings || listings.length === 0) && (
            <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-300 font-black uppercase italic tracking-widest text-2xl">Portfolio Empty</p>
            </div>
        )}
      </section>
    </main>
  );
}