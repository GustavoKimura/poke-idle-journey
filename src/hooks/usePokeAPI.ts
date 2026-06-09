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

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
    );
    const result = await response.json();

    const pokemonData: PokemonData = {
      name: result.name,
      sprite:
        result.sprites.other["official-artwork"].front_default ||
        result.sprites.front_default,
      shinySprite:
        result.sprites.front_shiny ||
        result.sprites.other["official-artwork"].front_shiny,
      types: result.types.map((t: PokeAPIType) => t.type.name),
      weight: result.weight,
    };

    memoryCache[pokemonId] = pokemonData;
    localStorage.setItem(localCacheKey, JSON.stringify(pokemonData));
    return pokemonData;
  } catch (error) {
    console.error(error);
    return null;
  }
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
      await Promise.resolve();

      if (!isMounted) return;

      if (!pokemonId || pokemonId <= 0) {
        setData(null);
        setIsLoading(false);
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
