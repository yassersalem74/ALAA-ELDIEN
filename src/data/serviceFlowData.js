import carCareCategoryImage from "../assets/images/service/carcare-service.png";
import cleaningImage from "../assets/images/service/cleaning.png";
import electricalImage from "../assets/images/service/electrical.png";
import homeCategoryImage from "../assets/images/service/home-service.png";
import personalCareCategoryImage from "../assets/images/service/personalcare-service.png";
import plumbingImage from "../assets/images/service/plumping.png";
import realEstateCategoryImage from "../assets/images/service/realstate-service.png";
import repairImage from "../assets/images/service/repair.png";
import serviceProvider1Image from "../assets/images/service/serviceProvider1.png";
import serviceProvider2Image from "../assets/images/service/serviceProvider2.png";
import serviceProvider3Image from "../assets/images/service/serviceProvider3.png";

const normalizeSlug = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const unique = (items) => [...new Set(items)];

export const PROVIDER_TYPE_OPTIONS = [
  { id: "all", label: "All Providers" },
  { id: "individual", label: "Individual" },
  { id: "company", label: "Company" },
  { id: "alaa-eldien", label: "Alaa Eldien" },
];

export const PRICE_RANGE_OPTIONS = [
  { id: "all", label: "All Prices", min: 0, max: Number.POSITIVE_INFINITY },
  { id: "budget", label: "0 - 200 EGP", min: 0, max: 200 },
  { id: "mid", label: "201 - 350 EGP", min: 201, max: 350 },
  { id: "premium", label: "351+ EGP", min: 351, max: Number.POSITIVE_INFINITY },
];

export const RATING_OPTIONS = [1, 2, 3, 4, 5];

export const FALLBACK_GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Dakahlia",
  "Sharqia",
  "Monufia",
  "Fayoum",
  "Suez",
  "Ismailia",
];

export const COMMON_TIME_SLOTS = [
  "08:00 AM",
  "10:00 AM",
  "12:00 PM",
  "02:00 PM",
  "04:00 PM",
  "06:00 PM",
];

const providerSeeds = {
  individual: [
    {
      name: "Sarah Jenkis",
      image: serviceProvider1Image,
      rating: 4.9,
      reviewCount: 2150,
      area: "Zahraa Maadi",
      governorate: "Cairo",
      experienceLabel: "5 Years Experience",
      multiplier: 1,
    },
    {
      name: "Ahmed Wael",
      image: serviceProvider2Image,
      rating: 4.7,
      reviewCount: 1280,
      area: "Heliopolis",
      governorate: "Cairo",
      experienceLabel: "4 Years Experience",
      multiplier: 1.05,
    },
    {
      name: "Mona Adel",
      image: serviceProvider3Image,
      rating: 4.8,
      reviewCount: 1640,
      area: "Dokki",
      governorate: "Giza",
      experienceLabel: "6 Years Experience",
      multiplier: 1.08,
    },
  ],
  company: [
    {
      name: "BlueNest Services",
      image: serviceProvider2Image,
      rating: 4.8,
      reviewCount: 3120,
      area: "6th of October",
      governorate: "Giza",
      experienceLabel: "8 Years Experience",
      multiplier: 1.12,
    },
    {
      name: "PrimeCare Solutions",
      image: serviceProvider1Image,
      rating: 4.6,
      reviewCount: 1985,
      area: "Nasr City",
      governorate: "Cairo",
      experienceLabel: "7 Years Experience",
      multiplier: 1.15,
    },
    {
      name: "UrbanFix Group",
      image: serviceProvider3Image,
      rating: 4.7,
      reviewCount: 2410,
      area: "Stanley",
      governorate: "Alexandria",
      experienceLabel: "9 Years Experience",
      multiplier: 1.18,
    },
  ],
  "alaa-eldien": [
    {
      name: "Alaa Eldien Elite",
      image: serviceProvider3Image,
      rating: 4.9,
      reviewCount: 4120,
      area: "New Cairo",
      governorate: "Cairo",
      experienceLabel: "Trusted by 3000+ local families",
      multiplier: 1.22,
    },
    {
      name: "Alaa Eldien Care",
      image: serviceProvider1Image,
      rating: 4.8,
      reviewCount: 2860,
      area: "Mohandessin",
      governorate: "Giza",
      experienceLabel: "Premium Crew",
      multiplier: 1.24,
    },
    {
      name: "Alaa Eldien Express",
      image: serviceProvider2Image,
      rating: 4.9,
      reviewCount: 3650,
      area: "Sheikh Zayed",
      governorate: "Giza",
      experienceLabel: "Rapid Dispatch",
      multiplier: 1.28,
    },
  ],
};

const galleryImages = [
  serviceProvider1Image,
  serviceProvider2Image,
  serviceProvider3Image,
];

