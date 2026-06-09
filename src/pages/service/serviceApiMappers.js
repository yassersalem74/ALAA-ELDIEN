export const SERVICE_LANGUAGE = "en";

export const CATEGORY_API_NAMES = {
  "home-service": "Home_Care",
  "car-care": "Car_Care",
  "personal-care": "Personal_Care",
};

export const ROLE_QUERY_VALUES = {
  individual: "Provider",
  company: "Company",
  "alaa-eldien": "AlaaEldin",
};

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

export const shouldFilterAlaaEldienProviders = (providerType) =>
  providerType === "alaa-eldien";

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
    data?.metaData?.pageCount ??
    data?.metadata?.pageCount ??
    data?.metaData?.totalPages ??
    data?.metadata?.totalPages ??
    data?.totalPages ??
    data?.totalPage ??
    data?.pageCount ??
    data?.pages ??
    payload?.metaData?.pageCount ??
    payload?.metadata?.pageCount ??
    payload?.totalPages ??
    payload?.totalPage ??
    payload?.pageCount ??
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

const DEFAULT_IMAGE_MARKERS = [
  "default",
  "placeholder",
  "no-image",
  "no_image",
  "noimage",
  "fallback",
];

const isApiDefaultImage = (value, imageUrl) => {
  if (value && typeof value === "object") {
    const hasDefaultFlag =
      value.isDefault ||
      value.isDefaultImage ||
      value.isPlaceholder ||
      value.defaultImage;

    if (hasDefaultFlag) return true;
  }

  const normalizedUrl = String(imageUrl || "").toLowerCase();

  return DEFAULT_IMAGE_MARKERS.some((marker) => normalizedUrl.includes(marker));
};

const pickRealImageUrl = (value) => {
  const imageUrl = pickImageUrl(value);

  if (!imageUrl || isApiDefaultImage(value, imageUrl)) return "";

  return imageUrl;
};

const getFirstImage = (service) => {
  const directImages = [
    service.image,
    service.imageUrl,
    service.serviceImage,
    service.coverImage,
    service.mainImage,
  ];

  for (const directImage of directImages) {
    const imageUrl = pickRealImageUrl(directImage);

    if (imageUrl) return imageUrl;
  }

  const imageCollections = [
    service.images,
    service.imageUrls,
    service.serviceImages,
    service.imageFiles,
    service.files,
  ];

  for (const collection of imageCollections) {
    if (!Array.isArray(collection) || !collection.length) continue;

    for (const image of collection) {
      const imageUrl = pickRealImageUrl(image);

      if (imageUrl) return imageUrl;
    }
  }

  return "";
};

const getServiceImages = (service, fallbackImage = "") => {
  const images = [
    service.image,
    service.imageUrl,
    service.serviceImage,
    service.coverImage,
    service.mainImage,
    ...(Array.isArray(service.images) ? service.images : []),
    ...(Array.isArray(service.imageUrls) ? service.imageUrls : []),
    ...(Array.isArray(service.serviceImages) ? service.serviceImages : []),
    ...(Array.isArray(service.imageFiles) ? service.imageFiles : []),
    ...(Array.isArray(service.files) ? service.files : []),
  ]
    .map(pickRealImageUrl)
    .filter(Boolean);

  const realImages = [...new Set(images)];

  return realImages.length ? realImages : [fallbackImage].filter(Boolean);
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
      const from =
        agenda.from ||
        agenda.From ||
        agenda.start ||
        agenda.Start ||
        agenda.startTime ||
        agenda.StartTime ||
        "";
      const to =
        agenda.to ||
        agenda.To ||
        agenda.end ||
        agenda.End ||
        agenda.endTime ||
        agenda.EndTime ||
        "";
      const timeslots = agenda.timeslots || agenda.timeSlots || agenda.slots || [];

      return {
        id: agenda.id || agenda.agendaId || `${day}-${from}-${to}`,
        day,
        dayIndex: getAgendaDayIndex(day),
        from,
        to,
        timeslots: Array.isArray(timeslots)
          ? timeslots.map((slot) => ({
              from:
                slot.from ||
                slot.From ||
                slot.start ||
                slot.Start ||
                slot.startTime ||
                slot.StartTime ||
                "",
              to:
                slot.to ||
                slot.To ||
                slot.end ||
                slot.End ||
                slot.endTime ||
                slot.EndTime ||
                "",
            }))
          : [],
      };
    })
    .filter((agenda) => agenda.day && agenda.dayIndex >= 0 && agenda.from && agenda.to)
    .sort((first, second) => first.dayIndex - second.dayIndex);
};

