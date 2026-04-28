const ctaActions = [
  {
    label: "Download App",
    variant: "primary",
  },
  {
    label: "Explore Service",
    variant: "outline",
  },
];

export default function ServiceCtaSection() {
  return (
    <section className="mx-auto flex min-h-[220px] w-full max-w-[1120px] flex-col items-center justify-center gap-8 rounded-2xl bg-[#E6E8EF] px-6 py-9 text-center md:px-24">
      <h2 className="font-['Roboto'] text-[30px] font-bold leading-[44px] text-[#011C60] md:text-[40px] md:leading-[64px]">
        Ready to Book a Service ?
      </h2>

      <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
        {ctaActions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={`h-16 w-full max-w-[235px] rounded-2xl px-8 py-2.5 font-['Roboto'] font-semibold transition ${
              action.variant === "primary"
                ? "bg-[#011C60] text-white hover:bg-[#02237a]"
                : "border border-[#011C60] bg-white text-[#011C60] hover:bg-[#011C60] hover:text-white"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}
