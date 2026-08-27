import { getCollection, type CollectionEntry } from 'astro:content';

export type Material = CollectionEntry<'materials'>;

/** Slug from a collection id, e.g. "argus-concurrency.mdx" → "argus-concurrency". */
export function getMaterialSlug(material: Material): string {
  return material.id.replace(/\/index$/, '').replace(/\.mdx?$/, '');
}

/** Permalink path: /materials/<slug>/. */
export function getMaterialPath(material: Material): string {
  return `/materials/${getMaterialSlug(material)}/`;
}

/**
 * Grid order: pinned first, then newest. Not a stream, so the date only breaks
 * ties — what puts a material at the front is being one you reach for.
 */
export async function getPublishedMaterials(): Promise<Material[]> {
  const all = await getCollection('materials', ({ data }) => !data.draft);
  return all.sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return b.data.date.localeCompare(a.data.date);
  });
}

/**
 * The materials either side of this one, in grid order rather than by date: the
 * grid is how a material gets found, so walking with prev/next should follow
 * the same sequence the cards were in. Wraps at neither end.
 */
export function getAdjacentMaterials(materials: Material[], currentId: string) {
  const idx = materials.findIndex((m) => m.id === currentId);
  return {
    prev: idx > 0 ? materials[idx - 1] : null,
    next: idx >= 0 && idx < materials.length - 1 ? materials[idx + 1] : null,
  };
}
