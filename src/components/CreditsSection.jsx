import React from 'react';
import { Code2, Heart, Shield } from 'lucide-react';

const ContributorCard = ({ name, initials, githubUrl, linkedinUrl, colorClass }) => (
  <div className="group relative bg-[#161b22] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-white/20 flex flex-col items-center text-center overflow-hidden">
    {/* Subtle gradient glow behind the avatar */}
    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full opacity-20 blur-2xl ${colorClass}`} />
    
    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl mb-4 relative z-10 shadow-lg ${colorClass}`}>
      {initials}
    </div>
    
    <h3 className="text-white font-bold text-lg tracking-tight mb-4 relative z-10">{name}</h3>
    
    <div className="flex gap-3 relative z-10 w-full">
      <a 
        href={githubUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm font-semibold border border-white/5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg> GitHub
      </a>
      <a 
        href={linkedinUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0a66c2]/10 text-[#0a66c2] hover:bg-[#0a66c2]/20 transition-all text-sm font-semibold border border-[#0a66c2]/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg> LinkedIn
      </a>
    </div>
  </div>
);

const CreditsSection = () => {
  const contributors = [
    {
      name: "Anubhav Maurya",
      initials: "AM",
      githubUrl: "https://github.com/anubhavmaurya22",
      linkedinUrl: "https://www.linkedin.com/in/anubhav-maurya-973482379/",
      colorClass: "bg-blue-600"
    },
    {
      name: "Aditya Bhardwaj",
      initials: "AB",
      githubUrl: "https://github.com/dayfall00",
      linkedinUrl: "https://www.linkedin.com/in/aditya-bhardwaj-87036a1a8/",
      colorClass: "bg-purple-600"
    },
    {
      name: "Yashi Srivastava",
      initials: "YS",
      githubUrl: "https://github.com/yashi-28",
      linkedinUrl: "https://www.linkedin.com/in/yashi-srivastava-579061329/",
      colorClass: "bg-amber-600"
    },
    {
      name: "Utkarsh Kumar",
      initials: "UK",
      githubUrl: "https://github.com/utkarsh795",
      linkedinUrl: "https://www.linkedin.com/in/utkarsh-kumar-bab18632b/",
      colorClass: "bg-emerald-600"
    }
  ];

  return (
    <footer className="bg-[#0d1117] pt-24 pb-12 px-6 relative overflow-hidden font-body">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-sm">
            <Heart size={14} className="fill-current" />
            Built with love in Bharat
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 font-headline">
            The Team Behind <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">RootBridge</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A small group of passionate developers building a platform to empower the local workforce and eliminate middlemen.
          </p>
        </div>

        {/* Contributor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {contributors.map((contributor) => (
            <ContributorCard key={contributor.name} {...contributor} />
          ))}
        </div>

        {/* Tech Stack Strip
        <div className="flex flex-col items-center mb-16 pt-10 border-t border-white/10">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">Powered By</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "React", bg: "bg-[#61dafb]/10 text-[#61dafb] border-[#61dafb]/20" },
              { name: "Tailwind CSS", bg: "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20" },
              { name: "Firebase", bg: "bg-[#ffca28]/10 text-[#ffca28] border-[#ffca28]/20" },
              { name: "Vite", bg: "bg-[#bd34fe]/10 text-[#bd34fe] border-[#bd34fe]/20" },
              { name: "Lucide React", bg: "bg-rose-500/10 text-rose-400 border-rose-500/20" }
            ].map((tech) => (
              <span key={tech.name} className={`px-4 py-2 rounded-xl text-sm font-bold border ${tech.bg}`}>
                {tech.name}
              </span>
            ))}
          </div>
        </div>*/}

        {/* Final Copyright & Logo Space */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-center md:text-left gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <Shield size={16} />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-tight font-headline">RootBridge</p>
              <p className="text-gray-500 text-xs">Hyperlocal service marketplace · Built for Bharat</p>
            </div>
          </div>
          
          <div className="text-gray-500 text-xs font-medium">
            <span className="flex items-center gap-1"><Code2 size={14} /> © {new Date().getFullYear()} RootBridge. All rights reserved.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default CreditsSection;
