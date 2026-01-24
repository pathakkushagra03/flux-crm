'use client'

import { motion } from 'framer-motion'

export default function Card({ 
  children, 
  className = '',
  hover = false,
  onClick
}) {
  const cardContent = (
    <div 
      className={`
        bg-gray-900 
        border border-gray-800 
        rounded-lg 
        p-6 
        transition-all duration-200
        ${hover ? 'hover:border-gray-700 hover:shadow-lg cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}
