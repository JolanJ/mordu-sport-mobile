import { createContext, useContext, useState, ReactNode } from 'react'

export type RegisterData = {
  // Step 1
  email: string
  password: string
  stateProvince: string
  is18Plus: boolean
  preferredLocale: 'fr' | 'en'
  // Step 2
  avatarId: number
  username: string
  // Step 3
  newsletterSubscribed: boolean | null
}

type RegisterContextType = {
  data: RegisterData
  updateData: (updates: Partial<RegisterData>) => void
  resetData: () => void
}

const initialData: RegisterData = {
  email: '',
  password: '',
  stateProvince: '',
  is18Plus: false,
  preferredLocale: 'fr',
  avatarId: 1,
  username: '',
  newsletterSubscribed: null,
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined)

export function RegisterProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegisterData>(initialData)

  const updateData = (updates: Partial<RegisterData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const resetData = () => {
    setData(initialData)
  }

  return (
    <RegisterContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </RegisterContext.Provider>
  )
}

export function useRegister() {
  const context = useContext(RegisterContext)
  if (context === undefined) {
    throw new Error('useRegister must be used within a RegisterProvider')
  }
  return context
}
