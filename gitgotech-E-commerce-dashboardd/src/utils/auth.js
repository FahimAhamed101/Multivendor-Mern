// Authentication utility functions

export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const hasAccess = (allowedRoles) => {
  const role = getUserRole();
  return allowedRoles.includes(role);
};

export const isAdmin = () => {
  return getUserRole() === 'admin';
};

export const isManager = () => {
  return getUserRole() === 'manager';
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('isAuthenticated');
};
