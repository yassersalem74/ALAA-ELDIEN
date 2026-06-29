import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { getGovernorates, getNeighborhoods } from "../../api/auth/auth.api";
import {
  getPackages,
  getServiceNames,
  getServices,
} from "../../api/services/service.api";
import noServicesImage from "../../assets/images/service/choose-service.png";
import { serviceCategories } from "../../components/Service-Page/servicePageData";
import {
  BackCircleButton,
  CreativeDropdown,
  LocationIcon,
  Pagination,
  SearchInput,
} from "../../components/Service-Flow/ServiceFlowShared";
import {
  SERVICE_LANGUAGE,
  extractApiArray,
  extractTotalPages,
  formatServicePrice,
  getApiCategoryName,
  getApiErrorMessage,
  getRoleQueryValue,
  isAlaaEldienProvider,
  isSupportedServiceCategory,
  normalizeLocationOptions,
  normalizeService,
} from "./serviceApiMappers";
import {
  filterServiceNamesByCategory,
  findServiceNameById,
  normalizeServiceNameList,
} from "./serviceNameMappers";

const PAGE_SIZE = 9;
const STATIC_RATING = "4.8";

const PROVIDER_TYPE_OPTIONS = [
  { id: "all", label: "All" },
  { id: "individual", label: "Individual" },
  { id: "company", label: "Company" },
  { id: "alaa-eldien", label: "AlaaEldin" },
];

const SERVICE_TYPE_OPTIONS = [
  { id: "one-time", label: "One Time Service" },
  { id: "packages", label: "Packages" },
];

const getServiceTypeFromSearch = (search) => {
  const params = new URLSearchParams(search || "");
  const value = normalizeText(
    params.get("serviceType") || params.get("type") || params.get("mode")
  );

  if (value === "package" || value === "packages") return "packages";
  if (value === "one-time" || value === "service") return "one-time";

  return "";
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeComparableText = (value) =>
  normalizeText(value).replace(/[_-]+/g, " ").replace(/\s+/g, " ");

const firstPresentValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const firstNonEmptyArray = (...values) =>
  values.find((value) => Array.isArray(value) && value.length > 0) || [];

const getNamedValue = (value) => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (typeof value !== "object") return "";

  return String(
    firstPresentValue(
      value.name,
      value.Name,
      value.serviceName,
      value.ServiceName,
      value.title,
      value.Title,
      value.label,
      value.Label,
      value.nameEn,
      value.NameEn
    ) || ""
  ).trim();
};

const getCategoryValue = (value) => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (typeof value !== "object") return "";

  return String(
    firstPresentValue(
      value.name,
      value.Name,
      value.slug,
      value.Slug,
      value.apiName,
      value.ApiName,
      value.categoryName,
      value.CategoryName,
      value.serviceCategory,
      value.ServiceCategory
    ) || ""
  ).trim();
};

const normalizeIdValues = (...values) => [
  ...new Set(
    values
      .flatMap((value) => {
        if (Array.isArray(value)) return normalizeIdValues(...value);
        if (value && typeof value === "object") {
          return [
            value.id,
            value.Id,
            value.value,
            value.Value,
            value.serviceNameId,
            value.ServiceNameId,
            value.serviceNameID,
            value.ServiceNameID,
          ];
        }

        return value;
      })
      .map((value) => String(value || "").trim())
      .filter(Boolean)
  ),
];

const normalizePackagePayload = (packageItem = {}) => {
  const nestedPackage =
    packageItem.package ||
    packageItem.Package ||
    packageItem.packageDto ||
    packageItem.PackageDto ||
    packageItem.packageDTO ||
    packageItem.PackageDTO ||
    packageItem.packageDetails ||
    packageItem.PackageDetails ||
    packageItem.details ||
    packageItem.Details ||
    {};

  if (!nestedPackage || typeof nestedPackage !== "object") return packageItem;

  return {
    ...nestedPackage,
    ...packageItem,
    images: firstNonEmptyArray(
      packageItem.images,
      packageItem.Images,
      packageItem.imageUrls,
      packageItem.ImageUrls,
      packageItem.packageImages,
      packageItem.PackageImages,
      packageItem.imageFiles,
      packageItem.ImageFiles,
      packageItem.files,
      packageItem.Files,
      nestedPackage.images,
      nestedPackage.Images,
      nestedPackage.imageUrls,
      nestedPackage.ImageUrls,
      nestedPackage.packageImages,
      nestedPackage.PackageImages,
      nestedPackage.imageFiles,
      nestedPackage.ImageFiles,
      nestedPackage.files,
      nestedPackage.Files
    ),
    neighborhoods: firstNonEmptyArray(
      packageItem.neighborhoods,
      packageItem.Neighborhoods,
      packageItem.neighborhoodDtos,
      packageItem.NeighborhoodDtos,
      nestedPackage.neighborhoods,
      nestedPackage.Neighborhoods,
      nestedPackage.neighborhoodDtos,
      nestedPackage.NeighborhoodDtos
    ),
  };
};

