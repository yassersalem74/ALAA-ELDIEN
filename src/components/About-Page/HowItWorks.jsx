import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      icon: "/explore-icon.png",
      title: "Explore",
      desc: "Browse services, products, and marketplace listings with ease.",
      step: "Step 1",
    },
    {
      icon: "/right-icon.png",
      title: "Choose & Act",
      desc: "Book a service, buy a product, or list what you want to sell.",
      step: "Step 2",
    },
    {
      icon: "/manage-icon.png",
      title: "Manage with Ease",
      desc: "Track your activity and enjoy a smooth, reliable experience.",
      step: "Step 3",
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="px-8 lg:px-20 mx-auto">

        {/* ===== TITLE ===== */}
        <h2 className="text-[#011C60] font-bold text-[28px] md:text-[34px] lg:text-[40px] mb-10">
          How It Work ?
        </h2>

        {/* ===== MAIN GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-center">

          {/* ===== IMAGE (FIRST ON MOBILE) ===== */}
          <div className="flex justify-center lg:justify-end order-1 md:order-2">
            <img
              src="/howItWorksection.png"
              alt="How it works"
              className="
                w-full
                max-w-[320px] md:max-w-[380px] lg:max-w-[444px]
                rounded-[16px]
                object-contain
                shadow-lg
              "
            />
          </div>

          {/* ===== TEXT SIDE ===== */}
          <div className="space-y-3 lg:col-span-2 order-2 md:order-1">

            {steps.map((item, i) => (
              <div
                key={i}
                className="
                  group
                  flex items-start gap-6
                  p-5 rounded-xl
                  transition-all duration-300
                  hover:bg-[#EECE42]
                  cursor-pointer
                "
              >
                {/* ICON CIRCLE */}
                <div
                  className="
                    w-[72px] h-[72px] md:w-[84px] md:h-[84px]
                    min-w-[72px] md:min-w-[84px]
                    rounded-full
                    bg-[#FCF5D9]
                    group-hover:bg-[#E2E8F3]
                    transition-colors duration-300
                    flex items-center justify-center
                    p-2
                  "
                >
                  <img
                    src={item.icon}
                    alt=""
                    className="w-8 h-8 md:w-10 md:h-10 object-contain"
                  />
                </div>

                {/* TEXT */}
                <div className="flex-1">

                  <div className="flex items-center justify-between">
                    <h3 className="
                        font-bold
                        text-[18px] md:text-[22px] lg:text-[28px]
                        text-[#011C60]
                      ">
                      {item.title}
                    </h3>

                    <span className="
                        text-[#011C60]
                        font-medium
                        text-[16px] md:text-[18px]
                        opacity-0
                        group-hover:opacity-100
                        transition
                      ">
                      {item.step}
                    </span>
                  </div>

                  <p className="
                      text-[#808DAF]
                      font-medium
                      text-[14px] md:text-[16px] lg:text-[20px]
                      mt-2
                      leading-relaxed
                    ">
                    {item.desc}
                  </p>

                </div>
              </div>
            ))}

          </div>

        </div>
      </div>
    </section>
  );
}
