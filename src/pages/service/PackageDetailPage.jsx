import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  bookServiceAppointment,
  getPackages,
  getServiceNames as fetchServiceNames,
  getServices,
  getServiceDetails,
} from "../../api/services/service.api";
import { serviceCategories } from "../../components/Service-Page/servicePageData";
import {
  BackCircleButton,
  CalendarIcon,
  ClockIcon,
  EmptyState,
  LocationIcon,
  StarIcon,
} from "../../components/Service-Flow/ServiceFlowShared";
import {
  SERVICE_LANGUAGE,
  WEEKDAY_NAMES,
  extractApiArray,
  extractPayloadData,
  extractTotalPages,
  formatServicePrice,
  formatTimeLabel,
  getApiErrorMessage,
  normalizeService,
} from "./serviceApiMappers";
import { normalizeServiceNameList } from "./serviceNameMappers";
import {
  extractAppointmentConcurrencyStamp,
  extractAppointmentStatus,
  formatTimeForApi,
  saveAppointmentBookings,
} from "../../utils/appointments/appointmentUtils";

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTodayKey = () => toDateKey(new Date());

const getNextDateForWeekday = (dayIndex) => {
  const today = new Date();
  const offset = (Number(dayIndex) - today.getDay() + 7) % 7;
  const date = new Date(today);

  date.setDate(today.getDate() + offset);

  return toDateKey(date);
};

const getNextDateForMonthDay = (monthDay) => {
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();
  const getCandidate = () => {
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(Number(monthDay) || 1, lastDayOfMonth));
  };
  let candidate = getCandidate();

  if (candidate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    month += 1;

    if (month > 11) {
      month = 0;
      year += 1;
    }

    candidate = getCandidate();
  }

  return toDateKey(candidate);
};

const formatMonthTitle = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

const formatShortSelectedDate = (dateKey) => {
  if (!dateKey) return "";

  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
};

const buildMonthDays = (visibleMonth) => {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, index - startOffset + 1);

    return {
      key: toDateKey(date),
      dayNumber: date.getDate(),
      dayIndex: date.getDay(),
      isCurrentMonth: date.getMonth() === month,
    };
  });
};

const parseTimeToMinutes = (value) => {
  const [hourPart = "0", minutePart = "0"] = String(value || "").split(":");

  return (Number(hourPart) || 0) * 60 + (Number(minutePart) || 0);
};

