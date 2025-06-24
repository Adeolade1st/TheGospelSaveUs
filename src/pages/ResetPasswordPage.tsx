import React from 'react';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ResetPasswordForm
        onSuccess={() => window.location.href = '/login'}
      />
    </div>
  );
};

export default ResetPasswordPage;