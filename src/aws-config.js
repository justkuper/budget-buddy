// AWS Amplify Configuration
// Copy .env.example to .env and fill in your values
// Set up in AWS Console: Cognito > User Pools

export const awsConfig = {
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      userPoolId: import.meta.env.VITE_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || '',
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_OAUTH_DOMAIN || '',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [import.meta.env.VITE_REDIRECT_SIGN_IN || 'http://localhost:3000/'],
          redirectSignOut: [import.meta.env.VITE_REDIRECT_SIGN_OUT || 'http://localhost:3000/login'],
          responseType: 'code',
        },
        email: true,
        username: false,
      },
      mfa: {
        status: 'optional',
        totpEnabled: true,
        smsEnabled: true,
      },
    },
  },
}