const getProviderName = (item) =>
  getNamedValue(item.partnerName) ||
  getNamedValue(item.PartnerName) ||
  getNamedValue(item.providerName) ||
  getNamedValue(item.ProviderName) ||
  getNamedValue(item.signatoryName) ||
  getNamedValue(item.SignatoryName) ||
  getNamedValue(item.partner) ||
  getNamedValue(item.Partner) ||
  getNamedValue(item.provider) ||
  getNamedValue(item.Provider) ||
  getNamedValue(item.signatory) ||
  getNamedValue(item.Signatory) ||
  getNamedValue(item.userName) ||
  getNamedValue(item.UserName) ||
  getNamedValue(item.company) ||
  getNamedValue(item.Company) ||
  "Provider";

const getPackageServices = (packageItem) => [
  ...(Array.isArray(packageItem.services) ? packageItem.services : []),
  ...(Array.isArray(packageItem.Services) ? packageItem.Services : []),
];

const getPackageServiceNames = (packageItem) => {
  const services = getPackageServices(packageItem);

  return [
    packageItem.serviceName,
    packageItem.ServiceName,
    packageItem.serviceNameDto,
    packageItem.ServiceNameDto,
    packageItem.serviceNameDTO,
    packageItem.ServiceNameDTO,
    packageItem.service,
    packageItem.Service,
    ...services,
    ...services.map((service) => service?.serviceName || service?.ServiceName),
    ...services.map(
      (service) =>
        service?.serviceNameDto ||
        service?.ServiceNameDto ||
        service?.serviceNameDTO ||
        service?.ServiceNameDTO
    ),
  ]
    .map(getNamedValue)
    .filter(Boolean);
};

const getPackageServiceNameIds = (packageItem) => {
  const services = getPackageServices(packageItem);

  return normalizeIdValues(
    packageItem.serviceNameId,
    packageItem.ServiceNameId,
    packageItem.serviceNameID,
    packageItem.ServiceNameID,
    packageItem.serviceName,
    packageItem.ServiceName,
    packageItem.serviceNameDto,
    packageItem.ServiceNameDto,
    packageItem.serviceNameDTO,
    packageItem.ServiceNameDTO,
    packageItem.service?.serviceNameId,
    packageItem.service?.ServiceNameId,
    packageItem.service?.serviceName,
    packageItem.service?.ServiceName,
    services.map((service) => [
      service?.serviceNameId,
      service?.ServiceNameId,
      service?.serviceName,
      service?.ServiceName,
      service?.serviceNameDto,
      service?.ServiceNameDto,
      service?.serviceNameDTO,
      service?.ServiceNameDTO,
    ])
  );
};

const findCategorySlug = (categoryValue) => {
  const normalizedCategory = normalizeComparableText(categoryValue);

  if (!normalizedCategory) return "";

  return (
    serviceCategories.find((category) => {
      const aliases = [
        category.slug,
        category.apiName,
        category.title,
        category.title.replace(/&/g, "and"),
      ].map(normalizeComparableText);

      return aliases.some(
        (alias) =>
          alias && (normalizedCategory === alias || normalizedCategory.includes(alias))
      );
    })?.slug || ""
  );
};

const getPackageCategorySlug = (packageItem) => {
  const services = getPackageServices(packageItem);
  const categoryValues = [
    packageItem.serviceCategory,
    packageItem.ServiceCategory,
    packageItem.categoryName,
    packageItem.CategoryName,
    packageItem.category,
    packageItem.Category,
    packageItem.serviceName?.categoryName,
    packageItem.ServiceName?.CategoryName,
    packageItem.serviceNameDto?.categoryName,
    packageItem.ServiceNameDto?.CategoryName,
    packageItem.service?.serviceCategory,
    packageItem.service?.ServiceCategory,
    packageItem.service?.categoryName,
    packageItem.service?.CategoryName,
    ...services.flatMap((service) => [
      service?.serviceCategory,
      service?.ServiceCategory,
      service?.categoryName,
      service?.CategoryName,
      service?.category,
      service?.Category,
      service?.serviceName?.categoryName,
      service?.ServiceName?.CategoryName,
    ]),
  ]
    .map(getCategoryValue)
    .filter(Boolean);

  for (const categoryValue of categoryValues) {
    const categorySlug = findCategorySlug(categoryValue);

    if (categorySlug) return categorySlug;
  }

  return "";
};

const pickImageUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return "";

  return (
    value.url ||
    value.Url ||
    value.imageUrl ||
    value.ImageUrl ||
    value.image ||
    value.Image ||
    value.path ||
    value.Path ||
    value.fileUrl ||
    value.FileUrl ||
    ""
  );
};

const getPackageCardImage = (packageItem, fallbackImage = "") => {
  const services = getPackageServices(packageItem);
  const directImages = [
    packageItem.image,
    packageItem.Image,
    packageItem.imageUrl,
    packageItem.ImageUrl,
    packageItem.coverImage,
    packageItem.CoverImage,
    packageItem.mainImage,
    packageItem.MainImage,
    packageItem.serviceImage,
    packageItem.ServiceImage,
    packageItem.service?.image,
    packageItem.service?.Image,
    packageItem.service?.imageUrl,
    packageItem.service?.ImageUrl,
    ...services.flatMap((service) => [
      service?.image,
      service?.Image,
      service?.imageUrl,
      service?.ImageUrl,
      service?.coverImage,
      service?.CoverImage,
      service?.mainImage,
      service?.MainImage,
    ]),
  ];
  const imageCollections = [
    packageItem.images,
    packageItem.Images,
    packageItem.imageUrls,
    packageItem.ImageUrls,
    packageItem.packageImages,
    packageItem.PackageImages,
    packageItem.serviceImages,
    packageItem.ServiceImages,
    packageItem.imageFiles,
    packageItem.ImageFiles,
    packageItem.files,
    packageItem.Files,
    packageItem.service?.images,
    packageItem.service?.Images,
    packageItem.service?.imageUrls,
    packageItem.service?.ImageUrls,
    ...services.flatMap((service) => [
      service?.images,
      service?.Images,
      service?.imageUrls,
      service?.ImageUrls,
      service?.serviceImages,
      service?.ServiceImages,
      service?.imageFiles,
      service?.ImageFiles,
      service?.files,
      service?.Files,
    ]),
  ];

  for (const image of directImages) {
    const imageUrl = pickImageUrl(image);

    if (imageUrl) return imageUrl;
  }

  for (const collection of imageCollections) {
    if (!Array.isArray(collection)) continue;

    for (const image of collection) {
      const imageUrl = pickImageUrl(image);

      if (imageUrl) return imageUrl;
    }
  }

  return fallbackImage;
};

