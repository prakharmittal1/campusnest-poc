import { prisma } from "./prisma";

/** Profile fields shown on /account and /account/welcome. */
export async function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      phone: true,
      nationality: true,
      destinationCountry: true,
      destinationCity: true,
      university: true,
      studyStart: true,
      budget: true,
      consentToShare: true,
      locale: true,
    },
  });
}

export async function getCountryNames() {
  const countries = await prisma.country.findMany({ orderBy: { id: "asc" }, select: { name: true } });
  return countries.map((c) => c.name);
}
