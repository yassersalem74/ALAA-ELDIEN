import { useEffect } from "react";
import verifyBackgroundImage from "../../../../assets/images/auth/verify-background.png";

export default function ForgotPasswordSuccessModal({
  image,
  title,
  message,
  onClose,
  autoCloseMs = 2000,
}) {
  useEffect(() => {
    if (!onClose) return undefined;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => clearTimeout(timer);
  }, [autoCloseMs, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(${verifyBackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex min-h-[520px] w-full max-w-[592px] flex-col items-center justify-center gap-9 rounded-[24px] border-[0.5px] border-gray-300 bg-white p-6 md:min-h-[627px]">
        <img
          src={image}
          alt={title}
          className="h-[175px] w-[220px] object-contain"
        />

        <div className="max-w-md text-center">
          <h2 className="mb-2 text-[24px] font-bold text-[#011C60]">{title}</h2>
          <p className="text-[14px] text-[#808DAF]">{message}</p>
        </div>
      </div>
    </div>
  );
}
