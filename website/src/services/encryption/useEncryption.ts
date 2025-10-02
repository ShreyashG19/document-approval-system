import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchEncKeyForAssistant, fetchEncKeyForDoc, setCachedKey, clearCache } from './encryptionSlice'

export const useEncryption = () => {
  const dispatch = useAppDispatch()
  const rsaKeyPair = useAppSelector((s: any) => s.encryption?.rsaKeyPair)
  const encKeyCache = useAppSelector((s: any) => s.encryption?.encKeyCache || {})

  const getEncKeyForAssistant = async () => {
    const cached = encKeyCache['self']
    if (cached) return cached
    const res = await dispatch(fetchEncKeyForAssistant())
    // @ts-ignore
    return res.payload ?? null
  }

  const getEncKeyForDoc = async (fileUniqueName: string) => {
    const cached = encKeyCache[fileUniqueName]
    if (cached) return cached
    const res = await dispatch(fetchEncKeyForDoc(fileUniqueName))
    // @ts-ignore
    return res.payload ?? null
  }

  return {
    rsaKeyPair,
    encKeyCache,
    getEncKeyForAssistant,
    getEncKeyForDoc,
    setCachedKey: (keyId: string, key: string) => dispatch(setCachedKey({ keyId, key })),
    clearCache: () => dispatch(clearCache()),
  }
}

export default useEncryption
