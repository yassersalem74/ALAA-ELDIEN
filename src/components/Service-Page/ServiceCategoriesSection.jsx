import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";
import { serviceCategories } from "./servicePageData";

export default function ServiceCategoriesSection() {
  return (
    <section className="mx-auto w-full max-w-[1290px]">
      <SectionHeader
        title="Services Categories"
        description="A simple process designed to get things done without hassle."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {serviceCategories.map((category) => (
          <article
            key={category.id}
            className="group flex min-h-[384px] w-full flex-col gap-6 rounded-2xl bg-white p-6 shadow-[0px_4px_16px_rgba(204,210,223,0.35)] transition duration-300 hover:bg-[#023AC6]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[#E6E8EF] p-3 transition duration-300 group-hover:bg-white">
                <img
                  src={category.image}
                  alt=""
                  className="h-20 w-[71px] object-contain"
                />
              </div>

              <span className="flex h-9 w-[120px] shrink-0 items-center justify-center rounded-2xl bg-[#CCD2DF] px-3 py-2.5 text-center font-['Roboto'] text-xs font-medium text-[#4D6090] shadow-[0px_4px_16px_rgba(204,210,223,0.35)] backdrop-blur-xl transition duration-300 group-hover:bg-white group-hover:text-[#023AC6]">
                {category.count}
              </span>
            </div>

            <div className="flex flex-1 flex-col">
              <h3 className="font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60] transition duration-300 group-hover:text-white md:text-[24px] md:leading-[40px]">
                {category.title}
              </h3>
              <p className="mt-2 flex-1 font-['Roboto'] text-[16px] font-normal leading-6 text-[#808DAF] transition duration-300 group-hover:text-white">
                {category.description}
              </p>

              <Link
                to={`/services/${category.slug}`}
                className="cursor-pointer mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-[#011C60] px-8 py-2.5 font-['Roboto'] font-semibold text-white transition duration-300 group-hover:bg-white group-hover:text-[#023AC6]"
              >
                View Services
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
