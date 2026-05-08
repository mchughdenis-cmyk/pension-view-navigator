import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { findNavLabel } from "./navConfig";

const SPECIAL: Record<string, string> = {
  "": "Home",
  overview: "Overview",
  pitch: "Pitch",
  demo: "Demo",
  documentation: "Documentation",
  "api-directory": "API directory",
  "system-overview": "System overview",
  auth: "Sign in",
  "client-admin": "Client admin",
};

function pretty(slug: string) {
  return SPECIAL[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname === "/dashboard") return null;
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    const label = findNavLabel(path) ?? pretty(seg);
    return { path, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 overflow-hidden">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground shrink-0">
        <Home className="h-3 w-3" /> Home
      </Link>
      {crumbs.map((c, i) => (
        <span key={c.path} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="h-3 w-3 shrink-0" />
          {i === crumbs.length - 1 ? (
            <span className="text-foreground font-medium truncate">{c.label}</span>
          ) : (
            <Link to={c.path} className="hover:text-foreground truncate">{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
