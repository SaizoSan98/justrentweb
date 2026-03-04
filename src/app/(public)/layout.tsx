
import { Footer } from "@/components/layout/Footer";
import { cookies } from "next/headers";
import { dictionaries } from "@/lib/dictionary";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dictionary = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;

  return (
    <>
      {children}
      <Footer dictionary={dictionary} />
    </>
  );
}
