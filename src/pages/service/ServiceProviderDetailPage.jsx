import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  BackCircleButton,
  CallyDatePicker,
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon,
  LocationIcon,
  StarIcon,
  formatBookingDate,
  formatCurrency,
  formatReviewCount,
  getTodayInputValue,
} from "../../components/Service-Flow/ServiceFlowShared";
import { createProfileDetails } from "../../components/Profile-Page/profileData";
import bookingSuccessImage from "../../assets/images/service/bookin-successfully.png";
import {
  getProviderBySlugs,
  getServiceCategoryBySlug,
  getSubServiceBySlugs,
} from "../../data/serviceFlowData";

const createInitialQuantities = (items = []) =>
  Object.fromEntries(
    items.map((item, index) => [item.id, index === 0 ? 1 : 0])
  );

function BookingPanelSection({
  title,
  isOpen,
  onToggle,
  icon,
  children,
}) {
  return (
    <div className="rounded-2xl bg-[#F5F7FC] p-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 rounded-2xl text-left transition hover:bg-white/70"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-[0px_4px_12px_rgba(204,210,223,0.45)]">
            {icon}
          </span>
          <span className="font-['Roboto'] text-[18px] font-semibold leading-7 text-[#011C60]">
            {title}
          </span>
        </div>

        <ChevronDownIcon isOpen={isOpen} />
      </button>

      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}

function DetailRow({ icon, label, value, helper }) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F7FC]">
        {icon}
      </span>
      <div>
        <p className="font-['Roboto'] text-[14px] font-medium text-[#808DAF]">
          {label}
        </p>
        <p className="font-['Roboto'] text-[18px] font-semibold leading-7 text-[#011C60]">
          {value}
        </p>
        {helper && (
          <p className="mt-1 font-['Roboto'] text-[14px] leading-6 text-[#808DAF]">
            {helper}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ServiceProviderDetailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categorySlug, serviceSlug, providerSlug } = useParams();
  const [selectedImage, setSelectedImage] = useState("");
  const [itemQuantities, setItemQuantities] = useState({});
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue());
  const [selectedTime, setSelectedTime] = useState("");
  const [isItemsOpen, setIsItemsOpen] = useState(true);
  const [isDateOpen, setIsDateOpen] = useState(true);
  const [isTimeOpen, setIsTimeOpen] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const category = getServiceCategoryBySlug(categorySlug);
  const service = getSubServiceBySlugs(categorySlug, serviceSlug);
  const provider = getProviderBySlugs(categorySlug, serviceSlug, providerSlug);

  const profileDetails = useMemo(() => createProfileDetails(user), [user]);

  const bookingLocation =
    profileDetails.location || provider?.location || "Cairo, Egypt";

  useEffect(() => {
    if (!provider) return;

    setSelectedImage(provider.image);
    setItemQuantities(createInitialQuantities(provider.items));
    setSelectedDate(getTodayInputValue());
    setSelectedTime(provider.timeSlots[0] || "");
    setIsItemsOpen(true);
    setIsDateOpen(true);
    setIsTimeOpen(true);
    setIsConfirmModalOpen(false);
    setIsSuccessModalOpen(false);
  }, [provider]);

  const selectedItems = useMemo(() => {
    if (!provider) return [];

    return provider.items
      .map((item) => ({
        ...item,
        quantity: itemQuantities[item.id] || 0,
      }))
      .filter((item) => item.quantity > 0);
  }, [itemQuantities, provider]);

  const totalPrice = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [selectedItems]
  );

  const selectedItemsSummary = useMemo(
    () =>
      selectedItems.map((item) => `${item.name} x${item.quantity}`).join(", "),
    [selectedItems]
  );

  const canBook =
    selectedItems.length > 0 && Boolean(selectedDate) && Boolean(selectedTime);

  if (!category || !service || !provider) {
    return <Navigate to="/services" replace />;
  }

  const changeQuantity = (itemId, direction) => {
    setItemQuantities((current) => {
      const nextQuantity = Math.max(0, (current[itemId] || 0) + direction);

      return {
        ...current,
        [itemId]: nextQuantity,
      };
    });
  };

  const confirmBooking = () => {
    setIsConfirmModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <>
      <div className="bg-[#F8F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex items-center">
            <BackCircleButton
              size="large"
              onClick={() =>
                navigate(`/services/${category.slug}/${service.slug}/providers`)
              }
            />
          </div>

          <div className="mt-8">
            <h1 className="font-['Roboto'] text-[30px] font-bold leading-[44px] text-[#011C60] sm:text-[40px] sm:leading-[64px]">
              {provider.title}
            </h1>
            <p className="mt-2 font-['Roboto'] text-[18px] font-medium leading-7 text-[#808DAF]">
              {provider.name}
            </p>
          </div>

          <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1.1fr)_430px] xl:items-start">
            <div>
              <div className="rounded-[24px] bg-white p-4 shadow-[0px_12px_32px_rgba(190,198,222,0.25)]">
                <img
                  src={selectedImage}
                  alt={provider.title}
                  className="h-[380px] w-full rounded-[24px] object-cover"
                />

                <div className="mt-4 grid grid-cols-3 gap-4">
                  {provider.gallery.map((image, index) => (
                    <button
                      key={`${provider.id}-gallery-${index + 1}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`overflow-hidden rounded-[18px] border-2 transition ${
                        selectedImage === image
                          ? "border-[#EECE42]"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${provider.title} view ${index + 1}`}
                        className="h-28 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2">
                  <StarIcon className="h-5 w-5" />
                  <span className="font-['Roboto'] text-[20px] font-semibold text-[#011C60]">
                    {provider.rating.toFixed(1)}
                  </span>
                  <span className="font-['Roboto'] text-[16px] leading-6 text-[#808DAF]">
                    ({formatReviewCount(provider.reviewCount)})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <LocationIcon className="h-5 w-5" />
                  <span className="font-['Roboto'] text-[16px] leading-6 text-[#808DAF]">
                    {provider.location}
                  </span>
                </div>
              </div>

              <p className="mt-6 max-w-3xl font-['Roboto'] text-[18px] leading-8 text-[#6777A0]">
                {provider.shortDescription}
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <div className="rounded-2xl bg-white px-5 py-4 shadow-[0px_8px_18px_rgba(190,198,222,0.22)]">
                  <p className="font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                    {provider.experienceLabel}
                  </p>
                  <p className="mt-1 font-['Roboto'] text-[12px] text-[#808DAF]">
                    Trusted local support
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-5 py-4 shadow-[0px_8px_18px_rgba(190,198,222,0.22)]">
                  <p className="font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                    Service Area
                  </p>
                  <p className="mt-1 font-['Roboto'] text-[12px] text-[#808DAF]">
                    {provider.serviceArea}
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <h2 className="font-['Roboto'] text-[28px] font-semibold leading-10 text-[#011C60]">
                  Long Description
                </h2>

                <div className="mt-5 space-y-5">
                  {provider.longDescription.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="font-['Roboto'] text-[17px] leading-8 text-[#6777A0]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-6">
                  <p className="font-['Roboto'] text-[18px] font-semibold text-[#011C60]">
                    We focus on:
                  </p>
                  <ul className="mt-4 space-y-3">
                    {provider.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="font-['Roboto'] text-[17px] leading-8 text-[#6777A0]"
                      >
                        {`- ${highlight}`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="xl:sticky xl:top-28">
              <div className="rounded-[24px] bg-white p-5 shadow-[0px_12px_32px_rgba(190,198,222,0.25)]">
                <BookingPanelSection
                  title="Choose items"
                  icon={<StarIcon className="h-5 w-5" />}
                  isOpen={isItemsOpen}
                  onToggle={() => setIsItemsOpen((current) => !current)}
                >
                  <div className="space-y-3">
                    {provider.items.map((item) => {
                      const quantity = itemQuantities[item.id] || 0;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-[0px_6px_18px_rgba(204,210,223,0.28)]"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E6E8EF] font-['Roboto'] text-sm font-semibold text-[#011C60]">
                              {item.name.charAt(0)}
                            </span>

                            <div>
                              <p className="font-['Roboto'] text-[16px] font-semibold text-[#011C60]">
                                {item.name}
                              </p>
                              <p className="font-['Roboto'] text-[13px] text-[#808DAF]">
                                {formatCurrency(item.price)} / {item.unit}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 rounded-full border border-[#D8DDEB] bg-[#F8F9FC] px-2 py-1">
                            <button
                              type="button"
                              onClick={() => changeQuantity(item.id, -1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#011C60] shadow-[0px_4px_10px_rgba(204,210,223,0.35)] transition hover:bg-[#EECE42] hover:shadow-[0px_8px_16px_rgba(238,206,66,0.24)]"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeQuantity(item.id, 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#011C60] shadow-[0px_4px_10px_rgba(204,210,223,0.35)] transition hover:bg-[#EECE42] hover:shadow-[0px_8px_16px_rgba(238,206,66,0.24)]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-xl bg-white px-4 py-3 shadow-[0px_6px_18px_rgba(204,210,223,0.22)]">
                    <p className="font-['Roboto'] text-[15px] text-[#808DAF]">
                      Total Price
                    </p>
                    <p className="mt-1 font-['Roboto'] text-[24px] font-semibold text-[#011C60]">
                      {formatCurrency(totalPrice)}
                    </p>
                  </div>
                </BookingPanelSection>

                <div className="mt-4">
                  <BookingPanelSection
                    title="Select Date"
                    icon={<CalendarIcon className="h-5 w-5" />}
                    isOpen={isDateOpen}
                    onToggle={() => setIsDateOpen((current) => !current)}
                  >
                    <div className="rounded-[20px] bg-white p-4 shadow-[0px_10px_24px_rgba(204,210,223,0.22)]">
                      <div className="mb-4 rounded-2xl bg-[#F8F9FC] px-4 py-3">
                        <p className="font-['Roboto'] text-[12px] font-medium uppercase tracking-[0.08em] text-[#808DAF]">
                          Selected date
                        </p>
                        <p className="mt-1 font-['Roboto'] text-[18px] font-semibold text-[#011C60]">
                          {formatBookingDate(selectedDate)}
                        </p>
                      </div>

                      <CallyDatePicker
                        value={selectedDate}
                        min={getTodayInputValue()}
                        onChange={setSelectedDate}
                      />
                    </div>
                  </BookingPanelSection>
                </div>

                <div className="mt-4">
                  <BookingPanelSection
                    title="Select Time"
                    icon={<ClockIcon className="h-5 w-5" />}
                    isOpen={isTimeOpen}
                    onToggle={() => setIsTimeOpen((current) => !current)}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {provider.timeSlots.map((timeSlot) => (
                        <button
                          key={timeSlot}
                          type="button"
                          onClick={() => setSelectedTime(timeSlot)}
                          className={`rounded-xl border px-3 py-3 font-['Roboto'] text-[14px] font-medium transition ${
                            selectedTime === timeSlot
                              ? "border-[#011C60] bg-[#011C60] text-white shadow-[0px_14px_28px_rgba(1,28,96,0.18)]"
                              : "border-[#D8DDEB] bg-white text-[#011C60] hover:-translate-y-0.5 hover:bg-[#F5F7FC] hover:shadow-[0px_12px_22px_rgba(204,210,223,0.24)]"
                          }`}
                        >
                          {timeSlot}
                        </button>
                      ))}
                    </div>
                  </BookingPanelSection>
                </div>

                {!canBook && (
                  <p className="mt-4 font-['Roboto'] text-[14px] leading-6 text-[#808DAF]">
                    Choose at least one item, a date, and a time before booking.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => canBook && setIsConfirmModalOpen(true)}
                  disabled={!canBook}
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#011C60] font-['Roboto'] text-[16px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#02237a] hover:shadow-[0px_16px_32px_rgba(1,28,96,0.24)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isConfirmModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#011C60]/45 px-4 py-8"
          onClick={() => setIsConfirmModalOpen(false)}
        >
          <div
            className="w-full max-w-[813px] rounded-2xl bg-white p-6 shadow-[0px_20px_50px_rgba(1,28,96,0.22)] sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-center font-['Roboto'] text-[30px] font-bold leading-[44px] text-[#011C60]">
              Confirm Booking
            </h2>

            <div className="mt-6 flex items-center gap-4 rounded-2xl bg-[#F4F7FC] p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#011C60] font-['Roboto'] text-[24px] font-semibold text-white">
                {profileDetails.avatarInitial}
              </div>

              <div>
                <p className="font-['Roboto'] text-[24px] font-semibold leading-8 text-[#011C60]">
                  {profileDetails.fullName || "User"}
                </p>
                <p className="mt-1 font-['Roboto'] text-[14px] leading-6 text-[#808DAF]">
                  Booking with {provider.name}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#E6E8EF] p-5 shadow-[0px_8px_22px_rgba(204,210,223,0.25)]">
              <div className="space-y-6">
                <DetailRow
                  icon={<CalendarIcon className="h-5 w-5" />}
                  label="Date & Time"
                  value={formatBookingDate(selectedDate)}
                  helper={selectedTime}
                />

                <DetailRow
                  icon={<LocationIcon className="h-5 w-5" />}
                  label="Address"
                  value={bookingLocation}
                  helper="Saved account location"
                />

                <DetailRow
                  icon={<StarIcon className="h-5 w-5" />}
                  label="Service Type"
                  value={service.title}
                  helper={selectedItemsSummary}
                />

                <DetailRow
                  icon={<ClockIcon className="h-5 w-5" />}
                  label="Fees"
                  value={formatCurrency(totalPrice)}
                  helper={`${selectedItems.length} selected item(s)`}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={confirmBooking}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#011C60] font-['Roboto'] text-[16px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#02237a] hover:shadow-[0px_16px_32px_rgba(1,28,96,0.24)]"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#011C60]/45 px-4"
          onClick={() => setIsSuccessModalOpen(false)}
        >
          <div
            className="w-full max-w-[513px] rounded-2xl bg-white p-6 text-center shadow-[0px_20px_50px_rgba(1,28,96,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={bookingSuccessImage}
              alt="Booking confirmed"
              className="mx-auto h-40 w-40 object-contain"
            />
            <p className="mt-4 font-['Roboto'] text-[30px] font-bold leading-[44px] text-[#011C60]">
              Your booking has been confirmed successfully
            </p>
            <button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className="mt-6 rounded-xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#02237a] hover:shadow-[0px_16px_32px_rgba(1,28,96,0.24)]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
