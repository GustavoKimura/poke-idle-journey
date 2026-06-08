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

const memoryCache: Record<number, PokemonData> = {};

export function usePokeAPI(pokemonId: number) {
  const [data, setData] = useState<PokemonData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPokemon = async () => {
      if (memoryCache[pokemonId]) {
        setData(memoryCache[pokemonId]);
        setIsLoading(false);
        return;
      }

      const localCacheKey = `pokeCache_${pokemonId}`;
      const localCache = localStorage.getItem(localCacheKey);

      if (localCache) {
        try {
          const parsed = JSON.parse(localCache);
          memoryCache[pokemonId] = parsed;
          setData(parsed);
          setIsLoading(false);
          return;
        } catch {
          localStorage.removeItem(localCacheKey);
        }
      }

      setIsLoading(true);
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

        if (isMounted) {
          setData(pokemonData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPokemon();

    return () => {
      isMounted = false;
    };
  }, [pokemonId]);

  return { data, isLoading };
}
