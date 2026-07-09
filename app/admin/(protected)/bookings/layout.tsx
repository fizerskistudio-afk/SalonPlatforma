import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

export const metadata:
  Metadata = {
    title:
      "Rezervacije",
  };

type SectionLayoutProps = {
  children: ReactNode;
};

export default function SectionLayout({
  children,
}: SectionLayoutProps) {
  return children;
}
