import { useEffect, useRef, useState } from "react";

import {
  changeRole,
  getGovernorates,
  getNeighborhoods,
} from "../../../../api/auth/auth.api";
import {
  addService,
  createOrUpdateAgendas,
  createOrUpdateItems,
  deletePackage,
  deleteService,
  getMyPackages,
  getMyServices,
  getPackageDetails,
  getServiceDetails,
  updatePackage,
  updateService,
} from "../../../../api/services/service.api";
import Toast from "../../../common/Toast";
import AddPackageFlow from "../add-package-flow/AddPackageFlow";
import AvailabilityStep from "./AvailabilityStep";
import DeleteConfirmModal from "../management-dashboard/DeleteConfirmModal";
import ManagementTable from "../management-dashboard/ManagementTable";
import PackageEditModal from "../management-dashboard/PackageEditModal";
import ServiceEditModal from "../management-dashboard/ServiceEditModal";
import MyServicesStep from "./MyServicesStep";
import ServiceDetailsStep from "./ServiceDetailsStep";
import ServiceItemsStep from "./ServiceItemsStep";
import { serviceCategories } from "../../../../data/serviceFlowData";
import {
  FLOW_ASSETS,
  PARTNER_TABS,
  WEEKDAY_OPTIONS,
  createEmptyAvailabilityData,
  createEmptyServiceDetails,
  getCategoryLabel,
} from "./partnerFlowData";
import {
  BriefcaseIcon,
  PANEL_CLASS_NAME,
  joinClasses,
} from "./PartnerFlowShared";

const isServiceDetailsComplete = (details) =>
  [
    details.serviceName,
    details.category,
    details.governorate,
    details.coverageArea,
    details.description,
    details.longDescription,
    details.price,
    details.serviceTimeHours,
  ].every((value) => String(value || "").trim()) &&
  (details.photos || []).some((photo) => photo instanceof File);

const createEmptyDraft = () => ({
  selectedPartnerType: "",
  serviceDetails: createEmptyServiceDetails(),
  serviceItems: [],
  availability: createEmptyAvailabilityData(),
});

const LANGUAGE = "en";
const PROVIDER_ROLE = "Provider";
const AUTH_TOKEN_COOKIE_NAME = "alaa_auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SERVICE_API_CURRENCY = "EGY";

const CATEGORY_API_VALUES = {
  "car-care": "Car_Care",
  "home-service": "Home_Care",
  "personal-care": "Personal_Care",
  Car_Care: "Car_Care",
  Home_Care: "Home_Care",
  Personal_Care: "Personal_Care",
};

const CATEGORY_UI_VALUES = {
  Car_Care: "car-care",
  Home_Care: "home-service",
  Personal_Care: "personal-care",
  car_care: "car-care",
  home_care: "home-service",
  personal_care: "personal-care",
  carcare: "car-care",
  homecare: "home-service",
  personalcare: "personal-care",
  "car care": "car-care",
  "home care": "home-service",
  "personal care": "personal-care",
  CarCare: "car-care",
  HomeCare: "home-service",
  PersonalCare: "personal-care",
};

const extractPayloadData = (response) => response?.data ?? response;

const extractList = (response) => {
  const data = extractPayloadData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

const toOption = (item) => ({
  value: item.id,
  label: item.name,
});

const getServiceIdFromResponse = (response) => {
  const data = extractPayloadData(response);

  if (typeof data === "string") return data;

  return data?.id || data?.serviceId || response?.id || response?.serviceId;
};

const normalizeTextValue = (value) => String(value || "").trim().replace(/\s+/g, " ");

const firstPresentValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeCategoryValue = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";
  const slugValue = rawValue
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase();
  const parentCategory = serviceCategories.find(
    (category) =>
      category.slug === slugValue ||
      category.title.toLowerCase() === rawValue.toLowerCase() ||
      category.shortLabel?.toLowerCase() === rawValue.toLowerCase() ||
      category.subServices?.some(
        (subService) =>
          subService.slug === slugValue ||
          subService.title.toLowerCase() === rawValue.toLowerCase()
      )
  );

  return (
    CATEGORY_UI_VALUES[rawValue] ||
    CATEGORY_UI_VALUES[rawValue.toLowerCase()] ||
    parentCategory?.slug ||
    slugValue
  );
};

const getCategorySource = (service) =>
  firstPresentValue(
    typeof service.categoryName === "string" ? service.categoryName : "",
    typeof service.category === "string" ? service.category : "",
    service.categoryDto?.name,
    service.categoryDto?.slug,
    service.category?.name,
    service.category?.slug,
    service.mainCategory?.name,
    service.mainCategory?.slug,
    service.parentCategory?.name,
    service.parentCategory?.slug,
    service.serviceCategory?.name,
    service.serviceCategory?.slug,
    service.subCategory?.name,
    service.subCategory?.slug
  );

const normalizeWeekdayValue = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  const normalizedValue = rawValue.toLowerCase();

  return (
    WEEKDAY_OPTIONS.find((day) => day.toLowerCase() === normalizedValue) ||
    rawValue.charAt(0).toUpperCase() + rawValue.slice(1).toLowerCase()
  );
};

const getAgendaTime = (agenda, fieldNames) =>
  fieldNames
    .map((fieldName) => agenda?.[fieldName])
    .find((value) => value !== undefined && value !== null && value !== "");

const AGENDA_DAY_FIELDS = [
  "day",
  "Day",
  "dayOfWeek",
  "DayOfWeek",
  "weekDay",
  "WeekDay",
  "weekday",
  "Weekday",
  "name",
  "Name",
];

const AGENDA_FROM_FIELDS = [
  "from",
  "From",
  "fromTime",
  "FromTime",
  "start",
  "Start",
  "startTime",
  "StartTime",
  "startHour",
  "StartHour",
  "startDate",
  "StartDate",
];

const AGENDA_TO_FIELDS = [
  "to",
  "To",
  "toTime",
  "ToTime",
  "end",
  "End",
  "endTime",
  "EndTime",
  "endHour",
  "EndHour",
  "endDate",
  "EndDate",
];

const getAgendaDayValue = (agenda) =>
  typeof agenda === "string" ? agenda : getAgendaTime(agenda, AGENDA_DAY_FIELDS);

const isAgendaLike = (item) => {
  if (typeof item === "string") {
    return WEEKDAY_OPTIONS.includes(normalizeWeekdayValue(item));
  }

  if (!item || typeof item !== "object") return false;

  return Boolean(getAgendaDayValue(item));
};

const findAgendaArray = (value, seen = new Set()) => {
  if (!value || typeof value !== "object" || seen.has(value)) return [];
  seen.add(value);

  if (Array.isArray(value)) {
    return value.some(isAgendaLike) ? value : [];
  }

  const preferredKeys = [
    "agendas",
    "Agendas",
    "agendaDtos",
    "AgendaDtos",
    "agendaDTOs",
    "AgendaDTOs",
    "serviceAgendas",
    "ServiceAgendas",
    "availabilities",
    "Availabilities",
    "availableDays",
    "AvailableDays",
    "schedules",
    "Schedules",
    "workingHours",
    "WorkingHours",
  ];

  for (const key of preferredKeys) {
    const nestedValue = value[key];
    const nestedAgendas = findAgendaArray(nestedValue, seen);

    if (nestedAgendas.length > 0) return nestedAgendas;
  }

  for (const nestedValue of Object.values(value)) {
    const nestedAgendas = findAgendaArray(nestedValue, seen);

    if (nestedAgendas.length > 0) return nestedAgendas;
  }

  return [];
};

const getAgendaHour = (timeValue, fallbackHour) => {
  const rawValue = String(timeValue || "");
  const match =
    rawValue.match(/T(\d{1,2}):/) ||
    rawValue.match(/(?:^|\s)(\d{1,2}):/) ||
    rawValue.match(/^(\d{1,2})$/);
  const hour = match ? Number(match[1] || match[0]) : Number.NaN;

  return Number.isFinite(hour) ? String(Math.min(Math.max(hour, 0), 23)) : fallbackHour;
};

