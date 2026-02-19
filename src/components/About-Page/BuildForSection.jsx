import React from "react";

export default function BuildForSection() {
  const items = [
    {
      img: "/about-build-for-1.png",
      title: "For Users",
      desc: "People who want convenience, reliability, and everything in one place.",
    },
    {
      img: "/about-build-for-2.png",
      title: "For Service Providers",
      desc: "Professionals looking to reach more customers and manage services easily.",
    },
    {
      img: "/about-build-for-3.png",
      title: "For Sellers & Businesses",
      desc: "Businesses that want a trusted space to sell and grow.",
    },
  ];

  return (
    <section className="pt-16 pb-24 bg-white">
      <div className="px-8 lg:px-20 mx-auto">

        {/* ===== TITLE ===== */}
        <h2 className="
          text-[#011C60]
          font-bold
          text-[28px] md:text-[34px] lg:text-[40px]
          mb-28
        ">
          Who It’s Built For ?
        </h2>

        {/* ===== GRID ===== */}
        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-x-12
          gap-y-24
          justify-items-center
        ">

          {items.map((item, i) => (
            <div
              key={i}
              className="group relative w-[312px]"
            >

              {/* ===== HIDDEN CONTENT ===== */}
              <div className="
                absolute left-0 top-0
                w-[312px] h-[151px]
                bg-[#4D6090]
                backdrop-blur-[12px]
                rounded-[16px]
                px-4 py-6
                text-center
                flex flex-col justify-center
                opacity-0 invisible
                transition-all duration-500
                group-hover:-top-[120px]
                group-hover:opacity-100
                group-hover:visible
                z-20
              ">
                <h3 className="text-[#EECE42] font-bold text-[24px]">
                  {item.title}
                </h3>

                <p className="text-[#EECE42] text-[16px] mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* ===== IMAGE CARD ===== */}
              <div className="
                relative top-0
                w-[312px] h-[312px]
                rounded-[16px]
                overflow-hidden
                shadow-[0px_4px_16px_#CCD2DF]
                transition-all duration-500
                group-hover:top-[90px]
                z-10
              ">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                {/* GLASS TITLE STRIP */}
                <div className="
                  absolute left-0 right-0
                  top-1/2 -translate-y-1/2
                  h-[64px]
                  flex items-center justify-center
                  backdrop-blur-[8px]
                  bg-[#CCD2DF59]
                  transition-opacity duration-300
                  group-hover:opacity-0
                ">
                  <h3 className="text-[#011C60] font-medium text-[24px]">
                    {item.title}
                  </h3>
                </div>

              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
