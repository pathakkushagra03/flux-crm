'use client'

import { useState } from 'react'
import { validateImage, fileToBase64 } from '@/lib/imageUpload'
import Button from './Button'

export default function ImageUpload({ 
  label, 
  currentImage, 
  onImageSelect,
  onImageRemove 
}) {
  const [preview, setPreview] = useState(currentImage || null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setError('')
      setUploading(true)

      // Validate image
      validateImage(file)

      // Convert to base64
      const base64 = await fileToBase64(file)
      
      // Create preview
      setPreview(base64)
      
      // Pass to parent
      if (onImageSelect) {
        onImageSelect(base64)
      }
    } catch (err) {
      setError(err.message)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError('')
    if (onImageRemove) {
      onImageRemove()
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="flex items-start gap-4">
        {/* Preview */}
        {preview && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Button */}
        {!preview && (
          <div className="flex-1">
            <label className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-500"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-400">
                    {uploading ? 'Uploading...' : 'Click to upload image'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
