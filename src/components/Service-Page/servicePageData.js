import bookRelaxImage from "../../assets/images/service/book-ralax.png";
import carCareImage from "../../assets/images/service/carcare-service.png";
import chooseServiceImage from "../../assets/images/service/choose-service.png";
import homeServiceImage from "../../assets/images/service/home-service.png";
import personalCareImage from "../../assets/images/service/personalcare-service.png";
import realEstateImage from "../../assets/images/service/realstate-service.png";
import selectProviderImage from "../../assets/images/service/select-provider.png";
import { serviceCategories as serviceFlowCategories } from "../../data/serviceFlowData";

export const serviceCategories = serviceFlowCategories.map((category) => ({
  id: category.id,
  slug: category.slug,
  title: category.title,
  description:
    category.slug === "home-service"
      ? "Plumbing, electrical work, cleaning, and home repairs by trusted professionals."
      : category.slug === "real-estate"
        ? "Buy, rent, or manage properties with reliable real estate services."
        : category.slug === "car-care"
          ? "Car maintenance, washing, repairs, and roadside assistance services."
          : "Tailoring, beauty, fitness, and personal services delivered when you need them.",
  count: category.count,
  image:
    category.slug === "home-service"
      ? homeServiceImage
      : category.slug === "real-estate"
        ? realEstateImage
        : category.slug === "car-care"
          ? carCareImage
          : personalCareImage,
}));

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
