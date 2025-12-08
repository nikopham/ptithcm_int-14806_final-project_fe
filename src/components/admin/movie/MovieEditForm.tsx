import React from "react";
import { MovieAddForm } from "@/components/admin/movie/MovieAddForm";
import type { Genre } from "@/types/genre";
import type { Country } from "@/types/country";
import type { Person } from "@/types/person";

type MovieAddFormProps = React.ComponentProps<typeof MovieAddForm>;

export interface MovieEditFormState {
  title: string;
  originalTitle: string;
  description: string;
  release: string;
  duration: string | number | null;
  poster: File | string | null;
  backdrop: File | string | null;
  age: string;
  status: string;
  countries: Country[];
  genres: Genre[];
  director: Person | null;
  actors: Person[];
}

interface MovieEditFormProps {
  form: MovieEditFormState;
  update: <K extends keyof MovieEditFormState>(
    k: K,
    v: MovieEditFormState[K]
  ) => void;
  displayGenres?: Genre[];
  displayCountries?: Country[];
  movieGenre?: Genre[];
  movieCountry?: Country[];
  formDataStatus?: string;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

export function MovieEditForm({
  form,
  update,
  displayGenres,
  displayCountries,
  movieGenre,
  movieCountry,
  formDataStatus,
  onSubmit,
  loading,
}: MovieEditFormProps) {
  // Adapt MovieAddForm props for edit use-case
  const addProps: MovieAddFormProps = {
    form: form as unknown as MovieAddFormProps["form"],
    update: update as MovieAddFormProps["update"],
    displayGenres,
    displayCountries,
    movieGenre,
    movieCountry,
    formDataStatus,
    handleSubmit: onSubmit,
    loading,
    submitLabel: "Save Changes",
    showReset: false,
  };
  return <MovieAddForm {...addProps} />;
}
