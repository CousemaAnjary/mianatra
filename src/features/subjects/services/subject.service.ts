import type { Course, CreateSubjectInput, Subject, UpdateSubjectInput } from "@/src/db";
import { DuplicateSubjectNameError, SubjectInUseError, SubjectNotFoundError } from "@/src/features/shared";

export type SubjectInput = {
  name: string;
  icon: string;
  color: string;
  isDefault?: boolean;
};

export type SubjectPatch = Partial<SubjectInput>;

function normalizeSpaces(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeSubjectInput(input: SubjectInput): CreateSubjectInput {
  return {
    name: normalizeSpaces(input.name),
    icon: normalizeSpaces(input.icon),
    color: normalizeSpaces(input.color),
    isDefault: input.isDefault ?? false,
  };
}

function normalizeSubjectPatch(input: SubjectPatch): UpdateSubjectInput {
  return {
    ...(input.name !== undefined ? { name: normalizeSpaces(input.name) } : {}),
    ...(input.icon !== undefined ? { icon: normalizeSpaces(input.icon) } : {}),
    ...(input.color !== undefined ? { color: normalizeSpaces(input.color) } : {}),
    ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
  };
}

function wrapDuplicateSubject(error: unknown): never {
  if (error instanceof Error && /unique|constraint/i.test(error.message)) {
    throw new DuplicateSubjectNameError(error);
  }
  throw error;
}

type SubjectServiceDeps = {
  subjects: {
    findAll: () => Promise<Subject[]>;
    findById: (id: string) => Promise<Subject | null>;
    create: (input: CreateSubjectInput) => Promise<Subject>;
    update: (id: string, input: UpdateSubjectInput) => Promise<Subject>;
    remove: (id: string) => Promise<void>;
  };
  courses: {
    findAllBySubject: (subjectId: string) => Promise<Course[]>;
  };
};

export function createSubjectService(deps: SubjectServiceDeps) {
  return {
    listSubjects: () => deps.subjects.findAll(),
    getSubject: async (id: string) => {
      const subject = await deps.subjects.findById(id);
      if (!subject) {
        throw new SubjectNotFoundError();
      }
      return subject;
    },
    createSubject: async (input: SubjectInput) => {
      try {
        return await deps.subjects.create(normalizeSubjectInput(input));
      } catch (error) {
        wrapDuplicateSubject(error);
      }
    },
    updateSubject: async (id: string, input: SubjectPatch) => {
      const existing = await deps.subjects.findById(id);
      if (!existing) {
        throw new SubjectNotFoundError();
      }
      try {
        return await deps.subjects.update(id, normalizeSubjectPatch(input));
      } catch (error) {
        wrapDuplicateSubject(error);
      }
    },
    deleteSubject: async (id: string) => {
      const existing = await deps.subjects.findById(id);
      if (!existing) {
        throw new SubjectNotFoundError();
      }
      const linkedCourses = await deps.courses.findAllBySubject(id);
      if (linkedCourses.length > 0) {
        throw new SubjectInUseError();
      }
      await deps.subjects.remove(id);
    },
  };
}

async function getDeps(): Promise<SubjectServiceDeps> {
  const repositories = await import("@/src/db");
  return { subjects: repositories.subjectsRepository, courses: repositories.coursesRepository };
}

export async function listSubjects() {
  return createSubjectService(await getDeps()).listSubjects();
}

export async function getSubject(id: string) {
  return createSubjectService(await getDeps()).getSubject(id);
}

export async function createSubject(input: SubjectInput) {
  return createSubjectService(await getDeps()).createSubject(input);
}

export async function updateSubject(id: string, input: SubjectPatch) {
  return createSubjectService(await getDeps()).updateSubject(id, input);
}

export async function deleteSubject(id: string) {
  return createSubjectService(await getDeps()).deleteSubject(id);
}

export const subjectService = { createSubject, deleteSubject, getSubject, listSubjects, updateSubject };
