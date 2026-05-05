import emptyServiceImage from "../../../../assets/images/service/add-service/empty-service.png";
import addImageIllustration from "../../../../assets/images/service/add-service/add-image.png";
import marketplaceIllustration from "../../../../assets/images/service/add-service/market-place.png";
import servicesIllustration from "../../../../assets/images/service/add-service/services.png";
import storeIllustration from "../../../../assets/images/service/add-service/store.png";
import successAddServiceImage from "../../../../assets/images/service/add-service/success-add-service.png";

export const PARTNER_HOME_OPTIONS = [
  {
    id: "service",
    title: "Offer a Service",
    description:
      "Provide services directly to clients through a guided provider setup flow.",
    buttonLabel: "Start as Service Provider",
    image: servicesIllustration,
  },
  {
    id: "package",
    title: "Create a Package",
    description:
      "Create packaged offers using the services and items you already provide.",
    buttonLabel: "Start Creating Package",
    image: marketplaceIllustration,
  },
];

export const SERVICE_CHANNEL_OPTIONS = [
  {
    id: "services",
    label: "Services",
    image: servicesIllustration,
    description:
      "Offer professional services directly to customers on the platform.",
  },
  {
    id: "store",
    label: "Store",
    image: storeIllustration,
    description:
      "Sell products to customers. This dashboard is reserved for a later phase.",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    image: marketplaceIllustration,
    description:
      "Run peer-to-peer marketplace listings. This dashboard is reserved for a later phase.",
  },
];

export const SERVICE_STEPS = [
  { id: 1, label: "My service" },
  { id: 2, label: "Service details" },
  { id: 3, label: "Service items" },
  { id: 4, label: "Availability" },
];

export const PACKAGE_BILLING_PERIOD_OPTIONS = [
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Yearly", label: "Yearly" },
];

export const SERVICE_CATEGORY_OPTIONS = [
  { value: "Car_Care", label: "Car Care" },
  { value: "Home_Care", label: "Home Care" },
  { value: "Personal_Care", label: "Personal Care" },
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

export const HOUR_OPTIONS = Array.from({ length: 25 }, (_, hour) => ({
  value: String(hour),
  label:
    hour === 24
      ? "12:00 AM"
      : `${String(hour % 12 || 12).padStart(2, "0")}:00 ${hour >= 12 ? "PM" : "AM"}`,
}));

export const PARTNER_FLOW_ASSETS = {
  emptyServiceImage,
  addImageIllustration,
  successAddServiceImage,
};

export const createEmptyAvailabilityData = () => ({
  days: [],
  startHour: "9",
  endHour: "17",
  dailyWindow: false,
});

export const createEmptyServiceDraft = () => ({
  id: "",
  partnerType: "services",
  name: "",
  categoryName: "",
  price: "",
  currency: "EGP",
  timeslotDurationInMin: "60",
  numberOfCustomerPerTimeSlots: "1",
  description: "",
  subDescription: "",
  governorateId: "",
  governorateName: "",
  neighborhoodId: "",
  neighborhoodName: "",
  imageFiles: [],
  existingImages: [],
  deletedImages: [],
  items: [],
  availability: createEmptyAvailabilityData(),
});

export const createEmptyPackageDraft = () => ({
  id: "",
  name: "",
  billingPeriod: "Monthly",
  duration: "1",
  price: "",
  serviceId: "",
  includedItemIds: [],
});

export const formatMoney = (value, currency = "EGP") => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return `${currency} 0`;

  return `${currency} ${numericValue.toFixed(2)}`;
};

export const formatHourLabel = (hourValue) => {
  const numericHour = Number(hourValue);

  if (!Number.isFinite(numericHour)) return "";
  if (numericHour === 24) return "12:00 AM";

  const suffix = numericHour >= 12 ? "PM" : "AM";
  const displayHour = numericHour % 12 || 12;

  return `${String(displayHour).padStart(2, "0")}:00 ${suffix}`;
};

export const calculateTotalHours = (startHour, endHour) => {
  const start = Number(startHour);
  const end = Number(endHour);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return end - start;
};

const parseTimeValueToHour = (value, fallback) => {
  if (typeof value !== "string") return fallback;

  const leadingHour = Number.parseInt(value.split(":")[0], 10);

  return Number.isFinite(leadingHour) ? String(leadingHour) : fallback;
};

export const createAvailabilityFromAgendas = (agendas = []) => {
  if (!Array.isArray(agendas) || agendas.length === 0) {
    return createEmptyAvailabilityData();
  }

  const days = agendas.map((agenda) => agenda.day).filter(Boolean);
  const firstAgenda = agendas[0];
  const startHour = parseTimeValueToHour(firstAgenda?.from, "9");
  const endHour =
    firstAgenda?.to === "24:00"
      ? "24"
      : parseTimeValueToHour(firstAgenda?.to, "17");

  return {
    days,
    startHour,
    endHour,
    dailyWindow: startHour === "0" && endHour === "24",
  };
};

export const buildAgendaPayload = (availability) =>
  availability.days.map((day) => ({
    day,
    from: `${String(availability.startHour).padStart(2, "0")}:00`,
    to:
      Number(availability.endHour) === 24
        ? "24:00"
        : `${String(availability.endHour).padStart(2, "0")}:00`,
  }));
