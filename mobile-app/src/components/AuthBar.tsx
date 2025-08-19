import React from 'react';
import { View, Text, Button, Image, Platform } from 'react-native';
import { onAuthChanged, loginWithGoogle, logout } from '../services/auth';

export default function AuthBar() {
  const [user, setUser] = React.useState<any>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthChanged(setUser);
    return () => unsub();
  }, []);

  const onLogin = async () => {
    try {
      setBusy(true);
      await loginWithGoogle();
    } catch (e: any) {
      alert(e?.message || 'Login indisponible');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {user ? (
        <>
          {user.photoURL ? <Image source={{ uri: user.photoURL }} style={{ width: 28, height: 28, borderRadius: 14 }} /> : null}
          <Text style={{ color: 'white' }}>{user.displayName || user.email}</Text>
          <Button title="Se déconnecter" onPress={logout} />
        </>
      ) : (
        <Button
          title={Platform.OS === 'web' ? (busy ? 'Connexion...' : 'Se connecter avec Google') : 'Connexion non configurée (web uniquement)'}
          onPress={onLogin}
          disabled={Platform.OS !== 'web' || busy}
        />
      )}
    </View>
  );
}
