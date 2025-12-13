import React from "react";
import { TvAddForm } from "@/components/admin/movie/TvAddForm";

// Reuse TvAddForm for editing TV content. This wrapper allows a distinct
// component entry for edit flows and future customization without
// touching the add form implementation.

export type TvEditFormProps = React.ComponentProps<typeof TvAddForm>;

export function TvEditForm(props: TvEditFormProps) {
  return <TvAddForm {...props} isEditMode={true} />;
}
