import { useEffect, useRef, useState } from "react";

import {
  changeRole,
  getGovernorates,
  getMyInformation,
  getNeighborhoods,
} from "../../../../api/auth/auth.api";
import {
  addService,
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
  MAX_SERVICE_TIME_HOURS,
  PARTNER_TABS,
  WEEKDAY_OPTIONS,
  createEmptyAvailabilityData,
  createEmptyServiceDetails,
  formatHourLabel,
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
    details.description,
    details.longDescription,
    details.price,
    details.serviceTimeHours,
  ].every((value) => String(value || "").trim()) &&
  getSelectedNeighborhoodIds(details).length > 0 &&
  (details.photos || []).some((photo) => photo instanceof File);

const createEmptyDraft = () => ({
  selectedPartnerType: "",
  serviceDetails: createEmptyServiceDetails(),
  serviceItems: [],
  availability: createEmptyAvailabilityData(),
});

const LANGUAGE = "en";
const PROVIDER_ROLE = "Provider";
const PROVIDER_CAPABLE_ROLE_ALIASES = ["provider", "serviceprovider", "company"];
const COMPANY_ACCOUNT_TYPE_ALIASES = ["company"];
const AUTH_TOKEN_COOKIE_NAME = "alaa_auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SERVICE_API_CURRENCY = "EGY";
const MY_SERVICES_PAGE_SIZE = 50;
const MY_PACKAGES_PAGE_SIZE = 50;
const DAILY_PACKAGE_RECURRENCE = "Daily";

const getTimeslotDurationInMin = (serviceTimeHours) => {
  const durationInMin = Number(serviceTimeHours) * 60;

  if (!Number.isFinite(durationInMin) || durationInMin <= 0) return 60;

  return Math.min(durationInMin, MAX_SERVICE_TIME_HOURS * 60);
};

const normalizeServiceTimeHoursInput = (value) => {
  if (value === "") return "";

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return "";

  return String(Math.min(Math.max(numericValue, 1), MAX_SERVICE_TIME_HOURS));
};

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

const CATEGORY_DISPLAY_VALUES = {
  "car-care": "Car Care",
  "home-service": "Home Care",
  "personal-care": "Personal Care",
  Car_Care: "Car Care",
  Home_Care: "Home Care",
  Personal_Care: "Personal Care",
  car_care: "Car Care",
  home_care: "Home Care",
  personal_care: "Personal Care",
  carcare: "Car Care",
  homecare: "Home Care",
  personalcare: "Personal Care",
  "car care": "Car Care",
  "home care": "Home Care",
  "personal care": "Personal Care",
};

const extractPayloadData = (response) => response?.data ?? response;

const extractList = (response) => {
  const data = extractPayloadData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.services)) return data.services;
  if (Array.isArray(data?.packages)) return data.packages;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

const extractTotalPages = (response) => {
  const data = extractPayloadData(response);
  const value =
    data?.metaData?.pageCount ??
    data?.metadata?.pageCount ??
    data?.metaData?.totalPages ??
    data?.metadata?.totalPages ??
    data?.totalPages ??
    data?.totalPage ??
    data?.pageCount ??
    data?.pages ??
    response?.metaData?.pageCount ??
    response?.metadata?.pageCount ??
    response?.totalPages ??
    response?.totalPage ??
    response?.pageCount ??
    response?.pages;

  return Math.max(1, Number(value) || 1);
};

const toOption = (item) => ({
  value: item.id,
  label: item.name,
});

const normalizeTextValue = (value) => String(value || "").trim().replace(/\s+/g, " ");

const firstPresentValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeIdList = (value) => [
  ...new Set(
    (Array.isArray(value) ? value : [value])
      .flatMap((item) => {
        if (Array.isArray(item)) return normalizeIdList(item);
        if (item && typeof item === "object") {
          return item.id || item.neighborhoodId || item.value || "";
        }
        return item;
      })
      .map((item) => String(item || "").trim())
      .filter(Boolean)
  ),
];

const getSelectedNeighborhoodIds = (details) =>
  normalizeIdList(details?.coverageArea);

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