const createProviderDescription = (service) =>
  `Professional ${service.title.toLowerCase()} services to keep your plans simple, reliable, and stress free.`;

const createProviderLongDescription = (service, providerName) => [
  `Our ${service.title.toLowerCase()} service is designed to make your day easier by delivering reliable, high-quality support whenever you need it.`,
  `From ${service.description.toLowerCase()}, ${providerName} works with trusted specialists who handle every task with care, speed, and professionalism.`,
  "Whether you need a one-time visit or repeated support, we make the experience clear, flexible, and easy to book.",
];

const createProviderHighlights = (service) => [
  `Experienced and verified ${service.title.toLowerCase()} specialists`,
  "Flexible booking times that fit your schedule",
  "Transparent pricing with no hidden fees",
  "High standards of safety and professionalism",
];

const createProviderPageDescription = (service) =>
  service.providerDescription ||
  "Compare top-rated providers, verified for quality and reliability. Instant booking available for local verified specialists.";

const createProviderHeadline = (service) =>
  service.providerHeadline || `Find Your Perfect ${service.title} Specialist`;

const createProviderCards = (service) =>
  Object.entries(providerSeeds).flatMap(([providerType, seeds]) =>
    seeds.map((seed, index) => {
      const basePrice = service.bookingItems[0]?.price || 0;
      const items = service.bookingItems.map((item) => ({
        ...item,
        id: `${service.slug}-${providerType}-${normalizeSlug(item.name)}`,
        price: Math.round(item.price * seed.multiplier),
      }));

      return {
        id: `${service.slug}-${providerType}-${index + 1}`,
        slug: normalizeSlug(`${seed.name}-${service.title}-${index + 1}`),
        providerType,
        name: seed.name,
        title: service.detailTitle || `${service.title} Services`,
        shortDescription: createProviderDescription(service),
        longDescription: createProviderLongDescription(service, seed.name),
        highlights: createProviderHighlights(service),
        rating: seed.rating,
        reviewCount: seed.reviewCount,
        area: seed.area,
        governorate: seed.governorate,
        location: `${seed.area}, ${seed.governorate}`,
        startingPrice: Math.round(basePrice * seed.multiplier),
        image: seed.image,
        gallery: unique([seed.image, ...galleryImages]),
        experienceLabel: seed.experienceLabel,
        serviceArea: `Available across ${seed.governorate}`,
        timeSlots: COMMON_TIME_SLOTS,
        items,
      };
    })
  );

const createSubService = ({
  title,
  description,
  image,
  providerHeadline,
  providerDescription,
  detailTitle,
  bookingItems,
}) => {
  const slug = normalizeSlug(title);
  const service = {
    id: slug,
    slug,
    title,
    description,
    image,
    providerHeadline,
    providerDescription,
    detailTitle,
    bookingItems,
  };

  return {
    ...service,
    providers: createProviderCards(service),
  };
};

