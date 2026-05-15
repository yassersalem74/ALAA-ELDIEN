import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { getGovernorates, getNeighborhoods } from "../../api/auth/auth.api";
import { getServices } from "../../api/services/service.api";
import { serviceCategories } from "../../components/Service-Page/servicePageData";
import {
  BackCircleButton,
  CreativeDropdown,
  EmptyState,
  LocationIcon,
  Pagination,
  SearchInput,
  ServicePageIntro,
} from "../../components/Service-Flow/ServiceFlowShared";
import {
  SERVICE_LANGUAGE,
  extractApiArray,
  extractTotalPages,
  formatServicePrice,
  getApiCategoryName,
  getApiErrorMessage,
  getRoleQueryValues,
  isSupportedServiceCategory,
  normalizeLocationOptions,
  normalizeService,
} from "./serviceApiMappers";

const PROVIDER_TYPE_OPTIONS = [
  { id: "all", label: "All Providers" },
  { id: "individual", label: "Individual" },
  { id: "company", label: "Company" },
  { id: "alaa-eldien", label: "Alaa Eldien" },
];

const PRICE_RANGE_OPTIONS = [
  { id: "all", label: "All Prices", min: undefined, max: undefined },
  { id: "budget", label: "0 - 200 EGP", min: 0, max: 200 },
  { id: "mid", label: "201 - 350 EGP", min: 201, max: 350 },
  { id: "premium", label: "351+ EGP", min: 351, max: undefined },
];

