import emptyServiceImage from "../../../assets/images/service/add-service/empty-service.png";
import addImageIllustration from "../../../assets/images/service/add-service/add-image.png";
import marketplaceIllustration from "../../../assets/images/service/add-service/market-place.png";
import servicesIllustration from "../../../assets/images/service/add-service/services.png";
import storeIllustration from "../../../assets/images/service/add-service/store.png";
import successAddServiceImage from "../../../assets/images/service/add-service/success-add-service.png";
import { serviceCategories } from "../../../data/serviceFlowData";

export const PARTNER_ENTRY_OPTIONS = [
  {
    id: "services",
    label: "Services",
    image: servicesIllustration,
    description:
      "Offer professional home repairs, cleaning, beauty, or tutoring services.",
  },
  {
    id: "store",
    label: "Store",
    image: storeIllustration,
    description:
      "Sell physical products directly to customers with integrated delivery.",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    image: marketplaceIllustration,
    description:
      "Connect buyers and sellers in a peer-to-peer specialized marketplace.",
  },
];

export const PARTNER_TABS = PARTNER_ENTRY_OPTIONS.map(
  ({ id, label, image }) => ({
    id,
    label,
    image,
  })
);

export const FLOW_STEPS = [
  { id: 1, label: "My services" },
  { id: 2, label: "Service details" },
  { id: 3, label: "Service items" },
  { id: 4, label: "Packages" },
  { id: 5, label: "Availability" },
];

export const SERVICE_CATEGORY_OPTIONS = serviceCategories
  .filter((category) => category.slug !== "real-estate")
  .map((category) => ({
    value: category.slug,
    label: category.shortLabel || category.title,
  }));

export const GOVERNORATE_OPTIONS = [
  {
    value: "cairo",
    label: "Cairo",
    areas: ["Maadi", "Heliopolis", "Nasr City", "New Cairo"],
  },
  {
    value: "giza",
    label: "Giza",
    areas: ["Dokki", "Mohandessin", "6th of October", "Sheikh Zayed"],
  },
  {
    value: "alexandria",
    label: "Alexandria",
    areas: ["Stanley", "Smouha", "Gleem", "Sidi Gaber"],
  },
  {
    value: "suez",
    label: "Suez",
    areas: ["Arbaeen", "Port Tawfik", "Faisal", "Ataqa"],
  },
];

export const WEEKDAY_OPTIONS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour),
  label: `${String(hour).padStart(2, "0")}:00`,
}));

export const FLOW_ASSETS = {
  emptyServiceImage,
  addImageIllustration,
  successAddServiceImage,
};

export const createEmptyServiceDetails = () => ({
  serviceName: "",
  category: "",
  governorate: "",
  coverageArea: "",
  description: "",
  longDescription: "",
  price: "",
  photos: [],
});

export const createEmptyPackageData = () => ({
  packageName: "",
  packageType: "",
  duration: "",
  price: "",
  includedItemIds: [],
});

export const createEmptyAvailabilityData = () => ({
  days: [],
  startHour: "9",
  endHour: "17",
  dailyWindow: false,
});

export const getCoverageAreaOptions = (governorateValue) => {
  const governorate = GOVERNORATE_OPTIONS.find(
    (option) => option.value === governorateValue
  );

  return governorate
    ? governorate.areas.map((area) => ({ value: area, label: area }))
    : [];
};

export const getCategoryLabel = (categoryValue) =>
  SERVICE_CATEGORY_OPTIONS.find((option) => option.value === categoryValue)
    ?.label || "Service";

export const getGovernorateLabel = (governorateValue) =>
  GOVERNORATE_OPTIONS.find((option) => option.value === governorateValue)
    ?.label || "";

export const formatHourLabel = (hourValue) => {
  const hour = Number(hourValue);

  if (Number.isNaN(hour)) return "";

  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;

  return `${String(normalizedHour).padStart(2, "0")}:00 ${suffix}`;
};

export const calculateTotalHours = (startHour, endHour) => {
  const start = Number(startHour);
  const end = Number(endHour);

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return 0;
  }

  return end - start;
};

export const isPackageEmpty = (packageData) =>
  [
    packageData.packageName,
    packageData.packageType,
    packageData.duration,
    packageData.price,
  ].every((value) => !String(value || "").trim()) &&
  packageData.includedItemIds.length === 0;

export const isPackageComplete = (packageData) =>
  [
    packageData.packageName,
    packageData.packageType,
    packageData.duration,
    packageData.price,
  ].every((value) => String(value || "").trim());
