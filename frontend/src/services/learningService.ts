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
  focus?: string;
  tags: string[];
  allDay: boolean;
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
  majorId?: string;
}): Promise<{ id: number }> => {
  const response = await httpClient.post<{ id: number }>('/api/learning/courses', payload);
  return response.data;
};

export const fetchSchedule = async (): Promise<ScheduleEntry[]> => {
  const response = await httpClient.get<{ schedule: ScheduleEntry[] }>('/api/learning/schedule');
  return (response.data.schedule ?? []).map((item) => ({
    ...item,
    id: item.id != null ? String(item.id) : '',
    allDay: Boolean((item as { allDay?: boolean }).allDay),
    tags: (() => {
      const source = (item as { tags?: unknown }).tags;
      if (Array.isArray(source)) {
        return source.map((tag) => String(tag));
      }
      if (typeof source === 'string') {
        return source
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);
      }
      return [];
    })(),
  }));
};

export const createScheduleEntry = async (payload: {
  title: string;
  type?: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
  focus?: string;
  tags?: string | string[];
}): Promise<{ id: string }> => {
  const response = await httpClient.post<{ id: number | string }>('/api/learning/schedule', payload);
  const id = response.data?.id;
  return { id: id != null ? String(id) : '' };
};

export default {
  fetchCourses,
  createCourse,
  fetchSchedule,
  createScheduleEntry,
};
