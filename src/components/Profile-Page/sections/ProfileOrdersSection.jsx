import { useEffect, useMemo, useState } from "react";

import { getStoredAppointmentBookings } from "../../../utils/appointments/appointmentUtils";

const formatDateTime = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatTime = (value) => String(value || "").slice(0, 5) || "Not set";

const JsonBlock = ({ title, data }) => {
  if (data === undefined || data === null || data === "") return null;

  return (
    <details className="rounded-[10px] border border-[#E6E8EF] bg-[#F8F9FC] px-4 py-3">
      <summary className="cursor-pointer font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
        {title}
      </summary>
      <pre className="mt-3 max-h-[260px] overflow-auto whitespace-pre-wrap break-words rounded-[8px] bg-white p-3 font-mono text-[11px] leading-5 text-[#4D6090]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
};

export default function ProfileOrdersSection() {
  const [bookings, setBookings] = useState([]);

  const loadBookings = () => {
    setBookings(getStoredAppointmentBookings());
  };

  useEffect(() => {
    loadBookings();

    const handleStorage = (event) => {
      if (!event.key || event.key === "serviceBookings") {
        loadBookings();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort(
        (first, second) =>
          new Date(second.createdAt || 0).getTime() -
          new Date(first.createdAt || 0).getTime()
      ),
    [bookings]
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-['Roboto'] text-[30px] font-semibold leading-10 text-[#011C60]">
          My Order
        </h1>
        <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
          Confirmed service and package appointments from the booking flow.
        </p>
      </div>

      {sortedBookings.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[#CCD2DF] bg-white px-6 py-12 text-center">
          <h2 className="font-['Roboto'] text-[22px] font-semibold text-[#011C60]">
            No bookings yet
          </h2>
          <p className="mx-auto mt-2 max-w-[520px] font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
            Your confirmed service and package appointments will appear here
            after booking.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {sortedBookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-[14px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_10px_28px_rgba(1,28,96,0.08)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-[#E6E8EF] px-3 py-1 font-['Roboto'] text-[12px] font-semibold uppercase tracking-wide text-[#4D6090]">
                    {booking.mode === "package" ? "Package" : "Service"}
                  </span>
                  <h2 className="mt-3 font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60]">
                    {booking.mode === "package"
                      ? booking.packageName || booking.serviceName
                      : booking.serviceName}
                  </h2>
                  <p className="mt-1 font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
                    Provider: {booking.providerName || "Not available"}
                  </p>
                </div>

                <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3 text-left lg:text-right">
                  <p className="font-['Roboto'] text-[12px] font-semibold uppercase text-[#808DAF]">
                    Status
                  </p>
                  <p className="font-['Roboto'] text-[16px] font-semibold text-[#011C60]">
                    {booking.status || "Booked"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3">
                  <p className="font-['Roboto'] text-[12px] font-semibold uppercase text-[#808DAF]">
                    Date
                  </p>
                  <p className="mt-1 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                    {booking.date || "Not set"}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3">
                  <p className="font-['Roboto'] text-[12px] font-semibold uppercase text-[#808DAF]">
                    Time
                  </p>
                  <p className="mt-1 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                    {formatTime(booking.from)} - {formatTime(booking.to)}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3">
                  <p className="font-['Roboto'] text-[12px] font-semibold uppercase text-[#808DAF]">
                    Total
                  </p>
                  <p className="mt-1 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                    {booking.total ?? 0} {booking.currency || "EGP"}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3">
                  <p className="font-['Roboto'] text-[12px] font-semibold uppercase text-[#808DAF]">
                    Created
                  </p>
                  <p className="mt-1 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                    {formatDateTime(booking.createdAt)}
                  </p>
                </div>
              </div>

              {Array.isArray(booking.schedule) && booking.schedule.length > 0 && (
                <div className="mt-5 rounded-[10px] border border-[#E6E8EF] px-4 py-3">
                  <p className="font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
                    Schedule
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {booking.schedule.map((item, index) => (
                      <span
                        key={`${booking.id}-schedule-${index}`}
                        className="rounded-[8px] bg-[#F3F5FA] px-3 py-1.5 font-['Roboto'] text-[12px] font-semibold text-[#4D6090]"
                      >
                        {item.date || item.label || item.key}:{" "}
                        {formatTime(item.from)} - {formatTime(item.to)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(booking.items) && booking.items.length > 0 && (
                <div className="mt-5 rounded-[10px] border border-[#E6E8EF] px-4 py-3">
                  <p className="font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
                    Items
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {booking.items.map((item) => (
                      <span
                        key={`${booking.id}-${item.id || item.name}`}
                        className="rounded-[8px] bg-[#F3F5FA] px-3 py-1.5 font-['Roboto'] text-[12px] font-semibold text-[#4D6090]"
                      >
                        {item.name} x{item.quantity || 1}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-3 xl:grid-cols-2">
                <JsonBlock
                  title="Appointment request"
                  data={booking.appointmentRequest || booking.appointmentRequests}
                />
                <JsonBlock
                  title="Appointment response"
                  data={booking.appointmentResponse || booking.appointmentResponses}
                />
                <JsonBlock
                  title="Availability response"
                  data={booking.availabilityResponse || booking.availabilityResponses}
                />
                <JsonBlock title="Full booking data" data={booking} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
