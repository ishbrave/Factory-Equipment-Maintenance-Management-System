export const Footer = () => {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white/90 py-4 text-center text-xs text-[#6B7280] md:text-sm">
      <p>
        <span className="font-semibold text-[#1E40AF]">SmartPark PSSMS</span>
        {' · '}
        Parking Space Sales Management · Rubavu District, Rwanda
      </p>
      <p className="mt-1">© {new Date().getFullYear()} National Practical Examination — ICT &amp; Multimedia (SWD)</p>
    </footer>
  );
};
