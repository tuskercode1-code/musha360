'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '../../../supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Box, CheckCircle2, Loader2, Camera, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    partner_id: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: agencyData } = await supabase.from('partners').select('*').order('name');
      setAgencies(agencyData || []);

      const { data, error } = await supabase
        .from('properties')
        .select(`*, property_media (*)`)
        .eq('id', id)
        .single();

      if (data) {
        const thumb = data.property_media?.find((m: any) => m.is_thumbnail)?.url || '';
        const matter = data.property_media?.find((m: any) => m.type === 'MATTERPORT')?.url || '';
        
        setExistingImageUrl(thumb);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          price: (data.price ?? '').toString(),
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip_code: data.zip_code || '',
          bedrooms: (data.bedrooms ?? '').toString(),
          bathrooms: (data.bathrooms ?? '').toString(),
          square_feet: (data.square_feet ?? '').toString(),
          matterportUrl: matter,
          property_type: data.property_type || 'RESIDENTIAL',
          listing_type: data.listing_type || 'BUY',
          partner_id: data.partner_id || '' // This could be empty
        });
      }
      setLoading(false);
    }
    loadData();
  }, [id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImageUrl = existingImageUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        await supabase.storage.from('property-images').upload(fileName, imageFile);
        const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      // FIX: Ensure partner_id is either a valid UUID or NULL (never an empty string "")
      const submissionPartnerId = formData.partner_id.trim() === "" ? null : formData.partner_id;

      const { error: propError } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price || '0'),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          bedrooms: parseFloat(formData.bedrooms || '0'),
          bathrooms: parseFloat(formData.bathrooms || '0'),
          square_feet: parseFloat(formData.square_feet || '0'),
          property_type: formData.property_type,
          listing_type: formData.listing_type,
          partner_id: submissionPartnerId // Use the fixed value here
        })
        .eq('id', id);

      if (propError) throw propError;

      await supabase.from('property_media').delete().eq('property_id', id);
      const media = [];
      if (finalImageUrl) media.push({ property_id: id, type: 'IMAGE', url: finalImageUrl, is_thumbnail: true });
      if (formData.matterportUrl) media.push({ property_id: id, type: 'MATTERPORT', url: formData.matterportUrl, is_thumbnail: false });
      if (media.length > 0) await supabase.from('property_media').insert(media);

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      alert('Update Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Syncing Musha360 Data...</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <Link href="/admin/dashboard" className="flex items-center text-slate-400 font-black hover:text-blue-600 transition-colors uppercase text-[10px] tracking-[0.2em]">
            <ArrowLeft className="mr-2" size={16} /> Exit Editor
          </Link>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">EDIT <span className="text-blue-600 not-italic">LISTING</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Listing Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-900"
                    value={formData.property_type}
                    onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                  >
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="INDUSTRIAL">Industrial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Offer</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-blue-600"
                    value={formData.listing_type}
                    onChange={(e) => setFormData({...formData, listing_type: e.target.value})}
                  >
                    <option value="BUY">For Sale</option>
                    <option value="RENT">To Rent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Agency</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-900"
                    value={formData.partner_id}
                    onChange={(e) => setFormData({...formData, partner_id: e.target.value})}
                  >
                    <option value="">No Agency Linked</option>
                    {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <input value={formData.title} required className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-black text-2xl" placeholder="Listing Title" onChange={(e) => setFormData({...formData, title: e.target.value})}/>
                <textarea value={formData.description} required rows={5} className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-medium text-slate-600" placeholder="Description" onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Price ($)</label>
                    <input value={formData.price} type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-blue-600" onChange={(e) => setFormData({...formData, price: e.target.value})}/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Sq Ft</label>
                    <input value={formData.square_feet} type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" onChange={(e) => setFormData({...formData, square_feet: e.target.value})}/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Beds</label>
                    <input value={formData.bedrooms} type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Baths</label>
                    <input value={formData.bathrooms} type="number" step="0.5" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}/>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl space-y-6">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 flex items-center gap-2"><MapPin size={14}/> Location Details</h2>
              <input value={formData.address} required className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-medium" placeholder="Street Address" onChange={(e) => setFormData({...formData, address: e.target.value})}/>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value={formData.city} required className="p-5 bg-slate-50 rounded-2xl outline-none font-medium" placeholder="City" onChange={(e) => setFormData({...formData, city: e.target.value})}/>
                <input value={formData.state} required className="p-5 bg-slate-50 rounded-2xl outline-none font-medium" placeholder="State" onChange={(e) => setFormData({...formData, state: e.target.value})}/>
                <input value={formData.zip_code} required className="p-5 bg-slate-50 rounded-2xl outline-none font-medium" placeholder="Zip" onChange={(e) => setFormData({...formData, zip_code: e.target.value})}/>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Media Assets</h2>
              <label className="block aspect-video bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-100 hover:border-blue-200 transition-all cursor-pointer overflow-hidden relative group">
                {previewUrl ? <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" /> : existingImageUrl && <img src={existingImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Photo</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
              <div className="flex items-center gap-3 bg-slate-900 text-white p-4 rounded-2xl">
                <Box size={20} className="text-blue-400" />
                <input value={formData.matterportUrl} placeholder="Matterport URL" className="bg-transparent outline-none text-xs w-full font-medium" onChange={(e) => setFormData({...formData, matterportUrl: e.target.value})}/>
              </div>
            </div>

            <button 
              disabled={saving} 
              className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-300"
            >
              {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
              {saving ? 'UPDATING...' : 'SAVE UPDATES'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}