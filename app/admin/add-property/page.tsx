'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Box, CheckCircle2, Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function AddPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [agencies, setAgencies] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    matterportUrl: '',
    property_type: 'RESIDENTIAL',
    listing_type: 'BUY',
    partner_id: '' // New Field
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else {
        setIsCheckingAuth(false);
        // Fetch agencies to populate dropdown
        const { data } = await supabase.from('partners').select('*').order('name');
        setAgencies(data || []);
        if (data && data.length > 0) setFormData(prev => ({ ...prev, partner_id: data[0].id }));
      }
    };
    init();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        await supabase.storage.from('property-images').upload(fileName, imageFile);
        const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      const { data: property, error: propError } = await supabase
        .from('properties')
        .insert([{
          ...formData,
          price: parseFloat(formData.price),
          bedrooms: parseFloat(formData.bedrooms || '0'),
          bathrooms: parseFloat(formData.bathrooms || '0'),
          square_feet: parseFloat(formData.square_feet || '0'),
        }])
        .select().single();

      if (propError) throw propError;

      const media = [];
      if (finalImageUrl) media.push({ property_id: property.id, type: 'IMAGE', url: finalImageUrl, is_thumbnail: true });
      if (formData.matterportUrl) media.push({ property_id: property.id, type: 'MATTERPORT', url: formData.matterportUrl, is_thumbnail: false });
      if (media.length > 0) await supabase.from('property_media').insert(media);

      router.push('/admin/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Verifying Agent...</div>;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl space-y-6 border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Property Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Type</label>
                  <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-900" onChange={(e) => setFormData({...formData, property_type: e.target.value})}>
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="INDUSTRIAL">Industrial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Listing Agency</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-blue-600"
                    value={formData.partner_id}
                    onChange={(e) => setFormData({...formData, partner_id: e.target.value})}
                  >
                    {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <input required placeholder="Listing Title" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" onChange={(e) => setFormData({...formData, title: e.target.value})}/>
              <textarea required placeholder="Description" rows={4} className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl space-y-4">
              <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-widest ml-2">Location</h2>
              <input required placeholder="Street Address" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, address: e.target.value})}/>
              <div className="grid grid-cols-3 gap-4">
                <input required placeholder="City" className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, city: e.target.value})}/>
                <input required placeholder="State" className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, state: e.target.value})}/>
                <input required placeholder="Zip" className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, zip_code: e.target.value})}/>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-4">
              <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-widest ml-2">Media</h2>
              <label className="flex flex-col items-center justify-center aspect-video bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 cursor-pointer overflow-hidden relative">
                {previewUrl ? <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" /> : <Upload className="text-slate-400" />}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
              <input placeholder="Matterport URL" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs" onChange={(e) => setFormData({...formData, matterportUrl: e.target.value})}/>
            </div>

            <button disabled={loading} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-blue-700 transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'PUBLISH'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}