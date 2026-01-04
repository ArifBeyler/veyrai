import { Stack } from 'expo-router';
import { Colors } from '../../src/ui/theme';

export default function GenerationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.dark.background },
        animation: 'fade',
      }}
    />
  );
}

