export const APPOINTMENT_BOOKINGS_STORAGE_KEY = "serviceBookings";

const firstPresentValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeKey = (key) =>
  String(key || "")
    .trim()
    .replace(/[\s_-]+/g, "")
    .toLowerCase();

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const extractAppointmentPayload = (response) => response?.data ?? response;

const getValueByNormalizedKeys = (source, keys) => {
  if (!source || typeof source !== "object") return undefined;

  const normalizedKeys = keys.map(normalizeKey);

  for (const [key, value] of Object.entries(source)) {
    if (normalizedKeys.includes(normalizeKey(key))) {
      return value;
    }
  }

  return undefined;
};

const findFirstValueByNormalizedKeys = (source, keys, seen = new Set()) => {
  if (!source || typeof source !== "object" || seen.has(source)) {
    return undefined;
  }

  seen.add(source);

  const directValue = getValueByNormalizedKeys(source, keys);

  if (directValue !== undefined && directValue !== null && directValue !== "") {
    return directValue;
  }

  for (const value of Object.values(source)) {
    const nestedValue = findFirstValueByNormalizedKeys(value, keys, seen);

    if (nestedValue !== undefined && nestedValue !== null && nestedValue !== "") {
      return nestedValue;
    }
  }

  return undefined;
};

const findAppointmentArray = (value, seen = new Set()) => {
  if (!value || seen.has(value)) return [];

  if (Array.isArray(value)) return value;
  if (!isObject(value)) return [];

  seen.add(value);

  const preferredKeys = [
    "appointments",
    "availableAppointments",
    "availabilities",
    "availability",
    "timeSlots",
    "timeslots",
    "slots",
    "items",
    "result",
    "results",
    "data",
  ];

  for (const key of preferredKeys) {
    const nestedValue = getValueByNormalizedKeys(value, [key]);
    const nestedArray = findAppointmentArray(nestedValue, seen);

    if (nestedArray.length > 0) return nestedArray;
  }

  const hasTimeRange =
    getValueByNormalizedKeys(value, ["from", "fromTime", "start", "startTime"]) &&
    getValueByNormalizedKeys(value, ["to", "toTime", "end", "endTime"]);

  if (hasTimeRange) return [value];

  for (const nestedValue of Object.values(value)) {
    const nestedArray = findAppointmentArray(nestedValue, seen);

    if (nestedArray.length > 0) return nestedArray;
  }

  return [];
};

const normalizeTimeParts = (value) => {
  const parts = String(value || "")
    .trim()
    .match(/\d{1,2}/g);

  if (!parts?.length) return null;

  const [hour = "0", minute = "0", second = "0"] = parts;

  return {
    hour: Math.min(Math.max(Number(hour) || 0, 0), 23),
    minute: Math.min(Math.max(Number(minute) || 0, 0), 59),
    second: Math.min(Math.max(Number(second) || 0, 0), 59),
  };
};

export const formatTimeForApi = (value) => {
  const parts = normalizeTimeParts(value);

  if (!parts) return "";

  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(
    2,
    "0"
  )}:${String(parts.second).padStart(2, "0")}`;
};

export const normalizeTimeForCompare = (value) => {
  const parts = normalizeTimeParts(value);

  if (!parts) return "";

  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(
    2,
    "0"
  )}`;
};

const createFallbackSecurityStamp = (appointmentBody) =>
  [
    "appointment",
    appointmentBody.date,
    normalizeTimeForCompare(appointmentBody.from),
    normalizeTimeForCompare(appointmentBody.to),
  ]
    .filter(Boolean)
    .join("-");

export const normalizeAppointmentSlots = (response, fallbackDate = "") => {
  const payload = extractAppointmentPayload(response);
  const topLevelSecurityStamp = findFirstValueByNormalizedKeys(payload, [
    "securityStamp",
    "bookingSecurityStamp",
    "appointmentSecurityStamp",
    "availabilitySecurityStamp",
    "securityToken",
    "bookingToken",
    "token",
    "stamp",
  ]);
  const slots = findAppointmentArray(payload);

  return slots
    .map((slot, index) => {
      const slotObject = isObject(slot) ? slot : { from: slot };
      const from = firstPresentValue(
        getValueByNormalizedKeys(slotObject, [
          "from",
          "fromTime",
          "start",
          "startTime",
          "startHour",
        ]),
        typeof slot === "string" ? slot : ""
      );
      const to = getValueByNormalizedKeys(slotObject, [
        "to",
        "toTime",
        "end",
        "endTime",
        "endHour",
      ]);

      return {
        id: String(
          firstPresentValue(
            getValueByNormalizedKeys(slotObject, ["id", "appointmentId", "slotId"]),
            `${fallbackDate || "slot"}-${index + 1}`
          )
        ),
        date:
          firstPresentValue(
            getValueByNormalizedKeys(slotObject, ["date", "day", "appointmentDate"]),
            fallbackDate
          ) || "",
        from: from ? normalizeTimeForCompare(from) : "",
        to: to ? normalizeTimeForCompare(to) : "",
        securityStamp:
          firstPresentValue(
            getValueByNormalizedKeys(slotObject, [
              "securityStamp",
              "bookingSecurityStamp",
              "appointmentSecurityStamp",
              "availabilitySecurityStamp",
              "securityToken",
              "bookingToken",
              "token",
              "stamp",
              "security_stamp",
            ]),
            topLevelSecurityStamp,
            null
          ) || null,
        raw: slot,
      };
    })
    .filter((slot) => slot.from && slot.to);
};

export const applyAvailabilitySecurityStamp = (appointmentBody, availability) => {
  if (appointmentBody.securityStamp) return appointmentBody;

  const slots = normalizeAppointmentSlots(availability, appointmentBody.date);
  const requestFrom = normalizeTimeForCompare(appointmentBody.from);
  const requestTo = normalizeTimeForCompare(appointmentBody.to);
  const matchingSlot =
    slots.find(
      (slot) =>
        normalizeTimeForCompare(slot.from) === requestFrom &&
        normalizeTimeForCompare(slot.to) === requestTo
    ) || slots.find((slot) => normalizeTimeForCompare(slot.from) === requestFrom);

  return {
    ...appointmentBody,
    securityStamp:
      matchingSlot?.securityStamp ||
      appointmentBody.securityStamp ||
      createFallbackSecurityStamp(appointmentBody),
  };
};

export const getStoredAppointmentBookings = () => {
  if (typeof window === "undefined") return [];

  try {
    const storedBookings = JSON.parse(
      localStorage.getItem(APPOINTMENT_BOOKINGS_STORAGE_KEY) || "[]"
    );

    return Array.isArray(storedBookings) ? storedBookings : [];
  } catch {
    return [];
  }
};

export const saveAppointmentBookings = (bookings) => {
  if (typeof window === "undefined") return;

  const nextBookings = Array.isArray(bookings) ? bookings : [bookings];
  const existingBookings = getStoredAppointmentBookings();
  const nextBookingIds = new Set(nextBookings.map((booking) => booking.id));

  localStorage.setItem(
    APPOINTMENT_BOOKINGS_STORAGE_KEY,
    JSON.stringify([
      ...nextBookings,
      ...existingBookings.filter((booking) => !nextBookingIds.has(booking.id)),
    ])
  );
};