export default function ServiceCategoryPage() {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const [activeProviderType, setActiveProviderType] = useState("all");
  const [activePriceRange, setActivePriceRange] = useState("all");
  const [selectedGovernorateId, setSelectedGovernorateId] = useState("");
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [governorates, setGovernorates] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const category = useMemo(
    () => serviceCategories.find((item) => item.slug === categorySlug),
    [categorySlug]
  );

  const selectedPriceRange = useMemo(
    () =>
      PRICE_RANGE_OPTIONS.find((option) => option.id === activePriceRange) ||
      PRICE_RANGE_OPTIONS[0],
    [activePriceRange]
  );

  const governorateOptions = useMemo(
    () => [
      { value: "", label: "All Governorates" },
      ...governorates.map((governorate) => ({
        value: governorate.id,
        label: governorate.name,
      })),
    ],
    [governorates]
  );

  const neighborhoodOptions = useMemo(
    () => [
      { value: "", label: "All Neighborhoods" },
      ...neighborhoods.map((neighborhood) => ({
        value: neighborhood.id,
        label: neighborhood.name,
      })),
    ],
    [neighborhoods]
  );

  useEffect(() => {
    let isMounted = true;

    const loadGovernorates = async () => {
      setIsLoadingLocations(true);

      try {
        const response = await getGovernorates(SERVICE_LANGUAGE);

        if (!isMounted) return;

        setGovernorates(normalizeLocationOptions(response));
      } catch (error) {
        if (isMounted) setGovernorates([]);
      } finally {
        if (isMounted) setIsLoadingLocations(false);
      }
    };

    loadGovernorates();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setSelectedNeighborhoodId("");

    if (!selectedGovernorateId) {
      setNeighborhoods([]);
      return undefined;
    }

    const loadNeighborhoods = async () => {
      setIsLoadingLocations(true);

      try {
        const response = await getNeighborhoods(
          selectedGovernorateId,
          SERVICE_LANGUAGE
        );

        if (!isMounted) return;

        setNeighborhoods(normalizeLocationOptions(response));
      } catch (error) {
        if (isMounted) setNeighborhoods([]);
      } finally {
        if (isMounted) setIsLoadingLocations(false);
      }
    };

    loadNeighborhoods();

    return () => {
      isMounted = false;
    };
  }, [selectedGovernorateId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activePriceRange,
    activeProviderType,
    categorySlug,
    searchQuery,
    selectedGovernorateId,
    selectedNeighborhoodId,
  ]);

  useEffect(() => {
    if (!isSupportedServiceCategory(categorySlug)) return undefined;

    let isMounted = true;

    const loadServices = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const params = {
        category: getApiCategoryName(categorySlug),
        page: currentPage,
        language: SERVICE_LANGUAGE,
        search: searchQuery.trim() || undefined,
        minPrice: selectedPriceRange.min,
        maxPrice: selectedPriceRange.max,
        governorateId: selectedGovernorateId || undefined,
        neighborhoodId: selectedNeighborhoodId || undefined,
      };
      const roleValues = getRoleQueryValues(activeProviderType);

      try {
        const responses =
          roleValues.length > 1
            ? await Promise.allSettled(
                roleValues.map((role) => getServices({ ...params, role }))
              )
            : [
                {
                  status: "fulfilled",
                  value: await getServices({ ...params, role: roleValues[0] }),
                },
              ];
        const fulfilledResponses = responses
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);

        if (!fulfilledResponses.length) {
          throw responses.find((result) => result.status === "rejected")?.reason;
        }

        const serviceMap = new Map();

        fulfilledResponses
          .flatMap((response) => extractApiArray(response))
          .map((service) => normalizeService(service, category?.image))
          .filter((service) => service.id)
          .forEach((service) => {
            serviceMap.set(service.id, service);
          });

        if (!isMounted) return;

        setServices(Array.from(serviceMap.values()));
        setTotalPages(
          Math.max(...fulfilledResponses.map((response) => extractTotalPages(response)))
        );
      } catch (error) {
        if (!isMounted) return;

        setServices([]);
        setTotalPages(1);
        setErrorMessage(
          getApiErrorMessage(error, "Unable to load services right now.")
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, [
    activeProviderType,
    category?.image,
    categorySlug,
    currentPage,
    searchQuery,
    selectedGovernorateId,
    selectedNeighborhoodId,
    selectedPriceRange.max,
    selectedPriceRange.min,
  ]);

  if (!category || !isSupportedServiceCategory(categorySlug)) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div className="bg-[#F8F9FC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex items-center">
          <BackCircleButton onClick={() => navigate("/services")} />
        </div>

        <div className="mt-8">
          <ServicePageIntro
            title={category.title}
            description="Choose from live providers and filter by provider type, price, and location."
          />
        </div>

        <div className="mt-10 overflow-x-auto border-b border-[#E6E8EF]">
          <div className="flex min-w-max items-center gap-10 px-1">
            {PROVIDER_TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveProviderType(option.id)}
                className={`border-b-2 px-2 pb-5 pt-2 font-['Roboto'] text-[18px] font-medium leading-8 transition sm:text-[24px] sm:leading-[40px] ${
                  activeProviderType === option.id
                    ? "border-[#011C60] text-[#011C60]"
                    : "border-transparent text-[#808DAF] hover:text-[#011C60]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#E6E8EF] bg-[#E6E8EF40] px-4 py-5 shadow-[0px_4px_16px_0px_rgba(230,232,239,0.35)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <p className="font-['Roboto'] text-[20px] font-medium leading-8 text-[#011C60] sm:text-[24px] sm:leading-[40px]">
                  Sort by:
                </p>

                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setActivePriceRange(option.id)}
                      className={`rounded-lg px-4 py-2 font-['Roboto'] text-sm font-medium transition sm:text-[16px] ${
                        activePriceRange === option.id
                          ? "bg-[#F6E6A0] text-[#011C60]"
                          : "bg-[#E6E8EF] text-[#011C60] hover:bg-[#d9dee9]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <CreativeDropdown
                  label="Governorate"
                  value={selectedGovernorateId}
                  options={governorateOptions}
                  onChange={setSelectedGovernorateId}
                  placeholder="All Governorates"
                  leading={<LocationIcon className="h-4 w-4" stroke="#011C60" />}
                  renderValue={(option) => option.label}
                  renderOption={(option) => (
                    <span className="font-['Roboto'] text-[14px] font-medium">
                      {option.label}
                    </span>
                  )}
                />

                <CreativeDropdown
                  label="Neighborhood"
                  value={selectedNeighborhoodId}
                  options={neighborhoodOptions}
                  onChange={setSelectedNeighborhoodId}
                  placeholder="All Neighborhoods"
                  leading={<LocationIcon className="h-4 w-4" stroke="#011C60" />}
                  renderValue={(option) => option.label}
                  renderOption={(option) => (
                    <span className="font-['Roboto'] text-[14px] font-medium">
                      {option.label}
                    </span>
                  )}
                />
              </div>
            </div>

            <SearchInput
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              size="compact"
              className="w-full xl:max-w-[400px]"
            />
          </div>

          {isLoadingLocations && (
            <p className="mt-3 font-['Roboto'] text-[13px] text-[#808DAF]">
              Loading location filters...
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-[#F5C2C7] bg-[#FFF5F5] px-5 py-4 font-['Roboto'] text-[15px] text-[#842029]">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={`service-loading-${index + 1}`}
                className="h-[348px] animate-pulse rounded-2xl border border-[#E6E8EF] bg-white shadow-[0px_8px_24px_rgba(190,198,222,0.18)]"
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="flex min-h-[360px] flex-col rounded-2xl border border-[#E6E8EF] bg-white p-6 shadow-[0px_8px_24px_rgba(190,198,222,0.22)]"
              >
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-[136px] w-full rounded-[18px] bg-[#E6E8EF] object-cover"
                />

                <div className="mt-4 flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60]">
                      {service.name}
                    </h2>

                    <span className="shrink-0 rounded-full bg-[#FFF4C4] px-3 py-1 font-['Roboto'] text-[12px] font-semibold text-[#011C60]">
                      {formatServicePrice(service.price, service.currency)}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 font-['Roboto'] text-[15px] leading-6 text-[#808DAF]">
                    {service.subDescription ||
                      service.description ||
                      "Service details are available on the next screen."}
                  </p>

                  <div className="mt-4 space-y-2 font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                    <p>
                      <span className="font-semibold text-[#011C60]">
                        Provider:
                      </span>{" "}
                      {service.providerName}
                    </p>
                    <p>
                      <span className="font-semibold text-[#011C60]">
                        Location:
                      </span>{" "}
                      {service.location || "Not specified"}
                    </p>
                  </div>

                  <div className="mt-auto pt-6">
                    <Link
                      to={`/services/${categorySlug}/${service.id}`}
                      className="flex h-11 w-full items-center justify-center rounded-xl bg-[#011C60] px-4 font-['Roboto'] text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#02237a] hover:shadow-[0px_14px_26px_rgba(1,28,96,0.24)]"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && !services.length && (
          <div className="mt-8">
            <EmptyState
              title="No services match your filters"
              description="Try changing the provider type, location, price, or search text."
            />
          </div>
        )}

        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
