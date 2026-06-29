import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPackages } from "../../api/services/service.api";
import oneTimeServiceImage from "../../assets/images/service/add-service/add-service-flow.png";
import packageServiceImage from "../../assets/images/service/add-service/add-package-flow.png";
import FlowBackButton from "../common/FlowBackButton";
import SectionHeader from "./SectionHeader";
import { serviceCategories } from "./servicePageData";

const PACKAGE_PAGE_SIZE = 8;

const extractPayloadData = (payload) => payload?.data ?? payload;

const extractList = (payload) => {
  const data = extractPayloadData(payload);

  if (Array.isArray(data)) return data;

  return (
    [
      data?.packages,
      data?.items,
      data?.results,
      data?.result,
      data?.data,
      payload?.packages,
      payload?.items,
      payload?.results,
    ].find(Array.isArray) || []
  );
};

const extractPaginationMeta = (payload, fallbackPage) => {
  const data = extractPayloadData(payload);
  const metaData = data?.metaData || data?.metadata || payload?.metaData || {};

  return {
    currentPage: Number(metaData.currentPage ?? fallbackPage) || fallbackPage,
    pageCount: Math.max(1, Number(metaData.pageCount ?? metaData.totalPages ?? 1) || 1),
    pageSize: Number(metaData.pageSize ?? PACKAGE_PAGE_SIZE) || PACKAGE_PAGE_SIZE,
    total: Number(metaData.total ?? 0) || 0,
  };
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

const uniqueTextValues = (values) => [
  ...new Set(values.map((value) => String(value || "").trim()).filter(Boolean)),
];

const getPackageSelectedServices = (packageItem) => {
  const serviceNames = uniqueTextValues([
    packageItem.serviceName,
    packageItem.service?.name,
    packageItem.service?.serviceName,
    ...(Array.isArray(packageItem.services)
      ? packageItem.services.map(
          (service) => service?.name || service?.serviceName || service?.title
        )
      : []),
  ]);

  if (serviceNames.length > 0) return serviceNames;

  return uniqueTextValues(getPackageServiceIds(packageItem));
};

const getPackageCategorySlug = (packageItem) => {
  const categoryValue =
    packageItem.serviceCategory ||
    packageItem.categoryName ||
    packageItem.category ||
    packageItem.services?.[0]?.serviceCategory ||
    packageItem.services?.[0]?.categoryName ||
    packageItem.service?.serviceCategory ||
    packageItem.service?.categoryName ||
    "";

  return (
    serviceCategories.find(
      (category) =>
        category.apiName === categoryValue ||
        category.slug === categoryValue ||
        category.title === categoryValue
    )?.slug || "home-service"
  );
};

const normalizePackage = (packageItem) => {
  const serviceIds = getPackageServiceIds(packageItem);

  return {
    id: String(packageItem.id || packageItem.packageId || ""),
    name: packageItem.name || packageItem.packageName || "",
    description:
      packageItem.description ||
      packageItem.packageDescription ||
      packageItem.subDescription ||
      packageItem.details ||
      packageItem.services?.[0]?.description ||
      packageItem.service?.description ||
      "",
    recurrence: packageItem.recurrence || packageItem.pricingType || "Weekly",
    daysPerInterval: Number(packageItem.daysPerInterval ?? packageItem.times ?? 1) || 1,
    price: Number(packageItem.price ?? packageItem.packagePrice ?? 0) || 0,
    currency: packageItem.currency || packageItem.packageCurrency || "EGP",
    serviceId: String(serviceIds[0] || ""),
    selectedServices: getPackageSelectedServices(packageItem),
    categorySlug: getPackageCategorySlug(packageItem),
  };
};

const getRecurrenceLabel = (recurrence) => {
  const value = String(recurrence || "").trim().toLowerCase();

  if (value === "daily") return "Daily";
  if (value === "weekly") return "Weekly";
  if (value === "monthly") return "Monthly";

  return recurrence || "Package";
};

const getIntervalLabel = (packageItem) => {
  const recurrence = packageItem.recurrence.toLowerCase();
  const days = packageItem.daysPerInterval;

  if (recurrence === "daily") return "1 time / day";
  if (recurrence === "weekly") return `${days} ${days === 1 ? "time" : "times"} / week`;
  if (recurrence === "monthly") return `${days} ${days === 1 ? "time" : "times"} / month`;

  return `${days} ${days === 1 ? "time" : "times"}`;
};

const formatPackagePrice = (packageItem) => {
  const formattedPrice = new Intl.NumberFormat("en-US").format(packageItem.price);
  const currency = String(packageItem.currency || "").trim();

  if (!currency || currency === "$" || currency.toUpperCase() === "USD") {
    return `$${formattedPrice}`;
  }

  return `${currency} ${formattedPrice}`;
};

const getVisiblePages = (currentPage, pageCount) => {
  const maxVisiblePages = 5;
  const startPage = Math.max(
    1,
    Math.min(currentPage - 2, pageCount - maxVisiblePages + 1)
  );
  const endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );
};

