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
      <div className="max-w-[1200px] mx-auto px-6">

        {/* ===== TITLE ===== */}
        <h2 className="text-[#011C60] font-bold text-[32px] md:text-[36px] lg:text-[40px] mb-10">
          How It Work ?
        </h2>

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* ===== LEFT SIDE ===== */}
          <div className="space-y-8">

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
                <div className="
                    w-[84px] h-[84px]
                    min-w-[84px]
                    rounded-full
                    bg-[#FCF5D9]
                    flex items-center justify-center
                    p-2
                  ">
                  <img
                    src={item.icon}
                    alt=""
                    className="w-10 h-10 object-contain"
                  />
                </div>

                {/* TEXT */}
                <div className="flex-1 relative">

                  <div className="flex items-center justify-between">

                    <h3 className="
                        font-bold
                        text-[24px] md:text-[28px] lg:text-[36px]
                        text-[#011C60]
                      ">
                      {item.title}
                    </h3>

                    {/* STEP (SHOW ON HOVER ONLY) */}
                    <span className="
                        text-[#011C60]
                        font-medium
                        text-[18px]
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
                      text-[18px] md:text-[20px] lg:text-[24px]
                      mt-2
                      leading-relaxed
                    ">
                    {item.desc}
                  </p>

                </div>
              </div>
            ))}

          </div>

          {/* ===== RIGHT IMAGE ===== */}
          <div className="flex justify-center lg:justify-end">
            <img
              src="/howItWorksection.png"
              alt="How it works"
              className="
                w-full
                max-w-[444px]
                rounded-[16px]
                object-contain
                shadow-lg
              "
            />
          </div>

        </div>
      </div>
    </section>
  );
}
