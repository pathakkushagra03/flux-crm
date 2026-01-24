// Convert file to base64 for Airtable attachment
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// Validate image file
export function validateImage(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPG, PNG, GIF, or WebP.')
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  return true
}

// Convert base64 to blob URL for preview
export function base64ToBlob(base64) {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
}

// Create object URL from base64
export function base64ToObjectURL(base64) {
  const blob = base64ToBlob(base64)
  return URL.createObjectURL(blob)
}
