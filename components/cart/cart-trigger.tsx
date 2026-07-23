"use client";

import { useCart } from "./cart-context";
import { useCartModal } from "./cart-modal-context";
import OpenCart from "./open-cart";

export default function CartTrigger() {
  const { cart } = useCart();
  const { openCart } = useCartModal();

  return (
    <button aria-label="Open cart" onClick={openCart}>
      <OpenCart quantity={cart?.totalQuantity} />
    </button>
  );
}