const getCategoryDisplayValue = (...values) => {
  for (const value of values) {
    const rawValue = String(value || "").trim();
    if (!rawValue || rawValue === "Service") continue;

    const normalizedValue = normalizeCategoryValue(rawValue);
    const displayValue =
      CATEGORY_DISPLAY_VALUES[rawValue] ||
      CATEGORY_DISPLAY_VALUES[rawValue.toLowerCase()] ||
      CATEGORY_DISPLAY_VALUES[normalizedValue];

    if (displayValue) return displayValue;
  }

  return "";
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
      service.Items,
      service.serviceItems,
      service.ServiceItems,
      service.itemDtos,
      service.ItemDtos,
      service.itemDTOs,
      service.ItemDTOs,
      nestedService.items,
      nestedService.Items,
      nestedService.serviceItems,
      nestedService.ServiceItems,
      nestedService.itemDtos,
      nestedService.ItemDtos,
      nestedService.itemDTOs,
      nestedService.ItemDTOs
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
  { includeImageFiles = true, items, availability: serviceAvailability } = {}
) => {
  const formData = new FormData();

  formData.append("name", normalizeTextValue(details.serviceName));
  formData.append("price", Number(details.price) || 0);
  formData.append("currency", SERVICE_API_CURRENCY);
  formData.append(
    "categoryName",
    CATEGORY_API_VALUES[details.category] || details.category
  );
  formData.append("timeslotDurationInMin", getTimeslotDurationInMin(details.serviceTimeHours));
  formData.append("numberOfCustomerPerTimeSlots", 1);
  formData.append("description", normalizeTextValue(details.description));
  formData.append("subDescription", String(details.longDescription || "").trim());
  formData.append("governorateId", details.governorate);
  getSelectedNeighborhoodIds(details).forEach((neighborhoodId) => {
    formData.append("neighborhoodIds", neighborhoodId);
  });

  if (items !== undefined) {
    formData.append("itemsJson", JSON.stringify(buildItemsPayload(items).items));
  }

  if (serviceAvailability !== undefined) {
    formData.append(
      "agendasJson",
      JSON.stringify(buildAgendasPayload(serviceAvailability).agendas)
    );
  }

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

  if (getSelectedNeighborhoodIds(details).length === 0) {
    return "Please choose at least one coverage area.";
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

  if (durationInHours > MAX_SERVICE_TIME_HOURS) {
    return `Service time cannot exceed ${MAX_SERVICE_TIME_HOURS} hours.`;
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

const normalizeAvailabilityDays = (...dayLists) => [
  ...new Set(
    dayLists
      .flatMap((days) => (Array.isArray(days) ? days : []))
      .map(normalizeWeekdayValue)
      .filter(Boolean)
  ),
];

const toAgendaTime = (hour) => {
  const match = String(hour || "").match(/\d{1,2}/);
  const hourNumber = match ? Number(match[0]) : 0;

  return `${String(Math.min(Math.max(hourNumber, 0), 23)).padStart(2, "0")}:00`;
};

const toAgendaFromTime = (hour) => {
  const time = toAgendaTime(hour);

  return time === "00:00" ? "00:01" : time;
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
      Day: normalizedDay,
      From: dayWindow.dailyWindow ? "00:01" : toAgendaFromTime(dayWindow.startHour),
      To: dayWindow.dailyWindow ? "23:59" : toAgendaTime(dayWindow.endHour),
    });

    return agendas;
  }, []),
});

const normalizeServiceItemsForApi = (items) =>
  (items || [])
    .map((item) => ({
      Name: normalizeTextValue(item.itemName || item.name || item.serviceItemName),
      Price: Number(item.price ?? item.itemPrice ?? item.serviceItemPrice ?? 0) || 0,
      Description: String(
        item.description || item.itemDescription || item.serviceItemDescription || ""
      ).trim(),
    }))
    .filter((item) => item.Name);

const buildItemsPayload = (items) => ({
  items: normalizeServiceItemsForApi(items),
});

const normalizeAgendaScheduleRows = (agendaList, availability = {}) =>
  agendaList.reduce((rows, agenda) => {
    const day = normalizeWeekdayValue(getAgendaDayValue(agenda));

    if (!day) return rows;

    const fromTime = getAgendaTime(agenda, AGENDA_FROM_FIELDS);
    const toTime = getAgendaTime(agenda, AGENDA_TO_FIELDS);
    const existingWindow = getAvailabilityDayWindow(availability, day);

    rows.push({
      day,
      from: fromTime || toAgendaTime(existingWindow.startHour || "9"),
      to: toTime || toAgendaTime(existingWindow.endHour || "17"),
      dailyWindow:
        Boolean(existingWindow.dailyWindow) ||
        isFullDayAgendaWindow(fromTime, toTime),
    });

    return rows;
  }, []);

const getWeekdaySortIndex = (day) => {
  const index = WEEKDAY_OPTIONS.indexOf(normalizeWeekdayValue(day));

  return index === -1 ? WEEKDAY_OPTIONS.length : index;
};

const formatClockTime = (timeValue, fallbackHour = "") => {
  const rawValue = String(timeValue || "");
  const match =
    rawValue.match(/T(\d{1,2}):(\d{2})/) ||
    rawValue.match(/(?:^|\s)(\d{1,2}):(\d{2})/);

  if (!match) return formatHourLabel(fallbackHour);

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return formatHourLabel(fallbackHour);
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;

  return `${String(normalizedHour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )} ${suffix}`;
};