const isFullDayAgendaWindow = (fromTime, toTime) => {
  const fromValue = String(fromTime || "");
  const toValue = String(toTime || "");
  const startsAtMidnight = /^0?0:0?[01](?::0{2})?$/.test(fromValue);
  const endsAtFullDay =
    /^0?0:0?0(?::0{2})?$/.test(toValue) || /^23:59(?::0{2})?$/.test(toValue);

  return (
    (startsAtMidnight && endsAtFullDay) ||
    (Boolean(fromTime) &&
      Boolean(toTime) &&
      getAgendaHour(fromTime, "") === getAgendaHour(toTime, ""))
  );
};

const normalizeAgendaList = (service) => {
  const availability = service.availability || service.Availability || {};
  const agendas =
    firstPresentValue(
      service.agendas,
      service.Agendas,
      service.agendaDtos,
      service.AgendaDtos,
      service.agendaDTOs,
      service.AgendaDTOs,
      service.serviceAgendas,
      service.ServiceAgendas,
      service.availabilities,
      service.Availabilities,
      service.availability,
      service.Availability,
      service.availableDays,
      service.AvailableDays,
      service.schedules,
      service.Schedules,
      service.workingHours,
      service.WorkingHours,
      availability.agendas,
      availability.Agendas,
      availability.items,
      availability.Items
    ) || [];

  if (Array.isArray(agendas)) return agendas;
  if (Array.isArray(agendas.agendas)) return agendas.agendas;
  if (Array.isArray(agendas.Agendas)) return agendas.Agendas;
  if (Array.isArray(agendas.items)) return agendas.items;
  if (Array.isArray(agendas.Items)) return agendas.Items;

  const days = firstPresentValue(
    service.days,
    service.Days,
    availability.days,
    availability.Days
  );

  if (Array.isArray(days)) {
    return days.map((day) => ({
      day,
      from: firstPresentValue(
        service.from,
        service.From,
        service.fromTime,
        service.FromTime,
        service.start,
        service.Start,
        service.startTime,
        service.StartTime,
        service.startHour,
        service.StartHour,
        availability.from,
        availability.From,
        availability.fromTime,
        availability.FromTime,
        availability.start,
        availability.Start,
        availability.startTime,
        availability.StartTime,
        availability.startHour,
        availability.StartHour
      ),
      to: firstPresentValue(
        service.to,
        service.To,
        service.toTime,
        service.ToTime,
        service.end,
        service.End,
        service.endTime,
        service.EndTime,
        service.endHour,
        service.EndHour,
        availability.to,
        availability.To,
        availability.toTime,
        availability.ToTime,
        availability.end,
        availability.End,
        availability.endTime,
        availability.EndTime,
        availability.endHour,
        availability.EndHour
      ),
    }));
  }
  if (Array.isArray(agendas.days)) {
    return agendas.days.map((day) => ({
      day,
      from: firstPresentValue(
        agendas.from,
        agendas.fromTime,
        agendas.start,
        agendas.startTime,
        agendas.startHour
      ),
      to: firstPresentValue(
        agendas.to,
        agendas.toTime,
        agendas.end,
        agendas.endTime,
        agendas.endHour
      ),
    }));
  }
  if (Array.isArray(agendas.Days)) {
    return agendas.Days.map((day) => ({
      day,
      from: firstPresentValue(
        agendas.from,
        agendas.From,
        agendas.fromTime,
        agendas.FromTime,
        agendas.start,
        agendas.Start,
        agendas.startTime,
        agendas.StartTime,
        agendas.startHour,
        agendas.StartHour
      ),
      to: firstPresentValue(
        agendas.to,
        agendas.To,
        agendas.toTime,
        agendas.ToTime,
        agendas.end,
        agendas.End,
        agendas.endTime,
        agendas.EndTime,
        agendas.endHour,
        agendas.EndHour
      ),
    }));
  }
  if (getAgendaDayValue(service)) {
    return [
      {
        day: getAgendaDayValue(service),
        from: firstPresentValue(
          service.from,
          service.From,
          service.fromTime,
          service.FromTime,
          service.start,
          service.Start,
          service.startTime,
          service.StartTime,
          service.startHour,
          service.StartHour
        ),
        to: firstPresentValue(
          service.to,
          service.To,
          service.toTime,
          service.ToTime,
          service.end,
          service.End,
          service.endTime,
          service.EndTime,
          service.endHour,
          service.EndHour
        ),
      },
    ];
  }

  return findAgendaArray(service);
};

const normalizeServicePayload = (service) => {
  const nestedService =
    service.service ||
    service.serviceDto ||
    service.serviceDTO ||
    service.serviceDetails ||
    service.details ||
    service.data ||
    service.value ||
    service.payload ||
    service.item ||
    service.model ||
    service.result ||
    {};
  const serviceAgendas = findAgendaArray(service);
  const nestedAgendas = findAgendaArray(nestedService);

  if (!nestedService || typeof nestedService !== "object") {
    return service;
  }

  return {
    ...nestedService,
    ...service,
    items: firstPresentValue(
      service.items,
      service.serviceItems,
      nestedService.items,
      nestedService.serviceItems
    ),
    agendas: firstPresentValue(
      service.agendas,
      service.Agendas,
      service.agendaDtos,
      service.AgendaDtos,
      service.agendaDTOs,
      service.AgendaDTOs,
      service.serviceAgendas,
      service.ServiceAgendas,
      nestedService.agendas,
      nestedService.Agendas,
      nestedService.agendaDtos,
      nestedService.AgendaDtos,
      nestedService.agendaDTOs,
      nestedService.AgendaDTOs,
      nestedService.serviceAgendas
        ? nestedService.serviceAgendas
        : undefined,
      nestedService.ServiceAgendas,
      serviceAgendas.length > 0 ? serviceAgendas : undefined,
      nestedAgendas.length > 0 ? nestedAgendas : undefined
    ),
    availability: firstPresentValue(
      service.availability,
      service.Availability,
      nestedService.availability,
      nestedService.Availability
    ),
    images: firstPresentValue(
      service.images,
      service.imageUrls,
      service.serviceImages,
      nestedService.images,
      nestedService.imageUrls,
      nestedService.serviceImages
    ),
  };
};

const buildServiceFormData = (
  details,
  isUpdate = false,
  { includeImageFiles = true } = {}
) => {
  const formData = new FormData();

  formData.append("name", normalizeTextValue(details.serviceName));
  formData.append("price", Number(details.price) || 0);
  formData.append("currency", SERVICE_API_CURRENCY);
  formData.append(
    "categoryName",
    CATEGORY_API_VALUES[details.category] || details.category
  );
  formData.append("timeslotDurationInMin", Number(details.serviceTimeHours) * 60 || 60);
  formData.append("numberOfCustomerPerTimeSlots", 1);
  formData.append("description", normalizeTextValue(details.description));
  formData.append("subDescription", String(details.longDescription || "").trim());
  formData.append("neighborhoodId", details.coverageArea);

  if (isUpdate) {
    formData.append("isAvailable", true);
  }

  (details.deletedImages || []).forEach((imageName) => {
    formData.append("deletedImages", imageName);
  });

  if (includeImageFiles) {
    (details.photos || []).forEach((photo) => {
      if (photo instanceof File) {
        formData.append("imageFiles", photo);
      }
    });
  }

  return formData;
};

