import { useEffect, useState } from 'react';

function GoogleSignIn() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Load the Google API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    
    // Initialize Google Sign-In when script is loaded
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual client ID
        callback: handleCredentialResponse
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large', text: 'signup_with' }
      );
    };
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  
  function handleCredentialResponse(response) {
    // Handle the Google sign-in response
    const credential = response.credential;
    // Decode JWT token to get user information
    const decodedToken = JSON.parse(atob(credential.split('.')[1]));
    
    setUser({
      name: decodedToken.name,
      email: decodedToken.email,
      picture: decodedToken.picture
    });
    setIsSignedIn(true);
    
    // You can send this token to your backend for verification
    console.log('ID Token:', credential);
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      {!isSignedIn ? (
        <div className="flex flex-col items-center space-y-4 w-full bg-white rounded-lg shadow-md p-8 max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800">Sign up with Google</h2>
          <p className="text-gray-600 text-center mb-4">Click the button below to sign up with your Google account</p>
          <div id="google-signin-button" className="mt-2"></div>
        </div>
      ) : (
        // Rest of your component stays the same
        <div className="flex flex-col items-center space-y-4 w-full bg-white rounded-lg shadow-md p-8 max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800">Welcome, {user.name}!</h2>
          <img 
            src={user.picture} 
            alt="Profile" 
            className="w-20 h-20 rounded-full border-2 border-gray-300"
          />
          <p className="text-gray-600">{user.email}</p>
          <button 
            onClick={() => {
              window.google.accounts.id.disableAutoSelect();
              setUser(null);
              setIsSignedIn(false);
            }} 
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default GoogleSignIn;