const getServiceScheduleRows = (service) => {
  const availability = service.availability || {};
  const rawScheduleRows = availability.scheduleRows || [];

  if (rawScheduleRows.length > 0) {
    return [...rawScheduleRows].sort(
      (firstRow, secondRow) =>
        getWeekdaySortIndex(firstRow.day) - getWeekdaySortIndex(secondRow.day)
    );
  }

  return (availability.days || [])
    .map((day) => {
      const normalizedDay = normalizeWeekdayValue(day);
      const dayWindow = getAvailabilityDayWindow(availability, normalizedDay);

      return {
        day: normalizedDay,
        from: toAgendaTime(dayWindow.startHour),
        to: toAgendaTime(dayWindow.endHour),
        dailyWindow: Boolean(dayWindow.dailyWindow),
      };
    })
    .filter((row) => row.day)
    .sort(
      (firstRow, secondRow) =>
        getWeekdaySortIndex(firstRow.day) - getWeekdaySortIndex(secondRow.day)
    );
};

const normalizeNeighborhoodObjects = (service) =>
  [
    ...(Array.isArray(service.neighborhoods) ? service.neighborhoods : []),
    ...(Array.isArray(service.Neighborhoods) ? service.Neighborhoods : []),
    ...(Array.isArray(service.neighborhoodDtos) ? service.neighborhoodDtos : []),
    ...(Array.isArray(service.NeighborhoodDtos) ? service.NeighborhoodDtos : []),
    service.neighborhood,
    service.Neighborhood,
    service.neighborhoodDto,
    service.NeighborhoodDto,
  ].filter((item) => item && typeof item === "object");

const normalizeService = (servicePayload) => {
  const service = normalizeServicePayload(servicePayload);
  const categorySource = getCategorySource(service);
  const category = normalizeCategoryValue(categorySource);
  const neighborhoods = normalizeNeighborhoodObjects(service);
  const neighborhood = neighborhoods[0] || {};
  const governorate =
    service.governorate ||
    service.governorateDto ||
    neighborhood.governorate ||
    neighborhood.governorateDto ||
    {};
  const items =
    service.items ||
    service.Items ||
    service.serviceItems ||
    service.ServiceItems ||
    service.itemDtos ||
    service.ItemDtos ||
    service.itemDTOs ||
    service.ItemDTOs ||
    [];
  const agendaList = normalizeAgendaList(service);
  const availabilitySource = service.availability || service.Availability || {};
  const firstAgenda = agendaList[0] || {};
  const agendaFrom = getAgendaTime(firstAgenda, AGENDA_FROM_FIELDS);
  const agendaTo = getAgendaTime(firstAgenda, AGENDA_TO_FIELDS);
  const availabilityDays = normalizeAvailabilityDays(
    agendaList.map(getAgendaDayValue),
    availabilitySource.days,
    availabilitySource.Days,
    availabilitySource.availableDays,
    availabilitySource.AvailableDays
  );
  const dayWindows = agendaList.reduce((windows, agenda) => {
    const day = normalizeWeekdayValue(getAgendaDayValue(agenda));

    if (!day) return windows;

    const fromTime = getAgendaTime(agenda, AGENDA_FROM_FIELDS);
    const toTime = getAgendaTime(agenda, AGENDA_TO_FIELDS);
    const existingWindow = getAvailabilityDayWindow(availabilitySource, day);

    return {
      ...windows,
      [day]: {
        startHour: getAgendaHour(fromTime, existingWindow.startHour || "9"),
        endHour: getAgendaHour(toTime, existingWindow.endHour || "17"),
        dailyWindow:
          Boolean(existingWindow.dailyWindow) ||
          isFullDayAgendaWindow(fromTime, toTime),
      },
    };
  }, { ...(availabilitySource.dayWindows || {}) });
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
  const neighborhoodIds = normalizeIdList([
    service.neighborhoodIds,
    service.NeighborhoodIds,
    service.neighborhoods,
    service.Neighborhoods,
    service.neighborhoodDtos,
    service.NeighborhoodDtos,
    service.neighborhoodId,
    service.NeighborhoodId,
    neighborhoods,
  ]);
  const neighborhoodNames = [
    ...new Set(
      neighborhoods
        .map((item) => item.name || item.Name || item.label || item.Label)
        .map((name) => String(name || "").trim())
        .filter(Boolean)
    ),
  ];

  return {
    id,
    serviceName: service.name || service.serviceName || "",
    category,
    categoryName:
      service.serviceCategory ||
      CATEGORY_API_VALUES[category] ||
      categorySource ||
      category,
    categoryDisplayName: getCategoryDisplayValue(
      service.serviceCategory,
      categorySource,
      category,
      service.categoryLabel
    ),
    categoryLabel: service.categoryLabel || getCategoryLabel(category),
    location:
      service.location ||
      [neighborhoodNames.join(", "), governorate.name].filter(Boolean).join(", "),
    governorate: service.governorateId || governorate.id || "",
    coverageArea: neighborhoodIds,
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
      id: item.id || item.itemId || item.serviceItemId || item.name || item.itemName,
      itemName: item.name || item.itemName || item.serviceItemName || "",
      price: String(item.price ?? item.itemPrice ?? item.serviceItemPrice ?? ""),
      description:
        item.description || item.itemDescription || item.serviceItemDescription || "",
    })),
    availability: {
      days: availabilityDays,
      startHour: getAgendaHour(agendaFrom, "9"),
      endHour: getAgendaHour(agendaTo, "17"),
      dailyWindow:
        Boolean(availabilitySource.dailyWindow) ||
        isFullDayAgendaWindow(agendaFrom, agendaTo),
      dayWindows,
      scheduleRows: normalizeAgendaScheduleRows(agendaList, availabilitySource),
    },
  };
};

