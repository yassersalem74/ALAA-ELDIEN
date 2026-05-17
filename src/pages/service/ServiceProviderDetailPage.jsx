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
  StarIcon,
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

const formatShortSelectedDate = (dateKey) => {
  if (!dateKey) return "";

  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
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

const getTimeButtonLabel = (range) => formatTimeLabel(range.from);

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

function ServiceImageGallery({ service }) {
  const images = service.galleryImages?.length
    ? service.galleryImages
    : [service.image].filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(images[0] || service.image);

  if (!images.length) return null;

  return (
    <div>
      <img
        src={selectedImage}
        alt={service.name}
        className="h-[260px] w-full rounded-[18px] bg-[#E6E8EF] object-cover sm:h-[360px]"
      />

      <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
        {images.map((image, index) => {
          const isSelected = image === selectedImage;

          return (
            <button
              key={`${image}-${index + 1}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              aria-label={`Show service image ${index + 1}`}
              aria-pressed={isSelected}
              className={`group h-20 overflow-hidden rounded-xl border bg-[#F8F9FC] p-1 transition sm:h-24 ${
                isSelected
                  ? "border-[#011C60] shadow-[0px_10px_22px_rgba(1,28,96,0.18)]"
                  : "border-[#E6E8EF] hover:border-[#EECE42]"
              }`}
            >
              <img
                src={image}
                alt=""
                className={`h-full w-full rounded-lg object-cover transition duration-200 ${
                  isSelected
                    ? "scale-100 blur-0 opacity-100"
                    : "scale-105 blur-[1.5px] opacity-55 group-hover:blur-0 group-hover:opacity-90"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionPanel({ title, children }) {
  return (
    <section className="rounded-[16px] bg-white">
      <div className="flex min-h-14 items-center justify-between rounded-[8px] bg-[#E6E8EF] px-4">
        <h2 className="font-['Roboto'] text-[15px] font-semibold text-[#011C60]">
          {title}
        </h2>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function QuantityControl({ value, onDecrease, onIncrease }) {
  return (
    <div className="flex h-9 items-center rounded-full bg-[#F3F5FA] px-1">
      <button
        type="button"
        onClick={onDecrease}
        disabled={value === 0}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white font-['Roboto'] text-[18px] font-semibold text-[#808DAF] shadow-sm transition hover:text-[#011C60] disabled:cursor-not-allowed disabled:opacity-45"
        aria-label="Decrease item quantity"
      >
        -
      </button>
      <span className="min-w-8 text-center font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white font-['Roboto'] text-[16px] font-semibold text-[#011C60] shadow-sm transition hover:bg-[#011C60] hover:text-white"
        aria-label="Increase item quantity"
      >
        +
      </button>
    </div>
  );
}

function AvailableDaysPills({ agendas }) {
  if (!agendas.length) return null;

  return (
    <div>
      <h2 className="font-['Roboto'] text-[24px] font-semibold text-[#011C60]">
        Availability Times
      </h2>
      <p className="mt-1 font-['Roboto'] text-[18px] leading-7 text-[#808DAF]">
        Available weekdays repeat through the calendar.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        {agendas.map((agenda) => (
          <span
            key={agenda.id}
            className="min-w-[120px] rounded-full border border-[#D8DDEB] bg-white px-6 py-3 text-center font-['Roboto'] text-[17px] font-semibold text-[#011C60] shadow-[0px_8px_20px_rgba(204,210,223,0.3)]"
          >
            {agenda.day}
          </span>
        ))}
      </div>
    </div>
  );
}

function BookingCalendar({
  agendas,
  selectedDateKey,
  onSelectDate,
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const todayKey = getTodayKey();

  const availableDayIndexes = useMemo(
    () => new Set(agendas.map((agenda) => agenda.dayIndex)),
    [agendas]
  );

  const calendarDays = useMemo(
    () => buildMonthDays(visibleMonth),
    [visibleMonth]
  );

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
              onClick={() => onSelectDate(day.key)}
              className={`aspect-square rounded-full font-['Roboto'] text-[12px] font-semibold transition ${
                isSelected
                  ? "bg-[#011C60] text-white"
                  : isAvailable
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

function BookingPanel({ service, onConfirmBooking }) {
  const agendas = useMemo(() => service.agendas || [], [service.agendas]);
  const durationInMin = service.timeslotDurationInMin || 60;
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [quantities, setQuantities] = useState({});

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

  const selectedItems = useMemo(
    () =>
      service.items
        .map((item) => ({
          ...item,
          quantity: quantities[item.id] || 0,
        }))
        .filter((item) => item.quantity > 0),
    [quantities, service.items]
  );

  const itemsTotal = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) => total + (Number(item.price) || 0) * item.quantity,
        0
      ),
    [selectedItems]
  );
  const total = (Number(service.price) || 0) + itemsTotal;

  const changeQuantity = (itemId, delta) => {
    setQuantities((current) => ({
      ...current,
      [itemId]: Math.max(0, (current[itemId] || 0) + delta),
    }));
  };

  const handleSelectDate = (dateKey) => {
    setSelectedDateKey(dateKey);
    setSelectedTimeSlot(null);
  };

  const handleBookNow = () => {
    if (!selectedDateKey || !selectedTimeSlot) return;

    onConfirmBooking({
      service,
      selectedDateKey,
      selectedTimeSlot,
      selectedItems,
      total,
    });
  };

  return (
    <aside className="sticky top-24 space-y-6 rounded-[18px] bg-white p-4 shadow-[0px_12px_36px_rgba(1,28,96,0.08)]">
      {service.items.length > 0 && (
        <SectionPanel title="Choose items">
          <div className="space-y-3">
            {service.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-[12px] border border-[#E6E8EF] bg-white px-3 py-3 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6E8EF]">
                  <CalendarIcon className="h-5 w-5" stroke="#808DAF" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
                    {item.name}
                  </p>
                  <p className="font-['Roboto'] text-[11px] font-medium text-[#808DAF]">
                    {formatServicePrice(item.price, service.currency)}
                  </p>
                </div>
                <QuantityControl
                  value={quantities[item.id] || 0}
                  onDecrease={() => changeQuantity(item.id, -1)}
                  onIncrease={() => changeQuantity(item.id, 1)}
                />
              </div>
            ))}
          </div>
        </SectionPanel>
      )}

      <div className="rounded-[14px] bg-[#F8F9FC] p-4">
        <div className="flex items-center justify-between font-['Roboto'] text-[14px] font-semibold text-[#6777A0]">
          <span>Base service</span>
          <span>{formatServicePrice(service.price, service.currency)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between font-['Roboto'] text-[18px] font-bold text-[#011C60]">
          <span>Total</span>
          <span>{formatServicePrice(total, service.currency)}</span>
        </div>
      </div>

      <SectionPanel title="Select Date">
        {agendas.length ? (
          <BookingCalendar
            agendas={agendas}
            selectedDateKey={selectedDateKey}
            onSelectDate={handleSelectDate}
          />
        ) : (
          <EmptyState
            title="No availability yet"
            description="The provider has not added available days for this service."
          />
        )}
      </SectionPanel>

      <SectionPanel title="Select Time">
        <div className="flex flex-wrap justify-center gap-2 pb-1">
          {!agendas.length ? (
            <p className="rounded-xl bg-[#F8F9FC] px-4 py-3 font-['Roboto'] text-[14px] text-[#808DAF]">
              Available times will show after the provider adds a schedule.
            </p>
          ) : selectedTimeSlots.length ? (
            selectedTimeSlots.map((slot) => {
              const isSelected = selectedTimeSlot?.id === slot.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`min-w-[96px] rounded-xl border px-3 py-3 font-['Roboto'] text-[13px] font-semibold transition ${
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
            <p className="rounded-xl bg-[#F8F9FC] px-4 py-3 font-['Roboto'] text-[14px] text-[#808DAF]">
              Choose an available day first.
            </p>
          )}
        </div>
      </SectionPanel>

      <button
        type="button"
        onClick={handleBookNow}
        disabled={!agendas.length || !selectedDateKey || !selectedTimeSlot}
        className="flex h-14 w-full items-center justify-center rounded-[12px] bg-[#011C60] font-['Roboto'] text-[15px] font-semibold text-white transition hover:bg-[#02237a] disabled:cursor-not-allowed disabled:bg-[#B3BBCF]"
      >
        Book Now
      </button>
    </aside>
  );
}

function ConfirmBookingModal({ booking, onClose, onConfirm }) {
  if (!booking) return null;

  const { service, selectedDateKey, selectedTimeSlot, selectedItems, total } =
    booking;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4">
      <div className="w-full max-w-[440px] rounded-[16px] bg-white p-5 shadow-[0px_28px_70px_rgba(1,28,96,0.22)]">
        <h2 className="text-center font-['Roboto'] text-[26px] font-semibold text-[#011C60]">
          Confirm Booking
        </h2>

        <div className="mt-5 flex items-center gap-3 rounded-[12px] bg-[#E6E8EF] p-3">
          <img
            src={service.providerImage || service.image}
            alt=""
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <p className="font-['Roboto'] text-[16px] font-semibold text-[#011C60]">
              {service.providerName}
            </p>
            <p className="mt-1 flex items-center gap-1 font-['Roboto'] text-[13px] text-[#808DAF]">
              <StarIcon className="h-4 w-4" />
              {service.rate ? service.rate.toFixed(1) : "New"} rating
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4 rounded-[12px] border border-[#E6E8EF] bg-white p-4 shadow-[0px_8px_24px_rgba(204,210,223,0.28)]">
          <div className="flex gap-3">
            <CalendarIcon className="mt-1 h-5 w-5 shrink-0" />
            <div>
              <p className="font-['Roboto'] text-[12px] font-semibold text-[#808DAF]">
                Date & Time
              </p>
              <p className="font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                {formatShortSelectedDate(selectedDateKey)}
              </p>
              <p className="font-['Roboto'] text-[13px] text-[#011C60]">
                {formatRangeLabel(selectedTimeSlot)}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <LocationIcon className="mt-1 h-5 w-5 shrink-0" stroke="#011C60" />
            <div>
              <p className="font-['Roboto'] text-[12px] font-semibold text-[#808DAF]">
                Address
              </p>
              <p className="font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                {service.location || "Not specified"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <ClockIcon className="mt-1 h-5 w-5 shrink-0" />
            <div>
              <p className="font-['Roboto'] text-[12px] font-semibold text-[#808DAF]">
                Service Type
              </p>
              <p className="font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                {selectedItems.length
                  ? selectedItems
                      .map((item) => `${item.name} x${item.quantity}`)
                      .join(", ")
                  : service.name}
              </p>
            </div>
          </div>

          <div>
            <p className="font-['Roboto'] text-[12px] font-semibold text-[#808DAF]">
              Fees
            </p>
            <p className="font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
              {formatServicePrice(total, service.currency)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-[10px] border border-[#CCD2DF] font-['Roboto'] text-[14px] font-semibold text-[#011C60]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 rounded-[10px] bg-[#011C60] font-['Roboto'] text-[14px] font-semibold text-white"
          >
            Confirm Booking
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
        className="w-full max-w-[330px] rounded-[16px] bg-white px-6 py-8 text-center shadow-[0px_28px_70px_rgba(1,28,96,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[14px] bg-[#DDEEFF]">
          <svg
            viewBox="0 0 64 64"
            className="h-16 w-16 text-[#EECE42]"
            aria-hidden="true"
          >
            <circle cx="32" cy="32" r="25" fill="currentColor" opacity="0.28" />
            <path
              d="M20 33.5L28 41L45 23"
              fill="none"
              stroke="#011C60"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mt-5 font-['Roboto'] text-[21px] font-semibold leading-8 text-[#011C60]">
          Your booking has been confirmed successfully
        </h2>
      </div>
    </div>
  );
}

export default function ServiceProviderDetailPage() {
  const navigate = useNavigate();
  const { categorySlug, serviceId } = useParams();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingDraft, setBookingDraft] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

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

  const handleConfirmBooking = () => {
    if (!bookingDraft) return;

    const bookingPayload = {
      id: `${bookingDraft.service.id}-${bookingDraft.selectedDateKey}-${bookingDraft.selectedTimeSlot.from}`,
      serviceId: bookingDraft.service.id,
      serviceName: bookingDraft.service.name,
      providerId: bookingDraft.service.providerId,
      providerName: bookingDraft.service.providerName,
      date: bookingDraft.selectedDateKey,
      from: bookingDraft.selectedTimeSlot.from,
      to: bookingDraft.selectedTimeSlot.to,
      items: bookingDraft.selectedItems,
      total: bookingDraft.total,
      currency: bookingDraft.service.currency,
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

    setBookingDraft(null);
    setIsSuccessOpen(true);
  };

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
              <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-start">
                <div>
                  <h1 className="font-['Roboto'] text-[28px] font-semibold leading-10 text-[#011C60] sm:text-[34px]">
                    {service.name}
                  </h1>

                  <div className="mt-5">
                    <ServiceImageGallery key={service.id} service={service} />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-5">
                    <div className="flex items-center gap-2">
                      <StarIcon className="h-5 w-5" />
                      <span className="font-['Roboto'] text-[18px] font-semibold text-[#011C60]">
                        {service.rate ? service.rate.toFixed(1) : "New"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LocationIcon className="h-5 w-5" stroke="#011C60" />
                      <span className="font-['Roboto'] text-[16px] font-medium text-[#4D6090]">
                        {service.location || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <p className="mt-6 max-w-[720px] font-['Roboto'] text-[17px] leading-8 text-[#4D6090]">
                    {service.description ||
                      service.subDescription ||
                      "Professional services delivered by trusted providers with flexible scheduling."}
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[10px] bg-[#E6E8EF]/70 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CCD2DF]">
                          <ClockIcon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
                            Fast Response
                          </p>
                          <p className="font-['Roboto'] text-[11px] text-[#6777A0]">
                            Based on provider availability
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[10px] bg-[#E6E8EF]/70 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CCD2DF]">
                          <LocationIcon className="h-5 w-5" stroke="#011C60" />
                        </span>
                        <div>
                          <p className="font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
                            Service Area
                          </p>
                          <p className="font-['Roboto'] text-[11px] text-[#6777A0]">
                            {service.location || "Provider location"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <section className="mt-8">
                    <h2 className="font-['Roboto'] text-[24px] font-semibold text-[#011C60]">
                      Long Description
                    </h2>
                    <div className="mt-3 space-y-4 font-['Roboto'] text-[16px] leading-7 text-[#4D6090]">
                      <p>
                        Our {service.name.toLowerCase()} service is designed to
                        make your life easier by providing reliable, high-quality
                        support whenever you need it.
                      </p>
                      <p>
                        Compare availability, choose the items you need, and
                        confirm a time that fits your schedule.
                      </p>
                      <div>
                        <p className="font-semibold text-[#011C60]">We focus on:</p>
                        <ul className="mt-1 list-disc pl-5">
                          <li>Experienced and verified service providers</li>
                          <li>Flexible booking times that fit your schedule</li>
                          <li>Transparent pricing with no hidden fees</li>
                          <li>High standards of safety and professionalism</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section className="mt-9">
                    <AvailableDaysPills agendas={service.agendas} />
                  </section>
                </div>

                <BookingPanel service={service} onConfirmBooking={setBookingDraft} />
              </div>

              <ConfirmBookingModal
                booking={bookingDraft}
                onClose={() => setBookingDraft(null)}
                onConfirm={handleConfirmBooking}
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
