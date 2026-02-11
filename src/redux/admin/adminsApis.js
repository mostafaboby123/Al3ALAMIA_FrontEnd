import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const URL = "https://al3alamiabackend-production.up.railway.app/admin";

const getAdmins = async () => {
  try {
    const res = await axios.get(URL);
    return res.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const useAdmins = () => {
  return useQuery({
    queryKey: ["admins"],
    queryFn: getAdmins,
    staleTime: 1000 * 60 * 5,
  });
};

const getUsers = async () => {
  try {
    const res = await axios.get("https://al3alamiabackend-production.up.railway.app/users");
    return res.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5,
  });
};