const normalizePackageCard = (
  packageItem,
  fallbackServiceName = "",
  fallbackImage = ""
) => {
  packageItem = normalizePackagePayload(packageItem || {});
  const serviceNames = getPackageServiceNames(packageItem);
  const serviceNameIds = getPackageServiceNameIds(packageItem);
  const neighborhoods = [
    ...(Array.isArray(packageItem.neighborhoods) ? packageItem.neighborhoods : []),
    ...(Array.isArray(packageItem.Neighborhoods) ? packageItem.Neighborhoods : []),
    ...(Array.isArray(packageItem.neighborhoodDtos)
      ? packageItem.neighborhoodDtos
      : []),
    ...(Array.isArray(packageItem.NeighborhoodDtos)
      ? packageItem.NeighborhoodDtos
      : []),
  ];
  const neighborhoodName =
    neighborhoods
      .map(
        (item) =>
          getNamedValue(item) ||
          item?.neighborhoodName ||
          item?.NeighborhoodName ||
          item?.label ||
          item?.Label
      )
      .filter(Boolean)
      .join(", ") ||
    packageItem.neighborhoodName ||
    packageItem.NeighborhoodName ||
    packageItem.neighborhood?.name ||
    packageItem.Neighborhood?.Name ||
    "";
  const governorateName =
    packageItem.governorateName ||
    packageItem.GovernorateName ||
    packageItem.governorate?.name ||
    packageItem.governorate?.Name ||
    packageItem.Governorate?.name ||
    packageItem.Governorate?.Name ||
    "";
  const price =
    Number(
      firstPresentValue(
        packageItem.servicePrice,
        packageItem.ServicePrice,
        packageItem.price,
        packageItem.Price,
        packageItem.packagePrice,
        packageItem.PackagePrice
      ) ?? 0
    ) || 0;

  return {
    id: String(
      firstPresentValue(
        packageItem.id,
        packageItem.Id,
        packageItem.packageId,
        packageItem.PackageId,
        packageItem.packageID,
        packageItem.PackageID
      ) || ""
    ),
    type: "package",
    providerName: getProviderName(packageItem),
    providerRole:
      packageItem.partnerType ||
      packageItem.PartnerType ||
      packageItem.providerRole ||
      packageItem.ProviderRole ||
      packageItem.providerType ||
      packageItem.ProviderType ||
      packageItem.accountType ||
      packageItem.AccountType ||
      "",
    name:
      packageItem.name ||
      packageItem.Name ||
      packageItem.packageName ||
      packageItem.PackageName ||
      serviceNames[0] ||
      fallbackServiceName,
    serviceName: serviceNames[0] || fallbackServiceName,
    serviceNames,
    serviceNameIds,
    description:
      packageItem.description ||
      packageItem.Description ||
      packageItem.packageDescription ||
      packageItem.PackageDescription ||
      packageItem.subDescription ||
      packageItem.SubDescription ||
      packageItem.details ||
      packageItem.Details ||
      "",
    price,
    currency:
      packageItem.currency ||
      packageItem.Currency ||
      packageItem.packageCurrency ||
      packageItem.PackageCurrency ||
      "EGP",
    recurrence:
      packageItem.recurrence ||
      packageItem.Recurrence ||
      packageItem.pricingType ||
      packageItem.PricingType ||
      "",
    daysPerInterval:
      packageItem.daysPerInterval ||
      packageItem.DaysPerInterval ||
      packageItem.times ||
      packageItem.Times ||
      "",
    categorySlug: getPackageCategorySlug(packageItem),
    image: getPackageCardImage(packageItem, fallbackImage),
    location: [neighborhoodName, governorateName].filter(Boolean).join(", "),
    raw: packageItem,
  };
};

const doesCardMatchSelectedService = (
  card,
  selectedServiceName,
  fallbackServiceName,
  fallbackServiceNameId
) => {
  const selectedIds = normalizeIdValues(
    selectedServiceName?.id,
    fallbackServiceNameId
  ).map(normalizeComparableText);
  const cardServiceIds = normalizeIdValues(card.serviceNameIds).map(
    normalizeComparableText
  );

  if (
    selectedIds.length > 0 &&
    cardServiceIds.some((serviceId) => selectedIds.includes(serviceId))
  ) {
    return true;
  }

  const cardServiceNames = (card.serviceNames || [])
    .map(normalizeComparableText)
    .filter(Boolean);

  if (!cardServiceIds.length && !cardServiceNames.length) return true;

  const selectedLabel = normalizeComparableText(
    selectedServiceName?.label || fallbackServiceName
  );

  if (!selectedLabel) return true;

  return cardServiceNames.some(
    (serviceName) =>
      serviceName === selectedLabel ||
      serviceName.includes(selectedLabel) ||
      selectedLabel.includes(serviceName)
  );
};

const doesCardMatchSearch = (card, searchQuery) => {
  const query = normalizeText(searchQuery);

  if (!query) return true;

  return [
    card.providerName,
    card.name,
    card.serviceName,
    card.description,
    card.location,
  ]
    .filter(Boolean)
    .some((value) => normalizeText(value).includes(query));
};

const doesCardMatchProviderType = (card, providerType) => {
  if (providerType === "all") return true;
  if (providerType === "alaa-eldien") {
    return isAlaaEldienProvider({
      providerName: card.providerName,
      providerRole: card.providerRole,
      raw: card.raw,
    });
  }

  if (!card.providerRole) return true;

  const providerRole = normalizeText(card.providerRole);

  if (providerType === "individual") {
    return providerRole.includes("provider") || providerRole.includes("individual");
  }

  return providerRole.includes(providerType);
};

