import { useEffect, useMemo, useState } from "react";

import {
  getMyAppointments,
  getMyPackages,
  getMyServices,
} from "../../../api/services/service.api.js";
import {
  extractApiArray,
  extractTotalPages,
  formatServicePrice,
  getApiErrorMessage,
} from "../../../pages/service/serviceApiMappers.js";

const SERVICES_PAGE_SIZE = 50;
const APPOINTMENTS_PAGE_SIZE = 100;
const MAX_PAGES_TO_LOAD = 20;
const CHART_MONTH_COUNT = 6;

const normalizeKey = (key) =>
  String(key || "")
    .trim()
    .replace(/[\s_-]+/g, "")
    .toLowerCase();

const normalizeLookupValue = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizeName = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
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

const getObjectByKeys = (source, keys) => {
  const value = getValueByKeys(source, keys);

  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
};

const firstPresentValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const toNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const getArrayByKeys = (source, keys) => {
  for (const key of keys) {
    const value = getValueByKeys(source, [key]);

    if (Array.isArray(value)) return value;
  }

  return [];
};

const getItemsTotal = (source) => {
  const items = getArrayByKeys(source, [
    "items",
    "serviceItems",
    "appointmentItems",
    "itemDtos",
    "itemDTOs",
  ]);

  return items.reduce((sum, item) => {
    const price = toNumber(
      firstPresentValue(
        getValueByKeys(item, [
          "totalPrice",
          "price",
          "itemPrice",
          "serviceItemPrice",
          "servicePrice",
          "amount",
        ]),
        0
      )
    );
    const quantity = toNumber(
      firstPresentValue(getValueByKeys(item, ["quantity", "count"]), 1)
    );

    return sum + price * Math.max(1, quantity || 1);
  }, 0);
};

const getServiceLookupKeys = (service) => {
  const nestedService = getObjectByKeys(service, [
    "service",
    "serviceDto",
    "serviceDTO",
  ]);

  return [
    getValueByKeys(service, [
      "serviceId",
      "serviceID",
      "id",
      "providerServiceId",
      "providerServiceID",
    ]),
    getValueByKeys(nestedService, [
      "serviceId",
      "serviceID",
      "id",
      "providerServiceId",
      "providerServiceID",
    ]),
  ]
    .flat()
    .map(normalizeLookupValue)
    .filter(Boolean);
};

const getServiceName = (service) => {
  const nestedService = getObjectByKeys(service, [
    "service",
    "serviceDto",
    "serviceDTO",
  ]);

  return (
    firstPresentValue(
      getValueByKeys(service, ["serviceName", "name", "title"]),
      getValueByKeys(nestedService, ["serviceName", "name", "title"])
    ) || "Service"
  );
};

const getServiceCurrency = (service) =>
  firstPresentValue(
    getValueByKeys(service, ["serviceCurrency", "currency"]),
    getValueByKeys(getObjectByKeys(service, ["service"]), [
      "serviceCurrency",
      "currency",
    ]),
    "EGP"
  );

const getServicePrice = (service) => {
  const nestedService = getObjectByKeys(service, [
    "service",
    "serviceDto",
    "serviceDTO",
  ]);
  const directPrice = toNumber(
    firstPresentValue(
      getValueByKeys(service, [
        "servicePrice",
        "price",
        "totalPrice",
        "itemsPrice",
        "amount",
      ]),
      getValueByKeys(nestedService, [
        "servicePrice",
        "price",
        "totalPrice",
        "itemsPrice",
        "amount",
      ])
    )
  );

  return directPrice || getItemsTotal(service) || getItemsTotal(nestedService);
};

const normalizeProviderService = (service, index) => {
  const lookupKeys = [...new Set(getServiceLookupKeys(service))];
  const entityId = lookupKeys[0] || `service-${index + 1}`;
  const name = getServiceName(service);

  return {
    id: `service:${entityId}`,
    entityId,
    type: "service",
    typeLabel: "Created Service",
    priceLabel: "Service price",
    lookupKeys,
    name,
    nameKey: normalizeName(name),
    price: getServicePrice(service),
    currency: getServiceCurrency(service),
  };
};

