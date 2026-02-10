import React, { useState } from "react";

export default function ServiceSection() {

  const services = [
    {
      key: "professional",
      label: "Professional Services",
      title: "Professional Services for Every Need",
      desc:
        "Access a wide range of professional services designed to cover your daily needs in one seamless ",
      border: "border-[#011C60]",
      icon: "/service-proffesional-service.png",
      items: [
        { img: "/service-home-care.png", label: "Home Care" },
        { img: "/service-personal-care.png", label: "Personal care" },
        { img: "/service-car-car.png", label: "Care care" },
        { img: "/service-relastate.png", label: "Realstate" },
      ],
    },

    {
      key: "market",
      label: "Market place",
      title: "Buy & Sell With Confidence",
      desc:
        "Explore a community-driven marketplace that connects buyers and sellers through a secure and easy ",
      border: "border-[#023AC6]",
      icon: "/service-market-place.png",
      items: [
        { img: "/market-furniture.png", label: "Furniture" },
        { img: "/market-car.png", label: "Car" },
        { img: "/market-mobile.png", label: "Mobile" },
        { img: "/market-electronic.png", label: "Electronic" },
      ],
    },

    {
      key: "store",
      label: "Store",
      title: "Online Store & Exclusive Deals",
      desc:
        "Shop high-quality products through our integrated store, curated to meet your everyday needs. ",
      border: "border-[#EECE42]",
      icon: "/service-store.png",
      items: [
        { img: "/store-electronic.png", label: "Electronic" },
        { img: "/store-lights.png", label: "Lights" },
        { img: "/store-furniture.png", label: "Furniture" },
        { img: "/store-kitchen.png", label: "Kitchen" },
      ],
      subItems: [
        { img: "/kitchen-coffe-maker.png", label: "Coffee makers" },
        { img: "/kitchen-plates.png", label: "Plates" },
        { img: "/kitchen-cups.png", label: "Cups" },
      ],
    },
  ];

  const [activeTab, setActiveTab] = useState(0);
  const [showSub, setShowSub] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const current = services[activeTab];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">

        {/* ===== HEADER ===== */}
        <header className="text-center mb-16 space-y-5">
          <h3 className="font-bold text-[28px] text-[#EECE42]">
            OUR SERVICES
          </h3>

          <h2 className="font-bold text-[32px] md:text-[42px]">
            <span className="text-[#011C60]">
              What We provide For Your
            </span>{" "}
            <span className="text-[#EECE42]">Daily Needs</span>
          </h2>

          <p className="text-[#99A4BF] text-[18px] max-w-2xl mx-auto">
            Reliable services designed to support your daily life.
          </p>
        </header>

        {/* ===== TABS ===== */}
        <nav className="
          flex flex-col sm:flex-row
          justify-between items-center
          gap-8 md:gap-16
          mb-10
        ">
          {services.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveTab(i);
                setShowSub(false);
                setActiveItem(null);
              }}
              className={`
                flex flex-col items-center gap-3
                px-6 sm:px-8 py-4 sm:py-6
                rounded-2xl border-2
                transition-all duration-300
                hover:scale-105
                cursor-pointer
                ${
                  activeTab === i
                    ? `${s.border} shadow-lg`
                    : "border-transparent"
                }
              `}
            >
              <img
                src={s.icon}
                className="w-[70px] sm:w-[80px] md:w-[96px] object-contain"
              />
              <span className="text-[16px] sm:text-[18px] font-medium text-[#011C60]">
                {s.label}
              </span>
            </button>
          ))}
        </nav>

        {/* ===== CONTENT BOX ===== */}
        <article
          className={`
            rounded-2xl p-8 md:p-12
            border-2 ${current.border}
          `}
        >
          <h3 className="font-bold text-[28px] md:text-[32px] text-[#EECE42] mb-4">
            {current.title}
          </h3>

          <p className="text-[18px] md:text-[22px] text-[#4D6090] mb-10">
            {current.desc}
            <span className="text-[#011C60] font-semibold cursor-pointer">
              See more.
            </span>
          </p>

          {/* ===== MAIN ITEMS ===== */}
          <div className="flex flex-wrap gap-8 md:gap-12">
            {current.items.map((item, idx) => (
              <figure
                key={idx}
                onClick={() => {
                  setActiveItem(idx);
                  if (
                    current.key === "store" &&
                    item.label === "Kitchen"
                  ) {
                    setShowSub(true);
                  }
                }}
                className="text-center cursor-pointer group"
              >
                <div className={`
                  bg-gray-100 rounded-xl
                  w-[95px] h-[95px] sm:w-[110px] sm:h-[110px]
                  flex items-center justify-center
                  transition-all duration-300
                  group-hover:scale-110
                  ${
                    activeItem === idx
                      ? `border-2 ${current.border} scale-105`
                      : ""
                  }
                `}>
                  <img
                    src={item.img}
                    className="w-12 h-12 object-contain"
                  />
                </div>

                <figcaption className="mt-3 text-[#011C60]">
                  {item.label}
                </figcaption>
              </figure>
            ))}
          </div>

          {/* ===== SUB ITEMS (SHOW BELOW) ===== */}
          {showSub && current.subItems && (
            <div className="flex flex-wrap gap-8 md:gap-12 mt-10">
              {current.subItems.map((sub, i) => (
                <figure
                  key={i}
                  className="text-center cursor-pointer group"
                >
                  <div className="
                    bg-[#F6E7A8]
                    rounded-xl
                    w-[95px] h-[95px] sm:w-[110px] sm:h-[110px]
                    flex items-center justify-center
                    transition-all duration-300
                    group-hover:scale-110
                  ">
                    <img
                      src={sub.img}
                      className="w-12 h-12 object-contain"
                    />
                  </div>

                  <figcaption className="mt-3 text-[#011C60]">
                    {sub.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

        </article>

      </div>
    </section>
  );
}
