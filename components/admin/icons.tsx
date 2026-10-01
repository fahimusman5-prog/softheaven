import type { SVGProps } from "react";
const paths: Record<string, string> = {
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  products: "m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8M12 13v9",
  reviews: "M4 4h16v12H9l-5 4V4ZM8 8h8M8 12h5",
  categories: "M3 5h7l2 3h9v12H3V5Z",
  collections: "M5 3h14v16H5V3ZM2 7v15h14",
  orders: "M6 3h12l2 4v14H4V7l2-4ZM4 7h16M9 11h6",
  commerce: "M3 6h18v13H3V6ZM3 10h18M6 15h4",
  customers: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2",
  newsletter: "M3 5h18v14H3V5Zm0 0 9 8 9-8",
  inventory: "M3 5h18v5H3V5ZM5 10v11h14V10M9 14h6",
  reports: "M4 21V3M4 21h17M9 17v-5M14 17V7M19 17V3",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3Z",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2",
  logout: "M9 4H4v16h5M14 8l5 4-5 4M8 12h11",
  search: "M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm5-2 6 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
  chevron: "m9 5 7 7-7 7",
  plus: "M12 5v14M5 12h14",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  warning: "m12 3 10 18H2L12 3ZM12 9v5M12 17v1",
  check: "m5 12 4 4L19 6",
  empty: "M4 5h16v16H4V5ZM8 3h8v4H8V3ZM8 12h8M8 16h5",
};
export function AdminIcon({
  name,
  ...props
}: { name: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] ?? paths.products} />
    </svg>
  );
}
