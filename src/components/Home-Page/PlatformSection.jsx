import React from "react";

export default function PlatformSection() {
  const features = [
    {
      img: "/platform-mobile.png",
      title: "All-in-One Experience",
      desc: "No need to switch between multiple apps. Everything you need is available in one place.",
    },
    {
      img: "/platform-energy.png",
      title: "Simple & Easy to Use",
      desc: "A clean and intuitive experience designed for effortless browsing, booking, and shopping.",
    },
    {
      img: "/platform-star.png",
      title: "Saves You Time&Effort",
      desc: "Find services, products, or deals quickly without unnecessary steps or complications.",
    },
    {
      img: "/platform-hand.png",
      title: "Built for Users& Busine",
      desc: "A balanced platform that benefits users while helping service providers and sellers grow.",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="px-8 lg:px-20 mx-auto">
        {/* ===== HEADER ===== */}
        <header className="text-center mb-16 space-y-6">
          <h3 className="font-bold text-[28px] text-[#EECE42]">OUR SERVICES</h3>

          <h2 className="font-bold text-[32px] md:text-[42px] text-[#011C60]">
            Why Choose Our Platform
          </h2>

          <p className="text-[#99A4BF] text-[18px] max-w-3xl mx-auto font-medium">
            We designed our platform to make everyday life easier by combining
            services, shopping, and marketplace experiences into one simple and
            reliable solution.
          </p>
        </header>

        {/* ===== CARDS GRID ===== */}
        <div
          className="
          grid grid-cols-1
          sm:grid-cols-2
        
          lg:grid-cols-4
          gap-8
        "
        >
          {features.map((f, i) => (
            <article
              key={i}
              className="
                group
                bg-white
                border border-[#E6E8EF]
                rounded-2xl
                p-6
                shadow-[0px_4px_16px_0px_#CCD2DF]
                transition-all duration-300
                hover:bg-[#023AC6]
                hover:scale-[1.03]
                cursor-pointer
              "
            >
              {/* ICON */}
              <div
                className="
                w-20 h-20
                rounded-full
                bg-[#F2F4F8]
                flex items-center justify-center
                mb-6
                transition
                group-hover:bg-white
              "
              >
                <img
                  src={f.img}
                  alt={f.title}
                  className="w-12 h-12 object-contain"
                />
              </div>

              {/* TITLE */}
              <h4
                className="
                font-semibold
                text-[20px]
                text-[#011C60]
                mb-3
                transition
                group-hover:text-white
              "
              >
                {f.title}
              </h4>

              {/* DESC */}
              <p
                className="
                text-[#7C8DB5]
                text-[16px]
                leading-relaxed
                transition
                group-hover:text-white/90
              "
              >
                {f.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
