import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRightIcon,
  BackCircleButton,
  EmptyState,
  SearchInput,
  ServicePageIntro,
} from "../../components/Service-Flow/ServiceFlowShared";
import { getServiceCategoryBySlug } from "../../data/serviceFlowData";

export default function ServiceCategoryPage() {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  const category = getServiceCategoryBySlug(categorySlug);

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const services = category?.subServices || [];

    if (!query) return services;

    return services.filter((service) =>
      [service.title, service.description].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [category, searchQuery]);

  if (!category) {
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
            description={category.description}
          />
        </div>

        <SearchInput
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="mx-auto mt-8 max-w-[735px]"
        />

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <article
              key={service.id}
              className="flex min-h-[352px] flex-col rounded-[9.51px] bg-[#E6E8EF] px-4 pb-6 pt-6 shadow-[0px_10px_24px_rgba(190,198,222,0.25)]"
            >
              <div className="flex-1">
                <h2 className="font-['Roboto'] text-[20px] font-semibold leading-6 text-[#011C60]">
                  {service.title}
                </h2>
                <p className="mt-2 font-['Roboto'] text-[16px] leading-6 text-[#808DAF]">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 flex justify-center">
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-[156px] w-[157px] object-contain"
                />
              </div>

              <Link
                to={`/services/${category.slug}/${service.slug}/providers`}
                className="mt-6 flex h-9 w-full items-center justify-center gap-4 rounded-lg bg-[#EECE42] px-2 font-['Roboto'] text-[16px] font-semibold leading-6 text-[#011C60] transition hover:-translate-y-0.5 hover:bg-[#f7d85a] hover:shadow-[0px_12px_24px_rgba(238,206,66,0.28)]"
              >
                View All Provider
                <ArrowRightIcon className="h-4 w-4" stroke="#011C60" />
              </Link>
            </article>
          ))}
        </div>

        {!filteredServices.length && (
          <div className="mt-10">
            <EmptyState
              title="No services match your search"
              description="Try a different keyword to explore more services in this category."
            />
          </div>
        )}
      </div>
    </div>
  );
}
