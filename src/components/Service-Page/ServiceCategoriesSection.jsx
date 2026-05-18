import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPackages } from "../../api/services/service.api";
import oneTimeServiceImage from "../../assets/images/service/add-service/add-service-flow.png";
import packageServiceImage from "../../assets/images/service/add-service/add-package-flow.png";
import SectionHeader from "./SectionHeader";
import { serviceCategories } from "./servicePageData";

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

const normalizeFeature = (item) => {
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

const getPackageServiceIds = (packageItem) => [
  ...(Array.isArray(packageItem.serviceIds) ? packageItem.serviceIds : []),
  ...(Array.isArray(packageItem.services)
    ? packageItem.services.map((service) => service?.id || service?.serviceId)
    : []),
  packageItem.serviceId,
  packageItem.service?.id,
  packageItem.service?.serviceId,
].filter(Boolean);

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
  const includedItems =
    packageItem.includedItems ||
    packageItem.items ||
    packageItem.serviceItems ||
    packageItem.features ||
    packageItem.packageItems ||
    [];
  const serviceIds = getPackageServiceIds(packageItem);

  return {
    id: String(packageItem.id || packageItem.packageId || ""),
    name: packageItem.name || packageItem.packageName || "Service Package",
    recurrence: packageItem.recurrence || packageItem.pricingType || "Weekly",
    daysPerInterval: Number(packageItem.daysPerInterval ?? packageItem.times ?? 1) || 1,
    price: Number(packageItem.price ?? packageItem.packagePrice ?? 0) || 0,
    currency: packageItem.currency || packageItem.packageCurrency || "EGP",
    serviceId: String(serviceIds[0] || ""),
    categorySlug: getPackageCategorySlug(packageItem),
    includedItems: includedItems.map(normalizeFeature).filter(Boolean),
  };
};

const formatPackagePrice = (packageItem) =>
  `${new Intl.NumberFormat("en-US").format(packageItem.price)} ${
    packageItem.currency === "EGY" ? "EGP" : packageItem.currency
  }`;

const getIntervalLabel = (packageItem) => {
  const recurrence = packageItem.recurrence.toLowerCase();
  const days = packageItem.daysPerInterval;

  if (recurrence === "daily") return "Every day";
  if (recurrence === "weekly") return `${days} ${days === 1 ? "day" : "days"} / week`;
  if (recurrence === "monthly") return `${days} ${days === 1 ? "day" : "days"} / month`;

  return `${days} sessions`;
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
    <article className="group h-full rounded-[12px] border border-[#D8DDEB] bg-white p-5 shadow-[0px_10px_24px_rgba(1,28,96,0.08)] transition hover:-translate-y-2 hover:border-[#011C60] hover:bg-[#E6E8EF] hover:shadow-[0px_18px_38px_rgba(1,28,96,0.14)]">
      <h3 className="font-['Roboto'] text-[18px] font-semibold text-[#011C60]">
        {packageItem.name}
      </h3>
      <p className="mt-3 font-['Roboto'] text-[30px] font-semibold text-[#011C60]">
        {formatPackagePrice(packageItem)}
      </p>
      <p className="font-['Roboto'] text-[12px] font-semibold uppercase text-[#6777A0]">
        {getIntervalLabel(packageItem)}
      </p>
      <div className="mt-5 flex min-h-[86px] flex-wrap gap-2">
        {(packageItem.includedItems.length
          ? packageItem.includedItems
          : ["Window cleaning", "Eco-friendly supplies", "Deep service"]
        )
          .slice(0, 4)
          .map((feature) => (
            <span
              key={feature}
              className="rounded-[8px] bg-[#F3F5FA] px-3 py-2 font-['Roboto'] text-[12px] font-medium text-[#808DAF] transition group-hover:bg-white"
            >
              {feature}
            </span>
          ))}
      </div>
      <span className="mt-4 flex h-11 w-full items-center justify-center rounded-[10px] bg-[#011C60] font-['Roboto'] text-[14px] font-semibold text-white transition hover:bg-[#02237a]">
        Select package
      </span>
    </article>
  );

  if (!packageItem.serviceId) return content;

  return (
    <Link
      to={`/services/${packageItem.categorySlug}/${packageItem.serviceId}?mode=package&packageId=${packageItem.id}`}
    >
      {content}
    </Link>
  );
}

export default function ServiceCategoriesSection({ mode = "" }) {
  const [packages, setPackages] = useState([]);
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
        const response = await getMyPackages({ page: 1 });
        const nextPackages = extractList(response).map(normalizePackage);

        if (isMounted) setPackages(nextPackages);
      } catch (error) {
        if (isMounted) {
          setPackages([]);
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
  }, [mode]);

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
          <Link to="/services/one-time-service">
            <BookingModeCard
              title="One-Time Service"
              description="Book this service once for a specific task without any long-term commitment."
              image={oneTimeServiceImage}
              buttonLabel="View Services"
              features={["Quick booking", "Pay per service", "Flexible"]}
            />
          </Link>
          <Link to="/services/package">
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
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#B3BBCF] font-['Roboto'] text-[28px] font-semibold text-white transition hover:bg-[#9ea8bf]"
          aria-label="Back to booking options"
        >
          &larr;
        </button>
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
                    to={`/services/${category.slug}?mode=one-time`}
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
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[250px] animate-pulse rounded-[12px] bg-white shadow-[0px_10px_24px_rgba(1,28,96,0.08)]"
                />
              ))}
            </div>
          ) : packages.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {packages.map((packageItem) => (
                <PackageCard key={packageItem.id || packageItem.name} packageItem={packageItem} />
              ))}
            </div>
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
