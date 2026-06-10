import { supabase } from './supabase';
import Link from 'next/link';
import { MapPin, Search, Building2, Star, ChevronDown, DollarSign, Box, Sparkles } from 'lucide-react';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string, type?: string, listing?: string, max_price?: string }>;
}) {
  const sParams = await searchParams;
  const queryTerm = sParams.query || '';
  const typeFilter = sParams.type || 'RESIDENTIAL'; 
  const listingFilter = sParams.listing || 'BUY';   
  const maxPriceFilter = sParams.max_price || '';

  let query = supabase.from('properties').select(`
      *, 
      property_media (*),
      partners (*)
    `)
    .eq('property_type', typeFilter)
    .eq('listing_type', listingFilter);

  if (queryTerm) query = query.ilike('city', `%${queryTerm}%`);
  if (maxPriceFilter) query = query.lte('price', parseInt(maxPriceFilter));

  const { data: properties } = await query;
  const { data: partners } = await supabase.from('partners').select('name, logo_url');

  const priceOptions = listingFilter === 'BUY' 
    ? [1000000, 2000000, 5000000, 10000000, 20000000] 
    : [5000, 10000, 20000, 50000];

  return (
    <main className="bg-white min-h-screen">
      {/* HERO SECTION WITH NEW VILLA BACKGROUND */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-slate-950 overflow-hidden py-20">
        <img 
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 scale-105" 
          alt="Luxury Villa Background"
        />
        
        {/* Subtle radial gradient to focus attention on the center */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(2,6,23,0.6)_100%)]"></div>

        <div className="relative z-10 text-center px-6 w-full max-w-6xl">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-pulse backdrop-blur-sm">
            <Sparkles size={14} /> Welcome to Musha360
          </div>

          <h1 className="text-white text-5xl md:text-8xl font-black mb-6 tracking-tighter italic leading-[0.9] uppercase drop-shadow-2xl">
            Step Inside <br/> <span className="text-blue-500 not-italic">From Anywhere.</span>
          </h1>
          
          <p className="text-white/70 text-lg md:text-xl font-medium mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Musha360 is the leading destination for high-fidelity property exploration. Physically navigate 
            <span className="text-white font-bold mx-1 border-b border-white/20">Residential, Commercial, and Industrial</span> 
            spaces via immersive 3D walkthroughs before you ever set foot on site.
          </p>
          
          {/* SEARCH BAR */}
          <form action="/" method="GET" className="bg-white p-2 rounded-[2rem] md:rounded-full shadow-2xl flex flex-col lg:flex-row items-center gap-1 border border-white/10 backdrop-blur-md">
            <div className="flex-1 flex items-center px-6 gap-3 w-full border-b lg:border-b-0 lg:border-r border-slate-100">
              <Search className="text-slate-400" size={20} />
              <input name="query" defaultValue={queryTerm} placeholder="Which city?" className="w-full py-5 outline-none text-slate-800 font-bold text-lg bg-transparent"/>
            </div>
            <div className="relative flex items-center px-6 gap-3 w-full lg:w-auto min-w-[180px] border-b lg:border-b-0 lg:border-r border-slate-100">
              <Building2 className="text-slate-400" size={20} />
              <select name="type" defaultValue={typeFilter} className="w-full py-5 bg-transparent outline-none font-bold text-slate-800 appearance-none cursor-pointer pr-8 uppercase tracking-widest text-xs">
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="INDUSTRIAL">Industrial</option>
              </select>
              <ChevronDown className="text-slate-400 absolute right-4 pointer-events-none" size={16} />
            </div>
            <div className="relative flex items-center px-6 gap-3 w-full lg:w-auto min-w-[140px] border-b lg:border-b-0 lg:border-r border-slate-100">
              <select name="listing" defaultValue={listingFilter} className="w-full py-5 bg-transparent outline-none font-bold text-blue-600 appearance-none cursor-pointer text-center uppercase tracking-widest text-xs">
                <option value="BUY">For Sale</option>
                <option value="RENT">To Rent</option>
              </select>
            </div>
            <div className="relative flex items-center px-6 gap-3 w-full lg:w-auto min-w-[180px]">
              <DollarSign className="text-slate-400" size={20} />
              <select name="max_price" defaultValue={maxPriceFilter} className="w-full py-5 bg-transparent outline-none font-bold text-slate-800 appearance-none cursor-pointer pr-8 uppercase tracking-widest text-xs">
                <option value="">Any Price</option>
                {priceOptions.map((p) => <option key={p} value={p}>Max ${p.toLocaleString()}</option>)}
              </select>
              <ChevronDown className="text-slate-400 absolute right-4 pointer-events-none" size={16} />
            </div>
            <button type="submit" className="w-full lg:w-auto bg-blue-600 text-white px-12 py-5 rounded-full font-black text-lg shadow-xl hover:bg-blue-700 transition-all uppercase active:scale-95">
              EXPLORE
            </button>
          </form>
        </div>
      </section>

      {/* PARTNER BANNER */}
      {partners && partners.length > 0 && (
        <div className="py-14 bg-white border-b border-slate-100 overflow-hidden relative group">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {[...partners, ...partners, ...partners, ...partners].map((agency, index) => (
              <div key={index} className="flex items-center mx-12 h-10">
                {agency.logo_url ? (
                  <img src={agency.logo_url} className="h-full w-auto object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500" alt={agency.name} />
                ) : (
                  <span className="text-2xl font-black text-slate-200 uppercase italic tracking-tighter">{agency.name}</span>
                )}
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
        </div>
      )}

      {/* LISTINGS GRID */}
      <section id="listings" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-20">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-16">
          Premium <span className="text-blue-600 not-italic">Inventory</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
          {properties?.map((property) => {
            const thumbnail = property.property_media?.find((m: any) => m.is_thumbnail)?.url;
            const agency = property.partners;

            return (
              <div key={property.id} className="group block relative">
                <Link href={`/property/${property.id}`}>
                  <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-500 border border-slate-100 bg-slate-50">
                    <img src={thumbnail || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={property.title}/>
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
                        <div className="bg-blue-600 p-1.5 rounded-lg text-white"><Box size={16} /></div>
                        <span className="font-black text-slate-900 text-xs tracking-widest uppercase">Start 3D Tour</span>
                      </div>
                    </div>
                    <div className="absolute top-8 left-8 bg-slate-900/90 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">
                      {property.property_type}
                    </div>
                  </div>
                </Link>

                {agency && (
                  <div className="absolute top-6 right-6 z-20">
                    <Link href={`/agencies/${agency.id}`}>
                      <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-white/50 hover:scale-110 hover:bg-white transition-all cursor-pointer">
                        {agency.logo_url ? <img src={agency.logo_url} className="h-6 w-auto object-contain" alt={agency.name} /> : <span className="text-[8px] font-black text-slate-900 uppercase">{agency.name}</span>}
                      </div>
                    </Link>
                  </div>
                )}

                <Link href={`/property/${property.id}`}>
                  <div className="px-4">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">${property.price.toLocaleString()}{property.listing_type === 'RENT' && <span className="text-xs text-slate-400 font-bold ml-1">/MO</span>}</h3>
                    <p className="text-xl font-bold text-slate-800 mb-3 tracking-tight leading-none uppercase">{property.title}</p>
                    <p className="text-slate-400 font-bold flex items-center gap-2 text-sm uppercase tracking-wide"><MapPin size={16} className="text-blue-600"/> {property.city}</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}