const mergeServiceForEdit = (baseService, detailsService) => {
  const baseAvailability = baseService.availability || {};
  const detailsAvailability = detailsService.availability || {};
  const detailsNeighborhoodIds = getSelectedNeighborhoodIds(detailsService);
  const baseNeighborhoodIds = getSelectedNeighborhoodIds(baseService);
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
    categoryName: detailsService.categoryName || baseService.categoryName,
    categoryDisplayName:
      detailsService.categoryDisplayName || baseService.categoryDisplayName,
    categoryLabel:
      detailsService.category && detailsService.category !== "service"
        ? detailsService.categoryLabel
        : baseService.categoryLabel,
    location: detailsService.location || baseService.location,
    governorate: detailsService.governorate || baseService.governorate,
    coverageArea:
      detailsNeighborhoodIds.length > 0
        ? detailsNeighborhoodIds
        : baseNeighborhoodIds,
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

const normalizePackageServiceIds = (serviceIds) => [
  ...new Set(
    (serviceIds || []).map((serviceId) => String(serviceId || "").trim()).filter(Boolean)
  ),
];

const getPackageServiceIds = (packageItem) =>
  normalizePackageServiceIds([
    ...(Array.isArray(packageItem.serviceIds) ? packageItem.serviceIds : []),
    packageItem.serviceId,
    ...(Array.isArray(packageItem.services)
      ? packageItem.services.map((service) => service?.id)
      : []),
    packageItem.service?.id,
  ]);

const getPackageServiceNames = (packageItem) =>
  [
    packageItem.serviceName,
    ...(Array.isArray(packageItem.services)
      ? packageItem.services.map((service) => service?.name || service?.serviceName)
      : []),
    packageItem.service?.name || packageItem.service?.serviceName,
  ]
    .map((serviceName) => String(serviceName || "").trim())
    .filter(Boolean);

const normalizePackage = (packageItem) => {
  const serviceIds = getPackageServiceIds(packageItem);
  const serviceNames = getPackageServiceNames(packageItem);

  return {
    id: packageItem.id,
    packageName: packageItem.name || packageItem.packageName || "",
    serviceIds,
    serviceId: serviceIds[0] || "",
    serviceName: serviceNames.join(", "),
    pricingType:
      (packageItem.recurrence || packageItem.pricingType || "").charAt(0).toUpperCase() +
      (packageItem.recurrence || packageItem.pricingType || "").slice(1).toLowerCase(),
    times: String(packageItem.daysPerInterval ?? packageItem.times ?? ""),
    price: String(packageItem.price ?? ""),
  };
};

const mergePackageForEdit = (basePackage, detailsPackage) => ({
  ...basePackage,
  ...detailsPackage,
  id: detailsPackage.id || basePackage.id,
  packageName: detailsPackage.packageName || basePackage.packageName,
  serviceIds:
    detailsPackage.serviceIds?.length > 0
      ? detailsPackage.serviceIds
      : basePackage.serviceIds,
  serviceId: detailsPackage.serviceId || basePackage.serviceId,
  serviceName: detailsPackage.serviceName || basePackage.serviceName,
  pricingType: detailsPackage.pricingType || basePackage.pricingType,
  times: detailsPackage.times || basePackage.times,
  price: detailsPackage.price || basePackage.price,
});

const enrichServicesWithDetails = async (services) => {
  const detailResults = await Promise.allSettled(
    services.map(async (service) => {
      if (!service.id) return service;

      const response = await getServiceDetails(service.id, LANGUAGE);
      const detailsService = normalizeService(extractPayloadData(response));

      return mergeServiceForEdit(service, {
        ...detailsService,
        id: detailsService.id || service.id,
      });
    })
  );

  return services.map((service, index) =>
    detailResults[index]?.status === "fulfilled"
      ? detailResults[index].value
      : service
  );
};

const getMyServicesPage = (page) =>
  getMyServices({
    language: LANGUAGE,
    page,
    pageSize: MY_SERVICES_PAGE_SIZE,
    search: "",
    isMine: true,
  });

const fetchMyServices = async () => {
  const firstResponse = await getMyServicesPage(1);
  const pageCount = extractTotalPages(firstResponse);
  const otherResponses =
    pageCount > 1
      ? await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, index) =>
            getMyServicesPage(index + 2)
          )
        )
      : [];
  const responses = [firstResponse, ...otherResponses];
  const rawServices = responses.flatMap((response) => extractList(response));

  if (isDebugLoggingEnabled()) {
    console.groupCollapsed("[Provider Services] my services API objects");
    console.log("raw response pages", responses);
    console.log("raw service objects", rawServices);
    rawServices.forEach((service, index) => {
      console.log(`service object ${index + 1}`, service);
    });
    console.groupEnd();
  }

  return rawServices
    .map(normalizeService)
    .filter((service) => service.id);
};

