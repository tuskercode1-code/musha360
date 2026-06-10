'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '../../supabase';
import { MapPin, Camera, Box, ChevronRight, X, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [property, setProperty] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'3D' | 'PHOTOS'>('3D');
  const [loading, setLoading] = useState(true);
  
  // Lead Form State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '', message: '' });

  useEffect(() => {
    async function fetchProperty() {
      const { data } = await supabase.from('properties').select(`*, property_media (*)`).eq('id', id).single();
      if (data) {
        setProperty(data);
        if (!data.property_media?.some((m: any) => m.type === 'MATTERPORT')) setViewMode('PHOTOS');
      }
      setLoading(false);
    }
    fetchProperty();
  }, [id]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from('leads').insert([{
      property_id: id,
      full_name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      message: leadData.message
    }]);
    if (!error) setSubmitted(true);
    else alert(error.message);
    setIsSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!property) return <div className="p-20 text-center">Not Found</div>;

  const images = property.property_media?.filter((m: any) => m.type === 'IMAGE') || [];
  const matterport = property.property_media?.find((m: any) => m.type === 'MATTERPORT');

  return (
    <main className="bg-white min-h-screen pb-20">
      {/* Lead Form Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative shadow-2xl">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X/></button>
            
            {submitted ? (
              <div className="text-center py-10">
                <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                <h3 className="text-2xl font-black italic">INQUIRY SENT</h3>
                <p className="text-slate-500 mt-2">The agent will contact you shortly.</p>
                <button onClick={() => setShowForm(false)} className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-full font-bold">CLOSE</button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black italic mb-2 uppercase tracking-tighter">Inquire about this space</h3>
                <p className="text-slate-400 text-xs font-bold mb-8 uppercase tracking-widest">{property.title}</p>
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <input required placeholder="Your Full Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e)=>setLeadData({...leadData, name: e.target.value})}/>
                  <input required type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e)=>setLeadData({...leadData, email: e.target.value})}/>
                  <input placeholder="Phone Number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e)=>setLeadData({...leadData, phone: e.target.value})}/>
                  <textarea placeholder="Your Message..." rows={3} className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e)=>setLeadData({...leadData, message: e.target.value})}></textarea>
                  <button disabled={isSubmitting} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                    {isSubmitting ? 'SENDING...' : <><Send size={20}/> SEND INQUIRY</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
        <Link href="/">COLLECTION</Link> <ChevronRight size={12}/> {property.property_type} <ChevronRight size={12}/> <span className="text-slate-900">{property.title}</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl bg-slate-100 group border border-slate-100">
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-2xl">
              {matterport && <button onClick={() => setViewMode('3D')} className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs transition-all ${viewMode === '3D' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Box size={16}/> 3D TOUR</button>}
              <button onClick={() => setViewMode('PHOTOS')} className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs transition-all ${viewMode === 'PHOTOS' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Camera size={16}/> PHOTOS</button>
            </div>
            {viewMode === '3D' && matterport ? <iframe src={`${matterport.url}&play=1&brand=0`} className="w-full h-full" frameBorder="0" allowFullScreen allow="vr"></iframe> : <div className="w-full h-full grid grid-cols-2 gap-1 overflow-y-auto no-scrollbar">{images.map((img: any)=><img key={img.id} src={img.url} className="w-full h-full object-cover"/>)}</div>}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-8">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{property.title}</h1>
            <p className="flex items-center text-slate-400 font-bold text-sm tracking-widest"><MapPin size={16} className="text-blue-600 mr-2"/> {property.address.toUpperCase()}, {property.city.toUpperCase()}</p>
            <div className="text-4xl font-black text-slate-900">${property.price.toLocaleString()}</div>
            
            <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-8">
               <div className="text-center"><div className="font-black text-xl">{property.bedrooms || '-'}</div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beds</div></div>
               <div className="text-center border-x border-slate-100"><div className="font-black text-xl">{property.bathrooms || '-'}</div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baths</div></div>
               <div className="text-center"><div className="font-black text-xl">{property.square_feet}</div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sqft</div></div>
            </div>

            <p className="text-slate-500 font-medium leading-relaxed">{property.description}</p>
            
            <button onClick={() => setShowForm(true)} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-blue-700 transition-all active:scale-95">CONTACT AGENT</button>
          </div>
        </div>
      </div>
    </main>
  );
}