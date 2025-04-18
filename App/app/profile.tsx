// ProfilePage.tsx
import React from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ProfileCard from '@/components/ProfileCard';

export default function ProfilePage() {
  const { authState } = useAuth();
  const user = authState?.user;
  const router = useRouter();

  return (
    <ProfileCard
      name={user?.name}
      email={user?.email}
      role={user?.role}
      gender={user?.gender}
      birthDate={user?.birthDate}
      mobile={user?.mobile}
      country={user?.country}
      zipCode={user?.zipCode}
      onBack={() => router.back()}
    />
  );
}