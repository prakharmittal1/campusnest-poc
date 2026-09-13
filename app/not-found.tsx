import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { LogoMark } from "@/components/brand/Logo";
import { Container } from "@/components/ui/layout";

export default function NotFound() {
  return (
    <Container className="flex max-w-xl flex-col items-center py-24 text-center">
      <LogoMark className="size-14" />
      <h1 className="heading-lg mt-6">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-muted">The home or city may have moved. Try searching instead.</p>
      <div className="mt-8 w-full">
        <SearchBar />
      </div>
      <Link href="/" className="mt-6 text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
        Back to home
      </Link>
    </Container>
  );
}
