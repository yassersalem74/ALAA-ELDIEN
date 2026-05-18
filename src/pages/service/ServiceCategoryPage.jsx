import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { getGovernorates, getNeighborhoods } from "../../api/auth/auth.api";
import { getServices } from "../../api/services/service.api";
import noServicesImage from "../../assets/images/service/choose-service.png";
import comingSoonImage from "../../assets/images/service/select-provider.png";
import { serviceCategories } from "../../components/Service-Page/servicePageData";
import {
  BackCircleButton,
  CreativeDropdown,
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
  getRoleQueryValue,
  isSupportedServiceCategory,
  normalizeLocationOptions,
  normalizeService,
} from "./serviceApiMappers";

const PAGE_SIZE = 10;

const PROVIDER_TYPE_OPTIONS = [
  { id: "individual", label: "Provider" },
  { id: "company", label: "Company" },
  { id: "alaa-eldien", label: "AlaaEldin" },
];

const COMING_SOON_PROVIDER_TYPES = new Set(["alaa-eldien"]);

const normalizeFilterText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isLastPageExceededError = (error) => {
  const data = error?.response?.data;
  const code = data?.error?.code || data?.code;
  const message = data?.error?.message || data?.message || data?.error;

  return code === "LastPageExceeded" || message === "LastPageExceeded";
};