function BookingModeCard({ image, title, description, features, buttonLabel }) {
  return (
    <article className="group rounded-[12px] border border-[#D8DDEB] bg-white p-5 text-left shadow-[0px_12px_32px_rgba(1,28,96,0.08)] transition hover:-translate-y-1 hover:border-[#011C60] hover:bg-[#F8F9FC]">
      <img
        src={image}
        alt=""
        className="h-[190px] w-full rounded-[10px] bg-[#EEF3FF] object-contain"
      />
      <h3 className="mt-5 font-['Roboto'] text-[18px] font-semibold text-[#011C60]">
        {title}
      </h3>
      <p className="mt-2 min-h-12 font-['Roboto'] text-[13px] leading-5 text-[#6777A0]">
        {description}
      </p>
      <div className="mt-4 space-y-2">
        {features.map((feature) => (
          <p
            key={feature}
            className="flex items-center gap-2 font-['Roboto'] text-[12px] font-semibold text-[#4D6090]"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#808DAF] text-[10px] text-white">
              &#10003;
            </span>
            {feature}
          </p>
        ))}
      </div>
      <span className="mt-5 flex h-11 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#011C60] font-['Roboto'] text-[14px] font-semibold text-white transition group-hover:bg-[#02237a]">
        {buttonLabel}
      </span>
    </article>
  );
}

