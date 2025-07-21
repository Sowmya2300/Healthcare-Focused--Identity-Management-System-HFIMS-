// utils/auth.js

// Save token and user to localStorage
export const setAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };
  
  // Get stored token
  export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  // Get stored user object
  export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };
  
  // Get user's role
  export const getUserRole = () => {
    const user = getUser();
    return user?.role;
  };
  
  // Check if logged in
  export const isAuthenticated = () => {
    return !!getToken();
  };
  
  // Logout
  export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };
  