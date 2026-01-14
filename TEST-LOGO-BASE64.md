# 🧪 Test de conversion Base64 → Image

## ✅ Fonction créée

La fonction `base64ToDataUri` convertit automatiquement le base64 en URI utilisable par React Native.

## 📝 Exemple d'utilisation

```typescript
import { fetchTeamRoster, base64ToDataUri } from '@/lib/services/api'

// Récupérer le roster avec le logo
const rosterData = await fetchTeamRoster('2786') // Winnipeg Jets

if (rosterData) {
  // Le logo est déjà converti en URI utilisable
  const logoUri = rosterData.teamInfo.logo
  // logoUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
  
  // Utiliser directement dans un composant Image
  <Image source={{ uri: logoUri }} style={styles.logo} />
}
```

## 🔧 Fonction utilitaire

```typescript
/**
 * Convertit une image base64 en URI utilisable par React Native
 */
export function base64ToDataUri(base64: string): string {
  if (!base64 || base64.trim().length === 0) {
    return ''
  }
  // Le base64 peut déjà être propre ou contenir des retours à la ligne
  const cleanBase64 = base64.trim().replace(/\s/g, '')
  return `data:image/png;base64,${cleanBase64}`
}
```

## 🎯 Utilisation dans les composants

### TeamBanner (mis à jour)
```typescript
<TeamBanner
  abbr="WPG"
  name="Winnipeg Jets"
  division="Central"
  conference="Western"
  wins={15}
  losses={8}
  otLosses={2}
  points={32}
  logo={rosterData?.teamInfo.logo} // ✅ Logo base64 converti
/>
```

### MatchCard (déjà compatible)
```typescript
// Le logo peut être utilisé directement
<Image
  source={{ uri: match.awayTeam.logo }}
  style={styles.teamLogo}
  resizeMode="contain"
/>
```

### TeamCard (déjà compatible)
```typescript
// Le logo peut être utilisé directement
<Image
  source={{ uri: team.logo }}
  style={styles.teamLogo}
  resizeMode="contain"
/>
```

## ✅ Test rapide

Pour tester rapidement :

```typescript
// Dans un composant ou hook
import { fetchTeamRoster } from '@/lib/services/api'

const testLogo = async () => {
  const data = await fetchTeamRoster('2786')
  if (data?.teamInfo.logo) {
    console.log('Logo URI:', data.teamInfo.logo.substring(0, 50) + '...')
    // Afficher dans un Image component
    return data.teamInfo.logo
  }
}
```

## 📌 Notes importantes

1. **Format supporté:** React Native supporte nativement les URI `data:image/png;base64,...`
2. **Performance:** Les images base64 peuvent être lourdes. Considérez la mise en cache.
3. **Nettoyage:** La fonction nettoie automatiquement les espaces et retours à la ligne du base64.

