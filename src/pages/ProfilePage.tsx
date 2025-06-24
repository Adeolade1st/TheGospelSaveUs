import React from 'react';
import UserProfile from '../components/auth/UserProfile';

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <UserProfile />
    </div>
  );
};

export default ProfilePage;