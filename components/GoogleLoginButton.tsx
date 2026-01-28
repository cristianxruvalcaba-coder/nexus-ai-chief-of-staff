import React from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { authService } from '../services/authService';

interface GoogleLoginButtonProps {
  onSuccess: (user: any) => void;
  onError?: () => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const user = await authService.handleGoogleLogin(credentialResponse);
      onSuccess(user);
    } catch (error) {
      console.error('Login failed:', error);
      onError?.();
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');
    onError?.();
  };

  if (!clientId) {
    console.error('Google Client ID is not configured');
    return <div>OAuth configuration error</div>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        ux_mode="popup"
        prompt="select_account"
        theme="filled_blue"
        size="large"
        text="signin_with"
        shape="rectangular"
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