export const serviceCategories = [
  {
    id: "home-service",
    slug: "home-service",
    shortLabel: "Home Service",
    title: "Home Services & Maintenance",
    description: "Choose the service you need from our trusted home solutions.",
    count: "+40 Service",
    image: homeCategoryImage,
    subServices: [
      createSubService({
        title: "Plumbing",
        description: "Pipes, leaks, installations, and repairs.",
        image: plumbingImage,
        providerHeadline: "Find Your Perfect Plumbing Specialist",
        providerDescription:
          "Compare top-rated providers, verified for quality and reliability. Instant booking available for trusted local plumbing experts.",
        detailTitle: "Plumbing Services",
        bookingItems: [
          { name: "Leak Fix", price: 120, unit: "per request" },
          { name: "Bathroom Fixture", price: 180, unit: "per task" },
          { name: "Pipe Installation", price: 250, unit: "per service" },
          { name: "Water Heater Repair", price: 300, unit: "per visit" },
        ],
      }),
      createSubService({
        title: "Electrical",
        description: "Wiring, lighting, and electrical maintenance.",
        image: electricalImage,
        providerHeadline: "Find Your Perfect Electrical Specialist",
        providerDescription:
          "Compare top-rated providers, verified for quality and reliability. Instant booking available for local verified electrical teams.",
        detailTitle: "Electrical Services",
        bookingItems: [
          { name: "Light Fixture Repair", price: 140, unit: "per request" },
          { name: "Socket Installation", price: 190, unit: "per task" },
          { name: "Circuit Check", price: 230, unit: "per visit" },
          { name: "Panel Maintenance", price: 340, unit: "per service" },
        ],
      }),
      createSubService({
        title: "Home Cleaning",
        description: "Regular and deep cleaning services.",
        image: cleaningImage,
        providerHeadline: "Find Your Perfect Clean Room Specialist",
        providerDescription:
          "Compare top-rated providers, verified for quality and reliability. Instant booking available for local verified cleaners.",
        detailTitle: "Cleaning Room Services",
        bookingItems: [
          { name: "1 Room", price: 120, unit: "per room" },
          { name: "2 Rooms", price: 220, unit: "per visit" },
          { name: "Kitchen", price: 150, unit: "per space" },
          { name: "Bathroom", price: 110, unit: "per space" },
        ],
      }),
      createSubService({
        title: "Appliance Repair",
        description: "Fixing and maintaining major appliances.",
        image: repairImage,
        providerHeadline: "Find Your Perfect Appliance Repair Specialist",
        providerDescription:
          "Compare top-rated providers, verified for quality and reliability. Instant booking available for local appliance repair teams.",
        detailTitle: "Appliance Repair Services",
        bookingItems: [
          { name: "Washing Machine", price: 220, unit: "per repair" },
          { name: "Refrigerator", price: 280, unit: "per repair" },
          { name: "Oven", price: 240, unit: "per repair" },
          { name: "Dishwasher", price: 260, unit: "per repair" },
        ],
      }),
      createSubService({
        title: "Deep Cleaning",
        description: "Detailed cleaning for move-ins, events, and refreshes.",
        image: cleaningImage,
        providerHeadline: "Find Your Perfect Deep Cleaning Specialist",
        providerDescription:
          "Compare top-rated providers, verified for quality and reliability. Instant booking available for deep cleaning specialists near you.",
        detailTitle: "Deep Cleaning Services",
        bookingItems: [
          { name: "Studio", price: 190, unit: "per visit" },
          { name: "Apartment", price: 320, unit: "per visit" },
          { name: "Kitchen Reset", price: 170, unit: "per service" },
          { name: "Bathroom Reset", price: 150, unit: "per service" },
        ],
      }),
    ],
  },
  {
    id: "real-estate",
    slug: "real-estate",
    shortLabel: "Real Estate",
    title: "Real Estate & Property Care",
    description:
      "Choose the service you need from our trusted property solutions.",
    count: "+30 Service",
    image: realEstateCategoryImage,
    subServices: [
      createSubService({
        title: "Appliance Repair",
        description: "Schedule property tours with verified specialists.",
        image: repairImage,
        detailTitle: "Appliance Repair Services",
        bookingItems: [
          { name: "Apartment Tour", price: 150, unit: "per visit" },
          { name: "Villa Tour", price: 220, unit: "per visit" },
          { name: "Commercial Tour", price: 260, unit: "per visit" },
          { name: "Neighborhood Review", price: 110, unit: "per request" },
        ],
      }),
      createSubService({
        title: "Electrical",
        description: "Get professional property pricing and market guidance.",
        image: electricalImage,
        detailTitle: "Electrical Services",
        bookingItems: [
          { name: "Apartment Valuation", price: 240, unit: "per report" },
          { name: "Villa Valuation", price: 320, unit: "per report" },
          { name: "Commercial Valuation", price: 380, unit: "per report" },
          { name: "Rental Check", price: 190, unit: "per report" },
        ],
      }),
      createSubService({
        title: "Home Cleaning",
        description: "Ongoing support for rented and owned properties.",
        image: cleaningImage,
        detailTitle: "Home Cleaning Services",
        bookingItems: [
          { name: "Monthly Management", price: 260, unit: "per month" },
          { name: "Tenant Follow-up", price: 180, unit: "per request" },
          { name: "Inspection Visit", price: 140, unit: "per visit" },
          { name: "Owner Report", price: 120, unit: "per report" },
        ],
      }),
      createSubService({
        title: "Plumbing",
        description: "Contracts, ownership papers, and rental support.",
        image: plumbingImage,
        detailTitle: "Real Estate Paperwork Services",
        bookingItems: [
          { name: "Contract Review", price: 210, unit: "per file" },
          { name: "Lease Draft", price: 260, unit: "per draft" },
          { name: "Ownership Check", price: 300, unit: "per review" },
          { name: "Registration Support", price: 340, unit: "per request" },
        ],
      }),
    ],
  },
  {
    id: "car-care",
    slug: "car-care",
    shortLabel: "Car Care",
    title: "Car Care & Automotive",
    description: "Choose the service you need from our trusted car solutions.",
    count: "+35 Service",
    image: carCareCategoryImage,
    subServices: [
      createSubService({
        title: "Car Wash",
        description: "Interior and exterior washing packages.",
        image: cleaningImage,
        detailTitle: "Car Wash Services",
        bookingItems: [
          { name: "Exterior Wash", price: 90, unit: "per car" },
          { name: "Interior Clean", price: 130, unit: "per car" },
          { name: "Full Wash", price: 180, unit: "per car" },
          { name: "Wax Finish", price: 160, unit: "per car" },
        ],
      }),
      createSubService({
        title: "Oil Change",
        description: "Engine oil service with quality inspection.",
        image: repairImage,
        detailTitle: "Oil Change Services",
        bookingItems: [
          { name: "Synthetic Oil", price: 240, unit: "per service" },
          { name: "Regular Oil", price: 180, unit: "per service" },
          { name: "Oil Filter", price: 90, unit: "per item" },
          { name: "Quick Inspection", price: 70, unit: "per check" },
        ],
      }),
      createSubService({
        title: "Battery Service",
        description: "Battery checks, charging, and replacement support.",
        image: electricalImage,
        detailTitle: "Battery Services",
        bookingItems: [
          { name: "Battery Check", price: 100, unit: "per visit" },
          { name: "Battery Charge", price: 150, unit: "per visit" },
          { name: "Battery Replacement", price: 320, unit: "per service" },
          { name: "Roadside Jump Start", price: 220, unit: "per request" },
        ],
      }),
      createSubService({
        title: "Interior Detailing",
        description: "Deep refresh for seats, dashboard, and flooring.",
        image: plumbingImage,
        detailTitle: "Interior Detailing Services",
        bookingItems: [
          { name: "Seat Cleaning", price: 150, unit: "per car" },
          { name: "Dashboard Detailing", price: 120, unit: "per car" },
          { name: "Floor Reset", price: 130, unit: "per car" },
          { name: "Full Interior Care", price: 240, unit: "per car" },
        ],
      }),
    ],
  },
  {
    id: "personal-care",
    slug: "personal-care",
    shortLabel: "Personal Care",
    title: "Personal Care Services",
    description:
      "Choose the service you need from our trusted personal care solutions.",
    count: "+28 Service",
    image: personalCareCategoryImage,
    subServices: [
      createSubService({
        title: "Hair Styling",
        description: "Cuts, styling, and grooming sessions.",
        image: plumbingImage,
        detailTitle: "Hair Styling Services",
        bookingItems: [
          { name: "Women Hair Cut", price: 180, unit: "per session" },
          { name: "Men Hair Cut", price: 120, unit: "per session" },
          { name: "Blow Dry", price: 140, unit: "per session" },
          { name: "Hair Treatment", price: 220, unit: "per session" },
        ],
      }),
      createSubService({
        title: "Makeup Artist",
        description: "Event makeup, soft glam, and bridal looks.",
        image: electricalImage,
        detailTitle: "Makeup Artist Services",
        bookingItems: [
          { name: "Soft Glam", price: 260, unit: "per session" },
          { name: "Evening Makeup", price: 320, unit: "per session" },
          { name: "Bridal Trial", price: 380, unit: "per session" },
          { name: "Bridal Day", price: 520, unit: "per session" },
        ],
      }),
      createSubService({
        title: "Massage Therapy",
        description: "Relaxation and recovery sessions at your convenience.",
        image: cleaningImage,
        detailTitle: "Massage Therapy Services",
        bookingItems: [
          { name: "30 Minutes", price: 190, unit: "per session" },
          { name: "60 Minutes", price: 320, unit: "per session" },
          { name: "90 Minutes", price: 420, unit: "per session" },
          { name: "Home Visit Fee", price: 120, unit: "per visit" },
        ],
      }),
      createSubService({
        title: "Personal Trainer",
        description: "Private fitness sessions tailored to your goals.",
        image: repairImage,
        detailTitle: "Personal Training Services",
        bookingItems: [
          { name: "Single Session", price: 220, unit: "per session" },
          { name: "2 Sessions", price: 400, unit: "per package" },
          { name: "Weekly Plan", price: 520, unit: "per package" },
          { name: "Nutrition Add-on", price: 160, unit: "per add-on" },
        ],
      }),
    ],
  },
];

export const getServiceCategoryBySlug = (categorySlug) =>
  serviceCategories.find((category) => category.slug === categorySlug);

export const getSubServiceBySlugs = (categorySlug, serviceSlug) =>
  getServiceCategoryBySlug(categorySlug)?.subServices.find(
    (service) => service.slug === serviceSlug
  );

export const getProviderBySlugs = (categorySlug, serviceSlug, providerSlug) =>
  getSubServiceBySlugs(categorySlug, serviceSlug)?.providers.find(
    (provider) => provider.slug === providerSlug
  );

export const getProviderHeadlineBySlugs = (categorySlug, serviceSlug) => {
  const service = getSubServiceBySlugs(categorySlug, serviceSlug);

  return service ? createProviderHeadline(service) : "";
};

export const getProviderDescriptionBySlugs = (categorySlug, serviceSlug) => {
  const service = getSubServiceBySlugs(categorySlug, serviceSlug);

  return service ? createProviderPageDescription(service) : "";
};