const getMyPackagesPage = (page) =>
  getMyPackages({
    page,
    pageSize: MY_PACKAGES_PAGE_SIZE,
    isMine: true,
  });

const fetchMyPackages = async () => {
  const firstResponse = await getMyPackagesPage(1);
  const pageCount = extractTotalPages(firstResponse);
  const otherResponses =
    pageCount > 1
      ? await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, index) =>
            getMyPackagesPage(index + 2)
          )
        )
      : [];
  const responses = [firstResponse, ...otherResponses];
  const rawPackages = responses.flatMap((response) => extractList(response));

  if (isDebugLoggingEnabled()) {
    console.groupCollapsed("[Provider Packages] my packages API objects");
    console.log("request params", {
      pageSize: MY_PACKAGES_PAGE_SIZE,
      isMine: true,
    });
    console.log("raw response pages", responses);
    console.log("raw package objects", rawPackages);
    rawPackages.forEach((packageItem, index) => {
      console.log(`package object ${index + 1}`, packageItem);
    });
    console.groupEnd();
  }

  return rawPackages.map(normalizePackage);
};

const buildPackagePayload = (packageItem) => ({
  name: packageItem.packageName.trim(),
  recurrence:
    packageItem.pricingType?.charAt(0).toUpperCase() +
    packageItem.pricingType?.slice(1).toLowerCase(),
  daysPerInterval:
    packageItem.pricingType === DAILY_PACKAGE_RECURRENCE
      ? 1
      : Number(packageItem.times) || 1,
  price: Number(packageItem.price) || 0,
  serviceIds: normalizePackageServiceIds(
    packageItem.serviceIds?.length > 0
      ? packageItem.serviceIds
      : [packageItem.serviceId]
  ),
});

const arePackagePayloadsEqual = (firstPackage, secondPackage) =>
  JSON.stringify(buildPackagePayload(firstPackage)) ===
  JSON.stringify(buildPackagePayload(secondPackage));

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

const normalizeRoleName = (role) =>
  String(role || "")
    .trim()
    .replace(/[\s_-]+/g, "")
    .toLowerCase();

const isProviderRole = (role) =>
  PROVIDER_CAPABLE_ROLE_ALIASES.includes(normalizeRoleName(role));

const isCompanyAccountType = (accountType) =>
  COMPANY_ACCOUNT_TYPE_ALIASES.includes(normalizeRoleName(accountType));

const hasProviderToken = () =>
  getTokenRoles(getAuthToken()).some(isProviderRole);

const getStoredAccountType = () => {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("accountType") ||
    localStorage.getItem("loggedInAs") ||
    ""
  );
};

const hasProviderCapableSession = () =>
  hasProviderToken() || isCompanyAccountType(getStoredAccountType());

const collectRoleValues = (source, seen = new Set()) => {
  if (!source) return [];

  if (typeof source === "string") return [source];
  if (Array.isArray(source)) {
    return source.flatMap((item) => collectRoleValues(item, seen));
  }
  if (typeof source !== "object" || seen.has(source)) return [];

  seen.add(source);

  const roleKeys = [
    "role",
    "roles",
    "Role",
    "Roles",
    "userRole",
    "userRoles",
    "UserRole",
    "UserRoles",
    "accountRole",
    "accountRoles",
    "AccountRole",
    "AccountRoles",
    "type",
    "Type",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  ];
  const nestedKeys = [
    "data",
    "user",
    "User",
    "account",
    "Account",
    "profile",
    "Profile",
    "result",
    "Result",
    "payload",
    "Payload",
  ];

  return [
    ...roleKeys.flatMap((key) => collectRoleValues(source[key], seen)),
    ...nestedKeys.flatMap((key) => collectRoleValues(source[key], seen)),
  ].filter(Boolean);
};

