import type { Project } from "$lib/domain/project/types";
import {
  addToListProject,
  projectList,
} from "$lib/data/mock/projectDataSource";

export { projectList };

export function addProject(project: Project): void {
  addToListProject(project);
}
