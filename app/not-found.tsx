import NotFoundState from "@/components/system/NotFoundState";

export default function NotFound() {
  return (
    <NotFoundState
      title="Stranica nije pronađena"
      description="Adresa možda nije ispravna ili je sadržaj uklonjen. Vrati se na početnu stranicu platforme."
      href="/"
      linkLabel="Nazad na početnu"
    />
  );
}
