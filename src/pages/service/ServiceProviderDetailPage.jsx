import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getServiceDetails } from "../../api/services/service.api";
import { serviceCategories } from "../../components/Service-Page/servicePageData";
import {
  BackCircleButton,
  CalendarIcon,
  ClockIcon,
  EmptyState,
  LocationIcon,
  ServicePageIntro,
} from "../../components/Service-Flow/ServiceFlowShared";
import {
  SERVICE_LANGUAGE,
  WEEKDAY_NAMES,
  extractPayloadData,
  getApiErrorMessage,
  formatServicePrice,
  formatTimeLabel,
  isSupportedServiceCategory,
  normalizeService,
} from "./serviceApiMappers";

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatMonthTitle = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

const formatSelectedDate = (dateKey) => {
  if (!dateKey) return "Choose an available date";

  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const getTodayKey = () => toDateKey(new Date());

const buildMonthDays = (visibleMonth) => {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, index - startOffset + 1);

    return {
      date,
      key: toDateKey(date),
      dayNumber: date.getDate(),
      dayIndex: date.getDay(),
      isCurrentMonth: date.getMonth() === month,
    };
  });
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
  `${formatTimeLabel(range.from)} - ${formatTimeLabel(range.to)}`;

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

function AvailabilityCalendar({ service }) {
  const agendas = useMemo(() => service.agendas || [], [service.agendas]);
  const durationInMin = service.timeslotDurationInMin || 60;
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const todayKey = getTodayKey();

  const availableDayIndexes = useMemo(
    () => new Set(agendas.map((agenda) => agenda.dayIndex)),
    [agendas]
  );

  const calendarDays = useMemo(
    () => buildMonthDays(visibleMonth),
    [visibleMonth]
  );

  const selectedDayIndex = useMemo(() => {
    if (!selectedDateKey) return -1;

    const [year, month, day] = selectedDateKey.split("-").map(Number);

    return new Date(year, month - 1, day).getDay();
  }, [selectedDateKey]);

  const selectedAgendas = useMemo(
    () => agendas.filter((agenda) => agenda.dayIndex === selectedDayIndex),
    [agendas, selectedDayIndex]
  );

  const selectedTimeSlots = useMemo(
    () =>
      selectedAgendas.flatMap((agenda) =>
        getAgendaRanges(agenda, durationInMin).map((range) => ({
          ...range,
          id: `${agenda.id}-${range.id}`,
          agendaId: agenda.id,
          day: agenda.day,
        }))
      ),
    [durationInMin, selectedAgendas]
  );

  const handleSelectDate = (dateKey) => {
    setSelectedDateKey(dateKey);
    setSelectedTimeSlot(null);
    setBookingMessage("");
  };

  const handleSelectTimeSlot = (slot) => {
    setSelectedTimeSlot(slot);
    setBookingMessage("");
  };

  const handleBookService = () => {
    if (!selectedDateKey || !selectedTimeSlot) return;

    const bookingPayload = {
      id: `${service.id}-${selectedDateKey}-${selectedTimeSlot.from}`,
      serviceId: service.id,
      serviceName: service.name,
      providerId: service.providerId,
      providerName: service.providerName,
      date: selectedDateKey,
      from: selectedTimeSlot.from,
      to: selectedTimeSlot.to,
      price: service.price,
      currency: service.currency,
      createdAt: new Date().toISOString(),
    };

    try {
      const existingBookings = JSON.parse(
        localStorage.getItem("serviceBookings") || "[]"
      );
      const nextBookings = [
        bookingPayload,
        ...existingBookings.filter((booking) => booking.id !== bookingPayload.id),
      ];

      localStorage.setItem("serviceBookings", JSON.stringify(nextBookings));
    } catch (error) {
      console.warn("Unable to save selected service booking locally.", error);
    }

    setBookingMessage(
      `Booking selected for ${formatSelectedDate(selectedDateKey)} at ${formatRangeLabel(
        selectedTimeSlot
      )}.`
    );
  };

  if (!agendas.length) {
    return (
      <EmptyState
        title="No availability yet"
        description="This service is saved, but the provider has not added available days."
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-2xl border border-[#E6E8EF] bg-white p-5 shadow-[0px_8px_24px_rgba(190,198,222,0.22)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-['Roboto'] text-[12px] font-medium uppercase text-[#808DAF]">
              Available calendar
            </p>
            <h2 className="font-['Roboto'] text-[24px] font-semibold leading-8 text-[#011C60]">
              {formatMonthTitle(visibleMonth)}
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setVisibleMonth(
                  (current) =>
                    new Date(current.getFullYear(), current.getMonth() - 1, 1)
                )
              }
              className="h-10 rounded-xl border border-[#CCD2DF] px-4 font-['Roboto'] text-sm font-semibold text-[#011C60] transition hover:bg-[#F5F7FC]"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() =>
                setVisibleMonth(
                  (current) =>
                    new Date(current.getFullYear(), current.getMonth() + 1, 1)
                )
              }
              className="h-10 rounded-xl border border-[#CCD2DF] px-4 font-['Roboto'] text-sm font-semibold text-[#011C60] transition hover:bg-[#F5F7FC]"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-2">
          {WEEKDAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-center font-['Roboto'] text-[12px] font-semibold uppercase text-[#808DAF]"
            >
              {day.slice(0, 3)}
            </div>
          ))}

          {calendarDays.map((day) => {
            const isAvailable =
              day.isCurrentMonth &&
              day.key >= todayKey &&
              availableDayIndexes.has(day.dayIndex);
            const isSelected = selectedDateKey === day.key;

            return (
              <button
                key={day.key}
                type="button"
                disabled={!isAvailable}
                onClick={() => handleSelectDate(day.key)}
                className={`aspect-square rounded-xl font-['Roboto'] text-sm font-semibold transition ${
                  isSelected
                    ? "bg-[#011C60] text-white shadow-[0px_12px_24px_rgba(1,28,96,0.22)]"
                    : isAvailable
                      ? "bg-[#FFF4C4] text-[#011C60] hover:-translate-y-0.5 hover:bg-[#EECE42]"
                      : "cursor-not-allowed bg-[#F3F5FA] text-[#B3BBCF]"
                } ${day.isCurrentMonth ? "" : "opacity-40"}`}
              >
                {day.dayNumber}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E6E8EF] bg-white p-5 shadow-[0px_8px_24px_rgba(190,198,222,0.22)]">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8F9FC]">
            <ClockIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-['Roboto'] text-[12px] font-medium uppercase text-[#808DAF]">
              Selected day
            </p>
            <h3 className="font-['Roboto'] text-[20px] font-semibold leading-7 text-[#011C60]">
              {formatSelectedDate(selectedDateKey)}
            </h3>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {selectedTimeSlots.length ? (
            selectedTimeSlots.map((slot) => {
              const isSelected = selectedTimeSlot?.id === slot.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSelectTimeSlot(slot)}
                  aria-pressed={isSelected}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-[#011C60] bg-[#011C60] text-white shadow-[0px_12px_24px_rgba(1,28,96,0.2)]"
                      : "border-[#E6E8EF] bg-[#F8F9FC] text-[#011C60] hover:border-[#EECE42] hover:bg-[#FFF8D7]"
                  }`}
                >
                  <p
                    className={`font-['Roboto'] text-[13px] font-medium ${
                      isSelected ? "text-white/80" : "text-[#808DAF]"
                    }`}
                  >
                    {slot.day}
                  </p>
                  <p className="mt-1 font-['Roboto'] text-[17px] font-semibold">
                    {formatRangeLabel(slot)}
                  </p>
                </button>
              );
            })
          ) : (
            <p className="font-['Roboto'] text-[15px] leading-6 text-[#808DAF]">
              Pick one of the highlighted days to see its available hours.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleBookService}
          disabled={!selectedDateKey || !selectedTimeSlot}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#011C60] px-5 font-['Roboto'] text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#02237a] disabled:cursor-not-allowed disabled:bg-[#B3BBCF] disabled:hover:translate-y-0"
        >
          Book Service
        </button>

        {bookingMessage && (
          <p className="mt-3 rounded-xl bg-[#F6E6A0] px-4 py-3 font-['Roboto'] text-[14px] font-semibold leading-5 text-[#011C60]">
            {bookingMessage}
          </p>
        )}
      </div>
    </div>
  );
}

function AvailabilitySummary({ agendas }) {
  if (!agendas.length) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {agendas.map((agenda) => (
        <div
          key={agenda.id}
          className="rounded-full border border-[#E6E8EF] bg-white px-5 py-3 shadow-[0px_8px_18px_rgba(190,198,222,0.18)]"
        >
          <p className="font-['Roboto'] text-[15px] font-semibold text-[#011C60] sm:text-[16px]">
            {agenda.day}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function ServiceProviderDetailPage() {
  const navigate = useNavigate();
  const { categorySlug, serviceId } = useParams();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const category = useMemo(
    () => serviceCategories.find((item) => item.slug === categorySlug),
    [categorySlug]
  );

  useEffect(() => {
    if (!serviceId || !category) return undefined;

    let isMounted = true;

    const loadServiceDetails = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getServiceDetails(serviceId, SERVICE_LANGUAGE);
        const serviceData = extractPayloadData(response);

        if (!isMounted) return;

        setService(normalizeService(serviceData, category.image));
      } catch (error) {
        if (!isMounted) return;

        setService(null);
        setErrorMessage(
          getApiErrorMessage(error, "Unable to load service details.")
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadServiceDetails();

    return () => {
      isMounted = false;
    };
  }, [category, serviceId]);

  if (!category || !isSupportedServiceCategory(categorySlug)) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div className="bg-[#F8F9FC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex items-center">
          <BackCircleButton onClick={() => navigate(`/services/${categorySlug}`)} />
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-[420px] animate-pulse rounded-2xl bg-white shadow-[0px_8px_24px_rgba(190,198,222,0.18)]" />
            <div className="h-[420px] animate-pulse rounded-2xl bg-white shadow-[0px_8px_24px_rgba(190,198,222,0.18)]" />
          </div>
        ) : errorMessage ? (
          <div className="mt-8">
            <EmptyState title="Service not available" description={errorMessage} />
          </div>
        ) : (
          service && (
            <>
              <div className="mt-8">
                <ServicePageIntro
                  title={service.name}
                  description={
                    service.subDescription ||
                    service.description ||
                    "Service details and available times."
                  }
                />
              </div>

              <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
                <div className="rounded-2xl border border-[#E6E8EF] bg-white p-5 shadow-[0px_8px_24px_rgba(190,198,222,0.22)]">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="h-[360px] w-full rounded-[18px] bg-[#E6E8EF] object-cover"
                  />

                  {service.description && (
                    <p className="mt-5 font-['Roboto'] text-[17px] leading-8 text-[#6777A0]">
                      {service.description}
                    </p>
                  )}

                  {service.items.length > 0 && (
                    <div className="mt-6">
                      <h2 className="font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60]">
                        Service Items
                      </h2>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {service.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-[#E6E8EF] bg-[#F8F9FC] px-4 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-['Roboto'] text-[15px] font-semibold text-[#011C60]">
                                {item.name}
                              </p>
                              <p className="shrink-0 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                                {formatServicePrice(item.price, service.currency)}
                              </p>
                            </div>
                            {item.description && (
                              <p className="mt-1 font-['Roboto'] text-[13px] leading-5 text-[#808DAF]">
                                {item.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <aside className="rounded-2xl border border-[#E6E8EF] bg-white p-5 shadow-[0px_8px_24px_rgba(190,198,222,0.22)]">
                  <div className="space-y-5">
                    <div>
                      <p className="font-['Roboto'] text-[12px] font-medium uppercase text-[#808DAF]">
                        Price
                      </p>
                      <p className="font-['Roboto'] text-[28px] font-semibold leading-10 text-[#011C60]">
                        {formatServicePrice(service.price, service.currency)}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8F9FC]">
                        <LocationIcon className="h-5 w-5" stroke="#011C60" />
                      </span>
                      <div>
                        <p className="font-['Roboto'] text-[12px] font-medium uppercase text-[#808DAF]">
                          Location
                        </p>
                        <p className="font-['Roboto'] text-[16px] font-semibold leading-6 text-[#011C60]">
                          {service.location || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8F9FC]">
                        <CalendarIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-['Roboto'] text-[12px] font-medium uppercase text-[#808DAF]">
                          Provider
                        </p>
                        <p className="font-['Roboto'] text-[16px] font-semibold leading-6 text-[#011C60]">
                          {service.providerName}
                        </p>
                        {service.providerRole && (
                          <p className="mt-1 font-['Roboto'] text-[13px] font-medium text-[#808DAF]">
                            {service.providerRole}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="font-['Roboto'] text-[12px] font-medium uppercase text-[#808DAF]">
                        Rating
                      </p>
                      <p className="font-['Roboto'] text-[16px] font-semibold leading-6 text-[#011C60]">
                        {service.rate ? `${service.rate.toFixed(1)} / 5` : "New service"}
                      </p>
                    </div>
                  </div>
                </aside>
              </div>

              <section className="mt-10">
                <div className="mb-5">
                  <h2 className="font-['Roboto'] text-[28px] font-semibold leading-10 text-[#011C60]">
                    Availability Times
                  </h2>
                  <p className="mt-1 font-['Roboto'] text-[16px] leading-6 text-[#808DAF]">
                    Available weekdays repeat through the calendar.
                  </p>
                </div>

                <AvailabilitySummary agendas={service.agendas} />

                <div className="mt-6">
                  <AvailabilityCalendar key={service.id} service={service} />
                </div>
              </section>
            </>
          )
        )}
      </div>
    </div>
  );
}
