'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useRouter } from 'next/navigation';
import { Edit3, Trash2, Plus, ExternalLink, Building2, Trash, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [properties, setProperties] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [newPartner, setNewPartner] = useState({ name: '', logo_url: '' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    const { data: props } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    const { data: parts } = await supabase.from('partners').select('*').order('name', { ascending: true });
    setProperties(props || []);
    setPartners(parts || []);
    setLoading(false);
  }

  async function addPartner(e: React.FormEvent) {
    e.preventDefault();
    if (!newPartner.name.trim()) return;
    const { error } = await supabase.from('partners').insert([{ name: newPartner.name.toUpperCase(), logo_url: newPartner.logo_url }]);
    if (error) alert(error.message);
    else {
      setNewPartner({ name: '', logo_url: '' });
      fetchData();
    }
  }

  async function deletePartner(id: string) {
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  }

  async function deleteProperty(id: string) {
    if (!confirm('Are you sure?')) return;
    await supabase.from('properties').delete().eq('id', id);
    fetchData();
  }

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading Musha360 Dashboard...</div>;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex justify-between items-end">
           <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">MUSHA<span className="text-blue-600">360</span></h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Management Portal</p>
           </div>
        </header>

        {/* AGENCIES */}
        <section className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Building2 className="text-blue-600" /> MANAGE PARTNER AGENCIES
          </h2>
          <form onSubmit={addPartner} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <input value={newPartner.name} onChange={(e) => setNewPartner({...newPartner, name: e.target.value})} placeholder="Agency Name" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold"/>
            <input value={newPartner.logo_url} onChange={(e) => setNewPartner({...newPartner, logo_url: e.target.value})} placeholder="Logo URL (SVG/PNG)" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold"/>
            <button className="bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all uppercase tracking-widest text-xs">ADD AGENCY</button>
          </form>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {partners.map((p) => (
              <div key={p.id} className="relative group bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                {p.logo_url ? <img src={p.logo_url} className="h-6 object-contain grayscale opacity-60" alt={p.name} /> : <ImageIcon className="text-slate-200" />}
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center">{p.name}</span>
                <button onClick={() => deletePartner(p.id)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={12} /></button>
              </div>
            ))}
          </div>
        </section>

        {/* LISTINGS */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic">Active Listings</h2>
            <Link href="/admin/add-property" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg">+ NEW LISTING</Link>
          </div>
          <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white text-[10px] font-black tracking-widest uppercase">
                <tr><th className="p-6">Listing</th><th className="p-6 text-center">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50">
                    <td className="p-6 font-bold text-slate-900 uppercase tracking-tight">{prop.title}</td>
                    <td className="p-6 flex justify-center gap-2">
                      <Link href={`/admin/edit-property/${prop.id}`} className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Edit3 size={18} /></Link>
                      <button onClick={() => deleteProperty(prop.id)} className="p-3 bg-red-50 text-red-500 rounded-xl"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}