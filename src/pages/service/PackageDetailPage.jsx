import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  bookServiceAppointment,
  getServiceAppointmentAvailabilities,
  getPackageDetails,
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
  extractPayloadData,
  formatServicePrice,
  formatTimeLabel,
  getApiErrorMessage,
  normalizeService,
} from "./serviceApiMappers";
import {
  applyAvailabilitySecurityStamp,
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

const getNeighborhoodLabel = (service, neighborhoodId) =>
  getServiceNeighborhoodOptions(service).find(
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
  itemIds: [],
  neighborhoodId: neighborhoodId || service?.neighborhoodId || null,
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

const DAILY_WEEKDAY_INDEXES = [0, 1, 2, 3, 4, 5, 6];

const getScheduleKey = (type, value) => `${type}-${value}`;

const createWeekdayScheduleSelection = (dayIndex) => ({
  key: getScheduleKey("weekday", dayIndex),
  type: "weekday",
  dayIndex,
  label: WEEKDAY_NAMES[dayIndex],
});

const getScheduleSelections = (
  recurrence,
  selectedWeekdays,
  selectedMonthDays
) => {
  if (recurrence === "daily") {
    return DAILY_WEEKDAY_INDEXES.map(createWeekdayScheduleSelection);
  }

  if (recurrence === "monthly") {
    return selectedMonthDays.map((monthDay) => ({
      key: getScheduleKey("month-day", monthDay),
      type: "month-day",
      monthDay,
      label: `Day ${monthDay}`,
    }));
  }

  return selectedWeekdays.map(createWeekdayScheduleSelection);
};

const getScheduleTimeOptions = (selection, service, durationInMin) => {
  const selectionDate = getScheduleSelectionDate(selection);
  const selectionDayIndex =
    typeof selection.dayIndex === "number"
      ? selection.dayIndex
      : selectionDate
        ? new Date(`${selectionDate}T00:00:00`).getDay()
        : -1;
  const matchingAgendas =
    selectionDayIndex >= 0
      ? (service.agendas || []).filter(
          (agenda) => agenda.dayIndex === selectionDayIndex
        )
      : [];

  if (matchingAgendas.length) {
    return matchingAgendas.flatMap((agenda) =>
      getAgendaRanges(agenda, durationInMin).map((range) => ({
        ...range,
        id: `${selection.key}-${agenda.id}-${range.id}`,
      }))
      );
  }

  return [];
};

const getPackageServiceIds = (packageItem) => [
  ...(Array.isArray(packageItem.serviceIds) ? packageItem.serviceIds : []),
  ...(Array.isArray(packageItem.services)
    ? packageItem.services.map((service) => service?.id || service?.serviceId)
    : []),
  packageItem.serviceId,
  packageItem.service?.id,
  packageItem.service?.serviceId,
].filter(Boolean);

const normalizePackageFeature = (item) => {
  if (typeof item === "string") return item;

  return (
    item?.name ||
    item?.itemName ||
    item?.serviceItemName ||
    item?.title ||
    item?.description ||
    ""
  );
};

const normalizePackage = (packageItem) => {
  const serviceIds = getPackageServiceIds(packageItem);
  const includedItems =
    packageItem.includedItems ||
    packageItem.items ||
    packageItem.serviceItems ||
    packageItem.features ||
    packageItem.packageItems ||
    [];

  return {
    id: String(packageItem.id || packageItem.packageId || ""),
    name: packageItem.name || packageItem.packageName || "Service Package",
    recurrence: packageItem.recurrence || packageItem.pricingType || "Weekly",
    daysPerInterval: Math.max(
      1,
      Number(packageItem.daysPerInterval ?? packageItem.times ?? 1) || 1
    ),
    price: Number(packageItem.price ?? packageItem.packagePrice ?? 0) || 0,
    currency: packageItem.currency || packageItem.packageCurrency || "EGP",
    serviceIds: serviceIds.map(String),
    serviceName:
      packageItem.serviceName ||
      packageItem.services?.[0]?.name ||
      packageItem.service?.name ||
      "",
    concurrencyStamp:
      packageItem.concurrencyStamp ||
      packageItem.ConcurrencyStamp ||
      packageItem.serviceConcurrencyStamp ||
      packageItem.ServiceConcurrencyStamp ||
      extractAppointmentConcurrencyStamp(packageItem) ||
      "",
    includedItems: includedItems.map(normalizePackageFeature).filter(Boolean),
    raw: packageItem,
  };
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

const getPackageSelectionLimit = (packageItem) => {
  const recurrence = getPackageRecurrence(packageItem);
  const value = Math.max(1, Number(packageItem.daysPerInterval) || 1);

  if (recurrence === "daily") return 7;
  if (recurrence === "weekly") return Math.min(7, value);
  if (recurrence === "monthly") return Math.min(30, value);

  return value;
};

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
  selectedWeekdays,
  selectedMonthDays,
}) {
  const recurrence = getPackageRecurrence(packageItem);
  const limit = getPackageSelectionLimit(packageItem);
  const selectedCount =
    recurrence === "daily"
      ? DAILY_WEEKDAY_INDEXES.length
      : recurrence === "monthly"
        ? selectedMonthDays.length
        : selectedWeekdays.length;
  const intervalLabel =
    recurrence === "daily"
      ? "Daily package"
      : recurrence === "monthly"
        ? "Monthly package"
        : "Weekly package";
  const statusLabel =
    recurrence === "daily"
      ? "7 days / week selected"
      : `${selectedCount} / ${limit} ${limit === 1 ? "day" : "days"} selected`;

  return (
    <div className="rounded-[12px] bg-[#F8F9FC] px-4 py-3 text-center">
      <p className="font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
        {intervalLabel}
      </p>
      <p className="mt-1 font-['Roboto'] text-[12px] leading-5 text-[#6777A0]">
        {statusLabel}
      </p>
    </div>
  );
}

function PackageCalendar({
  packageItem,
  selectedWeekdays,
  selectedMonthDays,
  onToggleWeekday,
  onToggleMonthDay,
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const todayKey = getTodayKey();
  const recurrence = getPackageRecurrence(packageItem);
  const limit = getPackageSelectionLimit(packageItem);
  const calendarDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);

  const isDateSelectable = (day) => {
    if (!day.isCurrentMonth || day.key < todayKey) return false;
    if (recurrence === "monthly" && day.dayNumber > 30) return false;

    return true;
  };

  const isDateSelected = (day) => {
    if (!isDateSelectable(day)) return false;
    if (recurrence === "daily") return true;
    if (recurrence === "monthly") return selectedMonthDays.includes(day.dayNumber);

    return selectedWeekdays.includes(day.dayIndex);
  };

  const handleSelectDay = (day) => {
    if (recurrence === "daily") return;

    if (recurrence === "monthly") {
      onToggleMonthDay(day.dayNumber);
      return;
    }

    onToggleWeekday(day.dayIndex);
  };

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
          {formatMonthTitle(visibleMonth)}
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
          const hasReachedLimit =
            recurrence === "monthly"
              ? selectedMonthDays.length >= limit
              : selectedWeekdays.length >= limit;
          const isDisabled =
            !isSelectable ||
            (recurrence !== "daily" && !isSelected && hasReachedLimit);

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
  service,
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
        const timeSlots = getScheduleTimeOptions(
          selection,
          service,
          durationInMin
        );
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

            <div className="mt-3 flex flex-wrap gap-2">
              {timeSlots.length > 0 ? (
                timeSlots.map((slot) => {
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
                })
              ) : (
                <p className="rounded-xl bg-[#F8F9FC] px-3 py-2 font-['Roboto'] text-[12px] font-semibold text-[#DC2626]">
                  No available service time for this package day.
                </p>
              )}
            </div>
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
  const limit = getPackageSelectionLimit(packageItem);
  const neighborhoodOptions = useMemo(
    () => getServiceNeighborhoodOptions(service),
    [service]
  );
  const [selectedWeekdays, setSelectedWeekdays] = useState(() =>
    recurrence === "daily" ? DAILY_WEEKDAY_INDEXES : []
  );
  const [selectedMonthDays, setSelectedMonthDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState(
    () => neighborhoodOptions[0]?.id || ""
  );
  const effectiveSelectedNeighborhoodId = neighborhoodOptions.some(
    (neighborhood) => neighborhood.id === selectedNeighborhoodId
  )
    ? selectedNeighborhoodId
    : neighborhoodOptions[0]?.id || "";
  const durationInMin = service.timeslotDurationInMin || 60;

  const scheduleSelections = useMemo(
    () => getScheduleSelections(recurrence, selectedWeekdays, selectedMonthDays),
    [recurrence, selectedMonthDays, selectedWeekdays]
  );

  const hasScheduleSelection =
    recurrence === "daily" ? true : scheduleSelections.length === limit;
  const hasTimeSelection =
    hasScheduleSelection &&
    scheduleSelections.every((selection) => selectedTimes[selection.key]);

  const removeSelectedTime = (key) => {
    setSelectedTimes((currentTimes) => {
      if (!currentTimes[key]) return currentTimes;

      const nextTimes = { ...currentTimes };
      delete nextTimes[key];

      return nextTimes;
    });
  };

  const toggleWeekday = (dayIndex) => {
    if (selectedWeekdays.includes(dayIndex)) {
      removeSelectedTime(getScheduleKey("weekday", dayIndex));
      setSelectedWeekdays((currentDays) =>
        currentDays.filter((day) => day !== dayIndex)
      );
      return;
    }

    if (selectedWeekdays.length >= limit) return;

    setSelectedWeekdays((currentDays) =>
      [...currentDays, dayIndex].sort((first, second) => first - second)
    );
  };

  const toggleMonthDay = (monthDay) => {
    if (selectedMonthDays.includes(monthDay)) {
      removeSelectedTime(getScheduleKey("month-day", monthDay));
      setSelectedMonthDays((currentDays) =>
        currentDays.filter((day) => day !== monthDay)
      );
      return;
    }

    if (selectedMonthDays.length >= limit) return;

    setSelectedMonthDays((currentDays) =>
      [...currentDays, monthDay].sort((first, second) => first - second)
    );
  };

  const handleSelectTime = (scheduleKey, slot) => {
    setSelectedTimes((currentTimes) => ({
      ...currentTimes,
      [scheduleKey]: slot,
    }));
  };

  const handleBookNow = () => {
    if (
      !hasScheduleSelection ||
      !hasTimeSelection ||
      !effectiveSelectedNeighborhoodId
    ) {
      return;
    }

    const bookedScheduleSelections = scheduleSelections.map((selection) => ({
      ...selection,
      timeSlot: selectedTimes[selection.key],
    }));

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
        service,
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
            selectedWeekdays={selectedWeekdays}
            selectedMonthDays={selectedMonthDays}
          />

          <PackageCalendar
            packageItem={packageItem}
            selectedWeekdays={selectedWeekdays}
            selectedMonthDays={selectedMonthDays}
            onToggleWeekday={toggleWeekday}
            onToggleMonthDay={toggleMonthDay}
          />

          <ScheduleTimeSelections
            service={service}
            durationInMin={durationInMin}
            selectionLimit={limit}
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
                    name={`package-detail-neighborhood-${service.id}`}
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
              No coverage areas available for this service.
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
  const detailsPrice = `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(packageItem.price) || 0)}`;

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
              {service.location || "Not specified"}
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

  useEffect(() => {
    if (!packageId) return undefined;

    let isMounted = true;

    const loadPackageDetails = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const packageResponse = await getPackageDetails(
          packageId,
          SERVICE_LANGUAGE
        );
        const normalizedPackage = normalizePackage(
          extractPayloadData(packageResponse)
        );

        if (!isMounted) return;

        setPackageItem(normalizedPackage);

        const serviceId = normalizedPackage.serviceIds[0];

        if (!serviceId) {
          setService(createFallbackService(normalizedPackage));
          return;
        }

        try {
          const serviceResponse = await getServiceDetails(
            serviceId,
            SERVICE_LANGUAGE
          );
          const serviceData = extractPayloadData(serviceResponse);
          const categoryImage =
            serviceCategories.find(
              (category) =>
                category.apiName === serviceData?.serviceCategory ||
                category.title === serviceData?.categoryName
            )?.image || serviceCategories[0]?.image;

          if (isMounted) {
            setService(normalizeService(serviceData, categoryImage));
          }
        } catch {
          if (isMounted) setService(createFallbackService(normalizedPackage));
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
  }, [packageId]);

  if (!packageId) {
    return <Navigate to="/services/package" replace />;
  }

  const getBookableAppointment = async (body) => {
    const response = await getServiceAppointmentAvailabilities(
      bookingDraft.service.id,
      body.date
    );

    return {
      body: applyAvailabilitySecurityStamp(body, response),
      availabilityResponse: response,
    };
  };

  const handleConfirmBooking = async () => {
    if (!bookingDraft) return;
    if (!bookingDraft.service.id) {
      setBookingErrorMessage("This package is missing a service id for booking.");
      return;
    }
    if (isOwnedByCurrentUser(user, bookingDraft.service, bookingDraft.packageItem)) {
      setBookingErrorMessage(OWN_PACKAGE_BOOKING_ERROR);
      return;
    }

    const scheduleSelections = Array.isArray(bookingDraft.scheduleSelections)
      ? bookingDraft.scheduleSelections
      : [];
    const appointmentSelections = scheduleSelections.length
      ? scheduleSelections
      : [
          {
            key: bookingDraft.selectedDateKey || "selected-date",
            label: bookingDraft.selectedDateKey || "Selected date",
            dateKey: bookingDraft.selectedDateKey,
            timeSlot: bookingDraft.selectedTimeSlot,
          },
        ];

    setIsBookingSubmitting(true);
    setBookingErrorMessage("");

    try {
      const appointmentResults = [];

      for (const selection of appointmentSelections) {
        const appointment = await getBookableAppointment(
          buildAppointmentBody({
            date: getScheduleSelectionDate(
              selection,
              bookingDraft.selectedDateKey
            ),
            timeSlot: selection.timeSlot,
            service: bookingDraft.service,
            packageItem: bookingDraft.packageItem,
            neighborhoodId: bookingDraft.selectedNeighborhoodId,
          })
        );
        const appointmentBody = appointment.body;
        const appointmentResponse = await bookServiceAppointment(
          bookingDraft.service.id,
          appointmentBody
        );

        appointmentResults.push({
          selection,
          request: appointmentBody,
          response: appointmentResponse,
          availabilityResponse: appointment.availabilityResponse,
        });
      }

      const firstResult = appointmentResults[0];
      const bookingPayload = {
        id: getAppointmentId(
          bookingDraft.packageItem.id,
          bookingDraft.service.id,
          firstResult.request
        ),
        mode: "package",
        serviceId: bookingDraft.service.id,
        serviceName: bookingDraft.service.name,
        packageId: bookingDraft.packageItem.id,
        packageName: bookingDraft.packageItem.name,
        providerId: bookingDraft.service.providerId,
        providerName: bookingDraft.service.providerName,
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
      setBookingErrorMessage(
        getApiErrorMessage(error, "Unable to confirm booking. Please try again.")
      );
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F9FC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex items-center">
          <BackCircleButton onClick={() => navigate("/services/package")} />
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
