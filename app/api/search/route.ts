import { searchAll } from "@/lib/queries";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const results = await searchAll(query.slice(0, 100));
  return Response.json({ results });
}