const validateServiceDetailsForApi = (details) => {
  const price = Number(details.price);
  const durationInHours = Number(details.serviceTimeHours);
  const hasNewPhoto = (details.photos || []).some((photo) => photo instanceof File);
  const hasExistingPhoto = (details.photoNames || []).some((photoName) =>
    String(photoName || "").trim()
  );

  if (!normalizeTextValue(details.serviceName)) {
    return "Please enter a service name.";
  }

  if (!CATEGORY_API_VALUES[details.category]) {
    return "Please choose a valid service category.";
  }

  if (!String(details.coverageArea || "").trim()) {
    return "Please choose a coverage area.";
  }

  if (!normalizeTextValue(details.description)) {
    return "Please enter a short service description.";
  }

  if (!String(details.longDescription || "").trim()) {
    return "Please enter a detailed service description.";
  }

  if (!Number.isFinite(price) || price < 0) {
    return "Please enter a valid service price.";
  }

  if (!Number.isFinite(durationInHours) || durationInHours <= 0) {
    return "Please enter a valid service duration.";
  }

  if (!hasNewPhoto && !hasExistingPhoto) {
    return "Please upload at least one service photo.";
  }

  return "";
};

const getAvailabilityDayWindow = (availability, day) => {
  const normalizedDay = normalizeWeekdayValue(day);
  const dayWindows = availability?.dayWindows || {};

  return (
    dayWindows[day] ||
    dayWindows[normalizedDay] || {
      startHour: availability?.startHour || "9",
      endHour: availability?.endHour || "17",
      dailyWindow: Boolean(availability?.dailyWindow),
    }
  );
};

const isAvailabilityWindowValid = (window) => {
  if (window?.dailyWindow) return true;

  const startHour = Number(window?.startHour);
  const endHour = Number(window?.endHour);

  return Number.isFinite(startHour) && Number.isFinite(endHour) && endHour > startHour;
};

const validateAvailabilityForApi = (availability) => {
  const days = availability?.days || [];

  if (days.length === 0) {
    return "Please select at least one availability day.";
  }

  const invalidDay = days.find(
    (day) => !isAvailabilityWindowValid(getAvailabilityDayWindow(availability, day))
  );

  if (invalidDay) {
    return `${invalidDay} availability end hour must be after the start hour. For a full day, turn on Daily Window.`;
  }

  return "";
};

const hasAvailabilityDays = (availability) =>
  (availability?.days || []).some((day) => String(day || "").trim());

const toAgendaTime = (hour) => {
  const match = String(hour || "").match(/\d{1,2}/);
  const hourNumber = match ? Number(match[0]) : 0;

  return `${String(Math.min(Math.max(hourNumber, 0), 23)).padStart(2, "0")}:00`;
};

const toAgendaDay = (day) => {
  const normalizedDay = normalizeWeekdayValue(day);

  return WEEKDAY_OPTIONS.includes(normalizedDay) ? normalizedDay : "";
};

const buildAgendasPayload = (availability) => ({
  agendas: (availability.days || []).reduce((agendas, day) => {
    const normalizedDay = toAgendaDay(day);
    if (!normalizedDay) return agendas;

    const dayWindow = getAvailabilityDayWindow(availability, normalizedDay);

    agendas.push({
      day: normalizedDay,
      from: dayWindow.dailyWindow ? "00:00" : toAgendaTime(dayWindow.startHour),
      to: dayWindow.dailyWindow ? "23:59" : toAgendaTime(dayWindow.endHour),
    });

    return agendas;
  }, []),
});

const buildItemsPayload = (items) => ({
  items: (items || []).map((item) => ({
    name: item.itemName,
    price: Number(item.price) || 0,
    description: item.description,
  })),
});

const normalizeService = (servicePayload) => {
  const service = normalizeServicePayload(servicePayload);
  const categorySource = getCategorySource(service);
  const category = normalizeCategoryValue(categorySource);
  const neighborhood = service.neighborhood || service.neighborhoodDto || {};
  const governorate =
    service.governorate ||
    service.governorateDto ||
    neighborhood.governorate ||
    neighborhood.governorateDto ||
    {};
  const items = service.items || service.serviceItems || [];
  const agendaList = normalizeAgendaList(service);
  const firstAgenda = agendaList[0] || {};
  const agendaFrom = getAgendaTime(firstAgenda, AGENDA_FROM_FIELDS);
  const agendaTo = getAgendaTime(firstAgenda, AGENDA_TO_FIELDS);
  const availabilityDays = [
    ...new Set(
      agendaList
        .map((agenda) => normalizeWeekdayValue(getAgendaDayValue(agenda)))
        .filter(Boolean)
    ),
  ];
  const dayWindows = agendaList.reduce((windows, agenda) => {
    const day = normalizeWeekdayValue(getAgendaDayValue(agenda));

    if (!day) return windows;

    const fromTime = getAgendaTime(agenda, AGENDA_FROM_FIELDS);
    const toTime = getAgendaTime(agenda, AGENDA_TO_FIELDS);

    return {
      ...windows,
      [day]: {
        startHour: getAgendaHour(fromTime, "9"),
        endHour: getAgendaHour(toTime, "17"),
        dailyWindow: isFullDayAgendaWindow(fromTime, toTime),
      },
    };
  }, {});
  const images =
    service.images ||
    service.imageUrls ||
    service.serviceImages ||
    service.imageFiles ||
    [];
  const id =
    service.id ||
    service.serviceId ||
    service.providerServiceId ||
    service.service?.id ||
    "";

  return {
    id,
    serviceName: service.name || service.serviceName || "",
    category,
    categoryLabel: service.categoryLabel || getCategoryLabel(category),
    location:
      service.location ||
      [neighborhood.name, governorate.name].filter(Boolean).join(", "),
    governorate: service.governorateId || governorate.id || "",
    coverageArea: service.neighborhoodId || neighborhood.id || "",
    description: service.description || "",
    longDescription: service.subDescription || service.longDescription || "",
    price: String(
      firstPresentValue(
        service.price,
        service.servicePrice,
        service.basePrice,
        service.startingPrice,
        service.pricePerSlot,
        service.amount
      ) ?? ""
    ),
    serviceTimeHours: String(
      service.serviceTimeHours ||
        Math.max(1, Math.round((service.timeslotDurationInMin || 60) / 60))
    ),
    photoNames: images
      .map((image) =>
        typeof image === "string"
          ? image
          : image.name || image.fileName || image.url || image.imageUrl || ""
      )
      .filter(Boolean),
    photos: [],
    items: items.map((item) => ({
      id: item.id || item.name,
      itemName: item.name || item.itemName || "",
      price: String(item.price ?? ""),
      description: item.description || "",
    })),
    availability: {
      days: availabilityDays,
      startHour: getAgendaHour(agendaFrom, "9"),
      endHour: getAgendaHour(agendaTo, "17"),
      dailyWindow: isFullDayAgendaWindow(agendaFrom, agendaTo),
      dayWindows,
    },
  };
};

const mergeServiceForEdit = (baseService, detailsService) => {
  const baseAvailability = baseService.availability || {};
  const detailsAvailability = detailsService.availability || {};
  const detailsHasAvailability =
    (detailsAvailability.days || []).length > 0 ||
    Object.keys(detailsAvailability.dayWindows || {}).length > 0 ||
    detailsAvailability.startHour !== "9" ||
    detailsAvailability.endHour !== "17" ||
    detailsAvailability.dailyWindow;

  return {
    ...baseService,
    ...detailsService,
    id: detailsService.id || baseService.id,
    serviceName: detailsService.serviceName || baseService.serviceName,
    category: detailsService.category || baseService.category,
    categoryLabel:
      detailsService.category && detailsService.category !== "service"
        ? detailsService.categoryLabel
        : baseService.categoryLabel,
    location: detailsService.location || baseService.location,
    governorate: detailsService.governorate || baseService.governorate,
    coverageArea: detailsService.coverageArea || baseService.coverageArea,
    description: detailsService.description || baseService.description,
    longDescription: detailsService.longDescription || baseService.longDescription,
    price: detailsService.price || baseService.price,
    serviceTimeHours: detailsService.serviceTimeHours || baseService.serviceTimeHours,
    photoNames:
      detailsService.photoNames?.length > 0
        ? detailsService.photoNames
        : baseService.photoNames,
    items: detailsService.items?.length > 0 ? detailsService.items : baseService.items,
    availability: detailsHasAvailability ? detailsAvailability : baseAvailability,
  };
};

