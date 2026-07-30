export interface PlayerData {
  playerName: string;
  server: string;
  level: number;
  attributes: number;
  scrapbook: string | null;
  maxAttrsFilter?: number | null;
  maxLevel?: number | null;
  classFilter?: string[] | undefined;
}