const getPackagePayload = (packageItem) => {
  const nestedPackage = getObjectByKeys(packageItem, [
    "package",
    "packageDto",
    "packageDTO",
    "packageDetails",
  ]);

  return Object.keys(nestedPackage).length > 0
    ? { ...packageItem, ...nestedPackage }
    : packageItem;
};

const getServiceNameObjectValue = (source, keys) => {
  const value = getValueByKeys(source, keys);

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return firstPresentValue(
    getValueByKeys(value, ["name", "serviceName", "title"]),
    getValueByKeys(value, ["label"])
  );
};

const getPackageLookupKeys = (packageItem) => {
  const packagePayload = getPackagePayload(packageItem || {});

  return [
    getValueByKeys(packagePayload, [
      "id",
      "packageId",
      "packageID",
      "providerPackageId",
      "providerPackageID",
    ]),
  ]
    .flat()
    .map(normalizeLookupValue)
    .filter(Boolean);
};

const getPackageName = (packageItem) => {
  const packagePayload = getPackagePayload(packageItem || {});

  return (
    firstPresentValue(
      getValueByKeys(packagePayload, ["packageName", "name", "title"]),
      typeof getValueByKeys(packagePayload, ["serviceName"]) === "string"
        ? getValueByKeys(packagePayload, ["serviceName"])
        : undefined,
      getServiceNameObjectValue(packagePayload, [
        "serviceName",
        "serviceNameDto",
        "serviceNameDTO",
      ]),
      getValueByKeys(getObjectByKeys(packagePayload, ["service"]), [
        "serviceName",
        "name",
        "title",
      ])
    ) || "Service Package"
  );
};

const getPackageCurrency = (packageItem) => {
  const packagePayload = getPackagePayload(packageItem || {});

  return firstPresentValue(
    getValueByKeys(packagePayload, ["currency", "packageCurrency"]),
    "EGP"
  );
};

const getPackagePrice = (packageItem) => {
  const packagePayload = getPackagePayload(packageItem || {});
  const directPrice = toNumber(
    firstPresentValue(
      getValueByKeys(packagePayload, [
        "servicePrice",
        "price",
        "packagePrice",
        "totalPrice",
        "amount",
      ])
    )
  );

  return directPrice || getItemsTotal(packagePayload);
};

const getPackageMetaLabel = (packageItem) => {
  const packagePayload = getPackagePayload(packageItem || {});
  const recurrence = firstPresentValue(
    getValueByKeys(packagePayload, ["recurrence", "pricingType"]),
    ""
  );
  const daysPerInterval = firstPresentValue(
    getValueByKeys(packagePayload, ["daysPerInterval", "times"]),
    ""
  );

  return [recurrence, daysPerInterval ? `${daysPerInterval} days` : ""]
    .filter(Boolean)
    .join(" / ");
};

const normalizeProviderPackage = (packageItem, index) => {
  const lookupKeys = [...new Set(getPackageLookupKeys(packageItem))];
  const entityId = lookupKeys[0] || `package-${index + 1}`;
  const name = getPackageName(packageItem);

  return {
    id: `package:${entityId}`,
    entityId,
    type: "package",
    typeLabel: "Created Package",
    priceLabel: "Package price",
    lookupKeys,
    name,
    nameKey: normalizeName(name),
    price: getPackagePrice(packageItem),
    currency: getPackageCurrency(packageItem),
    metaLabel: getPackageMetaLabel(packageItem),
  };
};

