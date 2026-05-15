import { Github, Linkedin, Mail, Heart } from 'lucide-react';
import GlassCard from './GlassCard';

export default function Footer() {
  const socialLinks = [
    { icon: Github, href: 'https://github.com/madhx3', label: 'GitHub' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/madhan-a-5003512a0', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:madhx2005@gmail.com', label: 'Email' },
  ];

  return (
    <footer className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative mt-16 sm:mt-20">
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-6 sm:p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="max-w-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Pothole Detection System
              </h3>
              <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">
                AI-powered solution for automated road damage detection using computer vision and deep learning technology.
              </p>
            </div>
            <div className="text-left md:text-right">
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Connect With Us</h4>
              <div className="flex gap-2 sm:gap-3 md:justify-end">
                {socialLinks.map((link, index) => (
                  <a key={index} href={link.href} aria-label={link.label} target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                    <link.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 sm:pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
              <p>A mini project by <span className="text-blue-400 font-semibold">Madhan</span></p>
              <p className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                Made with <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-red-500" />
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
    </footer>
  );
}