function PackageCard({ packageItem }) {
  const content = (
    <article className="group flex min-h-[360px] w-full flex-col rounded-[16px] border border-[#CCD2DF] bg-white px-5 py-6 shadow-[8px_4px_16px_0px_rgba(204,210,223,0.5)] transition duration-300 hover:bg-[#F8F9FC] hover:shadow-[8px_10px_24px_0px_rgba(204,210,223,0.65)]">
      <h3
        className="line-clamp-2 min-h-16 overflow-hidden text-ellipsis font-['Roboto'] text-[20px] font-semibold leading-8 text-[#011C60]"
        title={packageItem.name}
      >
        {packageItem.name}
      </h3>
      {packageItem.description && (
        <p className="mt-3 min-h-12 font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
          {packageItem.description}
        </p>
      )}
      <p className="mt-5 font-['Roboto'] text-[30px] font-semibold leading-9 text-[#011C60]">
        {formatPackagePrice(packageItem)}
        <span className="ml-1 align-middle text-[14px] font-medium text-[#4D6090]">
          / Flat Fee
        </span>
      </p>
      <div className="mt-5 grid gap-3 border-t border-[#EEF1F7] pt-5">
        <div className="flex items-center justify-between gap-3 rounded-[12px] bg-[#F3F5FA] px-3 py-2">
          <span className="font-['Roboto'] text-[12px] font-medium uppercase leading-5 text-[#6777A0]">
            Type
          </span>
          <span className="font-['Roboto'] text-[13px] font-semibold leading-5 text-[#011C60]">
            {getRecurrenceLabel(packageItem.recurrence)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-[12px] bg-[#F3F5FA] px-3 py-2">
          <span className="font-['Roboto'] text-[12px] font-medium uppercase leading-5 text-[#6777A0]">
            Times
          </span>
          <span className="text-right font-['Roboto'] text-[13px] font-semibold leading-5 text-[#011C60]">
            {getIntervalLabel(packageItem)}
          </span>
        </div>
      </div>
      {packageItem.selectedServices.length > 0 && (
        <div className="mt-4 rounded-[12px] bg-[#F8F9FC] px-3 py-3">
          <p className="font-['Roboto'] text-[12px] font-medium uppercase leading-5 text-[#6777A0]">
            Selected services
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {packageItem.selectedServices.slice(0, 4).map((serviceName) => (
              <span
                key={serviceName}
                className="rounded-[10px] bg-white px-3 py-1.5 font-['Roboto'] text-[12px] font-semibold leading-5 text-[#011C60]"
              >
                {serviceName}
              </span>
            ))}
            {packageItem.selectedServices.length > 4 && (
              <span className="rounded-[10px] bg-white px-3 py-1.5 font-['Roboto'] text-[12px] font-semibold leading-5 text-[#6777A0]">
                +{packageItem.selectedServices.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
      <span className="mt-auto flex h-12 w-full items-center justify-center rounded-[10px] bg-[#011C60] font-['Roboto'] text-[15px] font-semibold text-white transition hover:bg-[#02237a]">
        Select package
      </span>
    </article>
  );

  if (!packageItem.id) return content;

  return (
    <Link
      to={`/services/package/${packageItem.id}`}
      className="flex w-full"
    >
      {content}
    </Link>
  );
}

function PackagePagination({ meta, onPageChange }) {
  if (meta.pageCount <= 1) return null;

  const currentPage = meta.currentPage;
  const pages = getVisiblePages(currentPage, meta.pageCount);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Package pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="min-h-10 rounded-[10px] border border-[#CCD2DF] bg-white px-4 font-['Roboto'] text-[14px] font-semibold text-[#011C60] transition hover:border-[#011C60] disabled:cursor-not-allowed disabled:text-[#9AA6C7]"
      >
        Previous
      </button>
      {pages.map((page) => {
        const isActive = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`flex h-10 min-w-10 items-center justify-center rounded-[10px] border font-['Roboto'] text-[14px] font-semibold transition ${
              isActive
                ? "border-[#011C60] bg-[#011C60] text-white"
                : "border-[#CCD2DF] bg-white text-[#011C60] hover:border-[#011C60]"
            }`}
          >
            {page}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= meta.pageCount}
        className="min-h-10 rounded-[10px] border border-[#CCD2DF] bg-white px-4 font-['Roboto'] text-[14px] font-semibold text-[#011C60] transition hover:border-[#011C60] disabled:cursor-not-allowed disabled:text-[#9AA6C7]"
      >
        Next
      </button>
    </nav>
  );
}

export default function ServiceCategoriesSection({ mode = "" }) {
  const [packages, setPackages] = useState([]);
  const [packagePage, setPackagePage] = useState(1);
  const [packageMeta, setPackageMeta] = useState({
    currentPage: 1,
    pageCount: 1,
    pageSize: PACKAGE_PAGE_SIZE,
    total: 0,
  });
  const [isPackagesLoading, setIsPackagesLoading] = useState(false);
  const [packageError, setPackageError] = useState("");

  useEffect(() => {
    if (mode !== "package") {
      return undefined;
    }

    let isMounted = true;

    const loadPackages = async () => {
      setIsPackagesLoading(true);
      setPackageError("");

      try {
        const response = await getMyPackages({
          page: packagePage,
          pageSize: PACKAGE_PAGE_SIZE,
        });
        const nextPackages = extractList(response).map(normalizePackage);
        const nextMeta = extractPaginationMeta(response, packagePage);

        if (isMounted) {
          setPackages(nextPackages);
          setPackageMeta(nextMeta);
        }
      } catch (error) {
        if (isMounted) {
          setPackages([]);
          setPackageMeta({
            currentPage: packagePage,
            pageCount: 1,
            pageSize: PACKAGE_PAGE_SIZE,
            total: 0,
          });
          setPackageError(
            error?.response?.status === 401
              ? "Packages are not available for this account yet."
              : "Unable to load packages right now."
          );
        }
      } finally {
        if (isMounted) setIsPackagesLoading(false);
      }
    };

    loadPackages();

    return () => {
      isMounted = false;
    };
  }, [mode, packagePage]);

  if (!mode) {
    return (
      <section className="mx-auto w-full max-w-[1040px]">
        <div className="text-center">
          <h2 className="font-['Roboto'] text-[28px] font-semibold text-[#011C60] sm:text-[34px]">
            How would you like to book your service?
          </h2>
          <p className="mx-auto mt-3 max-w-[680px] font-['Roboto'] text-[16px] leading-7 text-[#808DAF]">
            Choose between a one-time service or a package with better value for
            a tailored professional experience.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-[860px] gap-8 md:grid-cols-2">
          <Link to="/services/service-categories">
            <BookingModeCard
              title="One-Time Service"
              description="Book this service once for a specific task without any long-term commitment."
              image={oneTimeServiceImage}
              buttonLabel="View Services"
              features={["Quick booking", "Pay per service", "Flexible"]}
            />
          </Link>
          <Link to="/services/service-categories">
            <BookingModeCard
              title="Service Package"
              description="Choose a package with multiple sessions and enjoy straightforward recurring models."
              image={packageServiceImage}
              buttonLabel="View Package"
              features={["Save money", "Multiple visits", "Structured service"]}
            />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1290px]">
      {mode === "package" && (
        <FlowBackButton
          onClick={() => window.history.back()}
          label="Back"
          ariaLabel="Back to booking options"
          className="mb-6"
        />
      )}

      {mode === "service" && (
        <>
          <SectionHeader
            title="Services Categories"
            description="A simple process designed to get things done without hassle."
          />

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {serviceCategories.map((category) => (
              <article
                key={category.id}
                className="group flex min-h-[360px] w-full flex-col gap-6 rounded-2xl bg-white p-6 shadow-[0px_4px_16px_rgba(204,210,223,0.35)] transition duration-300 hover:bg-[#023AC6]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[#E6E8EF] p-3 transition duration-300 group-hover:bg-white">
                    <img
                      src={category.image}
                      alt=""
                      className="h-20 w-[71px] object-contain"
                    />
                  </div>

                  <span className="flex h-9 w-[120px] shrink-0 items-center justify-center rounded-2xl bg-[#CCD2DF] px-3 py-2.5 text-center font-['Roboto'] text-xs font-medium text-[#4D6090] shadow-[0px_4px_16px_rgba(204,210,223,0.35)] backdrop-blur-xl transition duration-300 group-hover:bg-white group-hover:text-[#023AC6]">
                    {category.count}
                  </span>
                </div>

                <div className="flex flex-1 flex-col">
                  <h3 className="font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60] transition duration-300 group-hover:text-white md:text-[24px] md:leading-[40px]">
                    {category.title}
                  </h3>
                  <p className="mt-2 flex-1 font-['Roboto'] text-[16px] font-normal leading-6 text-[#808DAF] transition duration-300 group-hover:text-white">
                    {category.description}
                  </p>

                  <Link
                    to={`/services/${category.slug}`}
                    className="mt-6 flex h-14 w-full cursor-pointer items-center justify-center rounded-2xl bg-[#011C60] px-8 py-2.5 font-['Roboto'] font-semibold text-white transition duration-300 group-hover:bg-white group-hover:text-[#023AC6]"
                  >
                    View Services
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {mode === "package" && (
        <>
          <SectionHeader
            title="Choose a Package"
            description="Select a package that fits your needs. Structured service tiers are designed to deliver professional excellence."
          />

          {isPackagesLoading ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => index + 1).map((item) => (
                <div
                  key={item}
                  className="min-h-[360px] w-full animate-pulse rounded-[16px] bg-white shadow-[8px_4px_16px_0px_rgba(204,210,223,0.5)]"
                />
              ))}
            </div>
          ) : packages.length > 0 ? (
            <>
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {packages.map((packageItem) => (
                  <PackageCard
                    key={packageItem.id || packageItem.name}
                    packageItem={packageItem}
                  />
                ))}
              </div>
              <PackagePagination
                meta={packageMeta}
                onPageChange={(page) => setPackagePage(page)}
              />
            </>
          ) : (
            <div className="mx-auto mt-8 max-w-[520px] rounded-[24px] border border-dashed border-[#CCD2DF] bg-white px-6 py-12 text-center shadow-[0px_8px_24px_rgba(204,210,223,0.22)]">
              <h3 className="font-['Roboto'] text-[22px] font-semibold text-[#011C60]">
                No packages yet
              </h3>
              <p className="mt-3 font-['Roboto'] text-[16px] leading-6 text-[#808DAF]">
                {packageError || "Packages will appear here once they are available."}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
