import { useState, useEffect } from "react";

interface PokemonData {
  name: string;
  sprite: string;
}

const cache: Record<number, PokemonData> = {};

export function usePokeAPI(pokemonId: number) {
  const [data, setData] = useState<PokemonData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPokemon = async () => {
      if (cache[pokemonId]) {
        setData(cache[pokemonId]);
        setIsLoading(false);
        return;
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
        };

        cache[pokemonId] = pokemonData;

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
