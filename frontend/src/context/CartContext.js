import React, { createContext, useContext, useReducer, useEffect } from "react";

// Generate unique cart item ID
const generateCartItemId = () => {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Migrate old cart items that don't have cartItemId
const migrateCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => {
    if (!item.cartItemId) {
      return {
        ...item,
        cartItemId: `migrated_${Date.now()}_${index}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };
    }
    return item;
  });
};

// Create cart context
const CartContext = createContext();

// Load and migrate cart items from localStorage
const loadCartItems = () => {
  try {
    const stored = localStorage.getItem("cartItems");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    const migrated = migrateCartItems(parsed);
    // Save migrated items back to localStorage
    localStorage.setItem("cartItems", JSON.stringify(migrated));
    return migrated;
  } catch (e) {
    console.error("Error loading cart:", e);
    return [];
  }
};

// Initial state
const initialState = {
  cartItems: loadCartItems(),
  isLoading: false,
  error: null,
};

// Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      // Always add as a new item with unique cartItemId
      const newItem = {
        ...action.payload,
        cartItemId: generateCartItemId(), // Unique ID for each cart entry
        quantity: action.payload.quantity || 1,
        checkInDate:
          action.payload.checkInDate || new Date().toISOString().split("T")[0],
        checkOutDate:
          action.payload.checkOutDate ||
          new Date(Date.now() + 86400000).toISOString().split("T")[0],
        nights: action.payload.nights || 1,
      };

      return {
        ...state,
        cartItems: [...state.cartItems, newItem],
      };

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item.cartItemId !== action.payload
        ),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.cartItemId === action.payload.cartItemId
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };

    case "CLEAR_CART":
      return {
        ...state,
        cartItems: [],
      };

    case "LOADING":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

// Cart Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Update localStorage when cart changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  // Add item to cart
  const addToCart = (room) => {
    // Ensure all required fields are present
    const payload = {
      ...room,
      quantity: room.quantity || 1,
      checkInDate: room.checkInDate || new Date().toISOString().split("T")[0],
      checkOutDate:
        room.checkOutDate ||
        new Date(Date.now() + 86400000).toISOString().split("T")[0],
      nights:
        room.nights ||
        (room.checkInDate && room.checkOutDate
          ? Math.max(
              1,
              Math.round(
                (new Date(room.checkOutDate) - new Date(room.checkInDate)) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : 1),
    };
    dispatch({ type: "ADD_TO_CART", payload });
  };

  // Remove item from cart (uses cartItemId)
  const removeFromCart = (cartItemId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: cartItemId });
  };

  // Update item quantity or other properties (uses cartItemId)
  const updateQuantity = (cartItemId, updates) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { cartItemId, updates } });
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  // Calculate total price
  const getCartTotal = () => {
    return state.cartItems.reduce(
      (total, item) => total + item.price * item.quantity * (item.nights || 1),
      0
    );
  };

  // Context value
  const value = {
    cartItems: state.cartItems,
    isLoading: state.isLoading,
    error: state.error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
