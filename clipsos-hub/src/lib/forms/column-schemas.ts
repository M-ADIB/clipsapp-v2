import { z } from "zod";

/**
 * Schema for the grid add/edit custom-field dialog. Only the field name is
 * required; options/roles are managed as arrays via Controller.
 */
export const columnSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.string(),
  options: z.array(z.string()),
  width: z.number(),
  editableRoles: z.array(z.string()),
});

export type ColumnFormValues = z.infer<typeof columnSchema>;
