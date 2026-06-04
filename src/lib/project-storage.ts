import { get, set, del, keys } from 'idb-keyval';
import type { ProjectData } from './types';

const PROJECT_PREFIX = 'editor-project:';

function projectKey(id: string): string {
  return `${PROJECT_PREFIX}${id}`;
}

export async function saveProject(project: ProjectData): Promise<void> {
  const data: ProjectData = {
    ...project,
    updatedAt: Date.now(),
  };
  await set(projectKey(project.id), JSON.stringify(data));
  // Also save in the index
  const indexKey = 'editor-projects-index';
  const indexRaw = await get<string>(indexKey);
  const index: Array<{ id: string; name: string; updatedAt: number }> = indexRaw
    ? JSON.parse(indexRaw)
    : [];
  const existingIdx = index.findIndex((p) => p.id === project.id);
  const entry = { id: project.id, name: project.name, updatedAt: data.updatedAt };
  if (existingIdx >= 0) {
    index[existingIdx] = entry;
  } else {
    index.push(entry);
  }
  await set(indexKey, JSON.stringify(index));
}

export async function loadProject(id: string): Promise<ProjectData | undefined> {
  const raw = await get<string>(projectKey(id));
  if (!raw) return undefined;
  return JSON.parse(raw) as ProjectData;
}

export async function deleteProject(id: string): Promise<void> {
  await del(projectKey(id));
  const indexKey = 'editor-projects-index';
  const indexRaw = await get<string>(indexKey);
  if (indexRaw) {
    const index: Array<{ id: string; name: string; updatedAt: number }> = JSON.parse(indexRaw);
    const newIndex = index.filter((p) => p.id !== id);
    await set(indexKey, JSON.stringify(newIndex));
  }
}

export async function listProjects(): Promise<Array<{ id: string; name: string; updatedAt: number }>> {
  const indexKey = 'editor-projects-index';
  const indexRaw = await get<string>(indexKey);
  if (!indexRaw) return [];
  const index: Array<{ id: string; name: string; updatedAt: number }> = JSON.parse(indexRaw);
  return index.sort((a, b) => b.updatedAt - a.updatedAt);
}
