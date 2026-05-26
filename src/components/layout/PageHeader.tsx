"use client";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-[#A07050] mb-1 font-landing-sans">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {item.href ? (
                  <a
                    href={item.href}
                    className="hover:text-[#C43B2A] transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-[#6B3A1F] font-medium">
                    {item.label}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="font-landing-display text-2xl md:text-3xl font-bold text-[#2C1208]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[#A07050] mt-1 text-sm md:text-base font-landing-sans">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
