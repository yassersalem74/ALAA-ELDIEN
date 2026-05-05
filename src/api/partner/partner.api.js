import api from "../api";
import { getApiData, getApiList, getItemId, toArray, toNumber } from "../api.utils";
import { PARTNER_ENDPOINTS } from "./partner.endpoints";

const getFirstValue = (source, keys, fallback = "") => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
};

const getFirstArray = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];

    if (Array.isArray(value)) return value;
  }

  return [];
};

const normalizeImage = (image) => {
  if (typeof image === "string") return image;

  return (
    image?.url ||
    image?.imageUrl ||
    image?.path ||
    image?.filePath ||
    image?.src ||
    ""
  );
};

const normalizeItem = (item) => ({
  id: getItemId(item),
  itemName: getFirstValue(item, ["itemName", "name", "title"]),
  price: getFirstValue(item, ["price"], 0),
  description: getFirstValue(item, ["description", "details"]),
});

const normalizeAgenda = (agenda) => ({
  day: getFirstValue(agenda, ["day", "dayName"]),
  from: getFirstValue(agenda, ["from", "start", "startTime"]),
  to: getFirstValue(agenda, ["to", "end", "endTime"]),
});

export const normalizeService = (service) => ({
  ...service,
  id: getItemId(service),
  name: getFirstValue(service, ["name", "serviceName", "title"]),
  price: toNumber(getFirstValue(service, ["price"], 0), 0),
  currency: getFirstValue(service, ["currency"], "EGP"),
  categoryName: getFirstValue(service, ["categoryName", "category"], ""),
  timeslotDurationInMin: toNumber(
    getFirstValue(service, ["timeslotDurationInMin", "serviceTime", "duration"], 60),
    60
  ),
  numberOfCustomerPerTimeSlots: toNumber(
    getFirstValue(
      service,
      ["numberOfCustomerPerTimeSlots", "customersPerSlot", "slotsPerWindow"],
      1
    ),
    1
  ),
  description: getFirstValue(service, ["description", "details"], ""),
  subDescription: getFirstValue(service, ["subDescription", "summary", "shortDescription"], ""),
  neighborhoodId: getFirstValue(service, ["neighborhoodId"], ""),
  neighborhoodName: getFirstValue(service, ["neighborhoodName", "neighborhood"], ""),
  governorateId: getFirstValue(service, ["governorateId"], ""),
  governorateName: getFirstValue(service, ["governorateName", "governorate"], ""),
  isAvailable: getFirstValue(service, ["isAvailable"], true) !== false,
  imageUrls: getFirstArray(service, ["imageUrls", "images", "serviceImages", "imageFiles"])
    .map(normalizeImage)
    .filter(Boolean),
  items: getFirstArray(service, ["items", "serviceItems"]).map(normalizeItem),
  agendas: getFirstArray(service, ["agendas", "availability"]).map(normalizeAgenda),
});

export const normalizePackage = (partnerPackage) => ({
  ...partnerPackage,
  id: getItemId(partnerPackage),
  name: getFirstValue(partnerPackage, ["name", "packageName", "title"]),
  billingPeriod: getFirstValue(partnerPackage, ["billingPeriod", "pricingType"], "Monthly"),
  duration: toNumber(getFirstValue(partnerPackage, ["duration"], 1), 1),
  price: toNumber(getFirstValue(partnerPackage, ["price"], 0), 0),
  serviceIds: toArray(
    getFirstValue(partnerPackage, ["serviceIds"], []) || partnerPackage?.services?.map(getItemId)
  ).filter(Boolean),
  services: getFirstArray(partnerPackage, ["services"]).map(normalizeService),
});

const buildServiceFormData = (payload) => {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("price", String(payload.price));
  formData.append("currency", payload.currency);
  formData.append("categoryName", payload.categoryName);
  formData.append("timeslotDurationInMin", String(payload.timeslotDurationInMin));
  formData.append(
    "numberOfCustomerPerTimeSlots",
    String(payload.numberOfCustomerPerTimeSlots)
  );
  formData.append("description", payload.description);
  formData.append("subDescription", payload.subDescription);
  formData.append("neighborhoodId", payload.neighborhoodId);

  toArray(payload.imageFiles).forEach((file) => {
    if (file) {
      formData.append("imageFiles", file);
    }
  });

  toArray(payload.deletedImages).forEach((imageUrl) => {
    if (imageUrl) {
      formData.append("deletedImages", imageUrl);
    }
  });

  return formData;
};

export const getMyServices = async () => {
  const response = await api.get(PARTNER_ENDPOINTS.MY_SERVICES);
  const services = getApiList(response.data, ["services", "result", "results", "items"]);

  return services.map(normalizeService);
};

export const createService = async (payload) => {
  const response = await api.post(PARTNER_ENDPOINTS.SERVICES, buildServiceFormData(payload), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const data = getApiData(response.data);

  if (typeof data === "string") {
    return { id: data };
  }

  return normalizeService(data || {});
};

export const updateService = async (serviceId, payload) => {
  const response = await api.put(
    `${PARTNER_ENDPOINTS.SERVICES}/${serviceId}`,
    buildServiceFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const data = getApiData(response.data);

  if (typeof data === "string") {
    return { id: data || serviceId };
  }

  return normalizeService(data || { id: serviceId });
};

export const deleteService = async (serviceId) => {
  await api.delete(`${PARTNER_ENDPOINTS.SERVICES}/${serviceId}`);

  return serviceId;
};

export const saveServiceItems = async (serviceId, items) => {
  const response = await api.post(PARTNER_ENDPOINTS.ITEMS_FOR_SERVICE(serviceId), {
    items: items.map((item) => ({
      name: item.itemName,
      price: toNumber(item.price, 0),
      description: item.description,
    })),
  });

  return getApiData(response.data);
};

export const saveServiceAgendas = async (serviceId, agendas) => {
  const response = await api.post(PARTNER_ENDPOINTS.AGENDAS_FOR_SERVICE(serviceId), {
    agendas,
  });

  return getApiData(response.data);
};

export const getMyPackages = async () => {
  const response = await api.get(PARTNER_ENDPOINTS.MY_PACKAGES);
  const packages = getApiList(response.data, ["packages", "result", "results", "items"]);

  return packages.map(normalizePackage);
};

export const getPackageById = async (packageId) => {
  const response = await api.get(`${PARTNER_ENDPOINTS.PACKAGES}/${packageId}`);
  const data = getApiData(response.data);

  return normalizePackage(data || {});
};

export const createPackage = async (payload) => {
  const response = await api.post(PARTNER_ENDPOINTS.PACKAGES, payload);
  const data = getApiData(response.data);

  if (typeof data === "string") {
    return { id: data, ...payload };
  }

  return normalizePackage(data || payload);
};

export const updatePackage = async (packageId, payload) => {
  const response = await api.put(`${PARTNER_ENDPOINTS.PACKAGES}/${packageId}`, payload);
  const data = getApiData(response.data);

  if (typeof data === "string") {
    return { id: data || packageId, ...payload };
  }

  return normalizePackage(data || { id: packageId, ...payload });
};
