import React from "react";

export default function ContactUsSection() {
  const contacts = [
    { icon: "/phone-icon.png", text: "010-020-0860" },
    { icon: "/email-icon.png", text: "info@company.com" },
    { icon: "/earth-icon.png", text: "www.company.com" },
    { icon: "/location-icon.png", text: "Cairo, Egypt" },
  ];

  return (
    <section className=" bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* HEADER */}
        <header className="text-center mb-16 space-y-6">
          <h3 className="font-medium text-[28px] text-[#EECE42]">
            Get in Touch
          </h3>

          <h2 className="font-bold text-[32px] md:text-[42px] text-[#011C60]">
            Let's Work Together
          </h2>

          <p className="text-[#99A4BF] text-[18px] max-w-3xl mx-auto font-medium">
            Feel free to keep in touch with us!
          </p>
        </header>

        {/* CARD */}
        <article className="relative rounded-2xl border border-[#B3BBCF] overflow-hidden">
          {/* MAP */}
          <img
            src="/contact-map.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* GLASS */}
          <div
            className="
            relative
            backdrop-blur-[8px]
            bg-[#E6E8EFB2]
            border border-[#B3BBCF]
            p-8 md:p-12
            grid md:grid-cols-2
            gap-10
          "
          >
            {/* ===== LEFT SIDE (FIXED SPACING) ===== */}
            <aside className="flex flex-col gap-6 justify-center">
              {contacts.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center gap-4">
                    {/* ICON */}
                    <div
                      className="
                      w-12 h-12
                      flex items-center justify-center
                      rounded-full
                      bg-gradient-to-b
                      from-[#CCD2DF]
                      to-[#EECE42]
                    "
                    >
                      <img src={item.icon} alt="" className="w-6 h-6" />
                    </div>

                    <p className="text-[20px] font-medium text-[#011C60]">
                      {item.text}
                    </p>
                  </div>

                  {/* DIVIDER */}
                  {i !== contacts.length - 1 && (
                    <div className="mt-4 border-b border-[#CCD2DF]" />
                  )}
                </div>
              ))}
            </aside>

            {/* ===== RIGHT SIDE ===== */}
            <form className="flex flex-col gap-6">
              <h3 className="text-[36px] font-bold text-[#011C60]">
                Contact Us
              </h3>

              <input
                placeholder="Your Full name"
                className="
                  h-[60px]
                  rounded-[16px]
                  border border-[#CCD2DF]
                  bg-white
                  px-5
                  text-[24px]
                  text-[#011C60]
                  placeholder:text-[#CCD2DF]
                  outline-none
                "
              />

              <input
                placeholder="Email Or phone number"
                className="
                  h-[60px]
                  rounded-[16px]
                  border border-[#CCD2DF]
                  bg-white
                  px-5
                  text-[24px]
                  text-[#011C60]
                  placeholder:text-[#CCD2DF]
                "
              />

              <input
                placeholder="Phone number"
                className="
                  h-[60px]
                  rounded-[16px]
                  border border-[#CCD2DF]
                  bg-white
                  px-5
                  text-[24px]
                  text-[#011C60]
                  placeholder:text-[#CCD2DF]
                "
              />

              <textarea
                placeholder="Message"
                className="
                  h-[114px]
                  rounded-[16px]
                  border border-[#CCD2DF]
                  bg-white
                  px-5 py-3
                  text-[24px]
                  text-[#011C60]
                  placeholder:text-[#CCD2DF]
                  resize-none
                "
              />

              <button
                type="submit"
                className="
                  h-[64px]
                  rounded-[16px]
                  font-medium
                  text-white
                  bg-[#011C60]
                  transition-all duration-300
                  cursor-pointer
                  hover:bg-[linear-gradient(277.31deg,#CCD2DF_16.29%,#EECE42_96.02%)]
                "
              >
                Send Message
              </button>
            </form>
          </div>
        </article>
      </div>
    </section>
  );
}
