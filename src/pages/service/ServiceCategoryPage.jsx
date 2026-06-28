import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { getServiceNames } from "../../api/services/service.api";
import noServicesImage from "../../assets/images/service/choose-service.png";
import { serviceCategories } from "../../components/Service-Page/servicePageData";
import {
  BackCircleButton,
  SearchInput,
  ServicePageIntro,
} from "../../components/Service-Flow/ServiceFlowShared";
import {
  SERVICE_LANGUAGE,
  extractApiArray,
  getApiErrorMessage,
  isSupportedServiceCategory,
} from "./serviceApiMappers";
import {
  filterServiceNamesByCategory,
  normalizeServiceNameList,
} from "./serviceNameMappers";

export default function ServiceCategoryPage() {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const [serviceNames, setServiceNames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const category = useMemo(
    () => serviceCategories.find((item) => item.slug === categorySlug),
    [categorySlug]
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (!isSupportedServiceCategory(categorySlug)) return undefined;

    let isMounted = true;

    const loadServiceNames = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getServiceNames({
          language: SERVICE_LANGUAGE,
          search: debouncedSearchQuery || undefined,
        });
        const nextServiceNames = filterServiceNamesByCategory(
          normalizeServiceNameList(extractApiArray(response)),
          categorySlug
        );

        if (!isMounted) return;

        setServiceNames(nextServiceNames);
      } catch (error) {
        if (!isMounted) return;

        setServiceNames([]);
        setErrorMessage(
          getApiErrorMessage(error, "Unable to load service names right now.")
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadServiceNames();

    return () => {
      isMounted = false;
    };
  }, [categorySlug, debouncedSearchQuery]);

  if (!category || !isSupportedServiceCategory(categorySlug)) {
    return <Navigate to="/services/service-categories" replace />;
  }

  return (
    <div className="bg-[#F8F9FC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <BackCircleButton onClick={() => navigate("/services/service-categories")} />

        <div className="mt-8">
          <ServicePageIntro
            title={category.title}
            description="Choose the exact service you need, then compare available providers."
          />
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[18px] border border-[#D8DDEB] bg-white p-5 shadow-[0px_12px_32px_rgba(1,28,96,0.08)]">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#E6E8EF] p-3">
                <img
                  src={category.image}
                  alt=""
                  className="h-14 w-14 object-contain"
                />
              </div>
              <div>
                <p className="font-['Roboto'] text-[12px] font-semibold uppercase text-[#808DAF]">
                  Main category
                </p>
                <h2 className="font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60]">
                  {category.title}
                </h2>
              </div>
            </div>
            <p className="mt-4 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
              {category.description}
            </p>
          </aside>

          <section className="rounded-[18px] border border-[#D8DDEB] bg-white p-5 shadow-[0px_12px_32px_rgba(1,28,96,0.08)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-['Roboto'] text-[24px] font-semibold leading-8 text-[#011C60]">
                  Service Name
                </h2>
                <p className="mt-1 font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
                  {isLoading
                    ? "Loading services..."
                    : `${serviceNames.length} available option${
                        serviceNames.length === 1 ? "" : "s"
                      }`}
                </p>
              </div>

              <SearchInput
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search service name"
                size="compact"
                className="md:max-w-[360px]"
              />
            </div>

            {errorMessage && (
              <div className="mt-5 rounded-2xl border border-[#F5C2C7] bg-[#FFF5F5] px-5 py-4 font-['Roboto'] text-[15px] text-[#842029]">
                {errorMessage}
              </div>
            )}

            {isLoading ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }, (_, index) => (
                  <div
                    key={`service-name-loader-${index + 1}`}
                    className="h-16 animate-pulse rounded-2xl bg-[#F3F5FA]"
                  />
                ))}
              </div>
            ) : serviceNames.length > 0 ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {serviceNames.map((serviceName) => (
                  <Link
                    key={serviceName.id}
                    to={`/services/${category.slug}/service/${encodeURIComponent(
                      serviceName.id
                    )}`}
                    className="group flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-[#D8DDEB] bg-[#F8F9FC] px-4 py-3 transition hover:-translate-y-0.5 hover:border-[#011C60] hover:bg-white hover:shadow-[0px_12px_26px_rgba(1,28,96,0.1)]"
                  >
                    <span className="font-['Roboto'] text-[16px] font-semibold leading-6 text-[#011C60]">
                      {serviceName.label}
                    </span>
                    <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#EECE42] text-[#011C60] transition group-hover:bg-[#011C60] group-hover:text-white">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[28px] border border-dashed border-[#CCD2DF] bg-white px-6 py-12 text-center">
                <img
                  src={noServicesImage}
                  alt=""
                  className="mx-auto h-32 w-32 object-contain"
                />
                <h3 className="mt-5 font-['Roboto'] text-[24px] font-semibold text-[#011C60]">
                  No service names found
                </h3>
                <p className="mx-auto mt-2 max-w-[420px] font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                  Try another search word or choose another main category.
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </div>
  );
}
