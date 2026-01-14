import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Link, router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await signUp(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <View className="flex-1 bg-[#0a0a0a] px-6 justify-center">
        <View className="bg-green-900/30 border border-green-700 rounded-xl p-6">
          <Text className="text-green-400 text-xl font-bold text-center mb-2">
            Inscription réussie !
          </Text>
          <Text className="text-gray-300 text-center">
            Vérifiez votre email pour confirmer votre compte, puis connectez-vous.
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity className="bg-blue-600 py-3 rounded-xl mt-6">
              <Text className="text-white text-center font-semibold">Aller à la connexion</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#0a0a0a] px-6 justify-center">
      <View className="mb-10">
        <Text className="text-white text-3xl font-bold text-center">Créer un compte</Text>
        <Text className="text-gray-400 text-center mt-2">Rejoignez Mordu Sport</Text>
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
            placeholder="Minimum 6 caractères"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View className="mt-4">
          <Text className="text-gray-400 mb-2">Confirmer le mot de passe</Text>
          <TextInput
            className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl border border-gray-800"
            placeholder="Confirmez votre mot de passe"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {error ? (
          <Text className="text-red-500 text-center mt-4">{error}</Text>
        ) : null}

        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-xl mt-6"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">S'inscrire</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-400">Déjà un compte ? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-blue-500 font-semibold">Se connecter</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  )
}
