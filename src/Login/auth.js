// AuthService.js - Authentication service for React applications

class AuthService {
    // Store user data in localStorage
    static storeUser(userData, token) {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
    }
  
    // Get user data from localStorage
    static getUser() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user data:', e);
          return null;
        }
      }
      return null;
    }
  
    // Clear user data from localStorage
    static clearStorage() {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  
    // Check if user is authenticated
    static isAuthenticated() {
      return !!localStorage.getItem('token');
    }
  
    // Login user
    static async login(username, password) {
      try {
        // This would be replaced with actual API calls in production
        // For example:
        // const response = await fetch('/api/auth/login', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ username, password })
        // });
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock authentication logic (replace with actual API call)
        if (username === 'demo' && password === 'password') {
          const userData = {
            id: '1',
            username: 'demo',
            email: 'demo@example.com',
            hasProfile: true
          };
          const token = 'mock-jwt-token';
          
          this.storeUser(userData, token);
          
          return {
            success: true,
            data: { user: userData, token }
          };
        } else {
          return {
            success: false,
            error: 'Invalid username or password'
          };
        }
      } catch (error) {
        console.error('Login error:', error);
        return {
          success: false,
          error: 'An error occurred during login'
        };
      }
    }
  
    // Register user
    static async register(email, username, password) {
      try {
        // This would be replaced with actual API calls in production
        // For example:
        // const response = await fetch('/api/auth/register', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email, username, password })
        // });
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock registration logic (replace with actual API call)
        const userData = {
          id: Date.now().toString(),
          username,
          email,
          hasProfile: false
        };
        const token = 'mock-jwt-token-' + Date.now();
        
        this.storeUser(userData, token);
        
        return {
          success: true,
          data: { user: userData, token }
        };
      } catch (error) {
        console.error('Registration error:', error);
        return {
          success: false,
          error: 'An error occurred during registration'
        };
      }
    }
  
    // Get current user info
    static async getCurrentUser() {
      try {
        const user = this.getUser();
        const token = localStorage.getItem('token');
        
        if (!user || !token) {
          return { success: false };
        }
        
        // In a real app, you would validate the token with your backend here
        // For example:
        // const response = await fetch('/api/auth/me', {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // const data = await response.json();
        
        return {
          success: true,
          data: { user }
        };
      } catch (error) {
        console.error('Get current user error:', error);
        return {
          success: false,
          error: 'Failed to verify authentication'
        };
      }
    }
  
    // Logout user
    static async logout() {
      try {
        // In a real app, you might need to invalidate the token on the server
        // For example:
        // const token = localStorage.getItem('token');
        // await fetch('/api/auth/logout', {
        //   method: 'POST',
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        
        this.clearStorage();
        return { success: true };
      } catch (error) {
        console.error('Logout error:', error);
        return {
          success: false,
          error: 'Logout failed'
        };
      }
    }
  }
  
  export default AuthService;