const getProfileRoles = (response) =>
  collectRoleValues(extractPayloadData(response)).map((role) => String(role));

const collectAccountTypeValues = (source, seen = new Set()) => {
  if (!source) return [];

  if (typeof source === "string") return [source];
  if (Array.isArray(source)) {
    return source.flatMap((item) => collectAccountTypeValues(item, seen));
  }
  if (typeof source !== "object" || seen.has(source)) return [];

  seen.add(source);

  const accountTypeKeys = [
    "accountType",
    "AccountType",
    "account_type",
    "type",
    "Type",
  ];
  const nestedKeys = [
    "data",
    "user",
    "User",
    "account",
    "Account",
    "profile",
    "Profile",
    "result",
    "Result",
    "payload",
    "Payload",
  ];

  return [
    ...accountTypeKeys.flatMap((key) =>
      collectAccountTypeValues(source[key], seen)
    ),
    ...nestedKeys.flatMap((key) => collectAccountTypeValues(source[key], seen)),
  ].filter(Boolean);
};

const getProfileAccountTypes = (response) =>
  collectAccountTypeValues(extractPayloadData(response)).map((accountType) =>
    String(accountType)
  );

const getHasProviderAccountRole = async () => {
  const profile = await getMyInformation();
  const roles = getProfileRoles(profile);
  const accountTypes = getProfileAccountTypes(profile);

  if (roles.some(isProviderRole) || accountTypes.some(isCompanyAccountType)) {
    return true;
  }

  if (roles.length === 0 && accountTypes.length === 0) {
    return hasProviderCapableSession();
  }

  return false;
};

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

const isUnauthorizedError = (error) => error?.response?.status === 401;
const isForbiddenError = (error) => error?.response?.status === 403;
const isConflictError = (error) => error?.response?.status === 409;
const isStaleProviderTokenError = (error) =>
  error?.message === "PROVIDER_TOKEN_REFRESH_REQUIRED";
const isNoChangesDetectedError = (error) =>
  getApiErrorMessage(error, "").includes("NoChangesDetected");
const getApiErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data;
  const validationMessage =
    data?.errors && typeof data.errors === "object"
      ? Object.values(data.errors).flat().filter(Boolean).join(" ")
      : "";
  const message =
    data?.Error?.Message ||
    data?.Error?.Code ||
    data?.error?.message ||
    data?.error?.code ||
    data?.message ||
    data?.title ||
    validationMessage ||
    (typeof data === "string" ? data : "");

  return message || fallbackMessage;
};
const getProviderForbiddenMessage = (fallbackMessage) =>
  hasProviderCapableSession()
    ? fallbackMessage
    : "Provider mode is ready. Please sign in again so your session gets provider access.";
const SESSION_REFRESH_RETRY_MESSAGE =
  "Your session was refreshed. Please try again.";

const isDebugLoggingEnabled = () => import.meta.env.DEV;

const serializeFileForDebug = (value) => {
  if (typeof File !== "undefined" && value instanceof File) {
    return {
      name: value.name,
      size: value.size,
      type: value.type,
      lastModified: value.lastModified,
    };
  }

  return value;
};

const serializeServiceDetailsForDebug = (details) => ({
  ...details,
  photos: (details.photos || []).map(serializeFileForDebug),
});

const logCreateServiceFlowDebug = (label, data) => {
  if (!isDebugLoggingEnabled()) return;

  console.groupCollapsed(`[Create Service Flow] ${label}`);
  console.log("full object", data);

  if (data.serviceDetails) {
    Object.entries(data.serviceDetails).forEach(([key, value]) => {
      console.log(`input: ${key}`, value);
    });
  }

  if (Array.isArray(data.serviceItems)) {
    data.serviceItems.forEach((item, index) => {
      console.log(`service item ${index + 1}`, item);
    });
  }

  if (Array.isArray(data.agendasPayload?.agendas)) {
    data.agendasPayload.agendas.forEach((agenda, index) => {
      console.log(`agenda ${index + 1}`, agenda);
    });
  }

  console.groupEnd();
};

