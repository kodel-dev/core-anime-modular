'use client';

export default function Navbar({ onFilter }: { onFilter: (type: string) => void }) {
  const sectors = [
    { id: 'anime', label: 'Discovery' },
    { id: 'ghibli', label: 'Studio' },
    { id: 'manga', label: 'Reading' },
    { id: 'waifu', label: 'Gallery' },
    { id: 'neko', label: 'Neko' } // Sektor Catboy & Neko
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-[#060910]/80 backdrop-blur-xl border-b border-gray-800 px-6 py-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href = '/'}>
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-110">K</div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Kodel<span className="text-blue-500">Core</span></h1>
        </div>

        <div className="flex items-center gap-8 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {sectors.map((s) => (
            <button key={s.id} onClick={() => onFilter(s.id)} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-blue-500 transition-all whitespace-nowrap">{s.label}</button>
          ))}
        </div>
      </div>
    </nav>
  );
}