const getAppointmentServiceLookupKeys = (appointment) => {
  const service = getObjectByKeys(appointment, [
    "service",
    "serviceDto",
    "serviceDTO",
  ]);
  const packageItem = getObjectByKeys(appointment, [
    "package",
    "packageDto",
    "packageDTO",
  ]);

  return [
    getValueByKeys(appointment, [
      "serviceId",
      "serviceID",
      "providerServiceId",
      "providerServiceID",
      "serviceProviderId",
    ]),
    getValueByKeys(service, [
      "serviceId",
      "serviceID",
      "id",
      "providerServiceId",
      "providerServiceID",
    ]),
    getValueByKeys(packageItem, [
      "serviceId",
      "serviceID",
      "providerServiceId",
      "providerServiceID",
    ]),
  ]
    .flat()
    .map(normalizeLookupValue)
    .filter(Boolean);
};

const getAppointmentServiceName = (appointment) => {
  const service = getObjectByKeys(appointment, [
    "service",
    "serviceDto",
    "serviceDTO",
  ]);

  return firstPresentValue(
    getValueByKeys(appointment, ["serviceName", "name", "title"]),
    getValueByKeys(service, ["serviceName", "name", "title"])
  );
};

const getAppointmentPackage = (appointment) =>
  getObjectByKeys(appointment, [
    "package",
    "packageDto",
    "packageDTO",
    "packageDetails",
  ]);

const getAppointmentPackageLookupKeys = (appointment) => {
  const packageItem = getAppointmentPackage(appointment);

  return [
    getValueByKeys(appointment, [
      "packageId",
      "packageID",
      "providerPackageId",
      "providerPackageID",
      "appointmentPackageId",
    ]),
    getValueByKeys(packageItem, [
      "id",
      "packageId",
      "packageID",
      "providerPackageId",
      "providerPackageID",
    ]),
  ]
    .flat()
    .map(normalizeLookupValue)
    .filter(Boolean);
};

const getAppointmentPackageName = (appointment) => {
  const packageItem = getAppointmentPackage(appointment);

  return firstPresentValue(
    getValueByKeys(appointment, ["packageName"]),
    getValueByKeys(packageItem, ["packageName", "name", "title"]),
    typeof getValueByKeys(packageItem, ["serviceName"]) === "string"
      ? getValueByKeys(packageItem, ["serviceName"])
      : undefined,
    getServiceNameObjectValue(packageItem, [
      "serviceName",
      "serviceNameDto",
      "serviceNameDTO",
    ])
  );
};

const hasAppointmentPackageSignal = (appointment) =>
  getAppointmentPackageLookupKeys(appointment).length > 0 ||
  Boolean(getAppointmentPackageName(appointment)) ||
  ["package", "subscription", "recurring"].some((value) =>
    normalizeLookupValue(
      firstPresentValue(
        getValueByKeys(appointment, ["mode", "type", "appointmentType"]),
        getValueByKeys(getAppointmentPackage(appointment), ["type"])
      )
    ).includes(value)
  );

const getAppointmentCustomerKey = (appointment, index) => {
  const customer = getObjectByKeys(appointment, [
    "customer",
    "client",
    "user",
    "bookedBy",
  ]);
  const directKey = firstPresentValue(
    getValueByKeys(appointment, [
      "customerId",
      "clientId",
      "userId",
      "bookedById",
      "createdById",
      "customerEmail",
      "clientEmail",
      "customerPhone",
      "phoneNumber",
    ]),
    getValueByKeys(customer, [
      "id",
      "customerId",
      "clientId",
      "userId",
      "email",
      "phoneNumber",
      "phone",
    ])
  );

  return (
    normalizeLookupValue(directKey) ||
    normalizeLookupValue(
      getValueByKeys(appointment, ["id", "appointmentId", "bookingId"])
    ) ||
    `appointment-${index + 1}`
  );
};

const getAppointmentStatus = (appointment) =>
  firstPresentValue(
    getValueByKeys(appointment, ["status", "appointmentStatus", "state"]),
    ""
  );

const isCancelledAppointment = (appointment) => {
  const status = normalizeLookupValue(getAppointmentStatus(appointment));

  return [
    "cancelled",
    "canceled",
    "rejected",
    "declined",
    "failed",
    "refunded",
  ].some((cancelledStatus) => status.includes(cancelledStatus));
};

