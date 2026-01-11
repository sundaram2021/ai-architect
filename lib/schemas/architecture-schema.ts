import { z } from "zod";

export const architectureNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
  description: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const architectureEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

export const architectureSchema = z.object({
  nodes: z.array(architectureNodeSchema),
  edges: z.array(architectureEdgeSchema),
  summary: z.string().optional(),
});

export type ArchitectureSchema = z.infer<typeof architectureSchema>;
