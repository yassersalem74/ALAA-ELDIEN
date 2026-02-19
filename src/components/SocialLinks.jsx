import React from "react";

export default function SocialSidebar() {
  return (
    <div
      className="
        fixed
        left-4
        top-1/3
        -translate-y-1/2
        z-50
     
      "
    >
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
        {/* FACEBOOK - White bg with #011C60 icon */}
        <a
          href="#"
          className="
            w-9 h-9
            flex items-center justify-center
            rounded-full
            bg-white
            transition-all duration-300
            hover:scale-110
            hover:-translate-y-1
            group
          "
        >
          <svg
            viewBox="0 0 48 48"
            className=" fill-[#011C60]  transition"
          >
            <path d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z" />
            <path
              fill="currentColor"
              d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"
            />
          </svg>
        </a>

        {/* WHATSAPP - White bg with #011C60 icon */}
        <a
          href="#"
          className="
            w-9 h-9
            flex items-center justify-center
            rounded-full
            bg-white
            transition-all duration-300
            hover:scale-110
            hover:-translate-y-1
            group
          "
        >
          <svg
            viewBox="0 0 24 24"
            className=" fill-[#011C60]  transition"
          >
            <path d="M19.077,4.928C17.191,3.041,14.683,2.001,12.011,2c-5.506,0-9.987,4.479-9.989,9.985 c-0.001,1.76,0.459,3.478,1.333,4.992L2,22l5.233-1.237c1.459,0.796,3.101,1.215,4.773,1.216h0.004 c5.505,0,9.986-4.48,9.989-9.985C22.001,9.325,20.963,6.816,19.077,4.928z M16.056,16.376c-0.215,0.603-1.062,1.103-1.749,1.168c-0.466,0.044-0.968,0.067-1.561-0.098c-1.328-0.371-2.456-1.277-3.377-2.265c-0.919-0.988-1.608-2.093-2.009-3.022c-0.255-0.59-0.349-1.119-0.343-1.614c0.006-0.495,0.145-0.942,0.4-1.287c0.206-0.277,0.529-0.528,0.898-0.602c0.244-0.048,0.487-0.033,0.691,0.029c0.204,0.062,0.37,0.181,0.482,0.362c0.182,0.297,0.593,1.027,0.645,1.103c0.052,0.076,0.087,0.166,0.036,0.279c-0.051,0.112-0.123,0.196-0.219,0.29c-0.073,0.072-0.155,0.161-0.222,0.23c-0.074,0.074-0.155,0.155-0.067,0.305c0.088,0.15,0.39,0.643,0.837,1.041c0.575,0.511,1.062,0.839,1.513,1.044c0.188,0.085,0.332,0.126,0.448,0.126c0.095,0,0.17-0.015,0.235-0.077c0.074-0.07,0.213-0.249,0.326-0.404c0.113-0.155,0.222-0.273,0.356-0.277c0.134-0.004,0.223,0.022,0.311,0.099c0.088,0.077,0.56,0.528,0.656,0.628c0.096,0.1,0.16,0.182,0.179,0.279C16.186,15.412,16.185,15.782,16.056,16.376z" />
          </svg>
        </a>

        {/* LINKEDIN - White bg with #011C60 icon */}
        <a
          href="#"
          className="
            w-9 h-9
            flex items-center justify-center
            rounded-full
            bg-white
            transition-all duration-300
            hover:scale-110
            hover:-translate-y-1
            group
          "
        >
          <svg
            viewBox="0 0 48 48"
            className=" fill-[#011C60] transition"
          >
            <path d="M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z" />
            <path
              fill="currentColor"
              d="M14 19H18V34H14zM15.988 17h-.022C14.772 17 14 16.11 14 14.999 14 13.864 14.796 13 16.011 13c1.217 0 1.966.864 1.989 1.999C18 16.11 17.228 17 15.988 17zM35 24.5c0-3.038-2.462-5.5-5.5-5.5-1.862 0-3.505.928-4.5 2.344V19h-4v15h4v-8c0-1.657 1.343-3 3-3s3 1.343 3 3v8h4C35 34 35 24.921 35 24.5z"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}