import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Link, router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.replace('/(tabs)')
    }
  }

  return (
    <View className="flex-1 bg-[#0a0a0a] px-6 justify-center">
      <View className="mb-10">
        <Text className="text-white text-3xl font-bold text-center">Mordu Sport</Text>
        <Text className="text-gray-400 text-center mt-2">Connectez-vous pour continuer</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-gray-400 mb-2">Email</Text>
          <TextInput
            className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl border border-gray-800"
            placeholder="votre@email.com"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="mt-4">
          <Text className="text-gray-400 mb-2">Mot de passe</Text>
          <TextInput
            className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl border border-gray-800"
            placeholder="Votre mot de passe"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error ? (
          <Text className="text-red-500 text-center mt-4">{error}</Text>
        ) : null}

        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-xl mt-6"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">Se connecter</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-400">Pas encore de compte ? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-blue-500 font-semibold">S'inscrire</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  )
}
