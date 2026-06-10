import { useEffect, useMemo, useState } from "react";

import { getMyAppointments } from "../../../api/services/service.api.js";
import { getApiErrorMessage } from "../../../pages/service/serviceApiMappers.js";

const ORDERS_PAGE_SIZE = 50;

const normalizeKey = (key) =>
  String(key || "")
    .trim()
    .replace(/[\s_-]+/g, "")
    .toLowerCase();

const getValueByKeys = (source, keys) => {
  if (!source || typeof source !== "object") return undefined;

  const normalizedKeys = keys.map(normalizeKey);

  for (const [key, value] of Object.entries(source)) {
    if (normalizedKeys.includes(normalizeKey(key))) {
      return value;
    }
  }

  return undefined;
};

const firstPresentValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const extractApiArray = (payload) => {
  const data = payload?.data ?? payload;

  if (Array.isArray(data)) return data;

  const candidates = [
    data?.items,
    data?.appointments,
    data?.results,
    data?.result,
    data?.data,
    payload?.items,
    payload?.appointments,
    payload?.results,
    payload?.result,
  ];

  return candidates.find(Array.isArray) || [];
};

const formatDate = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

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

const formatMoney = (amount, currency = "EGP") => {
  if (amount === undefined || amount === null || amount === "") {
    return "Not available";
  }

  return `${new Intl.NumberFormat("en-US").format(Number(amount) || 0)} ${
    currency === "EGY" ? "EGP" : currency || "EGP"
  }`;
};

const getSortableTime = (value) => {
  const time = new Date(value || 0).getTime();

  return Number.isNaN(time) ? 0 : time;
};

const normalizeAppointmentItems = (appointment) => {
  const items =
    appointment.items ||
    appointment.Items ||
    appointment.appointmentItems ||
    appointment.serviceItems ||
    appointment.service?.items ||
    appointment.package?.items ||
    [];

  return Array.isArray(items)
    ? items
        .map((item, index) => ({
          id: item.id || item.itemId || item.serviceItemId || `item-${index + 1}`,
          name:
            item.name ||
            item.itemName ||
            item.serviceItemName ||
            item.title ||
            "Service item",
          quantity: item.quantity || item.count || 1,
        }))
        .filter((item) => item.name)
    : [];
};

const normalizeAppointment = (appointment, index) => {
  const service = appointment.service || appointment.Service || {};
  const packageItem = appointment.package || appointment.Package || {};
  const provider = appointment.provider || appointment.Provider || {};
  const date = firstPresentValue(
    getValueByKeys(appointment, ["date", "appointmentDate", "day"]),
    getValueByKeys(service, ["date", "appointmentDate"]),
    getValueByKeys(packageItem, ["date", "appointmentDate"])
  );
  const from = firstPresentValue(
    getValueByKeys(appointment, ["from", "fromTime", "start", "startTime"]),
    getValueByKeys(service, ["from", "fromTime", "start", "startTime"])
  );
  const to = firstPresentValue(
    getValueByKeys(appointment, ["to", "toTime", "end", "endTime"]),
    getValueByKeys(service, ["to", "toTime", "end", "endTime"])
  );
  const serviceName = firstPresentValue(
    getValueByKeys(appointment, ["serviceName", "name", "title"]),
    getValueByKeys(service, ["serviceName", "name", "title"]),
    getValueByKeys(packageItem, ["packageName", "name", "title"])
  );
  const providerName = firstPresentValue(
    getValueByKeys(appointment, [
      "providerName",
      "partnerName",
      "signatoryName",
      "companyName",
    ]),
    getValueByKeys(provider, ["name", "fullName", "providerName"]),
    getValueByKeys(service, ["providerName", "partnerName", "signatoryName"])
  );
  const total = firstPresentValue(
    getValueByKeys(appointment, ["totalPrice", "total", "price", "amount"]),
    getValueByKeys(service, ["totalPrice", "price"]),
    getValueByKeys(packageItem, ["totalPrice", "price"])
  );
  const status =
    getValueByKeys(appointment, ["status", "appointmentStatus", "state"]) ||
    "Not available";
  const createdAt = firstPresentValue(
    getValueByKeys(appointment, ["createdAt", "createdOn", "creationTime"]),
    getValueByKeys(appointment, ["updatedAt", "modifiedOn"])
  );
  const currency = firstPresentValue(
    getValueByKeys(appointment, ["currency"]),
    getValueByKeys(service, ["currency", "serviceCurrency"]),
    getValueByKeys(packageItem, ["currency"]),
    "EGP"
  );

  return {
    id:
      appointment.id ||
      appointment.appointmentId ||
      appointment.appointmentID ||
      `${date || "appointment"}-${from || index}`,
    serviceName: serviceName || "Appointment",
    providerName: providerName || "Not available",
    status,
    date,
    from,
    to,
    total,
    currency,
    createdAt,
    items: normalizeAppointmentItems(appointment),
  };
};

