import api from "../api";
import { getApiData, getApiEntity } from "../api.utils";
import { USER_ENDPOINTS } from "./user.endpoints";

const normalizeUser = (user) => {
  if (!user || typeof user !== "object") return null;

  return {
    ...user,
    id: user.id || user._id || "",
    email: user.email || user.mail || "",
    firstName: user.firstName || user.first_name || "",
    lastName: user.lastName || user.last_name || "",
    phoneNumber: user.phoneNumber || user.phone || "",
    governorateId: user.governorateId || "",
    governorateName: user.governorateName || user.governorate || "",
    neighborhoodId: user.neighborhoodId || "",
    neighborhoodName: user.neighborhoodName || user.neighborhood || "",
    isProvider: Boolean(user.isProvider || user.role === "Provider"),
  };
};

export const getMyProfile = async () => {
  const response = await api.get(USER_ENDPOINTS.PROFILE);
  const profile = getApiEntity(response.data, ["user", "profile", "result"]);

  return normalizeUser(profile);
};

export const changeUserRole = async (data) => {
  const response = await api.post(USER_ENDPOINTS.CHANGE_ROLE, data);

  return getApiData(response.data);
};
