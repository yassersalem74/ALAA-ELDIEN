import React from "react";

export default function Footer() {
  return (
    <footer
      className="
        bg-[#F6E6A0]
        pt-16 pb-10 px-6
        rounded-t-[48px]
      "
    >
      <div className="max-w-[1200px] mx-auto">
        {/* GRID */}
        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-12
        "
        >
          {/* ===== SUBSCRIBE ===== */}
          <div className="space-y-6">
            <h3
              className="
              font-['Epilogue']
              font-bold
              text-[24px]
              text-[#011C60]
            "
            >
              Subscribe for More News
            </h3>

            {/* SUBSCRIBE FIELD */}
            <div
              className="
                flex items-center
                w-full
                bg-white
                border border-[#011C60]
                rounded-full
                overflow-hidden
                focus-within:ring-2
                focus-within:ring-[#EECE42]
                transition
              "
            >
              <input
                type="email"
                placeholder="Email Address"
                className="
                  flex-1
                  px-6 py-3
                  text-[#011C60]
                  placeholder:text-[#99A4BF]
                  outline-none
                  bg-transparent
                  text-[16px]
                "
              />

              <button
                className="
                  px-7 py-3
                  bg-[#011C60]
                  text-white
                  font-semibold
                  rounded-full
                  whitespace-nowrap
                  transition-all duration-300
                  hover:bg-[#023AC6]
                  hover:shadow-md
                  active:scale-95
                "
              >
                Subscribe
              </button>
            </div>

            {/* SOCIALS */}
            <div className="flex gap-6 pt-4">
              <img
                src="/linkedin-png.png"
                className="w-6 cursor-pointer hover:scale-110 transition"
              />
              <img
                src="/x-icon.png"
                className="w-6 cursor-pointer hover:scale-110 transition"
              />
              <img
                src="/facebook-icon.png"
                className="w-6 cursor-pointer hover:scale-110 transition"
              />
              <img
                src="/insta-icon.png"
                className="w-6 cursor-pointer hover:scale-110 transition"
              />
            </div>
          </div>

          {/* ===== COMPANY ===== */}
          <div>
            <h3 className="footer-title text-[#011C60] font-bold text-[24px] font-['Epilogue']">
              Company
            </h3>

            <ul
              className="
              space-y-3 mt-4
              text-[16px]
              font-['Epilogue']
              text-[#011C60]
            "
            >
              <li className="hover:underline cursor-pointer">Home</li>
              <li className="hover:underline cursor-pointer">About Me</li>
              <li className="hover:underline cursor-pointer">Services</li>
            </ul>
          </div>

          {/* ===== RESOURCES ===== */}
          <div>
            <h3 className="footer-title text-[#011C60] font-bold text-[24px] font-['Epilogue']">
              Resources
            </h3>

            <ul
              className="
              space-y-3 mt-4
              text-[16px]
              font-['Epilogue']
              text-[#011C60]
            "
            >
              <li className="hover:underline cursor-pointer">Blogs</li>
              <li className="hover:underline cursor-pointer">Podcasts</li>
              <li className="hover:underline cursor-pointer">Books</li>
            </ul>
          </div>

          {/* ===== CONTACT ===== */}
          <div className="space-y-4">
            <h3 className="footer-title text-[#011C60] font-bold text-[24px] font-['Epilogue']">
              Contact
            </h3>

            <div
              className="
              text-[16px]
              font-['Epilogue']
              text-[#011C60]
              space-y-3
            "
            >
              <p>Greyson Lane 6212-648 Palarn.</p>
              <p>(610) 945-7986</p>
              <p>hello@Transparent.co</p>
            </div>

            <button
              className="
                mt-4
                bg-[#011C60]
                text-white
                px-6 py-3
                rounded-full
                text-[16px]
                font-medium
                transition
                hover:bg-[#023AC6]
                active:scale-95
              "
            >
              Free Consultation
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