const minutesToTimeValue = (value) => {
  const normalized = ((value % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

const splitRangeIntoTimeSlots = (range, durationInMin) => {
  const start = parseTimeToMinutes(range.from);
  const end = parseTimeToMinutes(range.to);
  const duration = Math.max(15, Number(durationInMin) || 60);

  if (!range.from || !range.to || end <= start || end - start <= duration) {
    return [range];
  }

  const slots = [];

  for (let slotStart = start; slotStart + duration <= end; slotStart += duration) {
    const slotEnd = slotStart + duration;

    slots.push({
      id: `${range.id}-${slotStart}`,
      from: minutesToTimeValue(slotStart),
      to: minutesToTimeValue(slotEnd),
    });
  }

  return slots.length ? slots : [range];
};

const getAgendaRanges = (agenda, durationInMin) => {
  const ranges = agenda.timeslots?.length
    ? agenda.timeslots
        .filter((slot) => slot.from && slot.to)
        .map((slot, index) => ({
          id: `${agenda.id}-slot-${index + 1}`,
          from: slot.from,
          to: slot.to,
        }))
    : [{ id: `${agenda.id}-window`, from: agenda.from, to: agenda.to }];

  return ranges.flatMap((range) => splitRangeIntoTimeSlots(range, durationInMin));
};

const formatRangeLabel = (range) =>
  range?.from && range?.to
    ? `${formatTimeLabel(range.from)} - ${formatTimeLabel(range.to)}`
    : "";

const getTimeButtonLabel = (range) => formatTimeLabel(range.from);

const getServiceNeighborhoodOptions = (service) => {
  const neighborhoods = Array.isArray(service?.neighborhoods)
    ? service.neighborhoods
    : [];

  if (neighborhoods.length > 0) return neighborhoods;

  return service?.neighborhoodId
    ? [
        {
          id: service.neighborhoodId,
          name: service.neighborhoodName || service.location || "Coverage area",
        },
      ]
    : [];
};

const getPackageNeighborhoodOptions = (packageItem, service) => {
  const neighborhoods = Array.isArray(packageItem?.neighborhoods)
    ? packageItem.neighborhoods
    : [];

  if (neighborhoods.length > 0) return neighborhoods;

  return getServiceNeighborhoodOptions(service);
};

const getNeighborhoodLabel = (neighborhoods, neighborhoodId) =>
  neighborhoods.find(
    (neighborhood) => neighborhood.id === neighborhoodId
  )?.name || "";

const OWN_PACKAGE_BOOKING_ERROR = "You cannot book your own package.";
const USER_ID_KEYS = [
  "id",
  "userId",
  "userID",
  "applicationUserId",
  "accountId",
  "signatoryId",
  "partnerId",
  "providerId",
  "companyId",
];
const OWNER_ID_KEYS = [
  "providerId",
  "partnerId",
  "signatoryId",
  "ownerId",
  "createdById",
  "userId",
  "userID",
  "companyId",
];
const USER_NESTED_KEYS = ["user", "profile", "account", "company", "provider", "signatory", "partner"];
const OWNER_NESTED_KEYS = ["provider", "partner", "signatory", "owner", "createdBy", "company", "user"];

const normalizeComparableId = (value) =>
  String(value || "").trim().toLowerCase();

const normalizeComparableText = (value) =>
  String(value || "")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const BACKEND_ENTITY_ID_PATTERNS = [
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  /^[0-9a-f]{24}$/i,
];

const isLikelyBackendId = (value) => {
  const text = String(value || "").trim();

  return BACKEND_ENTITY_ID_PATTERNS.some((pattern) => pattern.test(text));
};

const normalizeIdValues = (...values) => [
  ...new Set(
    values
      .flatMap((value) => {
        if (Array.isArray(value)) return normalizeIdValues(...value);
        if (value && typeof value === "object") {
          return [
            value.id,
            value.Id,
            value.value,
            value.Value,
            value.serviceNameId,
            value.ServiceNameId,
            value.serviceNameID,
            value.ServiceNameID,
          ];
        }

        return value;
      })
      .map((value) => String(value || "").trim())
      .filter(Boolean)
  ),
];

const normalizeBackendIdValues = (...values) =>
  normalizeIdValues(...values).filter(isLikelyBackendId);

const getNamedValue = (value) => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (typeof value !== "object") return "";

  return String(
    value.name ||
      value.Name ||
      value.serviceName ||
      value.ServiceName ||
      value.title ||
      value.Title ||
      value.label ||
      value.Label ||
      ""
  ).trim();
};

const collectIdsFromKeys = (source, directKeys, nestedKeys = []) => {
  if (!source || typeof source !== "object") return [];

  const directIds = directKeys
    .map((key) => normalizeComparableId(source[key]))
    .filter(Boolean);
  const nestedIds = nestedKeys.flatMap((key) =>
    collectIdsFromKeys(source[key], directKeys)
  );

  return [...new Set([...directIds, ...nestedIds])];
};

const getCurrentUserIds = (user) =>
  collectIdsFromKeys(user, USER_ID_KEYS, USER_NESTED_KEYS);

const getEntityOwnerIds = (entity) => [
  ...new Set([
    ...collectIdsFromKeys(entity, OWNER_ID_KEYS, OWNER_NESTED_KEYS),
    ...collectIdsFromKeys(entity?.raw, OWNER_ID_KEYS, OWNER_NESTED_KEYS),
  ]),
];

const isOwnedByCurrentUser = (user, ...entities) => {
  const currentUserIds = new Set(getCurrentUserIds(user));

  if (currentUserIds.size === 0) return false;

  return entities
    .flatMap(getEntityOwnerIds)
    .some((ownerId) => currentUserIds.has(ownerId));
};

const getPackageBookingErrorMessage = (error) => {
  const errorCode = getApiErrorCode(error);

  if (errorCode === "invalidday") {
    return "This package day is not accepted by the booking endpoint. Please choose another package day.";
  }

  if (errorCode === "invalidtime") {
    return "This package time is not accepted by the booking endpoint. Please choose another hour.";
  }

  if (errorCode === "notsupportedneighborhood") {
    return "This package coverage area is not accepted by the booking endpoint. Please choose another area.";
  }

  if (errorCode === "servicenotexist") {
    return "This package is not accepted by the booking endpoint yet. Please try another package or contact support.";
  }

  return getApiErrorMessage(
    error,
    "Unable to confirm package booking. Please try again."
  );
};

const getApiErrorCode = (error) =>
  String(
    error?.response?.data?.error?.code ||
      error?.response?.data?.code ||
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      ""
  ).toLowerCase();

const getEntityOwnerNames = (entity) => {
  const source = entity?.raw || entity || {};

  return [
    source.providerName,
    source.ProviderName,
    source.partnerName,
    source.PartnerName,
    source.signatoryName,
    source.SignatoryName,
    source.companyName,
    source.CompanyName,
    source.provider,
    source.Provider,
    source.partner,
    source.Partner,
    source.signatory,
    source.Signatory,
    source.company,
    source.Company,
  ]
    .map(getNamedValue)
    .map(normalizeComparableText)
    .filter(Boolean);
};

const hasSharedValue = (firstValues, secondValues, normalizer = normalizeComparableId) => {
  const firstSet = new Set(firstValues.map(normalizer).filter(Boolean));

  return secondValues.map(normalizer).some((value) => firstSet.has(value));
};

const buildAppointmentBody = ({
  date,
  timeSlot,
  service,
  packageItem,
  neighborhoodId,
}) => ({
  date,
  from: formatTimeForApi(timeSlot?.from),
  to: formatTimeForApi(timeSlot?.to),
  concurrencyStamp:
    timeSlot?.concurrencyStamp ||
    timeSlot?.securityStamp ||
    extractAppointmentConcurrencyStamp(timeSlot?.raw) ||
    service?.concurrencyStamp ||
    extractAppointmentConcurrencyStamp(service?.raw) ||
    packageItem?.concurrencyStamp ||
    extractAppointmentConcurrencyStamp(packageItem?.raw) ||
    null,
  itemIds: Array.isArray(packageItem?.includedItemIds)
    ? packageItem.includedItemIds
    : [],
  neighborhoodId:
    neighborhoodId || packageItem?.neighborhoodId || service?.neighborhoodId || null,
});

const getAppointmentId = (packageId, serviceId, body) =>
  ["package", packageId, serviceId || "service", body.date, body.from]
    .filter(Boolean)
    .join("-");

const getScheduleSelectionDate = (selection, fallbackDate = "") => {
  if (selection.dateKey) return selection.dateKey;
  if (selection.type === "weekday") return getNextDateForWeekday(selection.dayIndex);
  if (selection.type === "month-day") return getNextDateForMonthDay(selection.monthDay);

  return fallbackDate || getTodayKey();
};

const PACKAGE_LOOKUP_PAGE_SIZE = 50;
const SERVICE_LOOKUP_PAGE_SIZE = 50;
const MAX_SERVICE_LOOKUP_PAGES = 10;
const DEFAULT_PACKAGE_SLOT_DURATION_IN_MIN = 60;
const DAY_END_MINUTES = 24 * 60;

const getScheduleKey = (type, value) => `${type}-${value}`;

const createDateScheduleSelection = (day, recurrence) => ({
  key: getScheduleKey(recurrence === "monthly" ? "month-day" : "date", day.key),
  type: recurrence === "monthly" ? "month-day" : "date",
  dayIndex: day.dayIndex,
  monthDay: day.dayNumber,
  label: formatShortSelectedDate(day.key),
  dateKey: day.key,
});

const getPackageSlotDurationInMin = (packageItem) => {
  const duration = Number(
    packageItem?.timeslotDurationInMin ||
      packageItem?.timeSlotDurationInMin ||
      packageItem?.durationInMin ||
      packageItem?.slotDurationInMin
  );

  return Number.isFinite(duration) && duration > 0
    ? duration
    : DEFAULT_PACKAGE_SLOT_DURATION_IN_MIN;
};

const getScheduleTimeOptions = (selection, durationInMin) => {
  const duration = Math.min(
    DAY_END_MINUTES,
    Math.max(15, Number(durationInMin) || DEFAULT_PACKAGE_SLOT_DURATION_IN_MIN)
  );
  const slots = [];

  for (let start = 0; start < DAY_END_MINUTES; start += duration) {
    const end = Math.min(start + duration, DAY_END_MINUTES);

    slots.push({
      id: `${selection.key}-hour-${start}`,
      from: minutesToTimeValue(start),
      to: end >= DAY_END_MINUTES ? "23:59" : minutesToTimeValue(end),
    });
  }

  return slots;
};

const normalizePackagePayload = (packageItem = {}) => {
  const nestedPackage =
    packageItem.package ||
    packageItem.Package ||
    packageItem.packageDto ||
    packageItem.PackageDto ||
    packageItem.packageDTO ||
    packageItem.PackageDTO ||
    packageItem.packageDetails ||
    packageItem.PackageDetails ||
    {};

  if (!nestedPackage || typeof nestedPackage !== "object") return packageItem;

  return {
    ...nestedPackage,
    ...packageItem,
  };
};

const getPackageId = (packageItem) => {
  packageItem = normalizePackagePayload(packageItem || {});

  return String(
    packageItem?.id ||
      packageItem?.Id ||
      packageItem?.packageId ||
      packageItem?.PackageId ||
      packageItem?.packageID ||
      packageItem?.PackageID ||
      ""
  ).trim();
};

const isMatchingPackageId = (packageItem, packageId) =>
  getPackageId(packageItem).toLowerCase() ===
  String(packageId || "").trim().toLowerCase();

const getPackageServices = (packageItem) => [
  ...(Array.isArray(packageItem.services) ? packageItem.services : []),
  ...(Array.isArray(packageItem.Services) ? packageItem.Services : []),
];

const getPackageServiceNameIds = (packageItem) => {
  const services = getPackageServices(packageItem);

  return normalizeBackendIdValues(
    packageItem.serviceNameId,
    packageItem.ServiceNameId,
    packageItem.serviceNameID,
    packageItem.ServiceNameID,
    packageItem.serviceName,
    packageItem.ServiceName,
    packageItem.serviceNameDto,
    packageItem.ServiceNameDto,
    packageItem.serviceNameDTO,
    packageItem.ServiceNameDTO,
    packageItem.service?.serviceNameId,
    packageItem.service?.ServiceNameId,
    packageItem.service?.serviceName,
    packageItem.service?.ServiceName,
    services.map((service) => [
      service?.serviceNameId,
      service?.ServiceNameId,
      service?.serviceName,
      service?.ServiceName,
      service?.serviceNameDto,
      service?.ServiceNameDto,
      service?.serviceNameDTO,
      service?.ServiceNameDTO,
    ])
  );
};

const getPackageServiceIds = (packageItem) => [
  ...(Array.isArray(packageItem.serviceIds) ? packageItem.serviceIds : []),
  ...(Array.isArray(packageItem.ServiceIds) ? packageItem.ServiceIds : []),
  ...getPackageServices(packageItem).map(
    (service) => service?.id || service?.Id || service?.serviceId || service?.ServiceId
  ),
  packageItem.serviceId,
  packageItem.ServiceId,
  packageItem.serviceID,
  packageItem.ServiceID,
  packageItem.service?.id,
  packageItem.service?.Id,
  packageItem.service?.serviceId,
  packageItem.service?.ServiceId,
  packageItem.Service?.id,
  packageItem.Service?.Id,
  packageItem.Service?.serviceId,
  packageItem.Service?.ServiceId,
].filter(isLikelyBackendId);

const normalizePackageFeature = (item) => {
  if (typeof item === "string") return item;

  return (
    item?.name ||
    item?.Name ||
    item?.itemName ||
    item?.ItemName ||
    item?.serviceItemName ||
    item?.ServiceItemName ||
    item?.title ||
    item?.Title ||
    item?.description ||
    item?.Description ||
    ""
  );
};

const getPackageIncludedItemIds = (items) =>
  normalizeBackendIdValues(
    (Array.isArray(items) ? items : []).map((item) => {
      if (!item || typeof item !== "object") return "";

      return (
        item.id ||
        item.Id ||
        item.itemId ||
        item.ItemId ||
        item.itemID ||
        item.ItemID ||
        item.serviceItemId ||
        item.ServiceItemId ||
        item.serviceItemID ||
        item.ServiceItemID ||
        item.packageItemId ||
        item.PackageItemId ||
        item.value ||
        item.Value ||
        ""
      );
    })
  );

const normalizePackageNeighborhoodOption = (item, index) => {
  if (!item) return null;

  if (typeof item === "string" || typeof item === "number") {
    const value = String(item).trim();

    return value ? { id: value, name: value } : null;
  }

  if (typeof item !== "object") return null;

  const id = String(
    item.id ||
      item.Id ||
      item.neighborhoodId ||
      item.NeighborhoodId ||
      item.value ||
      item.Value ||
      item.name ||
      item.Name ||
      `package-area-${index + 1}`
  ).trim();
  const name = String(
    item.name ||
      item.Name ||
      item.neighborhoodName ||
      item.NeighborhoodName ||
      item.label ||
      item.Label ||
      id
  ).trim();
  const governorateName = String(
    item.governorateName ||
      item.GovernorateName ||
      item.governorate?.name ||
      item.governorate?.Name ||
      item.Governorate?.name ||
      item.Governorate?.Name ||
      ""
  ).trim();

  return id && name
    ? {
        id,
        name,
        governorateName,
      }
    : null;
};

const normalizePackageNeighborhoods = (packageItem) => {
  const directNeighborhoods = [
    ...(Array.isArray(packageItem.neighborhoods) ? packageItem.neighborhoods : []),
    ...(Array.isArray(packageItem.Neighborhoods) ? packageItem.Neighborhoods : []),
    ...(Array.isArray(packageItem.neighborhoodDtos)
      ? packageItem.neighborhoodDtos
      : []),
    ...(Array.isArray(packageItem.NeighborhoodDtos)
      ? packageItem.NeighborhoodDtos
      : []),
    ...(Array.isArray(packageItem.coverageAreas) ? packageItem.coverageAreas : []),
    ...(Array.isArray(packageItem.CoverageAreas) ? packageItem.CoverageAreas : []),
    packageItem.neighborhood,
    packageItem.Neighborhood,
    packageItem.neighborhoodDto,
    packageItem.NeighborhoodDto,
  ].filter(Boolean);
  const idOnlyNeighborhoods = [
    ...(Array.isArray(packageItem.neighborhoodIds)
      ? packageItem.neighborhoodIds
      : []),
    ...(Array.isArray(packageItem.NeighborhoodIds)
      ? packageItem.NeighborhoodIds
      : []),
    packageItem.neighborhoodId,
    packageItem.NeighborhoodId,
  ].filter(Boolean);
  const optionMap = new Map();

  [...directNeighborhoods, ...idOnlyNeighborhoods]
    .map(normalizePackageNeighborhoodOption)
    .filter(Boolean)
    .forEach((option) => {
      if (!optionMap.has(option.id)) {
        optionMap.set(option.id, option);
      }
    });

  return [...optionMap.values()];
};

const getPackageGovernorateName = (packageItem, neighborhoods) =>
  String(
    packageItem.governorateName ||
      packageItem.GovernorateName ||
      packageItem.governorate?.name ||
      packageItem.governorate?.Name ||
      packageItem.Governorate?.name ||
      packageItem.Governorate?.Name ||
      packageItem.governorateDto?.name ||
      packageItem.GovernorateDto?.Name ||
      neighborhoods.find((neighborhood) => neighborhood.governorateName)
        ?.governorateName ||
      ""
  ).trim();

const normalizePackage = (packageItem) => {
  packageItem = normalizePackagePayload(packageItem || {});
  const serviceIds = getPackageServiceIds(packageItem);
  const serviceNameIds = getPackageServiceNameIds(packageItem);
  const neighborhoods = normalizePackageNeighborhoods(packageItem);
  const governorateName = getPackageGovernorateName(packageItem, neighborhoods);
  const neighborhoodName = neighborhoods
    .map((neighborhood) => neighborhood.name)
    .filter(Boolean)
    .join(", ");
  const includedItems =
    packageItem.includedItems ||
    packageItem.IncludedItems ||
    packageItem.items ||
    packageItem.Items ||
    packageItem.serviceItems ||
    packageItem.ServiceItems ||
    packageItem.features ||
    packageItem.Features ||
    packageItem.packageItems ||
    packageItem.PackageItems ||
    [];

  return {
    id: getPackageId(packageItem),
    name:
      packageItem.name ||
      packageItem.Name ||
      packageItem.packageName ||
      packageItem.PackageName ||
      "Service Package",
    description:
      packageItem.description ||
      packageItem.Description ||
      packageItem.packageDescription ||
      packageItem.PackageDescription ||
      packageItem.subDescription ||
      packageItem.SubDescription ||
      packageItem.details ||
      packageItem.Details ||
      "",
    recurrence:
      packageItem.recurrence ||
      packageItem.Recurrence ||
      packageItem.pricingType ||
      packageItem.PricingType ||
      "Weekly",
    daysPerInterval: Math.max(
      1,
      Number(
        packageItem.daysPerInterval ??
          packageItem.DaysPerInterval ??
          packageItem.times ??
          packageItem.Times ??
          1
      ) || 1
    ),
    price:
      Number(
        packageItem.servicePrice ??
          packageItem.ServicePrice ??
          packageItem.price ??
          packageItem.Price ??
          packageItem.packagePrice ??
          packageItem.PackagePrice ??
          0
      ) || 0,
    currency:
      packageItem.currency ||
      packageItem.Currency ||
      packageItem.packageCurrency ||
      packageItem.PackageCurrency ||
      "EGP",
    serviceIds: serviceIds.map(String),
    serviceNameIds,
    serviceNameId: serviceNameIds[0] || "",
    categoryName:
      packageItem.categoryName ||
      packageItem.CategoryName ||
      packageItem.serviceCategory ||
      packageItem.ServiceCategory ||
      packageItem.category ||
      packageItem.Category ||
      "",
    governorateId:
      packageItem.governorateId ||
      packageItem.GovernorateId ||
      packageItem.governorate?.id ||
      packageItem.governorate?.Id ||
      packageItem.Governorate?.id ||
      packageItem.Governorate?.Id ||
      "",
    providerIds: getEntityOwnerIds(packageItem),
    providerNames: getEntityOwnerNames(packageItem),
    neighborhoodId: neighborhoods[0]?.id || "",
    neighborhoodName,
    neighborhoods,
    governorateName,
    location: [neighborhoodName, governorateName].filter(Boolean).join(", "),
    serviceName:
      packageItem.serviceName ||
      packageItem.ServiceName ||
      packageItem.serviceName?.name ||
      packageItem.serviceName?.Name ||
      packageItem.serviceNameDto?.name ||
      packageItem.ServiceNameDto?.Name ||
      packageItem.services?.[0]?.name ||
      packageItem.Services?.[0]?.Name ||
      packageItem.service?.name ||
      packageItem.service?.Name ||
      packageItem.Service?.name ||
      packageItem.Service?.Name ||
      "",
    concurrencyStamp:
      packageItem.concurrencyStamp ||
      packageItem.ConcurrencyStamp ||
      packageItem.serviceConcurrencyStamp ||
      packageItem.ServiceConcurrencyStamp ||
      extractAppointmentConcurrencyStamp(packageItem) ||
      "",
    includedItems: includedItems.map(normalizePackageFeature).filter(Boolean),
    includedItemIds: getPackageIncludedItemIds(includedItems),
    raw: packageItem,
  };
};

const getPackageFromListResponse = (response, packageId) =>
  extractApiArray(response).find((item) => isMatchingPackageId(item, packageId));

const fetchPackageFromPackagesList = async (packageId) => {
  const getPackagesPage = (page) =>
    getPackages({
      page,
      pageSize: PACKAGE_LOOKUP_PAGE_SIZE,
      language: SERVICE_LANGUAGE,
    });
  const firstResponse = await getPackagesPage(1);
  const firstMatch = getPackageFromListResponse(firstResponse, packageId);

  if (firstMatch) return firstMatch;

  const totalPages = extractTotalPages(firstResponse);

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await getPackagesPage(page);
    const match = getPackageFromListResponse(response, packageId);

    if (match) return match;
  }

  return null;
};

const getPackageIntervalLabel = (packageItem) => {
  const recurrence = String(packageItem.recurrence || "").toLowerCase();
  const days = packageItem.daysPerInterval;

  if (recurrence === "daily") return "Every day";
  if (recurrence === "weekly") return `${days} ${days === 1 ? "day" : "days"} / week`;
  if (recurrence === "monthly") return `${days} ${days === 1 ? "day" : "days"} / month`;

  return `${days} sessions`;
};

const getPackageRecurrence = (packageItem) =>
  String(packageItem.recurrence || "").trim().toLowerCase();

const createFallbackService = (packageItem) => ({
  id: packageItem.serviceIds[0] || "",
  name: packageItem.serviceName || packageItem.name,
  description:
    "Professional home services to keep your schedule simple, clear, and flexible.",
  subDescription: "",
  price: packageItem.price,
  currency: packageItem.currency,
  providerId: "",
  providerName: "Provider",
  providerImage: "",
  location: "Not specified",
  image: serviceCategories[0]?.image || "",
  galleryImages: [],
  items: [],
  agendas: [],
  timeslotDurationInMin: 60,
  concurrencyStamp: packageItem.concurrencyStamp || "",
  rate: 0,
});

const getCategoryImageForValue = (categoryValue) => {
  const normalizedCategory = normalizeComparableText(categoryValue);
  const category = serviceCategories.find((item) =>
    [
      item.apiName,
      item.title,
      item.slug,
      item.id,
    ]
      .map(normalizeComparableText)
      .includes(normalizedCategory)
  );

  return category?.image || serviceCategories[0]?.image || "";
};

const getPackageApiCategoryName = (packageItem) => {
  const normalizedCategory = normalizeComparableText(packageItem.categoryName);
  const category = serviceCategories.find((item) =>
    [
      item.apiName,
      item.title,
      item.slug,
      item.id,
    ]
      .map(normalizeComparableText)
      .includes(normalizedCategory)
  );

  return category?.apiName || packageItem.categoryName || "";
};

const getServiceLookupId = (service) => {
  const id = String(
    service?.serviceId ||
      service?.ServiceId ||
      service?.serviceID ||
      service?.ServiceID ||
      service?.id ||
      service?.Id ||
      service?.providerServiceId ||
      service?.ProviderServiceId ||
      ""
  ).trim();

  return isLikelyBackendId(id) ? id : "";
};

const getBookablePackageIds = (packageItem) =>
  [
    packageItem?.serviceNameId,
    ...(Array.isArray(packageItem?.serviceNameIds)
      ? packageItem.serviceNameIds
      : []),
    packageItem?.raw?.serviceNameId,
    packageItem?.raw?.ServiceNameId,
    packageItem?.raw?.serviceNameID,
    packageItem?.raw?.ServiceNameID,
    packageItem?.raw?.serviceName?.id,
    packageItem?.raw?.serviceName?.Id,
    packageItem?.raw?.ServiceName?.id,
    packageItem?.raw?.ServiceName?.Id,
    packageItem?.raw?.serviceNameDto?.id,
    packageItem?.raw?.serviceNameDto?.Id,
    packageItem?.raw?.ServiceNameDto?.id,
    packageItem?.raw?.ServiceNameDto?.Id,
  ]
    .map((value) => String(value || "").trim())
    .filter(isLikelyBackendId)
    .filter((value, index, values) => values.indexOf(value) === index);

const getPackageServiceNameCandidates = (packageItem) =>
  [
    packageItem?.serviceName,
    packageItem?.name,
    packageItem?.description,
    packageItem?.raw?.serviceName,
    packageItem?.raw?.ServiceName,
    packageItem?.raw?.description,
    packageItem?.raw?.Description,
    packageItem?.raw?.serviceName?.name,
    packageItem?.raw?.serviceName?.Name,
    packageItem?.raw?.ServiceName?.name,
    packageItem?.raw?.ServiceName?.Name,
    packageItem?.raw?.serviceNameDto?.name,
    packageItem?.raw?.serviceNameDto?.Name,
    packageItem?.raw?.ServiceNameDto?.name,
    packageItem?.raw?.ServiceNameDto?.Name,
  ]
    .map(getNamedValue)
    .map(normalizeComparableText)
    .filter(Boolean);

const resolvePackageServiceNameIds = async (packageItem) => {
  const existingIds = getBookablePackageIds(packageItem);

  if (existingIds.length > 0) return existingIds;

  const response = await fetchServiceNames({ language: SERVICE_LANGUAGE });
  const serviceNames = normalizeServiceNameList(extractApiArray(response));
  const packageNames = getPackageServiceNameCandidates(packageItem);
  const packageCategory = normalizeComparableText(packageItem?.categoryName);
  const exactMatch = serviceNames.find((item) =>
    packageNames.includes(normalizeComparableText(item.label))
  );
  const categoryMatch = serviceNames.find((item) => {
    const itemLabel = normalizeComparableText(item.label);
    const itemCategory = normalizeComparableText(item.categoryName);

    return (
      packageNames.some(
        (name) => name && (itemLabel === name || itemLabel.includes(name) || name.includes(itemLabel))
      ) &&
      (!packageCategory || !itemCategory || itemCategory === packageCategory)
    );
  });
  const matchedId = exactMatch?.id || categoryMatch?.id || "";

  return isLikelyBackendId(matchedId) ? [matchedId] : [];
};

const getServiceNameIds = (service) =>
  normalizeBackendIdValues(
    service?.serviceNameId,
    service?.ServiceNameId,
    service?.serviceNameID,
    service?.ServiceNameID,
    service?.serviceName,
    service?.ServiceName,
    service?.serviceNameDto,
    service?.ServiceNameDto,
    service?.serviceNameDTO,
    service?.ServiceNameDTO
  );

const getServiceDisplayNames = (service) => [
  service?.serviceName,
  service?.ServiceName,
  service?.name,
  service?.Name,
  service?.title,
  service?.Title,
  service?.serviceNameDto,
  service?.ServiceNameDto,
  service?.serviceNameDTO,
  service?.ServiceNameDTO,
]
  .map(getNamedValue)
  .map(normalizeComparableText)
  .filter(Boolean);

const getServiceCategoryName = (service) =>
  String(
    service?.serviceCategory ||
      service?.ServiceCategory ||
      service?.categoryName ||
      service?.CategoryName ||
      service?.category ||
      service?.Category ||
      ""
  ).trim();

const scoreServiceForPackage = (service, packageItem) => {
  const serviceId = normalizeComparableId(getServiceLookupId(service));
  const packageServiceIds = (packageItem.serviceIds || []).map(normalizeComparableId);
  const packageServiceNameIds = packageItem.serviceNameIds || [];
  const serviceNameIds = getServiceNameIds(service);
  const packageNames = [packageItem.serviceName, packageItem.name]
    .map(normalizeComparableText)
    .filter(Boolean);
  const serviceNames = getServiceDisplayNames(service);
  const packageProviderIds = packageItem.providerIds || [];
  const serviceProviderIds = getEntityOwnerIds(service);
  const packageProviderNames = packageItem.providerNames || [];
  const serviceProviderNames = getEntityOwnerNames(service);
  const packageCategory = normalizeComparableText(packageItem.categoryName);
  const serviceCategory = normalizeComparableText(getServiceCategoryName(service));
  let score = 0;

  if (serviceId && packageServiceIds.includes(serviceId)) score += 1000;
  if (hasSharedValue(packageServiceNameIds, serviceNameIds)) score += 300;
  if (hasSharedValue(packageNames, serviceNames, normalizeComparableText)) {
    score += 160;
  }
  if (hasSharedValue(packageProviderIds, serviceProviderIds)) score += 120;
  if (hasSharedValue(packageProviderNames, serviceProviderNames, normalizeComparableText)) {
    score += 90;
  }
  if (packageCategory && packageCategory === serviceCategory) score += 50;

  return score;
};

const findMatchingPackageService = (services, packageItem) =>
  services
    .map((service) => ({
      service,
      score: scoreServiceForPackage(service, packageItem),
    }))
    .filter((item) => item.score >= 160)
    .sort((first, second) => second.score - first.score)[0]?.service || null;

const getServicesLookupAttempts = (packageItem) => {
  const search = packageItem.serviceName || packageItem.name || "";
  const category = getPackageApiCategoryName(packageItem);
  const governorateId = packageItem.governorateId || "";
  const neighborhoodId = packageItem.neighborhoodId || "";
  const attempts = [
    { search, category, governorateId, neighborhoodId },
    { search, category },
    { search },
    { category },
    {},
  ];
  const seen = new Set();

  return attempts
    .map((attempt) =>
      Object.fromEntries(
        Object.entries(attempt).filter(([, value]) => Boolean(value))
      )
    )
    .filter((attempt) => {
      const key = JSON.stringify(attempt);

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const fetchMatchingPackageService = async (packageItem) => {
  for (const attemptParams of getServicesLookupAttempts(packageItem)) {
    const getServicesPage = (page) =>
      getServices({
        page,
        pageSize: SERVICE_LOOKUP_PAGE_SIZE,
        language: SERVICE_LANGUAGE,
        ...attemptParams,
      });
    const firstResponse = await getServicesPage(1);
    const firstItems = extractApiArray(firstResponse);
    const firstMatch = findMatchingPackageService(firstItems, packageItem);

    if (firstMatch) return firstMatch;

    const totalPages = Math.min(
      extractTotalPages(firstResponse),
      MAX_SERVICE_LOOKUP_PAGES
    );

    for (let page = 2; page <= totalPages; page += 1) {
      const response = await getServicesPage(page);
      const match = findMatchingPackageService(extractApiArray(response), packageItem);

      if (match) return match;
    }
  }

  return null;
};

const getNormalizedServiceDetails = async (serviceId, fallbackService, fallbackImage) => {
  if (!serviceId) return null;

  try {
    const serviceResponse = await getServiceDetails(serviceId, SERVICE_LANGUAGE);
    const serviceData = extractPayloadData(serviceResponse);

    return normalizeService(serviceData, fallbackImage);
  } catch {
    return fallbackService
      ? normalizeService(fallbackService, fallbackImage)
      : null;
  }
};

const resolvePackageBookingService = async (packageItem) => {
  const fallbackImage = getCategoryImageForValue(packageItem.categoryName);
  const directServiceId = packageItem.serviceIds[0] || "";
  const directService = await getNormalizedServiceDetails(
    directServiceId,
    null,
    fallbackImage
  );

  if (directService?.id) return directService;

  const matchingService = await fetchMatchingPackageService(packageItem);
  const matchingServiceId = getServiceLookupId(matchingService);

  return (
    (await getNormalizedServiceDetails(
      matchingServiceId,
      matchingService,
      fallbackImage
    )) || createFallbackService(packageItem)
  );
};

function SectionPanel({ title, children }) {
  return (
    <section className="rounded-[8px] bg-white">
      <div className="flex min-h-14 items-center rounded-[8px] bg-[#E6E8EF] px-4">
        <h2 className="font-['Roboto'] text-[15px] font-semibold text-[#011C60]">
          {title}
        </h2>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function PackageScheduleSelector({
  packageItem,
  selectedSchedule,
}) {
  const recurrence = getPackageRecurrence(packageItem);
  const times = Math.max(1, Number(packageItem.daysPerInterval) || 1);
  const intervalLabel =
    recurrence === "daily"
      ? "Daily package"
      : recurrence === "monthly"
        ? "Monthly package"
        : "Weekly package";
  const frequencyLabel =
    recurrence === "daily"
      ? "1 time / day"
      : `${times} ${times === 1 ? "time" : "times"} / ${recurrence || "package"}`;
  const statusLabel =
    selectedSchedule?.label
      ? `Starts ${selectedSchedule.label}`
      : "Choose one start day";

  return (
    <div className="rounded-[12px] bg-[#F8F9FC] px-4 py-3 text-center">
      <p className="font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
        {intervalLabel}
      </p>
      <p className="mt-1 font-['Roboto'] text-[12px] font-semibold text-[#4D6090]">
        {frequencyLabel}
      </p>
      <p className="mt-1 font-['Roboto'] text-[12px] leading-5 text-[#6777A0]">
        {statusLabel}
      </p>
    </div>
  );
}

function PackageCalendar({
  packageItem,
  selectedSchedule,
  onSelectSchedule,
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const todayKey = getTodayKey();
  const recurrence = getPackageRecurrence(packageItem);
  const calendarDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);

  const isDateSelectable = (day) => {
    if (!day.isCurrentMonth || day.key < todayKey) return false;

    return true;
  };

  const isDateSelected = (day) => {
    if (!isDateSelectable(day)) return false;
    return selectedSchedule?.dateKey === day.key;
  };

  const handleSelectDay = (day) => {
    if (!isDateSelectable(day)) return;

    onSelectSchedule(createDateScheduleSelection(day, recurrence));
  };

  const calendarTitle = formatMonthTitle(visibleMonth);

  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[10px] bg-white p-4 shadow-[0px_14px_32px_rgba(1,28,96,0.12)]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setVisibleMonth(
              (current) =>
                new Date(current.getFullYear(), current.getMonth() - 1, 1)
            )
          }
          className="btn btn-ghost btn-xs min-h-8 text-[#808DAF]"
          aria-label="Previous month"
        >
          &lt;
        </button>
        <p className="font-['Roboto'] text-[15px] font-semibold text-[#808DAF]">
          {calendarTitle}
        </p>
        <button
          type="button"
          onClick={() =>
            setVisibleMonth(
              (current) =>
                new Date(current.getFullYear(), current.getMonth() + 1, 1)
            )
          }
          className="btn btn-ghost btn-xs min-h-8 text-[#808DAF]"
          aria-label="Next month"
        >
          &gt;
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {WEEKDAY_NAMES.map((day) => (
          <span
            key={day}
            className="text-center font-['Roboto'] text-[10px] font-semibold uppercase text-[#9AA6C7]"
          >
            {day.slice(0, 3)}
          </span>
        ))}

        {calendarDays.map((day) => {
          const isSelectable = isDateSelectable(day);
          const isSelected = isDateSelected(day);
          const isDisabled = !isSelectable;

          return (
            <button
              key={day.key}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              onClick={() => handleSelectDay(day)}
              className={`aspect-square rounded-full font-['Roboto'] text-[12px] font-semibold transition ${
                isSelected
                  ? "bg-[#011C60] text-white"
                  : isSelectable
                    ? "text-[#4D6090] hover:bg-[#F6E6A0] hover:text-[#011C60]"
                    : "cursor-not-allowed text-[#CCD2DF]"
              } ${day.isCurrentMonth ? "" : "opacity-30"}`}
            >
              {day.dayNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleTimeSelections({
  durationInMin,
  selectionLimit,
  scheduleSelections,
  selectedTimes,
  onSelectTime,
}) {
  const pendingSelectionCount = Math.max(
    0,
    selectionLimit - scheduleSelections.length
  );

  return (
    <div className="space-y-4">
      {scheduleSelections.map((selection) => {
        const timeSlots = getScheduleTimeOptions(selection, durationInMin);
        const selectedTime = selectedTimes[selection.key];

        return (
          <div
            key={selection.key}
            className="rounded-[12px] border border-[#E6E8EF] bg-white p-3 shadow-[0px_8px_24px_rgba(204,210,223,0.24)]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                {selection.label}
              </p>
              <p className="font-['Roboto'] text-[11px] font-semibold text-[#808DAF]">
                {selectedTime ? formatRangeLabel(selectedTime) : "Select time"}
              </p>
            </div>

            {timeSlots.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = selectedTime?.id === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => onSelectTime(selection.key, slot)}
                      className={`min-w-[82px] rounded-xl border px-3 py-2.5 font-['Roboto'] text-[12px] font-semibold transition ${
                        isSelected
                          ? "border-[#011C60] bg-[#011C60] text-white"
                          : "border-[#CCD2DF] bg-white text-[#011C60] hover:border-[#EECE42]"
                      }`}
                    >
                      {getTimeButtonLabel(slot)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-[#F8F9FC] px-3 py-3 text-center font-['Roboto'] text-[12px] font-semibold text-[#6777A0]">
                No available package time for this day.
              </p>
            )}
          </div>
        );
      })}

      {Array.from({ length: pendingSelectionCount }, (_, index) => {
        const pendingIndex = scheduleSelections.length + index + 1;

        return (
          <div
            key={`pending-selection-${pendingIndex}`}
            className="rounded-[12px] border border-dashed border-[#CCD2DF] bg-[#F8F9FC] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-['Roboto'] text-[14px] font-semibold text-[#6777A0]">
                Selection {pendingIndex}
              </p>
              <p className="font-['Roboto'] text-[11px] font-semibold text-[#808DAF]">
                Pending day
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PackageBookingPanel({ service, packageItem, onConfirmBooking }) {
  const recurrence = getPackageRecurrence(packageItem);
  const neighborhoodOptions = useMemo(
    () => getPackageNeighborhoodOptions(packageItem, service),
    [packageItem, service]
  );
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState(
    () => neighborhoodOptions[0]?.id || ""
  );
  const effectiveSelectedNeighborhoodId = neighborhoodOptions.some(
    (neighborhood) => neighborhood.id === selectedNeighborhoodId
  )
    ? selectedNeighborhoodId
    : neighborhoodOptions[0]?.id || "";
  const durationInMin = getPackageSlotDurationInMin(packageItem);

  useEffect(() => {
    setSelectedSchedule(null);
    setSelectedTimeSlot(null);
  }, [packageItem.id, recurrence]);

  const scheduleSelections = useMemo(
    () => (selectedSchedule ? [selectedSchedule] : []),
    [selectedSchedule]
  );
  const selectedTimes = useMemo(
    () =>
      selectedSchedule && selectedTimeSlot
        ? { [selectedSchedule.key]: selectedTimeSlot }
        : {},
    [selectedSchedule, selectedTimeSlot]
  );

  const hasScheduleSelection = Boolean(selectedSchedule);
  const hasTimeSelection = Boolean(selectedTimeSlot);

  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedTimeSlot(null);
  };

  const handleSelectTime = (_scheduleKey, slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleBookNow = () => {
    if (
      !hasScheduleSelection ||
      !hasTimeSelection ||
      !effectiveSelectedNeighborhoodId
    ) {
      return;
    }

    const bookedScheduleSelections = [
      {
        ...selectedSchedule,
        recurrence: packageItem.recurrence,
        daysPerInterval: packageItem.daysPerInterval,
        timeSlot: selectedTimeSlot,
      },
    ];

    onConfirmBooking({
      mode: "package",
      service,
      packageItem,
      scheduleSelections: bookedScheduleSelections,
      selectedSchedule: bookedScheduleSelections.map(
        (selection) =>
          `${selection.label} ${formatRangeLabel(selection.timeSlot)}`
      ),
      selectedNeighborhoodId: effectiveSelectedNeighborhoodId,
      selectedNeighborhoodName: getNeighborhoodLabel(
        neighborhoodOptions,
        effectiveSelectedNeighborhoodId
      ),
      selectedItems: [],
      total: packageItem.price,
    });
  };

  return (
    <aside className="sticky top-24 space-y-7">
      <SectionPanel title="Select Date">
        <div className="space-y-4">
          <PackageScheduleSelector
            packageItem={packageItem}
            selectedSchedule={selectedSchedule}
          />

          <PackageCalendar
            packageItem={packageItem}
            selectedSchedule={selectedSchedule}
            onSelectSchedule={handleSelectSchedule}
          />

          <ScheduleTimeSelections
            durationInMin={durationInMin}
            selectionLimit={1}
            scheduleSelections={scheduleSelections}
            selectedTimes={selectedTimes}
            onSelectTime={handleSelectTime}
          />
        </div>
      </SectionPanel>

      <SectionPanel title="Coverage Area">
        <div className="space-y-2">
          {neighborhoodOptions.length > 0 ? (
            neighborhoodOptions.map((neighborhood) => {
              const isSelected =
                effectiveSelectedNeighborhoodId === neighborhood.id;

              return (
                <label
                  key={neighborhood.id}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition ${
                    isSelected
                      ? "border-[#011C60] bg-[#F8F9FC]"
                      : "border-[#E6E8EF] bg-white hover:border-[#EECE42]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`package-detail-neighborhood-${packageItem.id}`}
                    checked={isSelected}
                    onChange={() => setSelectedNeighborhoodId(neighborhood.id)}
                    className="h-4 w-4 accent-[#011C60]"
                  />
                  <span className="font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                    {neighborhood.name}
                  </span>
                </label>
              );
            })
          ) : (
            <p className="rounded-xl bg-[#F8F9FC] px-4 py-3 font-['Roboto'] text-[14px] text-[#808DAF]">
              No coverage areas available for this package.
            </p>
          )}
        </div>
      </SectionPanel>

      <button
        type="button"
        onClick={handleBookNow}
        disabled={
          !hasScheduleSelection ||
          !hasTimeSelection ||
          !effectiveSelectedNeighborhoodId
        }
        className="flex h-14 w-full items-center justify-center rounded-[12px] bg-[#011C60] font-['Roboto'] text-[15px] font-semibold text-white transition hover:bg-[#02237a] disabled:cursor-not-allowed disabled:bg-[#B3BBCF]"
      >
        Book Now
      </button>
    </aside>
  );
}

function PackageDetailsView({ service, packageItem, onConfirmBooking }) {
  const includedItems = packageItem.includedItems.length
    ? packageItem.includedItems
    : service.items.map((item) => item.name);
  const detailsPrice = formatServicePrice(packageItem.price, packageItem.currency);
  const coverageAreas = getPackageNeighborhoodOptions(packageItem, service);
  const packageLocation = packageItem.location || service.location || "";

  return (
    <div className="mt-12 grid gap-10 xl:grid-cols-[minmax(0,1fr)_416px] xl:items-start">
      <div className="rounded-[12px] bg-white p-6 sm:p-8">
        <h1 className="font-['Roboto'] text-[34px] font-semibold leading-[42px] text-[#011C60]">
          {packageItem.name}
        </h1>
        <p className="mt-8 font-['Roboto'] text-[28px] font-semibold leading-8 text-[#011C60]">
          {detailsPrice}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-12">
          <div className="flex items-center gap-2">
            <StarIcon className="h-5 w-5" />
            <span className="font-['Roboto'] text-[18px] font-semibold text-[#011C60]">
              {service.rate ? service.rate.toFixed(1) : "New"}
            </span>
            <span className="font-['Roboto'] text-[14px] text-[#808DAF]">
              (2,256,896)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#011C60]">
              <LocationIcon className="h-4 w-4" stroke="white" />
            </span>
            <span className="font-['Roboto'] text-[15px] font-medium text-[#4D6090]">
              {packageLocation || "Not specified"}
            </span>
          </div>
        </div>

        <div className="mt-8 grid max-w-[650px] gap-6 sm:grid-cols-2">
          <div className="rounded-[8px] bg-[#E6E8EF] px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#CCD2DF]">
                <ClockIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-['Roboto'] text-[13px] font-semibold leading-5 text-[#011C60]">
                  Times
                </p>
                <p className="font-['Roboto'] text-[11px] leading-4 text-[#6777A0]">
                  {getPackageIntervalLabel(packageItem)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[8px] bg-[#E6E8EF] px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#CCD2DF]">
                <CalendarIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-['Roboto'] text-[13px] font-semibold leading-5 text-[#011C60]">
                  Format
                </p>
                <p className="font-['Roboto'] text-[11px] leading-4 text-[#6777A0]">
                  {packageItem.recurrence}
                </p>
              </div>
            </div>
          </div>
        </div>

        {packageItem.description && (
          <section className="mt-12">
            <h2 className="font-['Roboto'] text-[24px] font-semibold text-[#011C60]">
              About this package
            </h2>
            <p className="mt-5 max-w-[620px] font-['Roboto'] text-[16px] leading-8 text-[#4D6090]">
              {packageItem.description}
            </p>
          </section>
        )}

        <section className="mt-12">
          <h2 className="font-['Roboto'] text-[24px] font-semibold text-[#011C60]">
            Package coverage
          </h2>
          <div className="mt-6 flex max-w-[650px] flex-wrap gap-3">
            {coverageAreas.length ? (
              coverageAreas.map((area) => (
                <span
                  key={area.id}
                  className="rounded-[12px] bg-[#F3F5FA] px-4 py-2.5 font-['Roboto'] text-[13px] font-medium text-[#6777A0]"
                >
                  {area.name}
                </span>
              ))
            ) : (
              <span className="rounded-[12px] bg-[#F3F5FA] px-4 py-2.5 font-['Roboto'] text-[13px] font-medium text-[#6777A0]">
                Coverage areas are not specified.
              </span>
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-['Roboto'] text-[24px] font-semibold text-[#011C60]">
            What's included
          </h2>
          <div className="mt-6 flex max-w-[650px] flex-wrap gap-5">
            {includedItems.length ? (
              includedItems.map((feature) => (
                <span
                  key={feature}
                  className="rounded-[12px] bg-[#F3F5FA] px-4 py-2.5 font-['Roboto'] text-[13px] font-medium text-[#6777A0]"
                >
                  {feature}
                </span>
              ))
            ) : (
              <span className="rounded-[12px] bg-[#F3F5FA] px-4 py-2.5 font-['Roboto'] text-[13px] font-medium text-[#6777A0]">
                Standard service included
              </span>
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-['Roboto'] text-[24px] font-semibold text-[#011C60]">
            About the provider
          </h2>
          <p className="mt-5 max-w-[620px] font-['Roboto'] text-[16px] leading-8 text-[#4D6090]">
            {service.description ||
              service.subDescription ||
              "Professional home services to keep your schedule simple, clear, and flexible."}
          </p>
        </section>
      </div>

      <PackageBookingPanel
        key={`${packageItem.id}-${packageItem.recurrence}-${packageItem.daysPerInterval}`}
        service={service}
        packageItem={packageItem}
        onConfirmBooking={onConfirmBooking}
      />
    </div>
  );
}

function ConfirmBookingModal({
  booking,
  onClose,
  onConfirm,
  isSubmitting = false,
  errorMessage = "",
}) {
  if (!booking) return null;

  const {
    service,
    packageItem,
    selectedDateKey,
    selectedTimeSlot,
    selectedNeighborhoodName,
    scheduleSelections = [],
    selectedSchedule = [],
    total,
  } = booking;
  const includedItems = packageItem?.includedItems?.length
    ? packageItem.includedItems
    : service.items.map((item) => item.name);
  const bookingPrice = formatServicePrice(total, packageItem.currency);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-[8px] bg-white px-4 py-5 shadow-[0px_28px_70px_rgba(1,28,96,0.22)] sm:px-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-center font-['Roboto'] text-[28px] font-semibold leading-9 text-[#011C60]">
          Confirm Booking
        </h2>

        <div className="mt-5 flex items-center gap-4 rounded-[8px] bg-[#E6E8EF] px-4 py-4 shadow-[8px_4px_16px_0px_rgba(204,210,223,0.5)]">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#4D6090]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path
                d="M8.5 7.5V6.25C8.5 5.01 9.51 4 10.75 4h2.5c1.24 0 2.25 1.01 2.25 2.25V7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <rect
                x="4.5"
                y="7.5"
                width="15"
                height="11.5"
                rx="2.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M9 12h6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div>
            <p className="font-['Roboto'] text-[20px] font-semibold leading-7 text-[#011C60]">
              {packageItem.name}
            </p>
            <p className="mt-1 flex items-center gap-1 font-['Roboto'] text-[13px] text-[#4D6090]">
              <StarIcon className="h-4 w-4" />
              {service.rate ? service.rate.toFixed(1) : "New"}{" "}
              <span className="text-[#808DAF]">(2,150 reviews)</span>
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-5 rounded-[8px] border border-[#E6E8EF] bg-white px-4 py-5 shadow-[0px_8px_24px_rgba(204,210,223,0.28)]">
          <div className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CCD2DF]">
              <CalendarIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-['Roboto'] text-[12px] font-semibold leading-5 text-[#808DAF]">
                Date & Time
              </p>
              {scheduleSelections.length > 0 ? (
                <div className="mt-1 space-y-2">
                  {scheduleSelections.map((selection) => (
                    <div key={selection.key}>
                      <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#011C60]">
                        {selection.label}
                      </p>
                      <p className="font-['Roboto'] text-[13px] leading-5 text-[#011C60]">
                        {formatRangeLabel(selection.timeSlot)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#011C60]">
                    {formatShortSelectedDate(selectedDateKey)}
                  </p>
                  <p className="font-['Roboto'] text-[13px] leading-5 text-[#011C60]">
                    {formatRangeLabel(selectedTimeSlot)}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CCD2DF]">
              <LocationIcon className="h-5 w-5" stroke="#011C60" />
            </span>
            <div>
              <p className="font-['Roboto'] text-[12px] font-semibold leading-5 text-[#808DAF]">
                Address
              </p>
              <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#011C60]">
                Home
              </p>
              <p className="font-['Roboto'] text-[13px] leading-5 text-[#011C60]">
                {selectedNeighborhoodName || service.location || "Not specified"}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CCD2DF]">
              <ClockIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-['Roboto'] text-[12px] font-semibold leading-5 text-[#808DAF]">
                Service Type
              </p>
              <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#011C60]">
                {packageItem.name}
              </p>
              {scheduleSelections.length > 0 ? (
                <p className="font-['Roboto'] text-[13px] leading-5 text-[#011C60]">
                  {scheduleSelections
                    .map((selection) => selection.label)
                    .join(", ")}
                </p>
              ) : (
                selectedSchedule.length > 0 && (
                  <p className="font-['Roboto'] text-[13px] leading-5 text-[#011C60]">
                    {selectedSchedule.join(", ")}
                  </p>
                )
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CCD2DF] font-['Roboto'] text-[18px] font-semibold text-[#011C60]">
              $
            </span>
            <div>
              <p className="font-['Roboto'] text-[12px] font-semibold leading-5 text-[#808DAF]">
                Fees
              </p>
              <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#011C60]">
                Package fee
              </p>
              <p className="font-['Roboto'] text-[13px] leading-5 text-[#011C60]">
                {bookingPrice}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CCD2DF]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#011C60]" aria-hidden="true">
                <path
                  d="M7 7.5h10M7 12h7M7 16.5h5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <rect
                  x="4.5"
                  y="4"
                  width="15"
                  height="16"
                  rx="2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
            <div className="flex-1">
              <p className="font-['Roboto'] text-[12px] font-semibold leading-5 text-[#808DAF]">
                Included in Package
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {includedItems.slice(0, 6).map((feature) => (
                  <span
                    key={feature}
                    className="rounded-[8px] bg-[#F3F5FA] px-3 py-1.5 font-['Roboto'] text-[11px] font-medium text-[#6777A0]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          {errorMessage && (
            <p className="mb-3 rounded-[8px] bg-red-50 px-3 py-2 text-center font-['Roboto'] text-[12px] font-semibold text-red-600">
              {errorMessage}
            </p>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-12 w-full rounded-[8px] bg-[#011C60] font-['Roboto'] text-[13px] font-semibold text-white transition hover:bg-[#02237a] disabled:cursor-not-allowed disabled:bg-[#B3BBCF]"
          >
            {isSubmitting ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingSuccessModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] rounded-[16px] bg-white px-8 py-9 text-center shadow-[0px_28px_70px_rgba(1,28,96,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#E6E8EF]">
          <svg
            viewBox="0 0 64 64"
            className="h-16 w-16 text-[#011C60]"
            aria-hidden="true"
          >
            <circle cx="32" cy="32" r="25" fill="#EECE42" opacity="0.4" />
            <path
              d="M20 33.5L28 41L45 23"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mt-6 font-['Roboto'] text-[28px] font-semibold leading-9 text-[#011C60]">
          Book Successfully
        </h2>
        <p className="mx-auto mt-3 max-w-[280px] font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
          Your booking has been confirmed successfully.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-7 h-12 w-full rounded-[8px] bg-[#011C60] font-['Roboto'] text-[14px] font-semibold text-white transition hover:bg-[#02237a]"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default function PackageDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { packageId } = useParams();
  const [packageItem, setPackageItem] = useState(null);
  const [service, setService] = useState(null);
  const [bookingDraft, setBookingDraft] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingErrorMessage, setBookingErrorMessage] = useState("");
  const returnTo =
    typeof location.state?.returnTo === "string" &&
    !location.state.returnTo.startsWith("/services/package")
      ? location.state.returnTo
      : "";
  const statePackageItem = useMemo(
    () =>
      location.state?.packageItem && typeof location.state.packageItem === "object"
        ? location.state.packageItem
        : null,
    [location.state]
  );

  useEffect(() => {
    if (!packageId) return undefined;

    let isMounted = true;

    const loadPackageDetails = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const packagePayload =
          statePackageItem && isMatchingPackageId(statePackageItem, packageId)
            ? statePackageItem
            : await fetchPackageFromPackagesList(packageId);

        if (!packagePayload) {
          throw new Error("Package was not found in the packages list.");
        }

        const normalizedPackage = normalizePackage(packagePayload);

        if (!isMounted) return;

        setPackageItem(normalizedPackage);

        const resolvedService = await resolvePackageBookingService(normalizedPackage);

        if (isMounted) {
          setService(resolvedService || createFallbackService(normalizedPackage));
        }
      } catch (error) {
        if (!isMounted) return;

        setPackageItem(null);
        setService(null);
        setErrorMessage(
          getApiErrorMessage(error, "Unable to load package details.")
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPackageDetails();

    return () => {
      isMounted = false;
    };
  }, [packageId, statePackageItem]);

  if (!packageId) {
    return <Navigate to="/services/service-categories" replace />;
  }

  const handleBack = () => {
    navigate(returnTo || "/services/service-categories");
  };

  const getPackageBookingTargetIds = (draft) =>
    getBookablePackageIds(draft?.packageItem);

  const getBookableAppointment = (body) => ({
    body,
    availabilityResponse: null,
  });

  const bookPackageAppointment = async (targetIds, body) => {
    let lastError = null;

    for (const targetId of targetIds) {
      try {
        return {
          targetId,
          response: await bookServiceAppointment(targetId, body),
          request: body,
        };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  };

  const handleConfirmBooking = async () => {
    if (!bookingDraft) return;

    if (isOwnedByCurrentUser(user, bookingDraft.service, bookingDraft.packageItem)) {
      setBookingErrorMessage(OWN_PACKAGE_BOOKING_ERROR);
      return;
    }

    const scheduleSelections = Array.isArray(bookingDraft.scheduleSelections)
      ? bookingDraft.scheduleSelections
      : [];
    const appointmentSelections = (
      scheduleSelections.length
        ? scheduleSelections
        : [
            {
              key: bookingDraft.selectedDateKey || "selected-date",
              label: bookingDraft.selectedDateKey || "Selected date",
              dateKey: bookingDraft.selectedDateKey,
              timeSlot: bookingDraft.selectedTimeSlot,
            },
          ]
    ).slice(0, 1);

    setIsBookingSubmitting(true);
    setBookingErrorMessage("");

    try {
      const bookingService = bookingDraft.service;
      const packageBookingTargetIds =
        getPackageBookingTargetIds(bookingDraft).length > 0
          ? getPackageBookingTargetIds(bookingDraft)
          : await resolvePackageServiceNameIds(bookingDraft.packageItem);

      if (packageBookingTargetIds.length === 0) {
        setBookingErrorMessage(
          "This package is missing a service name id for booking."
        );
        return;
      }

      const appointmentResults = [];

      for (const selection of appointmentSelections) {
        const appointment = getBookableAppointment(
          buildAppointmentBody({
            date: getScheduleSelectionDate(
              selection,
              bookingDraft.selectedDateKey
            ),
            timeSlot: selection.timeSlot,
            service: bookingService,
            packageItem: bookingDraft.packageItem,
            neighborhoodId: bookingDraft.selectedNeighborhoodId,
          })
        );
        const appointmentBody = appointment.body;
        const appointmentBooking = await bookPackageAppointment(
          packageBookingTargetIds,
          appointmentBody
        );

        appointmentResults.push({
          selection,
          request: appointmentBody,
          response: appointmentBooking.response,
          bookingTargetId: appointmentBooking.targetId,
          availabilityResponse: appointment.availabilityResponse,
        });
      }

      const firstResult = appointmentResults[0];
      const bookedTargetId = firstResult.bookingTargetId || packageBookingTargetIds[0];
      const bookingPayload = {
        id: getAppointmentId(
          bookingDraft.packageItem.id,
          bookedTargetId,
          firstResult.request
        ),
        mode: "package",
        serviceId: bookedTargetId,
        serviceName: bookingService.name,
        packageId: bookingDraft.packageItem.id,
        packageName: bookingDraft.packageItem.name,
        bookingTargetId: bookedTargetId,
        providerId: bookingService.providerId,
        providerName: bookingService.providerName,
        date: firstResult.request.date,
        from: firstResult.request.from,
        to: firstResult.request.to,
        neighborhoodId: firstResult.request.neighborhoodId,
        neighborhoodName: bookingDraft.selectedNeighborhoodName,
        items: [],
        schedule: appointmentResults.map(({ selection, request }) => ({
          key: selection.key,
          type: selection.type,
          label: selection.label,
          dayIndex: selection.dayIndex,
          monthDay: selection.monthDay,
          recurrence:
            selection.recurrence || bookingDraft.packageItem.recurrence || "",
          daysPerInterval:
            selection.daysPerInterval ||
            bookingDraft.packageItem.daysPerInterval ||
            1,
          date: request.date,
          from: request.from,
          to: request.to,
        })),
        selectedSchedule: bookingDraft.selectedSchedule || [],
        total: bookingDraft.total,
        currency: bookingDraft.packageItem.currency,
        appointmentRequests: appointmentResults.map((result) => result.request),
        appointmentResponses: appointmentResults.map((result) => result.response),
        availabilityResponses: appointmentResults.map(
          (result) => result.availabilityResponse
        ),
        status: extractAppointmentStatus(firstResult.response),
        createdAt: new Date().toISOString(),
      };

      saveAppointmentBookings(bookingPayload);

      setBookingDraft(null);
      setIsSuccessOpen(true);
    } catch (error) {
      setBookingErrorMessage(getPackageBookingErrorMessage(error));
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F9FC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex items-center">
          <BackCircleButton onClick={handleBack} />
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_416px]">
            <div className="h-[420px] animate-pulse rounded-2xl bg-white shadow-[0px_8px_24px_rgba(190,198,222,0.18)]" />
            <div className="h-[420px] animate-pulse rounded-2xl bg-white shadow-[0px_8px_24px_rgba(190,198,222,0.18)]" />
          </div>
        ) : errorMessage ? (
          <div className="mt-8">
            <EmptyState title="Package not available" description={errorMessage} />
          </div>
        ) : (
          packageItem &&
          service && (
            <>
              <PackageDetailsView
                service={service}
                packageItem={packageItem}
                onConfirmBooking={(draft) => {
                  const isOwnPackage = isOwnedByCurrentUser(
                    user,
                    draft.service,
                    draft.packageItem
                  );

                  setBookingErrorMessage("");
                  if (isOwnPackage) {
                    setBookingErrorMessage(OWN_PACKAGE_BOOKING_ERROR);
                  }
                  setBookingDraft(draft);
                }}
              />
              <ConfirmBookingModal
                booking={bookingDraft}
                onClose={() => {
                  if (isBookingSubmitting) return;
                  setBookingErrorMessage("");
                  setBookingDraft(null);
                }}
                onConfirm={handleConfirmBooking}
                isSubmitting={isBookingSubmitting}
                errorMessage={bookingErrorMessage}
              />
              <BookingSuccessModal
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
              />
            </>
          )
        )}
      </div>
    </div>
  );
}