const normalizePackage = (packageItem) => ({
  id: packageItem.id,
  packageName: packageItem.name || packageItem.packageName || "",
  serviceId: packageItem.serviceIds?.[0] || packageItem.serviceId || "",
  serviceName:
    packageItem.serviceName ||
    packageItem.services?.[0]?.name ||
    packageItem.service?.name ||
    "",
  pricingType:
    (packageItem.recurrence || packageItem.pricingType || "").charAt(0).toUpperCase() +
    (packageItem.recurrence || packageItem.pricingType || "").slice(1).toLowerCase(),
  times: String(packageItem.daysPerInterval ?? packageItem.times ?? ""),
  price: String(packageItem.price ?? ""),
  includedItems: packageItem.includedItems || [],
});

const buildPackagePayload = (packageItem) => ({
  name: packageItem.packageName.trim(),
  recurrence:
    packageItem.pricingType?.charAt(0).toUpperCase() +
    packageItem.pricingType?.slice(1).toLowerCase(),
  daysPerInterval: Number(packageItem.times) || 1,
  price: Number(packageItem.price) || 0,
  serviceIds: [packageItem.serviceId].filter(Boolean),
});

const getCookie = (name) => {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
};

const getAuthToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("token") || getCookie("alaa_auth_token")
    : "";

const setCookie = (name, value) => {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

const isJwtLike = (value) =>
  typeof value === "string" && value.split(".").length === 3;

const decodeJwtPayload = (token) => {
  if (!isJwtLike(token) || typeof window === "undefined") return null;

  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    return JSON.parse(window.atob(paddedBase64));
  } catch {
    return null;
  }
};

const getTokenRoles = (token) => {
  const payload = decodeJwtPayload(token);
  const roleClaims = [
    payload?.role,
    payload?.roles,
    payload?.Role,
    payload?.Roles,
    payload?.[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ],
  ];

  return roleClaims
    .flatMap((claim) => (Array.isArray(claim) ? claim : [claim]))
    .filter(Boolean)
    .map((role) => String(role));
};

const hasProviderToken = () =>
  getTokenRoles(getAuthToken()).some(
    (role) => role.toLowerCase() === PROVIDER_ROLE.toLowerCase()
  );

const extractAuthToken = (response) =>
  [
    response?.token,
    response?.accessToken,
    response?.data?.token,
    response?.data?.accessToken,
    response?.user?.token,
    response?.data?.user?.token,
    typeof response?.data === "string" && isJwtLike(response.data)
      ? response.data
      : null,
    isJwtLike(response) ? response : null,
  ].find(Boolean) || "";

const storeAuthToken = (token) => {
  if (!token || typeof window === "undefined") return;

  localStorage.setItem("token", token);
  setCookie(AUTH_TOKEN_COOKIE_NAME, token);
};

const deleteCookie = (name) => {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

const clearAuthSession = () => {
  if (typeof window === "undefined") return;

  ["token", "user", "accountType", "loggedInAs"].forEach((key) => {
    localStorage.removeItem(key);
  });

  deleteCookie("alaa_auth_session");
  deleteCookie("alaa_auth_token");
  deleteCookie("alaa_account_type");
};

const isUnauthorizedError = (error) => error?.response?.status === 401;
const isForbiddenError = (error) => error?.response?.status === 403;
const isConflictError = (error) => error?.response?.status === 409;
const isStaleProviderTokenError = (error) =>
  error?.message === "PROVIDER_TOKEN_REFRESH_REQUIRED";
const isNoChangesDetectedError = (error) =>
  getApiErrorMessage(error, "").includes("NoChangesDetected");
const isNonBlockingRelatedDataError = (error) => error?.response?.status === 400;
const getApiErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data;
  const validationMessage =
    data?.errors && typeof data.errors === "object"
      ? Object.values(data.errors).flat().filter(Boolean).join(" ")
      : "";
  const message =
    data?.error?.message ||
    data?.message ||
    data?.title ||
    validationMessage ||
    (typeof data === "string" ? data : "");

  return message || fallbackMessage;
};
const getProviderForbiddenMessage = (fallbackMessage) =>
  hasProviderToken()
    ? fallbackMessage
    : "Provider mode is ready. Please sign in again so your session gets provider access.";
const saveItemsIfPossible = async (serviceId, items) => {
  if (!items || items.length === 0) return;

  try {
    await createOrUpdateItems(serviceId, buildItemsPayload(items));
  } catch (error) {
    if (
      isUnauthorizedError(error) ||
      isForbiddenError(error) ||
      !isNonBlockingRelatedDataError(error)
    ) {
      throw error;
    }
  }
};
const ensureProviderRole = async () => {
  if (hasProviderToken()) {
    return true;
  }

  let response;

  try {
    response = await changeRole(PROVIDER_ROLE);
  } catch (error) {
    if (isConflictError(error)) {
      return true;
    }

    throw error;
  }

  const nextToken = extractAuthToken(response);
  storeAuthToken(nextToken);

  if (nextToken && !hasProviderToken()) {
    throw new Error("PROVIDER_TOKEN_REFRESH_REQUIRED");
  }

  return true;
};

