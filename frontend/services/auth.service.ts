const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || 'http://backend:4000';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

export const authService = {
  async requestOtp(mobile: string) {
    const res = await fetch(`${getBaseUrl()}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile }),
    });
    if (!res.ok) throw new Error('Failed to request OTP');
    return await res.json();
  },

  async verifyOtp(mobile: string, code: string) {
    const res = await fetch(`${getBaseUrl()}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, code }),
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
    
    // Save token to localStorage for persistent session
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('ariwatch_token', data.token);
      localStorage.setItem('ariwatch_user', JSON.stringify(data.user));
    }
    
    return data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ariwatch_token');
      localStorage.removeItem('ariwatch_user');
    }
  },

  isAuthenticated() {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('ariwatch_token');
    }
    return false;
  }
};
