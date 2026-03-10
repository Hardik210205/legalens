import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary:
    'btn-primary rounded-2xl px-4 py-2 text-sm font-medium flex items-center gap-2',
  ghost:
    'rounded-2xl px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-card border border-transparent',
  subtle:
    'rounded-2xl px-3 py-1.5 text-xs bg-card border border-border text-text-secondary hover:border-accent/40 hover:text-text-primary'
};

const Button = ({ variant = 'primary', className = '', children, ...props }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;

