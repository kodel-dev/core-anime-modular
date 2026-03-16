import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-900 bg-[#060910] py-16 px-6 mt-auto">
      <div className="container mx-auto grid md:grid-cols-4 gap-12 opacity-40">
        <div className="col-span-2">
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4 italic">CoreAnime Platform</h4>
          <p className="text-xs leading-relaxed max-w-sm">
            Platform eksplorasi metadata anime profesional yang mengintegrasikan berbagai API publik seperti Jikan, AniList, dan Ghibli Resources.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">API Metadata</h4>
          <ul className="text-[10px] font-bold space-y-2 uppercase">
            <li>Jikan Unofficial MAL</li>
            <li>Kitsu & Shikimori Sync</li>
            <li>Studio Ghibli API</li>
          </ul>
        </div>
        <div className="text-right flex flex-col justify-end">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Informatics Engineering</p>
          <p className="text-[10px] mt-1 text-gray-500">© 2026 CoreAnime • All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;