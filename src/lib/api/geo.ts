import axios from "axios";

const geoClient = axios.create({
  baseURL: "https://countriesnow.space/api/v0.1",
  timeout: 8000,
});

export interface GeoCountry {
  name: string;
  iso2: string;
}

export async function listCountries(): Promise<GeoCountry[]> {
  const { data } = await geoClient.get<{
    error: boolean;
    data: { name: string; iso2: string }[];
  }>("/countries/positions");

  return [...data.data]
    .map((country) => ({ name: country.name, iso2: country.iso2 }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listCitiesForCountry(countryName: string): Promise<string[]> {
  const { data } = await geoClient.get<{ error: boolean; data: string[] }>(
    "/countries/cities/q",
    { params: { country: countryName } },
  );

  return [...(data.data ?? [])].sort((a, b) => a.localeCompare(b));
}
