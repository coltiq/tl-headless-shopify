"use client";

import { useEffect, useRef } from "react";
import { createCartAndSetCookie } from "./actions";
import { useCart } from "./cart-context";
import { useCartModal } from "./cart-modal-context";

/** Owns the cart side effects that must run exactly once, regardless of how
 * many CartTrigger buttons are mounted (desktop + mobile). */
export default function CartEffects() {
  const { cart } = useCart();
  const { isOpen, openCart } = useCartModal();
  const quantityRef = useRef(cart?.totalQuantity);

  useEffect(() => {
    if (!cart) {
      createCartAndSetCookie();
    }
  }, [cart]);

  useEffect(() => {
    if (
      cart?.totalQuantity &&
      cart?.totalQuantity !== quantityRef.current &&
      cart?.totalQuantity > 0
    ) {
      if (!isOpen) {
        openCart();
      }
      quantityRef.current = cart?.totalQuantity;
    }
  }, [isOpen, cart?.totalQuantity, openCart]);

  return null;
}
