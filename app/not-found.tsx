import Link from "next/link";
import { useTranslations } from "next-intl";
import { SearchBar } from "@/components/SearchBar";
import { LogoMark } from "@/components/brand/Logo";
import { Container } from "@/components/ui/layout";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <Container className="flex max-w-xl flex-col items-center py-24 text-center">
      <LogoMark className="size-14" />
      <h1 className="heading-lg mt-6">{t("title")}</h1>
      <p className="mt-3 text-muted">{t("text")}</p>
      <div className="mt-8 w-full">
        <SearchBar />
      </div>
      <Link href="/" className="mt-6 text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
        {t("back")}
      </Link>
    </Container>
  );
}