const getAppointmentDate = (appointment) => {
  const value = firstPresentValue(
    getValueByKeys(appointment, [
      "date",
      "appointmentDate",
      "day",
      "createdAt",
      "createdOn",
      "creationTime",
      "bookedAt",
    ]),
    getValueByKeys(getObjectByKeys(appointment, ["service"]), [
      "date",
      "appointmentDate",
    ])
  );
  const date = new Date(value || Date.now());

  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const getAppointmentAmount = (appointment, servicePrice) => {
  const service = getObjectByKeys(appointment, [
    "service",
    "serviceDto",
    "serviceDTO",
  ]);
  const packageItem = getObjectByKeys(appointment, [
    "package",
    "packageDto",
    "packageDTO",
  ]);
  const directAmount = toNumber(
    firstPresentValue(
      getValueByKeys(appointment, [
        "totalPrice",
        "total",
        "price",
        "amount",
        "paidAmount",
        "paymentAmount",
        "servicePrice",
      ]),
      getValueByKeys(service, [
        "totalPrice",
        "total",
        "price",
        "amount",
        "servicePrice",
      ]),
      getValueByKeys(packageItem, [
        "totalPrice",
        "total",
        "price",
        "amount",
        "servicePrice",
      ])
    )
  );

  return (
    directAmount ||
    getItemsTotal(appointment) ||
    getItemsTotal(service) ||
    toNumber(servicePrice)
  );
};

const getMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getChartMonths = () => {
  const now = new Date();

  return Array.from({ length: CHART_MONTH_COUNT }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);

    return {
      key: getMonthKey(date),
      label: new Intl.DateTimeFormat("en-US", {
        month: "short",
      }).format(date),
    };
  }).reverse();
};

const formatCompactMoney = (value, currency = "EGP") =>
  `${new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0)} ${currency === "EGY" ? "EGP" : currency || "EGP"}`;

const fetchAllPages = async (request, params, pageSize) => {
  const firstResponse = await request({
    page: 1,
    pageSize,
    language: "en",
    ...params,
  });
  const firstItems = extractApiArray(firstResponse);
  const totalPages = Math.min(extractTotalPages(firstResponse), MAX_PAGES_TO_LOAD);

  if (totalPages <= 1) return firstItems;

  const restResponses = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      request({
        page: index + 2,
        pageSize,
        language: "en",
        ...params,
      })
    )
  );

  return restResponses.reduce(
    (items, response) => [...items, ...extractApiArray(response)],
    firstItems
  );
};

