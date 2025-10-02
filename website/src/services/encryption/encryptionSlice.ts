import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import forge from 'node-forge'
import { toast } from 'react-toastify'

interface RSAKeyPair {
  publicKeyPem: string
  privateKeyPem: string
}

interface EncryptionState {
  rsaKeyPair: RSAKeyPair | null
  encKeyCache: Record<string, string>
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: EncryptionState = {
  rsaKeyPair: null,
  encKeyCache: {},
  status: 'idle',
  error: null,
}

export const generateRSAKeyPair = createAsyncThunk('encryption/generateRSAKeyPair', async () => {
  const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 })
  const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey)
  const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey)
  return { publicKeyPem, privateKeyPem }
})

export const fetchEncKeyForAssistant = createAsyncThunk<string | null, void, { rejectValue: string }>(
  'encryption/fetchEncKeyForAssistant',
  async (_, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState()
      let rsa = state.encryption?.rsaKeyPair
      if (!rsa) {
        const res = await thunkAPI.dispatch(generateRSAKeyPair())
        // @ts-ignore
        rsa = res.payload
      }

      const { publicKeyPem, privateKeyPem } = rsa
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token not found. Please log in again.')

      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const resp = await axios.post(
        `${base}/api/file/get-enc-key`,
        { clientPublicKey: publicKeyPem },
        { withCredentials: true }
      )

      const encryptedEncKey = resp.data.encryptedEncKey
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
      const decryptedKey = privateKey.decrypt(
        forge.util.decode64(encryptedEncKey),
        'RSA-OAEP',
        { md: forge.md.sha256.create() }
      )

      return decryptedKey
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch encryption key'
      toast.error('Failed to fetch your encryption key')
      return thunkAPI.rejectWithValue(msg)
    }
  }
)

export const fetchEncKeyForDoc = createAsyncThunk<string | null, string, { rejectValue: string }>(
  'encryption/fetchEncKeyForDoc',
  async (fileUniqueName, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState()
      let rsa = state.encryption?.rsaKeyPair
      if (!rsa) {
        const res = await thunkAPI.dispatch(generateRSAKeyPair())
        // @ts-ignore
        rsa = res.payload
      }

      const { publicKeyPem, privateKeyPem } = rsa
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token not found. Please log in again.')

      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const resp = await axios.post(
        `${base}/api/file/get-enc-key`,
        { clientPublicKey: publicKeyPem, fileUniqueName },
        { withCredentials: true }
      )

      const encryptedEncKey = resp.data.encryptedEncKey
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
      const decryptedKey = privateKey.decrypt(
        forge.util.decode64(encryptedEncKey),
        'RSA-OAEP',
        { md: forge.md.sha256.create() }
      )

      return decryptedKey
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch encryption key for document'
      toast.error('Failed to fetch encryption key for document')
      return thunkAPI.rejectWithValue(msg)
    }
  }
)

const encryptionSlice = createSlice({
  name: 'encryption',
  initialState,
  reducers: {
    setCachedKey: (state, action: PayloadAction<{ keyId: string; key: string }>) => {
      state.encKeyCache[action.payload.keyId] = action.payload.key
    },
    clearCache: (state) => {
      state.encKeyCache = {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateRSAKeyPair.fulfilled, (state, action) => {
        state.rsaKeyPair = action.payload
      })
      .addCase(generateRSAKeyPair.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to generate RSA key pair'
      })
      .addCase(fetchEncKeyForAssistant.fulfilled, (state, action) => {
        if (action.payload) state.encKeyCache['self'] = action.payload
      })
      .addCase(fetchEncKeyForDoc.fulfilled, (state, action) => {
        // cache the decrypted key using the fileUniqueName passed as the thunk arg
        const fileUniqueName = (action as any).meta?.arg
        if (fileUniqueName && action.payload) {
          state.encKeyCache[fileUniqueName] = action.payload
        }
      })
  },
})

export const { setCachedKey, clearCache } = encryptionSlice.actions
export default encryptionSlice.reducer