export default function BecomePartnerFlow() {
  const [view, setView] = useState("entry");
  const [activeTab, setActiveTab] = useState("services");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPartnerType, setSelectedPartnerType] = useState("");
  const [serviceDetails, setServiceDetails] = useState(createEmptyServiceDetails);
  const [serviceItems, setServiceItems] = useState([]);
  const [draftServiceId, setDraftServiceId] = useState("");
  const [availability, setAvailability] = useState(createEmptyAvailabilityData);
  const [uploadError, setUploadError] = useState("");
  const [savedServices, setSavedServices] = useState([]);
  const [savedPackages, setSavedPackages] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [governorateOptions, setGovernorateOptions] = useState([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState([]);
  const [isLoadingGovernorates, setIsLoadingGovernorates] = useState(false);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);
  const [hasProviderAccess, setHasProviderAccess] = useState(false);
  const [isActivatingProvider, setIsActivatingProvider] = useState(false);
  const [isPreparingService, setIsPreparingService] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [toast, setToast] = useState(null);
  const hasFetchedInitialData = useRef(false);

  const loadProviderData = async ({ showPartialError = true } = {}) => {
    const [servicesResult, packagesResult] = await Promise.allSettled([
      getMyServices({ language: LANGUAGE, page: 1, search: "" }),
      getMyPackages({ page: 1 }),
    ]);

    const hasUnauthorizedResponse =
      (servicesResult.status === "rejected" &&
        isUnauthorizedError(servicesResult.reason)) ||
      (packagesResult.status === "rejected" &&
        isUnauthorizedError(packagesResult.reason));
    const hasForbiddenResponse =
      (servicesResult.status === "rejected" &&
        isForbiddenError(servicesResult.reason)) ||
      (packagesResult.status === "rejected" &&
        isForbiddenError(packagesResult.reason));

    if (hasUnauthorizedResponse) {
      clearAuthSession();
      setToast({
        id: Date.now(),
        type: "error",
        message: "Your session expired. Please sign in again.",
      });
      return false;
    }

    if (hasForbiddenResponse) {
      setHasProviderAccess(false);
      setToast({
        id: Date.now(),
        type: "error",
        message: getProviderForbiddenMessage(
          "Your account does not have permission to manage provider services or packages."
        ),
      });
      return false;
    }

    if (servicesResult.status === "fulfilled") {
      setSavedServices(extractList(servicesResult.value).map(normalizeService));
    }

    if (packagesResult.status === "fulfilled") {
      setSavedPackages(extractList(packagesResult.value).map(normalizePackage));
    }

    if (
      showPartialError &&
      (servicesResult.status === "rejected" ||
        packagesResult.status === "rejected")
    ) {
      setToast({
        id: Date.now(),
        type: "error",
        message: "Failed to load all provider data from the API.",
      });
    }

    return true;
  };

  useEffect(() => {
    if (hasFetchedInitialData.current) return;
    hasFetchedInitialData.current = true;

    const fetchInitialData = async () => {
      setIsLoadingGovernorates(true);

      try {
        const governoratesResponse = await getGovernorates(LANGUAGE);
        setGovernorateOptions(extractList(governoratesResponse).map(toOption));
      } catch {
        setToast({
          id: Date.now(),
          type: "error",
          message: "Failed to load governorates. Please try again.",
        });
      } finally {
        setIsLoadingGovernorates(false);
      }

      if (!getAuthToken()) {
        setToast({
          id: Date.now(),
          type: "error",
          message: "Please sign in again to manage your services and packages.",
        });
        return;
      }

      if (!hasProviderToken()) {
        setHasProviderAccess(false);
        return;
      }

      try {
        await ensureProviderRole();
        setHasProviderAccess(true);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          clearAuthSession();
          setToast({
            id: Date.now(),
            type: "error",
            message: "Your session expired. Please sign in again.",
          });
          return;
        }

        if (isForbiddenError(error)) {
          setHasProviderAccess(false);
          setToast({
            id: Date.now(),
            type: "error",
            message: getProviderForbiddenMessage(
              "The API refused provider access for this account. Please try signing in again."
            ),
          });
          return;
        }

        if (isStaleProviderTokenError(error)) {
          setHasProviderAccess(false);
          setToast({
            id: Date.now(),
            type: "error",
            message:
              "Provider mode is ready. Please sign in again so your session gets provider access.",
          });
          return;
        }

        setToast({
          id: Date.now(),
          type: "error",
          message: "Failed to activate provider mode. Please try again.",
        });
        return;
      }

      await loadProviderData();
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!serviceDetails.governorate) {
      setNeighborhoodOptions([]);
      return;
    }

    const fetchNeighborhoodOptions = async () => {
      setIsLoadingNeighborhoods(true);

      try {
        const response = await getNeighborhoods(serviceDetails.governorate, LANGUAGE);
        setNeighborhoodOptions(extractList(response).map(toOption));
      } catch {
        setNeighborhoodOptions([]);
        setToast({
          id: Date.now(),
          type: "error",
          message: "Failed to load neighborhoods for this governorate.",
        });
      } finally {
        setIsLoadingNeighborhoods(false);
      }
    };

    fetchNeighborhoodOptions();
  }, [serviceDetails.governorate]);

  const resetDraft = () => {
    const emptyDraft = createEmptyDraft();

    setCurrentStep(1);
    setSelectedPartnerType(emptyDraft.selectedPartnerType);
    setServiceDetails(emptyDraft.serviceDetails);
    setServiceItems(emptyDraft.serviceItems);
    setDraftServiceId("");
    setAvailability(emptyDraft.availability);
    setUploadError("");
  };

  const openServiceList = () => {
    resetDraft();
    setActiveTab("services");
    setView("services");
  };

  const activateProviderForFlow = async () => {
    if (!getAuthToken()) {
      setToast({
        id: Date.now(),
        type: "error",
        message: "Please sign in again to become a service provider.",
      });
      return false;
    }

    setIsActivatingProvider(true);

    try {
      if (!hasProviderAccess) {
        await ensureProviderRole();
      }
      setHasProviderAccess(true);
      return true;
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthSession();
        setToast({
          id: Date.now(),
          type: "error",
          message: "Your session expired. Please sign in again.",
        });
        return false;
      }

      if (isStaleProviderTokenError(error)) {
        setHasProviderAccess(false);
        setToast({
          id: Date.now(),
          type: "error",
          message:
            "Provider mode is ready. Please sign in again so your session gets provider access.",
        });
        return false;
      }

      setHasProviderAccess(false);
      setToast({
        id: Date.now(),
        type: "error",
        message:
          isForbiddenError(error)
            ? getProviderForbiddenMessage(
                "The API refused provider access for this account. Please try signing in again."
              )
            : "Failed to activate provider mode. Please try again.",
      });
      return false;
    } finally {
      setIsActivatingProvider(false);
    }
  };

  const openServiceListFromEntry = async () => {
    if (!(await activateProviderForFlow())) return;
    if (!(await loadProviderData({ showPartialError: false }))) return;

    openServiceList();
  };

  const openPackageFlowFromEntry = async () => {
    if (!(await activateProviderForFlow())) return;
    if (!(await loadProviderData({ showPartialError: false }))) return;

    setView("packages");
  };

  const openServiceFlow = async () => {
    if (!(await activateProviderForFlow())) return;

    resetDraft();
    setActiveTab("services");
    setView("wizard");
  };

  const cancelServiceFlow = () => {
    resetDraft();
    setView("services");
    setActiveTab("services");
  };

  const handleTopTabChange = (tabId) => {
    setActiveTab(tabId);
    setView("services");
  };

  const handleMyServicesNext = () => {
    if (!selectedPartnerType) return;

    if (selectedPartnerType !== "services") {
      setActiveTab(selectedPartnerType);
      setView("services");
      return;
    }

    setCurrentStep(2);
  };

  const handleWizardStepClick = (stepId) => {
    if (stepId > 1 && !selectedPartnerType) {
      setSelectedPartnerType("services");
    }

    setCurrentStep(stepId);
  };

  const handleDetailsChange = (fieldName, value) => {
    setServiceDetails((currentDetails) => {
      if (fieldName === "governorate") {
        return {
          ...currentDetails,
          governorate: value,
          coverageArea: "",
        };
      }

      return {
        ...currentDetails,
        [fieldName]: value,
      };
    });
  };

  const handlePhotoChange = (fileList) => {
    const files = Array.from(fileList || []);

    setServiceDetails((currentDetails) => {
      const nextFiles = [...(currentDetails.photos || [])];

      files.forEach((file) => {
        const alreadySelected = nextFiles.some(
          (currentFile) =>
            currentFile.name === file.name &&
            currentFile.size === file.size &&
            currentFile.lastModified === file.lastModified
        );

        if (!alreadySelected && nextFiles.length < 5) {
          nextFiles.push(file);
        }
      });

      setUploadError(
        (currentDetails.photos || []).length + files.length > 5
          ? "You can upload up to 5 photos only."
          : ""
      );

      return {
        ...currentDetails,
        photos: nextFiles,
      };
    });
  };

  const handleRemovePhoto = (photoIndex) => {
    setUploadError("");
    setServiceDetails((currentDetails) => ({
      ...currentDetails,
      photos: currentDetails.photos.filter((_, index) => index !== photoIndex),
    }));
  };

  const handleAddItem = (nextItem) => {
    setServiceItems((currentItems) => [...currentItems, nextItem]);
  };

  const handleAvailabilityFieldChange = (fieldName, value) => {
    setAvailability((currentAvailability) => ({
      ...currentAvailability,
      [fieldName]: value,
    }));
  };

  const handleAvailabilityDayFieldChange = (day, fieldName, value) => {
    setAvailability((currentAvailability) => {
      const currentWindow = getAvailabilityDayWindow(currentAvailability, day);

      return {
        ...currentAvailability,
        dayWindows: {
          ...(currentAvailability.dayWindows || {}),
          [day]: {
            ...currentWindow,
            [fieldName]: value,
          },
        },
      };
    });
  };

  const handleToggleDay = (day) => {
    setAvailability((currentAvailability) => {
      const isSelected = currentAvailability.days.includes(day);
      const nextDayWindows = { ...(currentAvailability.dayWindows || {}) };

      if (isSelected) {
        delete nextDayWindows[day];
      } else if (!nextDayWindows[day]) {
        nextDayWindows[day] = {
          startHour: currentAvailability.startHour || "9",
          endHour: currentAvailability.endHour || "17",
          dailyWindow: Boolean(currentAvailability.dailyWindow),
        };
      }

      return {
        ...currentAvailability,
        days: isSelected
          ? currentAvailability.days.filter((currentDay) => currentDay !== day)
          : [...currentAvailability.days, day],
        dayWindows: nextDayWindows,
      };
    });
  };

  const ensureServiceSaveAccess = async () => {
    if (!getAuthToken()) {
      setToast({
        id: Date.now(),
        type: "error",
        message: "Please sign in again before saving a service.",
      });
      return false;
    }

    if (!hasProviderAccess) {
      try {
        await ensureProviderRole();
        setHasProviderAccess(true);
      } catch (error) {
        if (isStaleProviderTokenError(error)) {
          setHasProviderAccess(false);
          setToast({
            id: Date.now(),
            type: "error",
            message:
              "Provider mode is ready. Please sign in again so your session gets provider access.",
          });
          return false;
        }

        setToast({
          id: Date.now(),
          type: "error",
          message:
            isForbiddenError(error)
              ? getProviderForbiddenMessage(
                  "The API refused provider access for this account. Please try signing in again."
                )
              : "Failed to activate provider mode. Please try again.",
        });
        return false;
      }
    }

    return true;
  };

  const rollbackDraftService = async (serviceId) => {
    if (!serviceId) return false;

    try {
      await deleteService(serviceId);
      return true;
    } catch {
      return false;
    }
  };

  const saveDraftServiceAndItems = async () => {
    if (draftServiceId) {
      try {
        await updateService(
          draftServiceId,
          buildServiceFormData(serviceDetails, true, {
            includeImageFiles: false,
          })
        );
      } catch (error) {
        if (!isNoChangesDetectedError(error)) {
          throw error;
        }
      }

      await saveItemsIfPossible(draftServiceId, serviceItems);
      return {
        serviceId: draftServiceId,
        shouldRollbackOnFailure: true,
      };
    }

    const response = await addService(buildServiceFormData(serviceDetails));
    const serviceId = getServiceIdFromResponse(response);

    if (!serviceId) {
      throw new Error("SERVICE_ID_MISSING");
    }

    setDraftServiceId(serviceId);

    try {
      await saveItemsIfPossible(serviceId, serviceItems);
    } catch (error) {
      error.createdServiceId = serviceId;
      throw error;
    }

    return {
      serviceId,
      shouldRollbackOnFailure: true,
    };
  };

  const handleServiceSaveError = async (error, fallbackMessage) => {
    if (isUnauthorizedError(error)) {
      clearAuthSession();
      setToast({
        id: Date.now(),
        type: "error",
        message: "Your session expired. Please sign in again.",
      });
      return true;
    }

    if (isForbiddenError(error)) {
      setHasProviderAccess(false);
      setToast({
        id: Date.now(),
        type: "error",
        message: getProviderForbiddenMessage(
          "Your account does not have permission to create provider services."
        ),
      });
      return true;
    }

    if (error.message === "SERVICE_ID_MISSING") {
      await loadProviderData({ showPartialError: false });
      setToast({
        id: Date.now(),
        type: "error",
        message:
          "Service was saved, but the API did not return its id to save items and availability.",
      });
      return true;
    }

    setToast({
      id: Date.now(),
      type: "error",
      message: getApiErrorMessage(error, fallbackMessage),
    });
    return true;
  };

  const handlePrepareServiceForAvailability = async () => {
    if (isPreparingService || isSavingService) return;

    const validationMessage = validateServiceDetailsForApi(serviceDetails);

    if (validationMessage) {
      setToast({
        id: Date.now(),
        type: "error",
        message: validationMessage,
      });
      return;
    }

    if (!(await ensureServiceSaveAccess())) return;

    setIsPreparingService(true);

    try {
      setCurrentStep(4);
    } catch (error) {
      await handleServiceSaveError(
        error,
        "Failed to save service details. Please try again."
      );
    } finally {
      setIsPreparingService(false);
    }
  };

  const handleSaveService = async () => {
    if (isSavingService || isPreparingService) return;

    const validationMessage = validateServiceDetailsForApi(serviceDetails);
    const availabilityValidationMessage = validateAvailabilityForApi(availability);

    if (validationMessage || availabilityValidationMessage) {
      setToast({
        id: Date.now(),
        type: "error",
        message: validationMessage || availabilityValidationMessage,
      });
      return;
    }

    if (!(await ensureServiceSaveAccess())) return;

    setIsSavingService(true);
    let savedService = null;

    try {
      const agendasPayload = buildAgendasPayload(availability);

      if (agendasPayload.agendas.length === 0) {
        setToast({
          id: Date.now(),
          type: "error",
          message: "Please select at least one availability day.",
        });
        return;
      }

      savedService = await saveDraftServiceAndItems();
      const serviceId = savedService.serviceId;

      await createOrUpdateAgendas(serviceId, agendasPayload);

      if (!(await loadProviderData({ showPartialError: false }))) {
        return;
      }
      setToast({
        id: Date.now(),
        type: "success",
        message: "Your service has been saved successfully.",
      });

      resetDraft();
      setView("services");
      setActiveTab("services");
    } catch (error) {
      const rollbackServiceId =
        savedService?.shouldRollbackOnFailure && savedService.serviceId
          ? savedService.serviceId
          : error.createdServiceId || "";
      const didRollbackService = await rollbackDraftService(rollbackServiceId);

      if (didRollbackService) {
        setDraftServiceId("");
        await loadProviderData({ showPartialError: false });
      }

      await handleServiceSaveError(
        error,
        didRollbackService
          ? "Availability could not be saved, so the service was not created."
          : "Availability could not be saved. Please refresh your services before trying again."
      );
    } finally {
      setIsSavingService(false);
    }
  };

  const handleEditService = async (service) => {
    if (!getAuthToken()) {
      setEditingService(service);
      return;
    }

    try {
      const response = await getServiceDetails(service.id, LANGUAGE);
      const serviceDetails = normalizeService(extractPayloadData(response));
      setEditingService(
        mergeServiceForEdit(normalizeService(service), {
          ...serviceDetails,
          id: serviceDetails.id || service.id,
        })
      );
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthSession();
        setToast({
          id: Date.now(),
          type: "error",
          message: "Your session expired. Please sign in again.",
        });
        return;
      }

      if (isForbiddenError(error)) {
        setHasProviderAccess(false);
        setToast({
          id: Date.now(),
          type: "error",
          message: getProviderForbiddenMessage(
            "Your account does not have permission to view provider services."
          ),
        });
        return;
      }

      setEditingService(service);
    }
  };

  const handleSaveServiceEdit = async (nextService) => {
    if (!nextService.id) {
      setToast({
        id: Date.now(),
        type: "error",
        message: "Cannot update this service because the API did not return its id.",
      });
      return;
    }

    const validationMessage = validateServiceDetailsForApi(nextService);
    const availabilityValidationMessage = hasAvailabilityDays(nextService.availability)
      ? validateAvailabilityForApi(nextService.availability)
      : "";

    if (validationMessage || availabilityValidationMessage) {
      setToast({
        id: Date.now(),
        type: "error",
        message: validationMessage || availabilityValidationMessage,
      });
      return;
    }

    if (!getAuthToken()) {
      setToast({
        id: Date.now(),
        type: "error",
        message: "Please sign in again before updating a service.",
      });
      return;
    }

    if (!hasProviderAccess) {
      try {
        await ensureProviderRole();
        setHasProviderAccess(true);
      } catch (error) {
        if (isStaleProviderTokenError(error)) {
          setHasProviderAccess(false);
          setToast({
            id: Date.now(),
            type: "error",
            message:
              "Provider mode is ready. Please sign in again so your session gets provider access.",
          });
          return;
        }

        setToast({
          id: Date.now(),
          type: "error",
          message:
            isForbiddenError(error)
              ? getProviderForbiddenMessage(
                  "The API refused provider access for this account. Please try signing in again."
                )
              : "Failed to activate provider mode. Please try again.",
        });
        return;
      }
    }

    try {
      try {
        await updateService(nextService.id, buildServiceFormData(nextService, true));
      } catch (error) {
        if (!isNoChangesDetectedError(error)) {
          throw error;
        }
      }

      await saveItemsIfPossible(nextService.id, nextService.items || []);
      if (hasAvailabilityDays(nextService.availability)) {
        await createOrUpdateAgendas(
          nextService.id,
          buildAgendasPayload(nextService.availability)
        );
      }

      await loadProviderData({ showPartialError: false });
      setEditingService(null);
      setToast({
        id: Date.now(),
        type: "success",
        message: "Service saved successfully.",
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthSession();
        setToast({
          id: Date.now(),
          type: "error",
          message: "Your session expired. Please sign in again.",
        });
        return;
      }

      if (isForbiddenError(error)) {
        setHasProviderAccess(false);
        setToast({
          id: Date.now(),
          type: "error",
          message: getProviderForbiddenMessage(
            "Your account does not have permission to update provider services."
          ),
        });
        return;
      }

      if (isNoChangesDetectedError(error)) {
        await loadProviderData({ showPartialError: false });
        setEditingService(null);
        setToast({
          id: Date.now(),
          type: "success",
          message: "Service saved successfully.",
        });
        return;
      }

      setToast({
        id: Date.now(),
        type: "error",
        message: getApiErrorMessage(
          error,
          "Failed to update service. Please try again."
        ),
      });
    }
  };

  const handleRequestDeleteService = (service) => {
    setPendingDelete({
      id: service.id,
      type: "service",
      name: service.serviceName,
    });
  };

  const confirmDeleteService = async (serviceId) => {
    if (!getAuthToken()) {
      throw new Error("Missing authentication token");
    }

    if (!hasProviderAccess) {
      throw new Error("Missing provider permission");
    }

    await deleteService(serviceId);
    await loadProviderData({ showPartialError: false });
    setToast({
      id: Date.now(),
      type: "success",
      message: "Service deleted successfully.",
    });
  };

  const handleEditPackage = async (packageItem) => {
    if (!getAuthToken()) {
      setEditingPackage(packageItem);
      return;
    }

    try {
      const response = await getPackageDetails(packageItem.id, LANGUAGE);
      setEditingPackage(normalizePackage(extractPayloadData(response)));
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthSession();
        setToast({
          id: Date.now(),
          type: "error",
          message: "Your session expired. Please sign in again.",
        });
        return;
      }

      if (isForbiddenError(error)) {
        setHasProviderAccess(false);
        setToast({
          id: Date.now(),
          type: "error",
          message: getProviderForbiddenMessage(
            "Your account does not have permission to view provider packages."
          ),
        });
        return;
      }

      setEditingPackage(packageItem);
    }
  };

  const handleSavePackageEdit = async (nextPackage) => {
    if (!getAuthToken()) {
      setToast({
        id: Date.now(),
        type: "error",
        message: "Please sign in again before updating a package.",
      });
      return;
    }

    if (!hasProviderAccess) {
      setToast({
        id: Date.now(),
        type: "error",
        message: getProviderForbiddenMessage(
          "Your account does not have permission to update provider packages."
        ),
      });
      return;
    }

    try {
      await updatePackage(nextPackage.id, buildPackagePayload(nextPackage));
      await loadProviderData({ showPartialError: false });
      setEditingPackage(null);
      setToast({
        id: Date.now(),
        type: "success",
        message: "Package saved successfully.",
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthSession();
        setToast({
          id: Date.now(),
          type: "error",
          message: "Your session expired. Please sign in again.",
        });
        return;
      }

      if (isForbiddenError(error)) {
        setHasProviderAccess(false);
        setToast({
          id: Date.now(),
          type: "error",
          message: getProviderForbiddenMessage(
            "Your account does not have permission to update provider packages."
          ),
        });
        return;
      }

      setToast({
        id: Date.now(),
        type: "error",
        message: getApiErrorMessage(
          error,
          "Failed to update package. Please try again."
        ),
      });
    }
  };

  const handleRequestDeletePackage = (packageItem) => {
    setPendingDelete({
      id: packageItem.id,
      type: "package",
      name: packageItem.packageName,
    });
  };

  const confirmDeletePackage = async (packageId) => {
    if (!getAuthToken()) {
      throw new Error("Missing authentication token");
    }

    if (!hasProviderAccess) {
      throw new Error("Missing provider permission");
    }

    await deletePackage(packageId);
    await loadProviderData({ showPartialError: false });
    setToast({
      id: Date.now(),
      type: "success",
      message: "Package deleted successfully.",
    });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      if (pendingDelete.type === "service") {
        await confirmDeleteService(pendingDelete.id);
      } else {
        await confirmDeletePackage(pendingDelete.id);
      }

      setPendingDelete(null);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthSession();
        setToast({
          id: Date.now(),
          type: "error",
          message: "Your session expired. Please sign in again.",
        });
        setPendingDelete(null);
        return;
      }

      if (isForbiddenError(error) || error.message === "Missing provider permission") {
        setHasProviderAccess(false);
        setToast({
          id: Date.now(),
          type: "error",
          message: getProviderForbiddenMessage(
            "Your account does not have permission to delete provider data."
          ),
        });
        setPendingDelete(null);
        return;
      }

      setToast({
        id: Date.now(),
        type: "error",
        message: getApiErrorMessage(
          error,
          `Failed to delete ${pendingDelete.type}. Please try again.`
        ),
      });
    }
  };

  const handlePackageSaved = async () => {
    const didLoad = await loadProviderData({ showPartialError: false });

    if (didLoad) {
      setView("packages");
    }

    return didLoad;
  };

  const tabCounts = {
    services: savedServices.length,
    store: 0,
    marketplace: 0,
  };

  const renderEntryChoice = () => (
    <section className="rounded-[24px] bg-white p-5 sm:p-8">
      <div className="mx-auto max-w-[900px]">
        <h1 className="font-['Roboto'] text-[30px] font-bold leading-[42px] text-[#011C60] sm:text-[36px] sm:leading-[52px]">
          Start Your Journey as a Partner
        </h1>
        <p className="mt-3 max-w-2xl font-['Roboto'] text-[16px] leading-6 text-[#6777A0]">
          Choose how you want to offer your services on our platform. We provide
          the tools you need to excel in your profession.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <button
            type="button"
            onClick={openServiceListFromEntry}
            disabled={isActivatingProvider}
            className="group cursor-pointer rounded-[20px] border border-[#E6E8EF] bg-white p-5 text-left shadow-[0px_16px_36px_rgba(17,27,71,0.12)] transition hover:-translate-y-1 hover:border-[#011C60] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <div className="flex h-[170px] items-center justify-center rounded-2xl bg-[#EFF3FF]">
              <img
                src={FLOW_ASSETS.addServiceFlowImage}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
            <h2 className="mt-5 font-['Roboto'] text-[24px] font-semibold leading-9 text-[#011C60]">
              Offer a Service
            </h2>
            <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
              Provide services directly and interact with clients for tailored
              care.
            </p>
            <span className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#011C60] px-5 font-['Roboto'] text-[16px] font-semibold text-white transition group-hover:bg-[#02267F]">
              {isActivatingProvider ? "Activating..." : "Start as Service Provider"}
            </span>
          </button>

          <button
            type="button"
            onClick={openPackageFlowFromEntry}
            disabled={isActivatingProvider}
            className="group cursor-pointer rounded-[20px] border border-[#E6E8EF] bg-white p-5 text-left shadow-[0px_16px_36px_rgba(17,27,71,0.12)] transition hover:-translate-y-1 hover:border-[#011C60] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <div className="flex h-[170px] items-center justify-center rounded-2xl bg-[#EFF3FF]">
              <img
                src={FLOW_ASSETS.addPackageFlowImage}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
            <h2 className="mt-5 font-['Roboto'] text-[24px] font-semibold leading-9 text-[#011C60]">
              Create a Package
            </h2>
            <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
              Create predefined service packages with fixed pricing and included
              features.
            </p>
            <span className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#011C60] px-5 font-['Roboto'] text-[16px] font-semibold text-white transition group-hover:bg-[#02267F]">
              {isActivatingProvider ? "Activating..." : "Start Creating Package"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );

  const renderPartnerTabs = () => (
    <div className="grid gap-3 sm:grid-cols-3">
      {PARTNER_TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTopTabChange(tab.id)}
            className={joinClasses(
              "flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
              isActive
                ? "border-[#011C60] bg-white shadow-[0px_12px_26px_rgba(17,27,71,0.08)]"
                : "border-[#E6E8EF] bg-[#F8F9FC] hover:border-[#011C60] hover:bg-white"
            )}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF3FF]">
                <img src={tab.image} alt="" className="h-6 w-6 object-contain" />
              </span>
              <span className="font-['Roboto'] text-[18px] font-medium leading-7 text-[#011C60]">
                {tab.label}
              </span>
            </span>
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#EFF3FF] px-2 font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
              {tabCounts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );

  const renderEmptyServiceState = () => (
    <section className={PANEL_CLASS_NAME}>
      <div className="mx-auto flex max-w-[700px] flex-col items-center text-center">
        <img
          src={FLOW_ASSETS.emptyServiceImage}
          alt="Empty services illustration"
          className="h-auto w-full max-w-[619px] object-contain"
        />
        <h3 className="mt-6 font-['Roboto'] text-center text-[30px] font-medium leading-[46px] text-[#011C60] sm:text-[36px] sm:leading-[56px]">
          You don&apos;t have any service yet
        </h3>
        <p className="mt-3 max-w-[540px] font-['Roboto'] text-center text-[16px] leading-6 text-[#6777A0]">
          Add your first service and publish it through the provider API.
        </p>
        <button
          type="button"
          onClick={openServiceFlow}
          className="mt-8 min-h-12 w-full cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold leading-6 text-white transition hover:bg-[#02267F]"
        >
          Add New Service
        </button>
      </div>
    </section>
  );

  const renderSavedServices = () => (
    <ManagementTable
      title="Manage Services"
      description="Manage the services your clients can book through the platform."
      itemType="service"
      items={savedServices}
      nameHeader="Service Name"
      categoryHeader="Category"
      priceHeader="Price"
      getName={(service) => service.serviceName}
      getCategory={(service) => service.categoryLabel}
      getPrice={(service) => service.price}
      onAdd={openServiceFlow}
      onEdit={handleEditService}
      onDelete={handleRequestDeleteService}
    />
  );

  const renderPackagesDashboard = () =>
    savedPackages.length > 0 ? (
      <ManagementTable
        title="Manage Packages"
        description="Manage the packages your clients can book through the platform."
        itemType="package"
        items={savedPackages}
        nameHeader="Package Name"
        priceHeader="Price"
        getName={(packageItem) => packageItem.packageName}
        getPrice={(packageItem) => packageItem.price}
        onAdd={() => setView("package-form")}
        onEdit={handleEditPackage}
        onDelete={handleRequestDeletePackage}
      />
    ) : (
      <AddPackageFlow
        onBack={() => setView("entry")}
        onToast={setToast}
        savedServices={savedServices}
        onSaved={handlePackageSaved}
        hasProviderAccess={hasProviderAccess}
      />
    );

  const renderBlankState = (tabLabel) => (
    <section className={PANEL_CLASS_NAME}>
      <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF3FF]">
          <BriefcaseIcon className="h-7 w-7" />
        </span>
        <h3 className="mt-6 font-['Roboto'] text-[30px] font-medium leading-[42px] text-[#011C60]">
          {tabLabel} setup is ready for API integration
        </h3>
        <p className="mt-3 max-w-xl font-['Roboto'] text-[16px] leading-6 text-[#6777A0]">
          This area is ready for the next provider API integration.
        </p>
      </div>
    </section>
  );

  return (
    <div className="flex flex-col gap-6">
      <Toast
        key={toast?.id}
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      {view === "entry" && renderEntryChoice()}

      {view === "packages" && renderPackagesDashboard()}

      {view === "package-form" && (
        <AddPackageFlow
          onBack={() => setView("packages")}
          onToast={setToast}
          savedServices={savedServices}
          onSaved={handlePackageSaved}
          hasProviderAccess={hasProviderAccess}
        />
      )}

      {view === "wizard" && (
        <>
          {currentStep === 1 && (
            <MyServicesStep
              selectedOption={selectedPartnerType}
              onSelect={setSelectedPartnerType}
              onCancel={cancelServiceFlow}
              onNext={handleMyServicesNext}
              onStepClick={handleWizardStepClick}
            />
          )}
          {currentStep === 2 && (
            <ServiceDetailsStep
              details={serviceDetails}
              onChange={handleDetailsChange}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
              onPhotoChange={handlePhotoChange}
              onRemovePhoto={handleRemovePhoto}
              canContinue={isServiceDetailsComplete(serviceDetails)}
              uploadError={uploadError}
              onStepClick={handleWizardStepClick}
              governorateOptions={governorateOptions}
              neighborhoodOptions={neighborhoodOptions}
              isLoadingGovernorates={isLoadingGovernorates}
              isLoadingNeighborhoods={isLoadingNeighborhoods}
            />
          )}
          {currentStep === 3 && (
            <ServiceItemsStep
              items={serviceItems}
              onAddItem={handleAddItem}
              onBack={() => setCurrentStep(2)}
              onNext={handlePrepareServiceForAvailability}
              onStepClick={handleWizardStepClick}
              isSaving={isPreparingService}
            />
          )}
          {currentStep === 4 && (
            <AvailabilityStep
              availability={availability}
              onToggleDay={handleToggleDay}
              onFieldChange={handleAvailabilityFieldChange}
              onDayFieldChange={handleAvailabilityDayFieldChange}
              onBack={() => setCurrentStep(3)}
              onSave={handleSaveService}
              onStepClick={handleWizardStepClick}
              isSaving={isSavingService}
            />
          )}
        </>
      )}

      {view === "services" && (
        <>
          {renderPartnerTabs()}
          {activeTab === "services" &&
            (savedServices.length > 0
              ? renderSavedServices()
              : renderEmptyServiceState())}
          {activeTab === "store" && renderBlankState("Store")}
          {activeTab === "marketplace" && renderBlankState("Marketplace")}
        </>
      )}

      {editingService && (
        <ServiceEditModal
          service={editingService}
          governorateOptions={governorateOptions}
          onClose={() => setEditingService(null)}
          onSave={handleSaveServiceEdit}
        />
      )}

      {editingPackage && (
        <PackageEditModal
          packageItem={editingPackage}
          savedServices={savedServices}
          onClose={() => setEditingPackage(null)}
          onSave={handleSavePackageEdit}
        />
      )}

      <DeleteConfirmModal
        isOpen={Boolean(pendingDelete)}
        itemType={pendingDelete?.type}
        itemName={pendingDelete?.name}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