const buildIncomeModel = (serviceItems, packageItems, appointmentItems) => {
  const services = serviceItems.map(normalizeProviderService);
  const packages = packageItems.map(normalizeProviderPackage);
  const offers = [...services, ...packages];
  const serviceIdByLookup = new Map();
  const serviceIdByName = new Map();
  const packageIdByLookup = new Map();
  const packageIdByName = new Map();
  const chartMonths = getChartMonths();
  const chartMonthKeys = new Set(chartMonths.map((month) => month.key));
  const metricsByOfferId = new Map();

  services.forEach((service) => {
    service.lookupKeys.forEach((key) => serviceIdByLookup.set(key, service.id));

    if (service.nameKey) {
      serviceIdByName.set(service.nameKey, service.id);
    }
  });

  packages.forEach((packageItem) => {
    packageItem.lookupKeys.forEach((key) =>
      packageIdByLookup.set(key, packageItem.id)
    );

    if (packageItem.nameKey) {
      packageIdByName.set(packageItem.nameKey, packageItem.id);
    }
  });

  offers.forEach((offer) => {
    metricsByOfferId.set(offer.id, {
      ...offer,
      bookingCount: 0,
      customerKeys: new Set(),
      totalIncome: 0,
      monthlyIncome: Object.fromEntries(
        chartMonths.map((month) => [month.key, 0])
      ),
    });
  });

  appointmentItems.forEach((appointment, index) => {
    if (isCancelledAppointment(appointment)) return;

    const matchedPackageId =
      getAppointmentPackageLookupKeys(appointment)
        .map((key) => packageIdByLookup.get(key))
        .find(Boolean) ||
      (hasAppointmentPackageSignal(appointment)
        ? packageIdByName.get(normalizeName(getAppointmentPackageName(appointment)))
        : undefined);
    const matchedOfferId =
      matchedPackageId ||
      getAppointmentServiceLookupKeys(appointment)
        .map((key) => serviceIdByLookup.get(key))
        .find(Boolean) ||
      serviceIdByName.get(normalizeName(getAppointmentServiceName(appointment)));

    if (!matchedOfferId) return;

    const metric = metricsByOfferId.get(matchedOfferId);

    if (!metric) return;

    const amount = getAppointmentAmount(appointment, metric.price);
    const customerKey = getAppointmentCustomerKey(appointment, index);
    const monthKey = getMonthKey(getAppointmentDate(appointment));

    metric.bookingCount += 1;
    metric.totalIncome += amount;
    metric.customerKeys.add(customerKey);

    if (chartMonthKeys.has(monthKey)) {
      metric.monthlyIncome[monthKey] += amount;
    }
  });

  const offerMetrics = [...metricsByOfferId.values()]
    .map((metric) => ({
      ...metric,
      peopleCount: metric.customerKeys.size || metric.bookingCount,
      averageIncome: metric.bookingCount
        ? metric.totalIncome / metric.bookingCount
        : 0,
    }))
    .sort(
      (first, second) =>
        second.totalIncome - first.totalIncome ||
        second.bookingCount - first.bookingCount ||
        first.name.localeCompare(second.name)
    );
  const allCustomerKeys = new Set();

  offerMetrics.forEach((offer) => {
    offer.customerKeys.forEach((customerKey) => allCustomerKeys.add(customerKey));
  });

  const totalIncome = offerMetrics.reduce(
    (sum, offer) => sum + offer.totalIncome,
    0
  );
  const totalBookings = offerMetrics.reduce(
    (sum, offer) => sum + offer.bookingCount,
    0
  );
  const totalPeople = allCustomerKeys.size || totalBookings;
  const topOffer = offerMetrics.find((offer) => offer.totalIncome > 0);
  const currency =
    topOffer?.currency ||
    offerMetrics.find((offer) => offer.currency)?.currency ||
    "EGP";
  const maxOfferIncome = Math.max(
    1,
    ...offerMetrics.map((offer) => offer.totalIncome)
  );
  const monthlyIncome = chartMonths.map((month) => {
    const total = offerMetrics.reduce(
      (sum, offer) => sum + (offer.monthlyIncome[month.key] || 0),
      0
    );

    return { ...month, total };
  });
  const maxMonthlyIncome = Math.max(
    1,
    ...monthlyIncome.map((month) => month.total)
  );

  return {
    currency,
    maxMonthlyIncome,
    maxOfferIncome,
    monthlyIncome,
    offerMetrics,
    summary: {
      totalOffers: offerMetrics.length,
      totalPackages: packages.length,
      totalServices: services.length,
      totalBookings,
      totalIncome,
      totalPeople,
      topOfferName: topOffer?.name || "No bookings yet",
    },
  };
};

