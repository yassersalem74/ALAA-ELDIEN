import bookRelaxImage from "../../assets/images/service/book-ralax.png";
import carCareImage from "../../assets/images/service/carcare-service.png";
import chooseServiceImage from "../../assets/images/service/choose-service.png";
import homeServiceImage from "../../assets/images/service/home-service.png";
import personalCareImage from "../../assets/images/service/personalcare-service.png";
import selectProviderImage from "../../assets/images/service/select-provider.png";

export const serviceCategories = [
  {
    id: "home-service",
    slug: "home-service",
    apiName: "Home_Care",
    title: "Home Services & Maintenance",
    description:
      "Plumbing, electrical work, cleaning, and home repairs by trusted professionals.",
    count: "Live Services",
    image: homeServiceImage,
  },
  {
    id: "car-care",
    slug: "car-care",
    apiName: "Car_Care",
    title: "Car Care & Automotive",
    description:
      "Car maintenance, washing, repairs, and roadside assistance services.",
    count: "Live Services",
    image: carCareImage,
  },
  {
    id: "personal-care",
    slug: "personal-care",
    apiName: "Personal_Care",
    title: "Personal Care Services",
    description:
      "Tailoring, beauty, fitness, and personal services delivered when you need them.",
    count: "Live Services",
    image: personalCareImage,
  },
];

export const serviceSteps = [
  {
    id: "choose",
    title: "1- Choose a Service",
    description:
      "Browse all available services and pick what fits your needs in seconds.",
    image: chooseServiceImage,
  },
  {
    id: "provider",
    title: "2- Select a Provider",
    description:
      "Compare verified providers, ratings, and availability before you decide.",
    image: selectProviderImage,
  },
  {
    id: "book",
    title: "3- Book & Relax",
    description:
      "Schedule your service, confirm your booking, and let us handle the rest.",
    image: bookRelaxImage,
  },
];
