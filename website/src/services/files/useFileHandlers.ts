import useEncryption from '@/services/encryption/useEncryption'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { toast } from 'react-toastify'

const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const convertWordArrayToUint8Array = (wordArray: any): Uint8Array => {
  const len = wordArray.sigBytes
  const words = wordArray.words as number[]
  const uint8Array = new Uint8Array(len)
  let offset = 0
  for (let i = 0; i < len; i += 4) {
    const word = words[i >>> 2]
    for (let j = 0; j < 4 && offset < len; ++j) {
      uint8Array[offset++] = (word >>> (24 - j * 8)) & 0xff
    }
  }
  return uint8Array
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const useFileHandlers = () => {
  const { getEncKeyForAssistant, getEncKeyForDoc } = useEncryption()

  const handlePreview = async (fileName: string) => {
    try {
      const encKey = await getEncKeyForDoc(fileName)
      if (!encKey) throw new Error('Encryption key not available')

      const downloadUrl = `${base}/api/file/download-pdf/${fileName}`
      const response = await axios.get(downloadUrl, {
        withCredentials: true,
        responseType: 'text',
      })

      const decrypted = CryptoJS.AES.decrypt(response.data, encKey)
      const typedArray = convertWordArrayToUint8Array(decrypted)

  const blob = new Blob([typedArray.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      return url
    } catch (error) {
      console.error('Preview Error:', error)
      toast.error('Failed to preview document')
      return null
    }
  }

  const handleDownload = async (fileName: string) => {
    try {
      const encKey = await getEncKeyForDoc(fileName)
      if (!encKey) throw new Error('Encryption key not available')

      const downloadUrl = `${base}/api/file/download-pdf/${fileName}`
      const response = await axios.get(downloadUrl, {
        withCredentials: true,
        responseType: 'text',
      })

      const decrypted = CryptoJS.AES.decrypt(response.data, encKey)
      const typedArray = convertWordArrayToUint8Array(decrypted)

  const blob = new Blob([typedArray.buffer as ArrayBuffer], { type: 'application/pdf' })
  downloadBlob(blob, fileName.replace('.enc', ''))
    } catch (error) {
      console.error('Download Error:', error)
      toast.error('Failed to download document')
    }
  }

  const handleUpload = async ({
    file,
    department,
    title,
    description = '',
    onSuccess = () => {},
  }: {
    file: File
    department: string
    title: string
    description?: string
    onSuccess?: () => void
  }) => {
    const toastId = toast.loading('Encrypting & uploading...')
    if (!file || !department || !title) {
      toast.dismiss(toastId)
      toast.error('Please fill all required fields')
      return
    }

    try {
      const encKey = await getEncKeyForAssistant()
      if (!encKey) throw new Error('Encryption key not available')

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result
          // Create WordArray from ArrayBuffer
          const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(arrayBuffer as ArrayBuffer))
          const encrypted = CryptoJS.AES.encrypt(wordArray, encKey).toString()

          const blob = new Blob([encrypted], { type: 'text/plain' })
          const formData = new FormData()
          formData.append('pdfFile', new File([blob], `${file.name}.enc`))
          formData.append('department', department)
          formData.append('title', title)
          formData.append('description', description)
          const uploadUrl = `${base}/api/file/upload-pdf`
          await axios.post(uploadUrl, formData, {
            withCredentials: true,
          })

          toast.dismiss(toastId)
          toast.success('Document uploaded successfully')
          onSuccess()
        } catch (err) {
          toast.dismiss(toastId)
          toast.error('Encryption or upload failed')
          console.error('Upload error:', err)
        }
      }

      reader.onerror = () => {
        toast.dismiss(toastId)
        toast.error('Failed to read file')
      }

      reader.readAsArrayBuffer(file)
    } catch (err) {
      toast.dismiss(toastId)
      toast.error('Error uploading document')
      console.error('Upload error:', err)
    }
  }

  return {
    handlePreview,
    handleDownload,
    handleUpload,
  }
}

export default useFileHandlers