export default function ProfileOrdersSection() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyAppointments({
        page: 1,
        pageSize: ORDERS_PAGE_SIZE,
        language: "en",
        ByMe: true,
      });

      setAppointments(extractApiArray(response));
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Unable to load your appointments.")
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyAppointments({
          page: 1,
          pageSize: ORDERS_PAGE_SIZE,
          language: "en",
          ByMe: true,
        });

        if (isActive) {
          setAppointments(extractApiArray(response));
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            getApiErrorMessage(requestError, "Unable to load your appointments.")
          );
          setAppointments([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchAppointments();

    return () => {
      isActive = false;
    };
  }, []);

  const sortedAppointments = useMemo(
    () =>
      appointments
        .map(normalizeAppointment)
        .sort(
          (first, second) =>
            getSortableTime(second.createdAt) - getSortableTime(first.createdAt)
        ),
    [appointments]
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-['Roboto'] text-[30px] font-semibold leading-10 text-[#011C60]">
            My Orders
          </h1>
          <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
            Your booked service appointments from your account.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAppointments}
          disabled={loading}
          className="min-h-11 min-w-[120px] cursor-pointer rounded-[10px] border border-[#D7DDED] bg-white px-4 py-2 font-['Roboto'] text-[14px] font-semibold text-[#011C60] transition hover:border-[#011C60] hover:bg-[#F8F9FC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-[14px] border border-[#E6E8EF] bg-white px-6 py-12 text-center">
          <p className="font-['Roboto'] text-[15px] font-semibold text-[#6777A0]">
            Loading appointments...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-[14px] border border-[#F3C8C8] bg-white px-6 py-12 text-center">
          <h2 className="font-['Roboto'] text-[22px] font-semibold text-[#C83232]">
            Could not load orders
          </h2>
          <p className="mx-auto mt-2 max-w-[520px] font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
            {error}
          </p>
        </div>
      ) : sortedAppointments.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[#CCD2DF] bg-white px-6 py-12 text-center">
          <h2 className="font-['Roboto'] text-[22px] font-semibold text-[#011C60]">
            No orders yet
          </h2>
          <p className="mx-auto mt-2 max-w-[520px] font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
            Your booked appointments will appear here after you make an order.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {sortedAppointments.map((appointment) => (
            <article
              key={appointment.id}
              className="rounded-[14px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_10px_28px_rgba(1,28,96,0.08)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-[#E6E8EF] px-3 py-1 font-['Roboto'] text-[12px] font-semibold uppercase tracking-wide text-[#4D6090]">
                    Appointment
                  </span>
                  <h2 className="mt-3 font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60]">
                    {appointment.serviceName}
                  </h2>
                  <p className="mt-1 font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
                    Provider: {appointment.providerName}
                  </p>
                </div>

                <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3 text-left lg:text-right">
                  <p className="font-['Roboto'] text-[12px] font-semibold uppercase text-[#808DAF]">
                    Status
                  </p>
                  <p className="font-['Roboto'] text-[16px] font-semibold text-[#011C60]">
                    {appointment.status}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3">
                  <p className="font-['Roboto'] text-[12px] font-semibold uppercase text-[#808DAF]">
                    Date
                  </p>
                  <p className="mt-1 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                    {formatDate(appointment.date)}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3">
                  <p className="font-['Roboto'] text-[12px] font-semibold uppercase text-[#808DAF]">
                    Time
                  </p>
                  <p className="mt-1 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                    {formatTime(appointment.from)} - {formatTime(appointment.to)}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3">
                  <p className="font-['Roboto'] text-[12px] font-semibold uppercase text-[#808DAF]">
                    Total
                  </p>
                  <p className="mt-1 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                    {formatMoney(appointment.total, appointment.currency)}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3">
                  <p className="font-['Roboto'] text-[12px] font-semibold uppercase text-[#808DAF]">
                    Created
                  </p>
                  <p className="mt-1 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                    {formatDateTime(appointment.createdAt)}
                  </p>
                </div>
              </div>

              {appointment.items.length > 0 && (
                <div className="mt-5 rounded-[10px] border border-[#E6E8EF] px-4 py-3">
                  <p className="font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
                    Items
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {appointment.items.map((item) => (
                      <span
                        key={`${appointment.id}-${item.id}`}
                        className="rounded-[8px] bg-[#F3F5FA] px-3 py-1.5 font-['Roboto'] text-[12px] font-semibold text-[#4D6090]"
                      >
                        {item.name} x{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