export default function ProfileTotalIncomeSection() {
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadIncomeData = async () => {
      try {
        setLoading(true);
        setError("");

        const [nextServices, nextPackages, nextAppointments] = await Promise.all([
          fetchAllPages(
            getMyServices,
            { isMine: true },
            SERVICES_PAGE_SIZE
          ),
          fetchAllPages(
            getMyPackages,
            { isMine: true },
            SERVICES_PAGE_SIZE
          ),
          fetchAllPages(
            getMyAppointments,
            { ByMe: false },
            APPOINTMENTS_PAGE_SIZE
          ),
        ]);

        if (isActive) {
          setServices(nextServices);
          setPackages(nextPackages);
          setAppointments(nextAppointments);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to load your income dashboard."
            )
          );
          setServices([]);
          setPackages([]);
          setAppointments([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadIncomeData();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const incomeModel = useMemo(
    () => buildIncomeModel(services, packages, appointments),
    [appointments, packages, services]
  );
  const {
    currency,
    maxMonthlyIncome,
    maxOfferIncome,
    monthlyIncome,
    offerMetrics,
    summary,
  } = incomeModel;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-['Roboto'] text-[30px] font-semibold leading-10 text-[#011C60]">
            Total Income
          </h1>
          <p className="mt-2 max-w-2xl font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
            Track bookings and income from the services and packages you created.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReloadKey((currentKey) => currentKey + 1)}
          disabled={loading}
          className="min-h-11 min-w-[120px] cursor-pointer rounded-[10px] border border-[#D7DDED] bg-white px-4 py-2 font-['Roboto'] text-[14px] font-semibold text-[#011C60] transition hover:border-[#011C60] hover:bg-[#F8F9FC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-[14px] border border-[#E6E8EF] bg-white px-6 py-12 text-center">
          <p className="font-['Roboto'] text-[15px] font-semibold text-[#6777A0]">
            Loading income dashboard...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-[14px] border border-[#F3C8C8] bg-white px-6 py-12 text-center">
          <h2 className="font-['Roboto'] text-[22px] font-semibold text-[#C83232]">
            Could not load income
          </h2>
          <p className="mx-auto mt-2 max-w-[520px] font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
            {error}
          </p>
        </div>
      ) : offerMetrics.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[#CCD2DF] bg-white px-6 py-12 text-center">
          <h2 className="font-['Roboto'] text-[22px] font-semibold text-[#011C60]">
            No services or packages created yet
          </h2>
          <p className="mx-auto mt-2 max-w-[520px] font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
            Your provider income will appear here after you create services or packages.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[14px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_10px_28px_rgba(1,28,96,0.08)]">
              <p className="font-['Roboto'] text-[13px] font-semibold text-[#808DAF]">
                Created Offers
              </p>
              <p className="mt-3 font-['Roboto'] text-[30px] font-bold leading-10 text-[#011C60]">
                {summary.totalOffers}
              </p>
              <p className="mt-1 font-['Roboto'] text-[13px] leading-5 text-[#6777A0]">
                {summary.totalServices} services / {summary.totalPackages} packages
              </p>
            </div>

            <div className="rounded-[14px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_10px_28px_rgba(1,28,96,0.08)]">
              <p className="font-['Roboto'] text-[13px] font-semibold text-[#808DAF]">
                People Booked
              </p>
              <p className="mt-3 font-['Roboto'] text-[30px] font-bold leading-10 text-[#011C60]">
                {summary.totalPeople}
              </p>
              <p className="mt-1 font-['Roboto'] text-[13px] leading-5 text-[#6777A0]">
                {summary.totalBookings} total bookings
              </p>
            </div>

            <div className="rounded-[14px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_10px_28px_rgba(1,28,96,0.08)]">
              <p className="font-['Roboto'] text-[13px] font-semibold text-[#808DAF]">
                Total Income
              </p>
              <p className="mt-3 font-['Roboto'] text-[28px] font-bold leading-10 text-[#011C60]">
                {formatServicePrice(summary.totalIncome, currency)}
              </p>
            </div>

            <div className="rounded-[14px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_10px_28px_rgba(1,28,96,0.08)]">
              <p className="font-['Roboto'] text-[13px] font-semibold text-[#808DAF]">
                Top Offer
              </p>
              <p className="mt-3 line-clamp-2 font-['Roboto'] text-[20px] font-bold leading-7 text-[#011C60]">
                {summary.topOfferName}
              </p>
            </div>
          </div>

          <article className="rounded-[14px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_10px_28px_rgba(1,28,96,0.08)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60]">
                  Income Progress
                </h2>
                <p className="font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
                  Last {CHART_MONTH_COUNT} months from provider bookings.
                </p>
              </div>
              <p className="font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                {formatServicePrice(summary.totalIncome, currency)}
              </p>
            </div>

            <div className="mt-6 overflow-x-auto pb-2">
              <div className="flex min-w-[520px] items-end gap-3">
                {monthlyIncome.map((month) => {
                  const barHeight = Math.max(
                    month.total > 0 ? 12 : 4,
                    Math.round((month.total / maxMonthlyIncome) * 100)
                  );

                  return (
                    <div
                      key={month.key}
                      className="flex min-w-[72px] flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex h-[190px] w-full items-end rounded-[12px] bg-[#F8F9FC] p-2">
                        <div
                          className="w-full rounded-[10px] bg-[#EECE42] shadow-[0px_8px_18px_rgba(238,206,66,0.35)] transition-all"
                          style={{ height: `${barHeight}%` }}
                          aria-label={`${month.label}: ${formatServicePrice(
                            month.total,
                            currency
                          )}`}
                        />
                      </div>
                      <p className="font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
                        {month.label}
                      </p>
                      <p className="font-['Roboto'] text-[12px] font-semibold text-[#6777A0]">
                        {formatCompactMoney(month.total, currency)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          <div className="grid gap-5">
            {offerMetrics.map((offer) => {
              const incomeProgress = Math.round(
                (offer.totalIncome / maxOfferIncome) * 100
              );

              return (
                <article
                  key={offer.id}
                  className="rounded-[14px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_10px_28px_rgba(1,28,96,0.08)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full bg-[#E6E8EF] px-3 py-1 font-['Roboto'] text-[12px] font-semibold text-[#4D6090]">
                        {offer.typeLabel}
                      </span>
                      <h2 className="mt-3 break-words font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60]">
                        {offer.name}
                      </h2>
                      <p className="mt-1 font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
                        {offer.priceLabel}: {formatServicePrice(offer.price, offer.currency)}
                      </p>
                      {offer.metaLabel && (
                        <p className="mt-1 font-['Roboto'] text-[13px] leading-5 text-[#6777A0]">
                          {offer.metaLabel}
                        </p>
                      )}
                    </div>

                    <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3 text-left lg:text-right">
                      <p className="font-['Roboto'] text-[12px] font-semibold text-[#808DAF]">
                        Income
                      </p>
                      <p className="font-['Roboto'] text-[18px] font-semibold text-[#011C60]">
                        {formatServicePrice(offer.totalIncome, offer.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3">
                      <p className="font-['Roboto'] text-[12px] font-semibold text-[#808DAF]">
                        People Booked
                      </p>
                      <p className="mt-1 font-['Roboto'] text-[18px] font-semibold text-[#011C60]">
                        {offer.peopleCount}
                      </p>
                    </div>
                    <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3">
                      <p className="font-['Roboto'] text-[12px] font-semibold text-[#808DAF]">
                        Bookings
                      </p>
                      <p className="mt-1 font-['Roboto'] text-[18px] font-semibold text-[#011C60]">
                        {offer.bookingCount}
                      </p>
                    </div>
                    <div className="rounded-[10px] bg-[#F8F9FC] px-4 py-3">
                      <p className="font-['Roboto'] text-[12px] font-semibold text-[#808DAF]">
                        Average Booking
                      </p>
                      <p className="mt-1 font-['Roboto'] text-[18px] font-semibold text-[#011C60]">
                        {formatServicePrice(offer.averageIncome, offer.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
                        Offer Progress
                      </p>
                      <p className="font-['Roboto'] text-[13px] font-semibold text-[#6777A0]">
                        {incomeProgress}%
                      </p>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#E6E8EF]">
                      <div
                        className="h-full rounded-full bg-[#011C60] transition-all"
                        style={{ width: `${incomeProgress}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
