import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const URL = "https://al3alamiabackend-production.up.railway.app/users";

// Get User Bills History
const getUserBillsHistory = async (userId) => {
  try {
    const response = await axios.get(`${URL}/${userId}`);
    return response.data.billsHistory || [];
  } catch (error) {
    console.error("Error fetching user bills history:", error);
    return [];
  }
};

export const useUserBillsHistory = (userId) => {
  return useQuery({
    queryKey: ["userBillsHistory", userId],
    queryFn: () => getUserBillsHistory(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

// Add a bill to User Bills History (for both checkout and WhatsApp orders)
const addBillToUserHistory = async ({ userId, newBill }) => {
  try {
    // 1. Get the user's current data
    const userResponse = await axios.get(`${URL}/${userId}`);
    const user = userResponse.data;

    // 2. Update the user's billsHistory array
    const updatedBillsHistory = [...(user.billsHistory || []), newBill];

    // 3. For WhatsApp orders, we need to clear the cart since the entire order is being placed
    let updatedCart = user.cartInfo?.cart || [];
    let newTotalPrice = user.cartInfo?.totalPrice || 0;
    
    // Only clear cart if this is a WhatsApp order (paymentMethod is "WhatsApp")
    if (newBill.paymentMethod === "WhatsApp") {
      updatedCart = [];
      newTotalPrice = 0;
    }

    // 4. Update the user in the database with new billsHistory and updated cart
    await axios.patch(`${URL}/${userId}`, {
      billsHistory: updatedBillsHistory,
      cartInfo: {
        cart: updatedCart,
        isEmpty: updatedCart.length === 0,
        totalPrice: newTotalPrice,
      },
    });

    // Return the updated user data (not just the response data)
    const updatedUser = {
      ...user,
      billsHistory: updatedBillsHistory,
      cartInfo: {
        cart: updatedCart,
        isEmpty: updatedCart.length === 0,
        totalPrice: newTotalPrice,
      },
    };

    return updatedUser;
  } catch (error) {
    console.error("Error adding bill to user history:", error);
    throw error;
  }
};

export const useAddBillToUserHistory = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newBill) => addBillToUserHistory({ userId, newBill }),
    onSuccess: (updatedUser) => {
      // Invalidate the userBillsHistory query to refetch the updated data
      queryClient.invalidateQueries(["userBillsHistory", userId]);
      // Invalidate the cart query to refetch the updated cart data
      queryClient.invalidateQueries(["cart", userId]);
      
      // Return the updated user for use in the component
      return updatedUser;
    },
    onError: (error) => {
      console.error("Failed to add bill to user history:", error);
      // Optionally, display an error message to the user
    },
  });
};
