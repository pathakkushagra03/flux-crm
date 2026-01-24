'use client'

export default function Textarea({
  label,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  rows = 4,
  className = ''
}) {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-4 py-3 
          bg-gray-900 
          border border-gray-700 
          rounded-lg 
          text-white 
          placeholder-gray-500
          focus:outline-none 
          focus:ring-2 
          focus:ring-white 
          focus:border-transparent
          disabled:opacity-50 
          disabled:cursor-not-allowed
          transition-all duration-200
          resize-none
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
