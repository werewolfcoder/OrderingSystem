import React, { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [cart, setCart] = useState({});
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (itemId, delta) => {
    setQuantities((prevQuantities) => {
      const newQuantity = (prevQuantities[itemId] || 0) + delta;
      if (newQuantity <= 0) {
        const { [itemId]: _, ...rest } = prevQuantities;
        return rest;
      }
      return { ...prevQuantities, [itemId]: newQuantity };
    });
  };

  const handleAddToCart = (itemId) => {
    if (!quantities[itemId]) return;
    setCart((prevCart) => {
      const newQuantity = (prevCart[itemId] || 0) + quantities[itemId];
      return { ...prevCart, [itemId]: newQuantity };
    });
    setQuantities((prevQuantities) => {
      const { [itemId]: _, ...rest } = prevQuantities;
      return rest;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const removeItem = (itemId) => {
    setCart((prevCart) => {
      const { [itemId]: _, ...rest } = prevCart;
      return rest;
    });
  };

  return (
    <OrderContext.Provider value={{
      cart,
      quantities,
      handleQuantityChange,
      handleAddToCart,
      clearCart,
      removeItem
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => useContext(OrderContext);
