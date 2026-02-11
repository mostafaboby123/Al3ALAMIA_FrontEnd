import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const URL = "https://al3alamiabackend-production.up.railway.app/products";

// update doctor rating function
const updateRating = (reviews) => {
  const ratingList = reviews.map((r) => r.rating);
  const rateSum = ratingList.reduce((prev, current) => {
    return prev + current;
  }, 0);
  return (rateSum / ratingList.length).toFixed(1);
};

// add review on doctor post
const addReview = async ({ productId, reviewData }) => {
  try {
    const { data } = await axios.get(`${URL}/${productId}`);
    const updatedReviews = [reviewData, ...data.reviews];
    const doctorRate = updateRating(updatedReviews);
    const res = await axios.patch(`${URL}/${productId}`, {
      reviews: updatedReviews,
      rating: doctorRate,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const useAddReview = (productId, onSuccessCallback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData) => addReview({ productId, reviewData }),
    onSuccess: () => {
      queryClient.invalidateQueries(["doctorReviews", productId]);
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

// update existing review for doctor post
const updateReview = async ({ productId, reviewData }) => {
  try {
    const { data } = await axios.get(`${URL}/${productId}`);
    const updatedReviews = data.reviews.map((review) => (review.clientId === reviewData.clientId ? reviewData : review));
    const doctorRate = updateRating(updatedReviews);
    const res = await axios.patch(`${URL}/${productId}`, {
      reviews: updatedReviews,
      rating: doctorRate,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const useUpdateReview = (productId, onSuccessCallback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData) => updateReview({ productId, reviewData }),
    onSuccess: () => {
      queryClient.invalidateQueries(["doctorReviews", productId]);
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
