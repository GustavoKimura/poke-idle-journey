import { useState, useEffect } from "react";

export interface PokemonData {
  name: string;
  sprite: string;
  shinySprite: string;
  types: string[];
  weight: number;
}

interface PokeAPIType {
  type: {
    name: string;
  };
}

export const memoryCache: Record<number, PokemonData> = {};

let activeRequests = 0;
const MAX_CONCURRENT = 3;
const queue: (() => void)[] = [];

const processQueue = () => {
  if (activeRequests < MAX_CONCURRENT && queue.length > 0) {
    const next = queue.shift();
    if (next) next();
  }
};

export async function fetchAndCachePokemon(
  pokemonId: number,
): Promise<PokemonData | null> {
  if (!pokemonId || pokemonId <= 0) return null;
  if (memoryCache[pokemonId]) return memoryCache[pokemonId];

  const localCacheKey = `pokeCache_${pokemonId}`;
  const localCache = localStorage.getItem(localCacheKey);

  if (localCache) {
    try {
      const parsed = JSON.parse(localCache);
      memoryCache[pokemonId] = parsed;
      return parsed;
    } catch {
      localStorage.removeItem(localCacheKey);
    }
  }

  return new Promise((resolve) => {
    const execute = async () => {
      activeRequests++;
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
        );
        if (!response.ok) throw new Error("API Rate Limit or Not Found");
        const result = await response.json();

        const pokemonData: PokemonData = {
          name: result.name,
          sprite:
            result.sprites.other["official-artwork"].front_default ||
            result.sprites.front_default,
          shinySprite:
            result.sprites.other["official-artwork"].front_shiny ||
            result.sprites.front_shiny,
          types: result.types.map((t: PokeAPIType) => t.type.name),
          weight: result.weight,
        };

        memoryCache[pokemonId] = pokemonData;
        localStorage.setItem(localCacheKey, JSON.stringify(pokemonData));
        resolve(pokemonData);
      } catch (error) {
        console.error(error);
        resolve(null);
      } finally {
        activeRequests--;
        processQueue();
      }
    };

    queue.push(execute);
    processQueue();
  });
}

export function getPokemonDataSync(id: number): PokemonData | null {
  if (memoryCache[id]) return memoryCache[id];
  const local = localStorage.getItem(`pokeCache_${id}`);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      memoryCache[id] = parsed;
      return parsed;
    } catch {
      return null;
    }
  }
  return null;
}

export function usePokeAPI(pokemonId: number) {
  const [data, setData] = useState<PokemonData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!pokemonId || pokemonId <= 0) {
        if (isMounted) {
          setData(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      const result = await fetchAndCachePokemon(pokemonId);

      if (isMounted) {
        setData(result);
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [pokemonId]);

  return { data, isLoading };
}
