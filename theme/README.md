# 🎨 Système de Thème - Mordu Sport

## 📖 Guide d'Utilisation

### Import des Couleurs

```typescript
import { colors } from '@/theme/colors'
```

### Exemples d'Utilisation

#### ✅ Avec React Native (StyleSheet)

```tsx
import { StyleSheet, View, Text } from 'react-native'
import { colors, fonts } from '@/theme/colors'

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  title: {
    color: colors.foreground,
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
  },
  liveIndicator: {
    backgroundColor: colors.live,
  }
})
```

#### ✅ Avec Inline Styles

```tsx
import { colors } from '@/theme/colors'

<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.foreground }}>
    Mordu Sport
  </Text>
</View>
```

#### ✅ Avec des Icônes (@expo/vector-icons)

```tsx
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

<Ionicons name="search" size={24} color={colors.neonGreen} />
<Ionicons name="notifications" size={24} color={colors.neonBlue} />
<Ionicons name="heart" size={24} color={colors.neonYellow} />
```

#### ⚡ Avec NativeWind (optionnel)

**Note:** NativeWind n'est pas encore installé. Pour l'utiliser:

```bash
npm install nativewind tailwindcss
```

Puis dans vos composants:

```tsx
<View className="bg-background border-border">
  <Text className="text-foreground text-2xl font-bold">
    Mordu Sport
  </Text>
</View>
```

---

## 🎨 Palette de Couleurs

### Couleurs Principales
- **morduBlue** (`#00C4FF`) - Bleu principal
- **morduOrange** (`#F27020`) - Orange principal

### Couleurs Néon (pour les icônes)
- **neonGreen** (`#00FF39`) - Icône recherche
- **neonBlue** (`#00D2FF`) - Icône notifications  
- **neonPurple** (`#A470F4`) - Violet
- **neonYellow** (`#FFD700`) - Icône favoris

### Couleurs Système
- **background** (`#0D0D0D`) - Fond principal
- **foreground** (`#F5F5F5`) - Texte principal
- **card** (`#141414`) - Cartes
- **border** (`#333333`) - Bordures
- **muted** (`#1F1F1F`) - Backgrounds secondaires
- **mutedForeground** (`#999999`) - Texte secondaire

### Couleurs par Ligue
- **nhl** (`#00C4FF`) - NHL
- **nba** (`#F27020`) - NBA
- **nfl** (`#DC2626`) - NFL

### États des Matchs
- **live** (`#FF4500`) - EN DIRECT
- **upcoming** (`#999999`) - À VENIR
- **finished** (`#F5F5F5`) - TERMINÉ

---

## 🔤 Polices

### Tailles
```typescript
fonts.sizes.xs      // 12
fonts.sizes.sm      // 14
fonts.sizes.base    // 16
fonts.sizes.lg      // 18
fonts.sizes.xl      // 20
fonts.sizes['2xl']  // 24
fonts.sizes['3xl']  // 30
fonts.sizes['4xl']  // 36 (pour les scores)
```

### Poids
```typescript
fonts.weights.normal    // '400'
fonts.weights.medium    // '500'
fonts.weights.semibold  // '600'
fonts.weights.bold      // '700'
```

---

## 📦 Structure du Projet

```
theme/
  ├── colors.ts          # Définitions des couleurs et polices
  └── README.md          # Ce fichier

tailwind.config.js       # Configuration Tailwind (si NativeWind installé)
```

---

**Profitez-en !** 🚀

