import React from "react";

export default function SocialSidebar() {
  const socials = [
    { img: "/facebook.png", alt: "Facebook" },
    { img: "/whatsapp.png", alt: "WhatsApp" },
    { img: "/linkedin.png", alt: "LinkedIn" },
  ];

  return (
    <div className="fixed left-4 top-1/3 -translate-y-1/2 z-50">
      
      <div
        className="
          flex flex-col items-center gap-5
          px-[10px] py-[32px]
          rounded-2xl
          bg-[#E6E8EFB2]
          backdrop-blur-[4px]
          shadow-[0px_4px_16px_0px_#808DAF]
        "
      >
        
        {socials.map((item, i) => (
          <a
            key={i}
            href="#"
            className="
              w-9 h-9
              flex items-center justify-center
              rounded-full
              bg-[#011C60]
              relative
              overflow-hidden
            "
          >
            
            {/* ICON (ONLY THIS HOVERS) */}
            <img
              src={item.img}
              alt={item.alt}
              className="
                w-5 h-5
                object-contain
                transition-all duration-300 ease-out
                hover:scale-125
                hover:-translate-y-1
                hover:rotate-6
              "
            />

            {/* GLOW (only when hovering image) */}
            <span
              className="
                pointer-events-none
                absolute inset-0
                rounded-full
                opacity-0
                transition duration-300
                bg-[#EECE42]/30
                blur-[6px]
              "
            ></span>

          </a>
        ))}

      </div>
    </div>
  );
}