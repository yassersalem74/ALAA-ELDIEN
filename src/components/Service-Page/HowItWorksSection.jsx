import SectionHeader from "./SectionHeader";
import { serviceSteps } from "./servicePageData";

export default function HowItWorksSection() {
  return (
    <section className="mx-auto w-full ">
      <SectionHeader
        title="How It Works"
        description="A simple process designed to get things done without hassle."
      />

      <div className="mt-10 grid gap-10 md:grid-cols-3">
        {serviceSteps.map((step) => (
          <article key={step.id} className="flex flex-col items-center text-center">
            <div className="flex h-[150px] w-[150px] items-center justify-center rounded-full bg-white p-2.5 shadow-[0px_4px_16px_rgba(204,210,223,0.5)]">
              <img
                src={step.image}
                alt=""
                className="h-24 w-[102px] object-contain"
              />
            </div>

            <h3 className="mt-6 font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60] md:text-[24px] md:leading-[40px]">
              {step.title}
            </h3>
            <p className="mt-1 max-w-[280px] font-['Roboto'] text-[16px] font-normal leading-6 text-[#808DAF]">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
