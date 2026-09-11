import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addCartItem,
  checkoutCart,
  emptyCart,
  mergeGuestCart,
  removeCartItem,
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
} from "@/types/cart";

// Every cart write returns the full priced Cart — push it into cache and keep the nav badge in sync.
function useCartWrite<TArgs>(mutationFn: (args: TArgs) => Promise<Cart>) {
  const queryClient = useQueryClient();

  return useMutation<Cart, NormalizedError, TArgs>({
    mutationFn,
    onSuccess: (cart) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.root });
      queryClient.setQueryData(queryKeys.cart.count, cart.item_count);
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
      queryClient.setQueryData(queryKeys.cart.count, cart.item_count);
    },
  });
}

export function useCheckoutCart() {
  return useMutation<CartCheckoutResponse, NormalizedError, CartCheckoutRequest>({
    mutationFn: checkoutCart,
  });
}
