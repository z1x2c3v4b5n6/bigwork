import httpClient from './httpClient';

export interface CourseItem {
  id: string;
  title: string;
  teacher: string;
  category: string;
  progress: number;
  nextTask: string;
}

export interface ScheduleEntry {
  id: string;
  title: string;
  type: string;
  start: string;
  end: string;
  location?: string;
}

export const fetchCourses = async (): Promise<CourseItem[]> => {
  const response = await httpClient.get<{ courses: CourseItem[] }>('/api/learning/courses');
  return response.data.courses ?? [];
};

export const createCourse = async (payload: {
  title: string;
  teacher?: string;
  category?: string;
  progress?: number;
  nextTask?: string;
  description?: string;
}): Promise<{ id: number }> => {
  const response = await httpClient.post<{ id: number }>('/api/learning/courses', payload);
  return response.data;
};

export const fetchSchedule = async (): Promise<ScheduleEntry[]> => {
  const response = await httpClient.get<{ schedule: ScheduleEntry[] }>('/api/learning/schedule');
  return response.data.schedule ?? [];
};

export const createScheduleEntry = async (payload: {
  title: string;
  type?: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
}): Promise<{ id: number }> => {
  const response = await httpClient.post<{ id: number }>('/api/learning/schedule', payload);
  return response.data;
};

export default {
  fetchCourses,
  createCourse,
  fetchSchedule,
  createScheduleEntry,
};
