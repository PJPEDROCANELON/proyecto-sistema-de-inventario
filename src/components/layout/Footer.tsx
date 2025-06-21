// src/components/layout/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800/70 backdrop-blur-md border-t border-slate-700/50 py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} NeoStock. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
