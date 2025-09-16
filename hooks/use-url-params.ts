"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function useUrlParams() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    setParams(searchParams);
  }, [searchParams]);

  return params;
}
