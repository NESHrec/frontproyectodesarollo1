export function SimulatedFormNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-[#62727B]/10 bg-[#E5F1D8] px-4 py-3 text-sm font-semibold text-[#62727B]" role="status">
      {children}
    </p>
  );
}