function ComingSoonState({ providerType }) {
  const title =
    providerType === "alaa-eldien"
      ? "AlaaEldin services are coming soon"
      : "This provider role is coming soon";

  return (
    <section className="mt-8 overflow-hidden rounded-[24px] border border-[#E6E8EF] bg-white shadow-[0px_16px_44px_rgba(1,28,96,0.08)]">
      <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_320px] md:items-center md:p-8">
        <div>
          <span className="inline-flex rounded-full bg-[#FFF4C4] px-4 py-2 font-['Roboto'] text-[13px] font-semibold uppercase text-[#011C60]">
            Coming Soon
          </span>
          <h2 className="mt-5 font-['Roboto'] text-[28px] font-semibold leading-10 text-[#011C60] sm:text-[36px] sm:leading-[48px]">
            {title}
          </h2>
          <p className="mt-3 max-w-[620px] font-['Roboto'] text-[16px] leading-7 text-[#808DAF] sm:text-[18px]">
            We are preparing this provider experience. For now, Provider and
            Company services are ready to browse, filter, and book.
          </p>
        </div>

        <div className="flex justify-center rounded-[22px] bg-[#F8F9FC] p-6">
          <img
            src={comingSoonImage}
            alt=""
            className="h-[220px] w-full max-w-[260px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}

function NoServicesState() {
  return (
    <section className="rounded-[28px] border border-dashed border-[#CCD2DF] bg-white px-6 py-12 text-center shadow-[0px_14px_34px_rgba(204,210,223,0.28)]">
      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-[#F8F9FC] p-5 shadow-[0px_10px_26px_rgba(190,198,222,0.24)] sm:h-40 sm:w-40">
        <img src={noServicesImage} alt="" className="h-full w-full object-contain" />
      </div>
      <h3 className="mt-6 font-['Roboto'] text-[28px] font-semibold leading-10 text-[#011C60]">
        mmmmm no service yet
      </h3>
      <p className="mx-auto mt-3 max-w-[520px] font-['Roboto'] text-[16px] leading-7 text-[#808DAF]">
        Try another search word or change the governorate and neighborhood
        filters.
      </p>
    </section>
  );
}

export default function ServiceCategoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categorySlug } = useParams();
  const [activeProviderType, setActiveProviderType] = useState("individual");
  const [selectedGovernorateId, setSelectedGovernorateId] = useState("");
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allServices, setAllServices] = useState([]);
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
  const flowMode = useMemo(
    () => new URLSearchParams(location.search).get("mode"),
    [location.search]
  );
  const detailSearch = flowMode === "one-time" ? "?mode=one-time" : "";
  const isComingSoonProvider = COMING_SOON_PROVIDER_TYPES.has(activeProviderType);

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

  const filteredServices = useMemo(() => {
    const searchText = normalizeFilterText(searchQuery);

    return allServices.filter((service) => {
      const matchesGovernorate =
        !selectedGovernorateId ||
        String(service.governorateId) === String(selectedGovernorateId);
      const matchesNeighborhood =
        !selectedNeighborhoodId ||
        String(service.neighborhoodId) === String(selectedNeighborhoodId);
      const matchesSearch =
        !searchText ||
        normalizeFilterText(
          [
            service.name,
            service.description,
            service.subDescription,
            service.providerName,
            service.location,
          ].join(" ")
        ).includes(searchText);

      return matchesGovernorate && matchesNeighborhood && matchesSearch;
    });
  }, [
    allServices,
    searchQuery,
    selectedGovernorateId,
    selectedNeighborhoodId,
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadGovernorates = async () => {
      setIsLoadingLocations(true);

      try {
        const response = await getGovernorates(SERVICE_LANGUAGE);

        if (!isMounted) return;

        setGovernorates(normalizeLocationOptions(response));
      } catch {
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
      } catch {
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
    activeProviderType,
    categorySlug,
    searchQuery,
    selectedGovernorateId,
    selectedNeighborhoodId,
  ]);

  useEffect(() => {
    if (isComingSoonProvider) {
      setServices([]);
      setTotalPages(1);
      return;
    }

    const nextTotalPages = Math.max(
      1,
      Math.ceil(filteredServices.length / PAGE_SIZE)
    );
    const safePage = Math.min(currentPage, nextTotalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;

    if (safePage !== currentPage) {
      setCurrentPage(safePage);
      return;
    }

    setServices(filteredServices.slice(startIndex, startIndex + PAGE_SIZE));
    setTotalPages(nextTotalPages);
  }, [currentPage, filteredServices, isComingSoonProvider]);

  useEffect(() => {
    if (!isSupportedServiceCategory(categorySlug)) return undefined;
    if (isComingSoonProvider) {
      return undefined;
    }

    let isMounted = true;

    const loadServices = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const baseParams = {
        category: getApiCategoryName(categorySlug),
        pageSize: PAGE_SIZE,
        language: SERVICE_LANGUAGE,
        role: getRoleQueryValue(activeProviderType),
      };

      try {
        const firstResponse = await getServices({ ...baseParams, page: 1 });
        const pageCount = extractTotalPages(firstResponse);
        const otherResponses =
          pageCount > 1
            ? await Promise.all(
                Array.from({ length: pageCount - 1 }, (_, index) =>
                  getServices({ ...baseParams, page: index + 2 })
                )
              )
            : [];
        const normalizedServices = [firstResponse, ...otherResponses]
          .flatMap((response) => extractApiArray(response))
          .map((service) => normalizeService(service, category?.image))
          .filter((service) => service.id);

        if (!isMounted) return;

        setAllServices(normalizedServices);
      } catch (error) {
        if (!isMounted) return;

        setAllServices([]);

        if (isLastPageExceededError(error)) {
          setErrorMessage("");
        } else {
          setErrorMessage(
            getApiErrorMessage(error, "Unable to load services right now.")
          );
        }
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
    isComingSoonProvider,
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
            description="Choose from live Provider and Company services, then filter by location."
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

        {isComingSoonProvider ? (
          <ComingSoonState providerType={activeProviderType} />
        ) : (
          <>
        <div className="mt-8 rounded-2xl border border-[#E6E8EF] bg-[#E6E8EF40] px-4 py-5 shadow-[0px_4px_16px_0px_rgba(230,232,239,0.35)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-4">
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
                      to={`/services/${categorySlug}/${service.id}${detailSearch}`}
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
            <NoServicesState />
          </div>
        )}

        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
          </>
        )}
      </div>
    </div>
  );
}
