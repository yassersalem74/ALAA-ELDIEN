import { useEffect, useState } from "react";
import { getMyServices } from "../../api/services/service.api.js";
import { serviceCategories } from "../../data/serviceFlowData";
import ServiceCategoryTable from "./ServiceCategoryTable";
import { BriefcaseIcon, PANEL_CLASS_NAME } from "./PartnerFlowShared";

// Map sub-service slugs to main category slugs
const getMainCategorySlug = (categoryName) => {
  // Assuming categoryName is the slug of the sub-service
  for (const category of serviceCategories) {
    if (category.subServices.some(sub => sub.slug === categoryName)) {
      return category.slug;
    }
  }
  return null;
};

const mainCategories = serviceCategories.filter(cat => cat.slug !== 'real-estate'); // Exclude real-estate as per earlier filter

export default function ServiceDashboard({ onAddNewService }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await getMyServices({ page: 1, search: '' });
      setServices(response.data || []);
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupedServices = services.reduce((acc, service) => {
    const mainCat = getMainCategorySlug(service.categoryName);
    if (mainCat) {
      if (!acc[mainCat]) acc[mainCat] = [];
      acc[mainCat].push(service);
    }
    return acc;
  }, {});

  const categoryCounts = mainCategories.map(cat => ({
    ...cat,
    count: groupedServices[cat.slug]?.length || 0
  }));

  if (selectedCategory) {
    return (
      <ServiceCategoryTable
        category={selectedCategory}
        services={groupedServices[selectedCategory.slug] || []}
        onBack={() => setSelectedCategory(null)}
        onRefresh={fetchServices}
      />
    );
  }

  return (
    <section className={PANEL_CLASS_NAME}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60]">
              Service Dashboard
            </h3>
            <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
              Manage your services across different categories.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddNewService}
            className="min-h-12 min-w-[190px] cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold leading-6 text-white transition hover:bg-[#02267F]"
          >
            Add New Service
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#6777A0]">Loading services...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {categoryCounts.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#E6E8EF] bg-white p-6 text-left shadow-[0px_12px_30px_rgba(17,27,71,0.05)] transition hover:border-[#011C60] hover:shadow-[0px_12px_40px_rgba(17,27,71,0.08)]"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-['Roboto'] text-[18px] font-semibold text-[#011C60]">
                      {category.shortLabel}
                    </h4>
                    <p className="font-['Roboto'] text-[14px] text-[#6777A0]">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF3FF]">
                  <span className="font-['Roboto'] text-[16px] font-semibold text-[#011C60]">
                    {category.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}