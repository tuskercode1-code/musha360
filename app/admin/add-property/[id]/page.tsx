'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '../../../supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Box, DollarSign, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
    imageUrl: '',
    matterportUrl: ''
  });

  useEffect(() => {
    async function loadProperty() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .select(`*, property_media (*)`)
        .eq('id', id)
        .single();

      if (data) {
        const thumb = data.property_media?.find((m: any) => m.is_thumbnail)?.url || '';
        const matter = data.property_media?.find((m: any) => m.type === 'MATTERPORT')?.url || '';
        
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price.toString(),
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          bedrooms: data.bedrooms.toString(),
          bathrooms: data.bathrooms.toString(),
          square_feet: data.square_feet.toString(),
          imageUrl: thumb,
          matterportUrl: matter
        });
      }
      setLoading(false);
    }
    loadProperty();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update Property details
      await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          bedrooms: parseFloat(formData.bedrooms),
          bathrooms: parseFloat(formData.bathrooms),
          square_feet: parseFloat(formData.square_feet),
        })
        .eq('id', id);

      // 2. Update Media (Simple approach: delete old and insert new)
      await supabase.from('property_media').delete().eq('property_id', id);
      
      const media = [];
      if (formData.imageUrl) media.push({ property_id: id, type: 'IMAGE', url: formData.imageUrl, is_thumbnail: true });
      if (formData.matterportUrl) media.push({ property_id: id, type: 'MATTERPORT', url: formData.matterportUrl, is_thumbnail: false });
      
      if (media.length > 0) {
        await supabase.from('property_media').insert(media);
      }

      alert('Listing updated successfully!');
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading Property Data...</div>;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin/dashboard" className="flex items-center text-slate-500 hover:text-blue-600 mb-8 font-bold transition-colors">
          <ArrowLeft size={18} className="mr-2" /> CANCEL EDIT
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-slate-100">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Edit Listing</h1>
          <p className="text-slate-500 mb-10">Modify the property details below.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input 
              value={formData.title} required placeholder="Title" 
              className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <textarea 
              value={formData.description} required placeholder="Description" rows={5}
              className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-4">
               <div className="relative flex items-center">
                <DollarSign className="absolute left-4 text-slate-400" size={18}/>
                <input value={formData.price} required type="number" className="w-full p-4 pl-10 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, price: e.target.value})}/>
              </div>
              <input value={formData.square_feet} required type="number" placeholder="Sqft" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, square_feet: e.target.value})}/>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <input value={formData.address} required placeholder="Address" className="w-full p-4 bg-slate-50 rounded-2xl outline-none col-span-3" onChange={(e) => setFormData({...formData, address: e.target.value})}/>
               <input value={formData.city} required placeholder="City" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, city: e.target.value})}/>
               <input value={formData.state} required placeholder="State" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, state: e.target.value})}/>
               <input value={formData.zip_code} required placeholder="Zip" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, zip_code: e.target.value})}/>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
               <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                 <Camera className="text-slate-400" />
                 <input value={formData.imageUrl} placeholder="Cover Image URL" className="bg-transparent w-full outline-none text-sm" onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}/>
               </div>
               <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                 <Box className="text-slate-400" />
                 <input value={formData.matterportUrl} placeholder="Matterport URL" className="bg-transparent w-full outline-none text-sm" onChange={(e) => setFormData({...formData, matterportUrl: e.target.value})}/>
               </div>
            </div>

            <button 
              disabled={saving}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} /> {saving ? 'Saving Changes...' : 'Save Updates'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}