export const formatServicePrice = (price, currency = "EGP") =>
  `${new Intl.NumberFormat("en-US").format(Number(price) || 0)} ${
    currency === "EGY" ? "EGP" : currency || "EGP"
  }`;

export const normalizeServiceItems = (value) => {
  const items = Array.isArray(value)
    ? value
    : value?.items ||
      value?.Items ||
      value?.serviceItems ||
      value?.ServiceItems ||
      value?.itemDtos ||
      value?.ItemDtos ||
      value?.itemDTOs ||
      value?.ItemDTOs ||
      value?.data?.items ||
      value?.data?.Items ||
      [];

  return items
    .map((item, index) => ({
      id:
        item.id ||
        item.itemId ||
        item.serviceItemId ||
        item.serviceItemID ||
        `item-${index + 1}`,
      name:
        item.name ||
        item.itemName ||
        item.serviceItemName ||
        item.title ||
        "Service item",
      price:
        item.price ??
        item.itemPrice ??
        item.serviceItemPrice ??
        item.servicePrice ??
        item.amount ??
        0,
      description:
        item.description ||
        item.itemDescription ||
        item.serviceItemDescription ||
        "",
    }))
    .filter((item) => item.name);
};

export const isAlaaEldienProvider = (service) => {
  const searchableText = [
    service.providerName,
    service.providerRole,
    service.partnerName,
    service.partnerType,
    service.signatoryName,
    service.raw?.partnerName,
    service.raw?.partnerType,
    service.raw?.signatoryName,
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeText(searchableText).includes("alaa");
};

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
  const providerName =
    service.partnerName ||
    service.signatoryName ||
    service.providerName ||
    service.provider?.name ||
    service.userName ||
    "Provider";
  const providerRole =
    service.partnerType ||
    service.providerRole ||
    service.providerType ||
    service.accountType ||
    service.userType ||
    "";

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
    providerId:
      service.partnerId ||
      service.signatoryId ||
      service.providerId ||
      service.provider?.id ||
      "",
    providerName,
    providerRole,
    providerImage:
      service.partnerImage || service.signatoryImage || service.provider?.image || "",
    neighborhoodId: service.neighborhoodId || service.neighborhood?.id || "",
    neighborhoodName,
    governorateId: service.governorateId || service.governorate?.id || "",
    governorateName,
    location: [neighborhoodName, governorateName].filter(Boolean).join(", "),
    image: getFirstImage(service) || fallbackImage,
    galleryImages: getServiceImages(service, fallbackImage),
    items: normalizeServiceItems(service),
    agendas: normalizeAgendaRows(service.agendas || service.Agendas || []),
    timeslotDurationInMin: Number(service.timeslotDurationInMin) || 60,
    numberOfCustomerPerTimeSlots:
      Number(service.numberOfCustomerPerTimeSlots) || 1,
    concurrencyStamp:
      service.concurrencyStamp ||
      service.ConcurrencyStamp ||
      service.serviceConcurrencyStamp ||
      service.ServiceConcurrencyStamp ||
      "",
    rate: Number(service.rate || service.rating) || 0,
    isAvailable: service.isAvailable ?? service.available ?? true,
    raw: service,
  };
};
