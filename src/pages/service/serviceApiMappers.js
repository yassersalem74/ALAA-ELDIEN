export const SERVICE_LANGUAGE = "en";

export const CATEGORY_API_NAMES = {
  "home-service": "Home_Care",
  "car-care": "Car_Care",
  "personal-care": "Personal_Care",
};

export const ROLE_QUERY_VALUES = {
  individual: "Individual",
  company: "Company",
  "alaa-eldien": "Alaa_Eldien",
};

export const ALL_PROVIDER_ROLE_VALUES = Object.values(ROLE_QUERY_VALUES);

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const isSupportedServiceCategory = (categorySlug) =>
  Boolean(CATEGORY_API_NAMES[categorySlug]);

export const getApiCategoryName = (categorySlug) =>
  CATEGORY_API_NAMES[categorySlug] || "";

export const getRoleQueryValue = (providerType) =>
  ROLE_QUERY_VALUES[providerType];

export const getRoleQueryValues = (providerType) =>
  providerType === "all"
    ? ALL_PROVIDER_ROLE_VALUES
    : [getRoleQueryValue(providerType)].filter(Boolean);

export const toDisplayMessage = (
  value,
  fallback = "Something went wrong."
) => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const message = value
      .map((item) => toDisplayMessage(item, ""))
      .filter(Boolean)
      .join(", ");

    return message || fallback;
  }

  if (typeof value === "object") {
    return (
      toDisplayMessage(value.message, "") ||
      toDisplayMessage(value.title, "") ||
      toDisplayMessage(value.error, "") ||
      JSON.stringify(value)
    );
  }

  return fallback;
};

export const getApiErrorMessage = (
  error,
  fallback = "Unable to complete the request."
) =>
  toDisplayMessage(
    error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data ||
      error?.message,
    fallback
  );

export const extractPayloadData = (payload) => payload?.data ?? payload;

export const extractApiArray = (payload) => {
  const data = extractPayloadData(payload);

  if (Array.isArray(data)) return data;

  const candidates = [
    data?.items,
    data?.services,
    data?.results,
    data?.result,
    data?.data,
    payload?.items,
    payload?.services,
    payload?.results,
  ];

  return candidates.find(Array.isArray) || [];
};

export const extractTotalPages = (payload) => {
  const data = extractPayloadData(payload);
  const value =
    data?.totalPages ??
    data?.totalPage ??
    data?.pages ??
    payload?.totalPages ??
    payload?.totalPage ??
    payload?.pages;

  return Math.max(1, Number(value) || 1);
};

const pickImageUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return (
      value.url ||
      value.imageUrl ||
      value.image ||
      value.path ||
      value.fileUrl ||
      ""
    );
  }

  return "";
};

const getFirstImage = (service) => {
  const directImage =
    service.image ||
    service.imageUrl ||
    service.serviceImage ||
    service.coverImage ||
    service.mainImage;

  if (directImage) return pickImageUrl(directImage);

  const imageCollections = [
    service.images,
    service.imageUrls,
    service.serviceImages,
    service.imageFiles,
    service.files,
  ];

  for (const collection of imageCollections) {
    if (!Array.isArray(collection) || !collection.length) continue;

    const imageUrl = pickImageUrl(collection[0]);

    if (imageUrl) return imageUrl;
  }

  return "";
};

export const normalizeLocationOptions = (payload) =>
  extractApiArray(payload)
    .map((item) => {
      if (typeof item === "string") {
        return { id: item, name: item };
      }

      const id =
        item?.id ||
        item?.governorateId ||
        item?.neighborhoodId ||
        item?.value ||
        "";
      const name =
        item?.name ||
        item?.governorateName ||
        item?.neighborhoodName ||
        item?.title ||
        item?.label ||
        "";

      return { id, name };
    })
    .filter((option) => option.id && option.name);

export const getAgendaDayIndex = (day) => {
  const normalizedDay = normalizeText(day);

  return WEEKDAY_NAMES.findIndex(
    (weekday) => normalizeText(weekday) === normalizedDay
  );
};

export const formatTimeLabel = (timeValue) => {
  if (!timeValue) return "";

  const [hourPart = "0", minutePart = "0"] = String(timeValue).split(":");
  const hour = Number(hourPart) || 0;
  const minute = Number(minutePart) || 0;
  const displayHour = hour % 12 || 12;
  const suffix = hour >= 12 ? "PM" : "AM";

  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
};

export const normalizeAgendaRows = (value) => {
  const agendas = Array.isArray(value)
    ? value
    : value?.agendas || value?.Agendas || [];

  return agendas
    .map((agenda) => {
      const day = agenda.day || agenda.Day || "";
      const from = agenda.from || agenda.From || "";
      const to = agenda.to || agenda.To || "";
      const timeslots = agenda.timeslots || agenda.timeSlots || agenda.slots || [];

      return {
        id: agenda.id || agenda.agendaId || `${day}-${from}-${to}`,
        day,
        dayIndex: getAgendaDayIndex(day),
        from,
        to,
        timeslots: Array.isArray(timeslots)
          ? timeslots.map((slot) => ({
              from: slot.from || slot.From || "",
              to: slot.to || slot.To || "",
            }))
          : [],
      };
    })
    .filter((agenda) => agenda.day && agenda.dayIndex >= 0 && agenda.from && agenda.to)
    .sort((first, second) => first.dayIndex - second.dayIndex);
};

export const formatServicePrice = (price, currency = "EGP") =>
  `${new Intl.NumberFormat("en-US").format(Number(price) || 0)} ${currency || "EGP"}`;

export const normalizeService = (service, fallbackImage = "") => {
  const id =
    service.serviceId ||
    service.id ||
    service.serviceID ||
    service.providerServiceId ||
    "";
  const price =
    service.servicePrice ??
    service.price ??
    service.totalPrice ??
    service.itemsPrice ??
    0;
  const currency = service.serviceCurrency || service.currency || "EGP";
  const neighborhoodName =
    service.neighborhoodName || service.neighborhood?.name || "";
  const governorateName =
    service.governorateName || service.governorate?.name || "";

  return {
    id,
    name: service.serviceName || service.name || service.title || "Service",
    description: service.description || service.serviceDescription || "",
    subDescription:
      service.subDescription ||
      service.serviceSubDescription ||
      service.shortDescription ||
      "",
    price,
    currency,
    categoryName:
      service.serviceCategory || service.categoryName || service.category || "",
    providerId: service.providerId || service.provider?.id || "",
    providerName:
      service.providerName || service.provider?.name || service.userName || "Provider",
    providerRole:
      service.providerRole ||
      service.providerType ||
      service.accountType ||
      service.userType ||
      "",
    neighborhoodId: service.neighborhoodId || service.neighborhood?.id || "",
    neighborhoodName,
    governorateId: service.governorateId || service.governorate?.id || "",
    governorateName,
    location: [neighborhoodName, governorateName].filter(Boolean).join(", "),
    image: getFirstImage(service) || fallbackImage,
    items: service.items || [],
    agendas: normalizeAgendaRows(service.agendas || service.Agendas || []),
    raw: service,
  };
};
