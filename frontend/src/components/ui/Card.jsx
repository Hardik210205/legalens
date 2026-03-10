import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ className = '', children, hover = false, ...props }) => {
  const base =
    'card ' +
    (hover
      ? 'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl'
      : '');

  return (
    <motion.div
      className={`${base} ${className}`}
      {...props}
      layout
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;

