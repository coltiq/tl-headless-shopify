"use client";

import React, { createContext, useContext, useState } from "react";

type CartModalContextType = {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartModalContext = createContext<CartModalContextType | undefined>(
  undefined,
);

export function CartModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return (
    <CartModalContext.Provider value={{ isOpen, openCart, closeCart }}>
      {children}
    </CartModalContext.Provider>
  );
}

export function useCartModal() {
  const context = useContext(CartModalContext);
  if (context === undefined) {
    throw new Error("useCartModal must be used within a CartModalProvider");
  }
  return context;
}
