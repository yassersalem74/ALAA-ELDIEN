import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  BackCircleButton,
  EmptyState,
  LocationIcon,
  Pagination,
  SearchInput,
  ServicePageIntro,
  StarIcon,
  formatReviewCount,
} from "../components/Service-Flow/ServiceFlowShared";
import {
  FALLBACK_GOVERNORATES,
  PRICE_RANGE_OPTIONS,
  PROVIDER_TYPE_OPTIONS,
  RATING_OPTIONS,
  getProviderDescriptionBySlugs,
  getProviderHeadlineBySlugs,
  getServiceCategoryBySlug,
  getSubServiceBySlugs,
} from "../data/serviceFlowData";

const PROVIDERS_PER_PAGE = 6;

export default function ServiceProvidersPage() {
  const navigate = useNavigate();
  const { categorySlug, serviceSlug } = useParams();
  const [activeProviderType, setActiveProviderType] = useState("all");
  const [activePriceRange, setActivePriceRange] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const category = getServiceCategoryBySlug(categorySlug);
  const service = getSubServiceBySlugs(categorySlug, serviceSlug);

  const locationOptions = useMemo(() => {
    const providerGovernorates =
      service?.providers.map((provider) => provider.governorate) || [];

    return [...new Set([...providerGovernorates, ...FALLBACK_GOVERNORATES])];
  }, [service]);

  const filteredProviders = useMemo(() => {
    const providers = service?.providers || [];
    const priceRange = PRICE_RANGE_OPTIONS.find(
      (option) => option.id === activePriceRange
    );
    const minimumRating =
      selectedRating === "all" ? 0 : Number(selectedRating) || 0;
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return providers.filter((provider) => {
      const matchesType =
        activeProviderType === "all" ||
        provider.providerType === activeProviderType;
      const matchesPrice =
        provider.startingPrice >= (priceRange?.min || 0) &&
        provider.startingPrice <=
          (priceRange?.max || Number.POSITIVE_INFINITY);
      const matchesRating = provider.rating >= minimumRating;
      const matchesLocation =
        selectedLocation === "all" ||
        provider.governorate === selectedLocation;
      const matchesSearch =
        !normalizedQuery ||
        [
          provider.name,
          provider.title,
          provider.shortDescription,
          provider.location,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

      return (
        matchesType &&
        matchesPrice &&
        matchesRating &&
        matchesLocation &&
        matchesSearch
      );
    });
  }, [
    activePriceRange,
    activeProviderType,
    searchQuery,
    selectedLocation,
    selectedRating,
    service,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProviders.length / PROVIDERS_PER_PAGE)
  );

  const paginatedProviders = useMemo(() => {
    const startIndex = (currentPage - 1) * PROVIDERS_PER_PAGE;

    return filteredProviders.slice(startIndex, startIndex + PROVIDERS_PER_PAGE);
  }, [currentPage, filteredProviders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activePriceRange,
    activeProviderType,
    searchQuery,
    selectedLocation,
    selectedRating,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (!category || !service) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div className="bg-[#F8F9FC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex items-center">
          <BackCircleButton
            onClick={() => navigate(`/services/${category.slug}`)}
          />
        </div>

        <div className="mt-8">
          <ServicePageIntro
            title={getProviderHeadlineBySlugs(category.slug, service.slug)}
            description={getProviderDescriptionBySlugs(
              category.slug,
              service.slug
            )}
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

              <div className="flex flex-col gap-3 lg:flex-row">
                <select
                  value={selectedRating}
                  onChange={(event) => setSelectedRating(event.target.value)}
                  className="h-12 rounded-lg border border-[#808DAF] bg-white px-4 font-['Roboto'] text-[16px] text-[#011C60] shadow-[8px_4px_16px_0px_rgba(226,232,243,0.5)] outline-none"
                >
                  <option value="all">Rating</option>
                  {RATING_OPTIONS.map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}+ Stars
                    </option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(event) => setSelectedLocation(event.target.value)}
                  className="h-12 rounded-lg border border-[#808DAF] bg-white px-4 font-['Roboto'] text-[16px] text-[#011C60] shadow-[8px_4px_16px_0px_rgba(226,232,243,0.5)] outline-none"
                >
                  <option value="all">Location</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <SearchInput
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              size="compact"
              className="w-full xl:max-w-[400px]"
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedProviders.map((provider) => (
            <article
              key={provider.id}
              className="rounded-2xl border border-[#E6E8EF] bg-white p-6 shadow-[0px_8px_24px_rgba(190,198,222,0.22)]"
            >
              <img
                src={provider.image}
                alt={provider.name}
                className="h-[136px] w-full rounded-[24px] object-cover"
              />

              <div className="mt-4">
                <h2 className="font-['Roboto'] text-[24px] font-semibold leading-[40px] text-[#011C60]">
                  {provider.name}
                </h2>

                <div className="mt-2 flex items-center gap-2">
                  <StarIcon className="h-3 w-3" />
                  <span className="font-['Roboto'] text-[12px] leading-4 text-[#808DAF]">
                    {provider.rating.toFixed(1)} ({formatReviewCount(provider.reviewCount)}{" "}
                    reviews)
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <LocationIcon className="h-[15px] w-3" />
                  <span className="font-['Roboto'] text-[16px] leading-6 text-[#808DAF]">
                    {provider.location}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <Link
                  to={`/services/${category.slug}/${service.slug}/providers/${provider.slug}`}
                  className="font-['Roboto'] text-[14px] font-medium text-[#808DAF] transition hover:text-[#011C60]"
                >
                  View Details
                </Link>
                <Link
                  to={`/services/${category.slug}/${service.slug}/providers/${provider.slug}`}
                  className="rounded-lg bg-[#011C60] px-4 py-2 font-['Roboto'] text-[14px] font-semibold text-white transition hover:bg-[#02237a]"
                >
                  Book Now
                </Link>
              </div>
            </article>
          ))}
        </div>

        {!filteredProviders.length && (
          <div className="mt-8">
            <EmptyState
              title="No providers match your filters"
              description="Try changing the provider type, location, rating, or search text to see more results."
            />
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
