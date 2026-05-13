import { useState, useEffect, useCallback } from "react";

export function useNavigate() {
  const getPath = () => window.location.hash.slice(1) || "/";
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const h = () => setPath(getPath());
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const navigate = useCallback((to) => { window.location.hash = to; }, []);
  return { path, navigate };
}
