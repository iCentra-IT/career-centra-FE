import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addCartItem,
  addStandaloneCartAddon,
  checkoutCart,
  emptyCart,
  mergeGuestCart,
  removeCartItem,
  removeStandaloneCartAddon,
  setCartItemAddons,
} from "@/lib/api/cart";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import type {
  AddToCartRequest,
  Cart,
  CartCheckoutRequest,
  CartCheckoutResponse,
  MergeGuestCartRequest,
  MergeGuestCartResponse,
  SetCartAddonsRequest,
} from "@/types/cart";

// Every cart write returns the full priced Cart — push it into cache and keep the nav badge in
// sync via total_item_count, which the backend already computes as item_count +
// standalone_addons.length (matching /api/cart/count/) — see apps.cart.services.build_cart_payload.
// Using item_count alone here used to under-count the badge by the number of standalone add-ons in
// the cart; reading the backend's own total avoids re-deriving that sum (and re-breaking it) here.
function useCartWrite<TArgs>(mutationFn: (args: TArgs) => Promise<Cart>) {
  const queryClient = useQueryClient();

  return useMutation<Cart, NormalizedError, TArgs>({
    mutationFn,
    onSuccess: (cart) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.root });
      queryClient.setQueryData(queryKeys.cart.count, cart.total_item_count);
    },
  });
}

export function useAddToCart() {
  return useCartWrite<AddToCartRequest>(addCartItem);
}

export function useRemoveCartItem() {
  return useCartWrite<number>(removeCartItem);
}

export function useEmptyCart() {
  return useCartWrite<void>(() => emptyCart());
}

export function useMergeGuestCart() {
  const queryClient = useQueryClient();

  return useMutation<MergeGuestCartResponse, NormalizedError, MergeGuestCartRequest>({
    mutationFn: mergeGuestCart,
    onSuccess: (cart) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.root });
      queryClient.setQueryData(queryKeys.cart.count, cart.total_item_count);
    },
  });
}

export function useCheckoutCart() {
  return useMutation<CartCheckoutResponse, NormalizedError, CartCheckoutRequest>({
    mutationFn: checkoutCart,
  });
}

export function useSetCartItemAddons() {
  return useCartWrite(({ cohortId, payload }: { cohortId: number; payload: SetCartAddonsRequest }) =>
    setCartItemAddons(cohortId, payload),
  );
}

export function useAddStandaloneCartAddon() {
  return useCartWrite<number>(addStandaloneCartAddon);
}

export function useRemoveStandaloneCartAddon() {
  return useCartWrite<number>(removeStandaloneCartAddon);
}
