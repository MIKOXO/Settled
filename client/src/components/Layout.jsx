const Layout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <span className="font-heading text-lg font-semibold text-text-primary flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
            Settled
          </span>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
