import { listGamesAction } from "@/app/actions/games";
import { HomeScreen } from "@/components/home-screen";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let games;
  let loadError: string | null = null;
  try {
    games = await listGamesAction();
  } catch (error) {
    games = [];
    loadError =
      error instanceof Error
        ? `No se pudo conectar con PostgreSQL: ${error.message}`
        : "No se pudo conectar con PostgreSQL.";
  }

  return <HomeScreen initialGames={games} initialError={loadError} />;
}
