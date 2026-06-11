'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '../../supabase';
import { MapPin, Box, Camera, ChevronRight, MessageSquare, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [property, setProperty] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'3D' | 'PHOTOS'>('3D');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      const { data } = await supabase
        .from('properties')
        .select(`*, property_media (*), partners (*)`)
        .eq('id', id)
        .single();
      
      if (data) {
        setProperty(data);
        const hasMatterport = data.property_media?.some((m: any) => m.type === 'MATTERPORT');
        if (!hasMatterport) setViewMode('PHOTOS');
      }
      setLoading(false);
    }
    fetchProperty();
  }, [id]);

  const handleInquiry = (method: 'WHATSAPP' | 'EMAIL') => {
    const message = `Hi Musha360, I am interested in ${property.title} in ${property.city}. Can I get more information? (Ref: ${id.slice(0,5)})`;
    if (method === 'WHATSAPP') {
      window.open(`https://wa.me/263700000000?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`mailto:info@musha360.com?subject=Property Inquiry: ${property.title}&body=${message}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-black text-slate-200 animate-pulse uppercase tracking-[0.5em]">
      Syncing 3D Space...
    </div>
  );

  if (!property) return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest">Listing not found.</div>;

  const images = property.property_media?.filter((m: any) => m.type === 'IMAGE') || [];
  const matterport = property.property_media?.find((m: any) => m.type === 'MATTERPORT');
  const agency = property.partners;

  return (
    <main className="bg-white min-h-screen pb-32">
      {/* BREADCRUMBS */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 overflow-x-auto whitespace-nowrap no-scrollbar">
          <Link href="/#listings" className="hover:text-blue-600 transition-colors">Collection</Link>
          <ChevronRight size={10} />
          <span className="text-slate-900">{property.property_type}</span>
          <ChevronRight size={10} />
          <span className="text-slate-300">{property.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* MEDIA VIEWER COLUMN */}
          <div className="lg:col-span-8 space-y-6">
            {/* The Media Frame is now completely clear */}
            <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 border-4 border-white">
              {viewMode === '3D' && matterport ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`${matterport.url}&play=1&brand=0&mls=1`} 
                  frameBorder="0" 
                  allowFullScreen 
                  allow="vr" 
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="w-full h-full grid grid-cols-2 gap-1 overflow-y-auto no-scrollbar bg-slate-200">
                  {images.map((img: any) => (
                    <img key={img.id} src={img.url} className={`w-full h-full object-cover ${images.length === 1 ? 'col-span-2' : ''}`} alt="Interior" />
                  ))}
                </div>
              )}
            </div>

            {/* TOGGLE PILL - MOVED BELOW THE FRAME */}
            <div className="flex justify-center pt-2">
              <div className="inline-flex bg-slate-100 p-1.5 rounded-full shadow-inner border border-slate-200">
                {matterport && (
                  <button 
                    onClick={() => setViewMode('3D')} 
                    className={`flex items-center gap-2 px-8 py-4 rounded-full font-black text-[10px] tracking-widest transition-all duration-300 ${viewMode === '3D' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Box size={14} /> 3D WALKTHROUGH
                  </button>
                )}
                <button 
                  onClick={() => setViewMode('PHOTOS')} 
                  className={`flex items-center gap-2 px-8 py-4 rounded-full font-black text-[10px] tracking-widest transition-all duration-300 ${viewMode === 'PHOTOS' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Camera size={14} /> HI-RES PHOTOS
                </button>
              </div>
            </div>
          </div>

          {/* DATA COLUMN */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              <div className="space-y-4">
                {agency && (
                  <Link href={`/agencies/${agency.id}`} className="inline-block px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex items-center gap-3">
                       {agency.logo_url && <img src={agency.logo_url} className="h-4 object-contain grayscale group-hover:grayscale-0 transition-all" alt={agency.name}/>}
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{agency.name}</span>
                    </div>
                  </Link>
                )}
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.85]">{property.title}</h1>
                <p className="flex items-center text-blue-600 font-bold uppercase tracking-widest text-[11px]">
                  <MapPin className="mr-2" size={14} /> {property.address}, {property.city}
                </p>
                <div className="text-6xl font-black text-slate-900 tracking-tighter pt-4">
                  ${property.price.toLocaleString()}
                  {property.listing_type === 'RENT' && <span className="text-xl text-slate-300 ml-2 uppercase">/mo</span>}
                </div>
              </div>

              {/* SPEC GRID */}
              <div className="grid grid-cols-3 gap-2 border-y-2 border-slate-50 py-10">
                <div className="text-center"><div className="font-black text-3xl text-slate-900">{property.bedrooms}</div><div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Beds</div></div>
                <div className="text-center border-x-2 border-slate-50"><div className="font-black text-3xl text-slate-900">{property.bathrooms}</div><div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Baths</div></div>
                <div className="text-center"><div className="font-black text-3xl text-slate-900">{property.square_feet}</div><div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Sqft</div></div>
              </div>

              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Inventory Description</h2>
                <p className="text-slate-500 leading-relaxed font-medium text-base">{property.description}</p>
              </div>

              {/* INQUIRY BUTTONS */}
              <div className="grid grid-cols-1 gap-4 pt-6">
                <button 
                  onClick={() => handleInquiry('WHATSAPP')}
                  className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xs tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95"
                >
                  <MessageSquare size={18} /> CONTACT VIA WHATSAPP
                </button>
                <button 
                  onClick={() => handleInquiry('EMAIL')}
                  className="w-full bg-white text-slate-900 border-2 border-slate-100 py-6 rounded-[2.5rem] font-black text-xs tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                >
                  <Mail size={18} /> INQUIRE BY EMAIL
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}