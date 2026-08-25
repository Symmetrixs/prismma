import { lazy } from "react";

export const moduleRegistry: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "asset-tagging": lazy(() => import("./asset-tagging")),
  ticketing: lazy(() => import("./ticketing")),
  "admin-operations": lazy(() => import("./admin-operations")),
  "news-editor": lazy(() => import("./news-editor")),
  "site-settings": lazy(() => import("./site-settings")),
};
