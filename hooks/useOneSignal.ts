import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { OneSignal, LogLevel } from 'react-native-onesignal';

const ONESIGNAL_APP_ID = '96cc2045-0e7a-462a-8d88-5c9ba4c4d56e';

export function useOneSignal() {
  useEffect(() => {
    if (__DEV__) {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    }

    OneSignal.initialize(ONESIGNAL_APP_ID);

    OneSignal.Notifications.requestPermission(true);

    // Link OneSignal player to Supabase user
    const linkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        OneSignal.login(user.id);
      }
    };

    linkUser();

    // Keep OneSignal in sync with auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          OneSignal.login(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          OneSignal.logout();
        }
      }
    );

    // Handle notification tap — redirect to relevant screen
    const handleClick = (event: any) => {
      const data = event.notification.additionalData as Record<string, string> | undefined;
      if (!data) return;

      const { router } = require('expo-router');

      if (data.type === 'match' && data.matchId) {
        router.push(`/(tabs)/match/${data.matchId}`);
      } else if (data.type === 'team' && data.teamId) {
        router.push(`/(tabs)/teams/${data.teamId}`);
      } else if (data.type === 'news') {
        router.push('/(tabs)/mordusport');
      }
    };

    OneSignal.Notifications.addEventListener('click', handleClick);

    return () => {
      subscription.unsubscribe();
      OneSignal.Notifications.removeEventListener('click', handleClick);
    };
  }, []);
}
