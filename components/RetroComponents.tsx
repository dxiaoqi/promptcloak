import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const RetroButton: React.FC<RetroButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '',
  ...props 
}) => {
  const baseStyles = "relative uppercase font-bold py-3 px-6 border-4 transition-all active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-teal-900 border-teal-500 text-teal-100 hover:bg-teal-800 shadow-[4px_4px_0px_0px_rgba(20,184,166,0.5)]",
    secondary: "bg-slate-900 border-slate-500 text-slate-300 hover:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(100,116,139,0.5)]",
    danger: "bg-red-900 border-red-500 text-red-100 hover:bg-red-800 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.5)]",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="animate-pulse">PROCESSING...</span>
      ) : (
        children
      )}
    </button>
  );
};

export const RetroCard: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ children, title, className = '' }) => {
  return (
    <div className={`border-4 border-slate-700 bg-black p-6 relative ${className}`}>
      {/* Corner decors */}
      <div className="absolute -top-1 -left-1 w-4 h-4 bg-slate-700" />
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-700" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-slate-700" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-700" />
      
      {title && (
        <div className="absolute -top-5 left-4 bg-black px-2 border-x-4 border-slate-700">
          <h3 className="text-xl font-bold text-slate-300 uppercase tracking-widest">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

export const RetroInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className={`w-full bg-slate-900 border-b-4 border-slate-700 text-teal-400 p-3 focus:outline-none focus:border-teal-500 focus:bg-slate-800 placeholder-slate-600 font-mono ${props.className}`}
  />
);

export const RetroTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea 
    {...props}
    className={`w-full bg-slate-900 border-4 border-slate-700 text-teal-400 p-3 focus:outline-none focus:border-teal-500 focus:bg-slate-800 placeholder-slate-600 font-mono min-h-[150px] ${props.className}`}
  />
);
