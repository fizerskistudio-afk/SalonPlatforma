import NotFoundState from "@/components/system/NotFoundState";

export default function TenantNotFound() {
  return (
    <NotFoundState
      eyebrow="Salon nije dostupan"
      title="Salon nije pronađen"
      description="Salon ne postoji, nije objavljen ili trenutno nije javno dostupan. Proveri adresu ili se vrati na platformu."
      href="/"
      linkLabel="Nazad na platformu"
    />
  );
}
