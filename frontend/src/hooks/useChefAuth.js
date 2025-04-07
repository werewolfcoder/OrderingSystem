import { useState, useEffect } from 'react';
import axios from 'axios';

export const useChefAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('chefToken');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        await axios.get(`${import.meta.env.VITE_BASE_URL}/chef/verify`, {
          headers: { Authorization: token }
        });
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('chefToken');
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  return { isAuthenticated, isLoading };
};