function FilterSegment({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-[#D8DDEB] bg-white p-2">
      {options.map((option) => {
        const isActive = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`min-h-10 rounded-xl px-4 font-['Roboto'] text-[14px] font-semibold transition ${
              isActive
                ? "bg-[#011C60] text-white shadow-[0px_10px_24px_rgba(1,28,96,0.2)]"
                : "text-[#011C60] hover:bg-[#F3F5FA]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ProviderResultCard({ card, categorySlug, returnTo = "" }) {
  const detailPath =
    card.type === "package"
      ? `/services/package/${card.id}`
      : `/services/${categorySlug}/${card.id}?mode=one-time`;
  const cardImage = card.image || noServicesImage;
  const packageInterval = [card.recurrence, card.daysPerInterval]
    .filter(Boolean)
    .join(" / ");

  return (
    <article className="flex min-h-[430px] flex-col overflow-hidden rounded-2xl border border-[#D8DDEB] bg-white shadow-[0px_10px_26px_rgba(1,28,96,0.08)] transition hover:-translate-y-1 hover:border-[#011C60] hover:shadow-[0px_18px_36px_rgba(1,28,96,0.12)]">
      <div className="h-40 bg-[#F3F5FA]">
        <img
          src={cardImage}
          alt=""
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = noServicesImage;
          }}
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-['Roboto'] text-[13px] font-semibold uppercase text-[#808DAF]">
            Provider
          </p>
          <h2 className="mt-1 line-clamp-2 font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60]">
            {card.providerName}
          </h2>
        </div>
        <span className="rounded-full bg-[#FFF4C4] px-3 py-1 font-['Roboto'] text-[13px] font-bold text-[#011C60]">
          ★ {STATIC_RATING}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <p className="font-['Roboto'] text-[16px] font-semibold leading-6 text-[#011C60]">
            {card.name || card.serviceName}
          </p>
          {card.type === "package" && card.serviceName && card.serviceName !== card.name && (
            <p className="mt-1 font-['Roboto'] text-[13px] font-semibold uppercase text-[#808DAF]">
              {card.serviceName}
            </p>
          )}
          {card.type === "package" && packageInterval && (
            <p className="mt-2 inline-flex rounded-full bg-[#F3F5FA] px-3 py-1 font-['Roboto'] text-[12px] font-semibold text-[#4D6090]">
              {packageInterval}
            </p>
          )}
        </div>
        <p className="line-clamp-3 min-h-[72px] font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
          {card.description || "Details are available on the next screen."}
        </p>
        <p className="font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
          <span className="font-semibold text-[#011C60]">Location:</span>{" "}
          {card.location || "Not specified"}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-5">
        <span className="font-['Roboto'] text-[15px] font-semibold text-[#011C60]">
          {formatServicePrice(card.price, card.currency)}
        </span>
        <Link
          to={detailPath}
          state={
            card.type === "package"
              ? {
                  returnTo,
                  packageItem: card.raw,
                }
              : undefined
          }
          className="flex min-h-11 items-center justify-center rounded-xl bg-[#011C60] px-4 font-['Roboto'] text-[15px] font-semibold text-white transition hover:bg-[#02237a]"
        >
          {card.type === "package" ? "Package Details" : "Service Details"}
        </Link>
      </div>
      </div>
    </article>
  );
}

export default function ServiceProvidersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categorySlug, serviceNameId } = useParams();
  const decodedServiceNameId = decodeURIComponent(serviceNameId || "");
  const serviceTypeFromSearch = getServiceTypeFromSearch(location.search);
  const [activeProviderType, setActiveProviderType] = useState("all");
  const [activeServiceType, setActiveServiceType] = useState(
    serviceTypeFromSearch || "one-time"
  );
  const [selectedGovernorateId, setSelectedGovernorateId] = useState("");
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceNames, setServiceNames] = useState([]);
  const [cards, setCards] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [governorates, setGovernorates] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServiceNames, setIsLoadingServiceNames] = useState(true);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const previousFilterKeyRef = useRef("");

  const category = useMemo(
    () => serviceCategories.find((item) => item.slug === categorySlug),
    [categorySlug]
  );
  const selectedServiceName = useMemo(
    () => findServiceNameById(serviceNames, decodedServiceNameId),
    [decodedServiceNameId, serviceNames]
  );
  const selectedServiceLabel =
    selectedServiceName?.label || decodedServiceNameId.replace(/[-_]+/g, " ");
  const packageReturnTo = useMemo(() => {
    const params = new URLSearchParams(location.search);

    params.set("serviceType", "packages");

    return `${location.pathname}?${params.toString()}`;
  }, [location.pathname, location.search]);

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
    if (!isSupportedServiceCategory(categorySlug)) return undefined;

    let isMounted = true;

    const loadServiceNames = async () => {
      setIsLoadingServiceNames(true);

      try {
        const response = await getServiceNames({ language: SERVICE_LANGUAGE });
        const nextServiceNames = filterServiceNamesByCategory(
          normalizeServiceNameList(extractApiArray(response)),
          categorySlug
        );

        if (isMounted) setServiceNames(nextServiceNames);
      } catch {
        if (isMounted) setServiceNames([]);
      } finally {
        if (isMounted) setIsLoadingServiceNames(false);
      }
    };

    loadServiceNames();

    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  useEffect(() => {
    if (!serviceTypeFromSearch || serviceTypeFromSearch === activeServiceType) {
      return;
    }

    setActiveServiceType(serviceTypeFromSearch);
  }, [activeServiceType, serviceTypeFromSearch]);

  useEffect(() => {
    let isMounted = true;

    const loadGovernorates = async () => {
      setIsLoadingLocations(true);

      try {
        const response = await getGovernorates(SERVICE_LANGUAGE);

        if (isMounted) setGovernorates(normalizeLocationOptions(response));
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

        if (isMounted) setNeighborhoods(normalizeLocationOptions(response));
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
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (!isSupportedServiceCategory(categorySlug)) return undefined;
    if (isLoadingServiceNames && !selectedServiceName) return undefined;

    let isMounted = true;

    const loadCards = async () => {
      const filterKey = [
        activeProviderType,
        activeServiceType,
        categorySlug,
        selectedServiceLabel,
        debouncedSearchQuery,
        selectedGovernorateId,
        selectedNeighborhoodId,
      ].join("|");

      if (previousFilterKeyRef.current !== filterKey) {
        previousFilterKeyRef.current = filterKey;

        if (currentPage !== 1) {
          setCurrentPage(1);
          return;
        }
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const sharedParams = {
          page: currentPage,
          pageSize: PAGE_SIZE,
          language: SERVICE_LANGUAGE,
          search: selectedServiceLabel,
          governorateId: selectedGovernorateId || undefined,
          neighborhoodId: selectedNeighborhoodId || undefined,
        };
        const response =
          activeServiceType === "packages"
            ? await getPackages(sharedParams)
            : await getServices({
                ...sharedParams,
                category: getApiCategoryName(categorySlug),
                role: getRoleQueryValue(activeProviderType),
              });
        const rawItems = extractApiArray(response);
        const normalizedCards =
          activeServiceType === "packages"
            ? rawItems
                .map((packageItem) =>
                  normalizePackageCard(
                    packageItem,
                    selectedServiceLabel,
                    category?.image
                  )
                )
                .filter((card) => card.id)
                .filter((card) =>
                  doesCardMatchSelectedService(
                    card,
                    selectedServiceName,
                    selectedServiceLabel,
                    decodedServiceNameId
                  )
                )
                .filter(
                  (card) => !card.categorySlug || card.categorySlug === categorySlug
                )
                .filter((card) =>
                  doesCardMatchProviderType(card, activeProviderType)
                )
            : rawItems
                .map((service) => normalizeService(service, category?.image))
                .filter((service) => service.id)
                .map((service) => ({
                  ...service,
                  type: "service",
                  serviceName: service.name,
                }));
        const nextCards = normalizedCards.filter((card) =>
          doesCardMatchSearch(card, debouncedSearchQuery)
        );
        const nextTotalPages = extractTotalPages(response);
        const responseData = response?.data ?? response;
        const responseMeta = responseData?.metaData || responseData?.metadata || {};

        if (!isMounted) return;

        if (currentPage > nextTotalPages) {
          setCurrentPage(nextTotalPages);
          return;
        }

        setCards(nextCards);
        setTotalPages(nextTotalPages);
        setTotalItems(
          activeServiceType === "packages" && nextCards.length !== rawItems.length
            ? nextCards.length
            : Number(
                responseMeta.total ??
                  responseMeta.totalCount ??
                  responseMeta.totalItems ??
                  responseMeta.count ??
                  nextCards.length
              ) || 0
        );
      } catch (error) {
        if (!isMounted) return;

        setCards([]);
        setTotalPages(1);
        setTotalItems(0);
        setErrorMessage(
          getApiErrorMessage(error, "Unable to load providers right now.")
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCards();

    return () => {
      isMounted = false;
    };
  }, [
    activeProviderType,
    activeServiceType,
    category?.image,
    categorySlug,
    currentPage,
    debouncedSearchQuery,
    decodedServiceNameId,
    isLoadingServiceNames,
    selectedGovernorateId,
    selectedNeighborhoodId,
    selectedServiceLabel,
    selectedServiceName,
  ]);

  const handleGovernorateChange = (governorateId) => {
    setSelectedGovernorateId(governorateId);
    setSelectedNeighborhoodId("");
  };

  const handleResetFilters = () => {
    setActiveProviderType("all");
    setActiveServiceType("one-time");
    setSelectedGovernorateId("");
    setSelectedNeighborhoodId("");
    setSearchQuery("");
  };

  if (!category || !isSupportedServiceCategory(categorySlug)) {
    return <Navigate to="/services/service-categories" replace />;
  }

  return (
    <div className="bg-[#F8F9FC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <BackCircleButton onClick={() => navigate(`/services/${categorySlug}`)} />

        <header className="mt-8">
          <p className="font-['Roboto'] text-[14px] font-semibold uppercase text-[#808DAF]">
            {category.title}
          </p>
          <h1 className="mt-2 font-['Roboto'] text-[30px] font-semibold leading-[42px] text-[#011C60] sm:text-[38px] sm:leading-[52px]">
            {selectedServiceLabel}
          </h1>
          <p className="mt-3 max-w-3xl font-['Roboto'] text-[16px] leading-7 text-[#6777A0]">
            Compare providers and packages for this service, then open details to
            book.
          </p>
          {isLoadingServiceNames && (
            <p className="mt-2 font-['Roboto'] text-[13px] text-[#808DAF]">
              Checking service name...
            </p>
          )}
        </header>

        <section className="mt-8 rounded-2xl border border-[#D8DDEB] bg-white p-4 shadow-[0px_12px_32px_rgba(1,28,96,0.08)]">
          <div className="flex flex-col gap-4">
            <FilterSegment
              options={PROVIDER_TYPE_OPTIONS}
              value={activeProviderType}
              onChange={setActiveProviderType}
            />

            <FilterSegment
              options={SERVICE_TYPE_OPTIONS}
              value={activeServiceType}
              onChange={setActiveServiceType}
            />

            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_minmax(260px,1.3fr)]">
              <CreativeDropdown
                label="Governorate"
                value={selectedGovernorateId}
                options={governorateOptions}
                onChange={handleGovernorateChange}
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

              <SearchInput
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search provider, description, or location"
                size="compact"
              />
            </div>

            {isLoadingLocations && (
              <p className="font-['Roboto'] text-[13px] text-[#808DAF]">
                Loading location filters...
              </p>
            )}

            <div className="flex flex-col gap-3 border-t border-[#E6E8EF] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-['Roboto'] text-[14px] font-medium text-[#6777A0]">
                {isLoading
                  ? "Loading results..."
                  : `${totalItems} result${totalItems === 1 ? "" : "s"} found`}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="min-h-10 rounded-xl border border-[#CCD2DF] bg-white px-4 font-['Roboto'] text-[14px] font-semibold text-[#011C60] transition hover:border-[#011C60] hover:bg-[#F8F9FC]"
              >
                Reset filters
              </button>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-[#F5C2C7] bg-[#FFF5F5] px-5 py-4 font-['Roboto'] text-[15px] text-[#842029]">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={`provider-result-loader-${index + 1}`}
                className="h-[300px] animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        ) : cards.length > 0 ? (
          <>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => (
                <ProviderResultCard
                  key={`${card.type}-${card.id}`}
                  card={card}
                  categorySlug={categorySlug}
                  returnTo={packageReturnTo}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <section className="mt-8 rounded-[28px] border border-dashed border-[#CCD2DF] bg-white px-6 py-12 text-center shadow-[0px_14px_34px_rgba(204,210,223,0.28)]">
            <img
              src={noServicesImage}
              alt=""
              className="mx-auto h-32 w-32 object-contain"
            />
            <h3 className="mt-6 font-['Roboto'] text-[28px] font-semibold leading-10 text-[#011C60]">
              No results yet
            </h3>
            <p className="mx-auto mt-3 max-w-[520px] font-['Roboto'] text-[16px] leading-7 text-[#808DAF]">
              Try another provider type, switch between services and packages,
              or change the location filters.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