const ensureProviderRole = async () => {
  const sessionAlreadyHasProviderAccess = hasProviderCapableSession();

  try {
    if (await getHasProviderAccountRole()) {
      return true;
    }
  } catch (error) {
    if (isUnauthorizedError(error) || isForbiddenError(error)) {
      throw error;
    }

    if (sessionAlreadyHasProviderAccess) {
      return true;
    }
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

  if (getProfileRoles(response).some(isProviderRole)) {
    return true;
  }

  try {
    if (await getHasProviderAccountRole()) {
      return true;
    }
  } catch (error) {
    if (isUnauthorizedError(error) || isForbiddenError(error)) {
      throw error;
    }

    if (hasProviderCapableSession()) {
      return true;
    }
  }

  throw new Error("PROVIDER_ROLE_NOT_ACTIVE");
};

export default function BecomePartnerFlow() {
  const [view, setView] = useState("entry");
  const [activeTab, setActiveTab] = useState("services");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPartnerType, setSelectedPartnerType] = useState("");
  const [serviceDetails, setServiceDetails] = useState(createEmptyServiceDetails);
  const [serviceItems, setServiceItems] = useState([]);
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
  const [isSavingService, setIsSavingService] = useState(false);
  const [toast, setToast] = useState(null);
  const hasFetchedInitialData = useRef(false);

  const loadProviderData = async ({ showPartialError = true } = {}) => {
    const [servicesResult, packagesResult] = await Promise.allSettled([
      fetchMyServices(),
      fetchMyPackages(),
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
      setToast({
        id: Date.now(),
        type: "error",
        message: SESSION_REFRESH_RETRY_MESSAGE,
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
      setSavedServices(await enrichServicesWithDetails(servicesResult.value));
    }

    if (packagesResult.status === "fulfilled") {
      setSavedPackages(packagesResult.value);
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

      let hasExistingProviderAccess = false;

      try {
        hasExistingProviderAccess = await getHasProviderAccountRole();
      } catch (error) {
        if (isUnauthorizedError(error)) {
          setToast({
            id: Date.now(),
            type: "error",
            message: SESSION_REFRESH_RETRY_MESSAGE,
          });
          return;
        }

        if (isForbiddenError(error)) {
          setHasProviderAccess(false);
          return;
        }
      }

      if (!hasExistingProviderAccess) {
        setHasProviderAccess(false);
        return;
      }

      try {
        await ensureProviderRole();
        setHasProviderAccess(true);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          setToast({
            id: Date.now(),
            type: "error",
            message: SESSION_REFRESH_RETRY_MESSAGE,
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
        setToast({
          id: Date.now(),
          type: "error",
          message: SESSION_REFRESH_RETRY_MESSAGE,
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

    if (stepId > 2) {
      const validationMessage = validateServiceDetailsForApi(serviceDetails);

      if (validationMessage) {
        setToast({
          id: Date.now(),
          type: "error",
          message: validationMessage,
        });
        return;
      }
    }

    setCurrentStep(stepId);
  };

  const handleDetailsChange = (fieldName, value) => {
    setServiceDetails((currentDetails) => {
      if (fieldName === "governorate") {
        return {
          ...currentDetails,
          governorate: value,
          coverageArea: [],
        };
      }

      return {
        ...currentDetails,
        [fieldName]:
          fieldName === "serviceTimeHours"
            ? normalizeServiceTimeHoursInput(value)
            : value,
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

  const handleRemoveItem = (itemId) => {
    setServiceItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
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

  const createServiceWithFullPayload = async () => {
    const response = await addService(
      buildServiceFormData(serviceDetails, false, {
        items: serviceItems,
        availability,
      })
    );

    logCreateServiceFlowDebug("service saved", {
      response,
      serviceDetails: serializeServiceDetailsForDebug(serviceDetails),
      serviceItems,
      availability,
      itemsPayload: buildItemsPayload(serviceItems),
      agendasPayload: buildAgendasPayload(availability),
    });

    return response;
  };

  const handleServiceSaveError = async (error, fallbackMessage) => {
    if (isUnauthorizedError(error)) {
      setToast({
        id: Date.now(),
        type: "error",
        message: SESSION_REFRESH_RETRY_MESSAGE,
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

    setToast({
      id: Date.now(),
      type: "error",
      message: getApiErrorMessage(error, fallbackMessage),
    });
    return true;
  };

  const handlePrepareServiceForAvailability = () => {
    if (isSavingService) return;

    const validationMessage = validateServiceDetailsForApi(serviceDetails);

    if (validationMessage) {
      setToast({
        id: Date.now(),
        type: "error",
        message: validationMessage,
      });
      return;
    }

    setCurrentStep(4);
  };

  const handleSaveService = async () => {
    if (isSavingService) return;

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

      await createServiceWithFullPayload();

      if (!(await loadProviderData({ showPartialError: false }))) {
        return;
      }
      setToast({
        id: Date.now(),
        type: "success",
        message: "Service has been saved successfully.",
      });

      resetDraft();
      setView("services");
      setActiveTab("services");
    } catch (error) {
      await handleServiceSaveError(
        error,
        "Failed to save service. Please try again."
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
        setToast({
          id: Date.now(),
          type: "error",
          message: SESSION_REFRESH_RETRY_MESSAGE,
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
        await updateService(
          nextService.id,
          buildServiceFormData(nextService, true, {
            items: nextService.items || [],
            availability: hasAvailabilityDays(nextService.availability)
              ? nextService.availability
              : undefined,
          })
        );
      } catch (error) {
        if (!isNoChangesDetectedError(error)) {
          throw error;
        }
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
        setToast({
          id: Date.now(),
          type: "error",
          message: SESSION_REFRESH_RETRY_MESSAGE,
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
      setEditingPackage(normalizePackage(packageItem));
      return;
    }

    try {
      const response = await getPackageDetails(packageItem.id, LANGUAGE);
      setEditingPackage(
        mergePackageForEdit(
          normalizePackage(packageItem),
          normalizePackage(extractPayloadData(response))
        )
      );
    } catch (error) {
      if (isUnauthorizedError(error)) {
        setToast({
          id: Date.now(),
          type: "error",
          message: SESSION_REFRESH_RETRY_MESSAGE,
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

      setEditingPackage(normalizePackage(packageItem));
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

    const closePackageEditAsSaved = async () => {
      await loadProviderData({ showPartialError: false });
      setEditingPackage(null);
      setToast({
        id: Date.now(),
        type: "success",
        message: "Package saved successfully.",
      });
    };

    try {
      const shouldUpdatePackage =
        !editingPackage || !arePackagePayloadsEqual(editingPackage, nextPackage);

      if (!shouldUpdatePackage) {
        await closePackageEditAsSaved();
        return;
      }

      if (shouldUpdatePackage) {
        try {
          await updatePackage(nextPackage.id, buildPackagePayload(nextPackage));
        } catch (error) {
          if (!isNoChangesDetectedError(error)) {
            throw error;
          }
        }
      }

      await closePackageEditAsSaved();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        setToast({
          id: Date.now(),
          type: "error",
          message: SESSION_REFRESH_RETRY_MESSAGE,
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

      if (isNoChangesDetectedError(error)) {
        await closePackageEditAsSaved();
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
        setToast({
          id: Date.now(),
          type: "error",
          message: SESSION_REFRESH_RETRY_MESSAGE,
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
              services.
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

  const renderEmptyPackageState = () => (
    <section className={PANEL_CLASS_NAME}>
      <div className="mx-auto flex max-w-[700px] flex-col items-center text-center">
        <img
          src={FLOW_ASSETS.addPackageFlowImage}
          alt="Empty packages illustration"
          className="h-auto w-full max-w-[420px] object-contain"
        />
        <h3 className="mt-6 font-['Roboto'] text-center text-[30px] font-medium leading-[46px] text-[#011C60] sm:text-[36px] sm:leading-[56px]">
          You don&apos;t have any package yet
        </h3>
        <p className="mt-3 max-w-[540px] font-['Roboto'] text-center text-[16px] leading-6 text-[#6777A0]">
          Add your first package and manage edits from this dashboard.
        </p>
        <button
          type="button"
          onClick={() => setView("package-form")}
          className="mt-8 min-h-12 w-full cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold leading-6 text-white transition hover:bg-[#02267F]"
        >
          Add New Package
        </button>
      </div>
    </section>
  );

  const renderServiceSchedule = (service) => {
    const scheduleRows = getServiceScheduleRows(service);

    if (scheduleRows.length === 0) {
      return (
        <span className="font-['Roboto'] text-[13px] leading-5 text-[#9AA3BA]">
          No availability set
        </span>
      );
    }

    return (
      <div className="flex flex-col gap-1.5">
        {scheduleRows.map((row) => (
          <div
            key={`${service.id}-${row.day}`}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 font-['Roboto'] text-[13px] leading-5"
          >
            <span className="font-semibold text-[#011C60]">{row.day}</span>
            <span className="text-[#6777A0]">
              {row.dailyWindow
                ? "12:00 AM - 11:59 PM"
                : `${formatClockTime(row.from)} - ${formatClockTime(row.to)}`}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderSavedServices = () => (
    <ManagementTable
      title="Manage Services"
      description="Manage the services your clients can book through the platform."
      itemType="service"
      items={savedServices}
      nameHeader="Service Name"
      categoryHeader="Category"
      scheduleHeader="Availability"
      priceHeader="Price"
      getName={(service) => service.serviceName}
      getCategory={(service) =>
        service.categoryDisplayName ||
        getCategoryDisplayValue(
          service.categoryName,
          service.category,
          service.categoryLabel
        )
      }
      getPrice={(service) => service.price}
      renderSchedule={renderServiceSchedule}
      onAdd={openServiceFlow}
      onEdit={handleEditService}
      onDelete={handleRequestDeleteService}
    />
  );

  const renderPackagesDashboard = () => (
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

      {view === "packages" &&
        (savedPackages.length > 0
          ? renderPackagesDashboard()
          : renderEmptyPackageState())}

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
              onRemoveItem={handleRemoveItem}
              onBack={() => setCurrentStep(2)}
              onNext={handlePrepareServiceForAvailability}
              onStepClick={handleWizardStepClick}
              isSaving={false}
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
