import dayjs from 'dayjs';
import httpClient from './httpClient';

export interface CourseSuitability {
  mathSubjects?: string[];
  englishSubjects?: string[];
  majors?: string[];
  majorIds?: string[];
  scoreMin?: number;
  scoreMax?: number;
}

export interface CourseItem {
  id: string;
  title: string;
  teacher: string;
  category: string;
  progress: number;
  nextTask: string;
  intensity?: '基础' | '强化' | '冲刺';
  highlight?: string;
  tags?: string[];
  suitability?: CourseSuitability;
  subjectTags?: string[];
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
  status?: '未开始' | '进行中' | '已完成';
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
  tags?: string[];
  mathSubjects?: string[];
  englishSubjects?: string[];
  visibleMajorIds?: string[];
  visibleMajorNames?: string[];
}): Promise<{ id: number }> => {
  const response = await httpClient.post<{ id: number }>('/api/learning/courses', payload);
  return response.data;
};

export const fetchSchedule = async (): Promise<ScheduleEntry[]> => {
  const response = await httpClient.get<{ schedule: ScheduleEntry[] }>('/api/learning/schedule');
  return (response.data.schedule ?? []).map((item, index) => {
    const startValue = (item as { start?: string }).start;
    const endValue = (item as { end?: string }).end;
    const fallbackId = `schedule-${index}-${startValue ?? 'unknown'}-${endValue ?? 'unknown'}`;

    return {
      ...item,
      id: item.id != null && item.id !== '' ? String(item.id) : fallbackId,
      allDay: Boolean((item as { allDay?: boolean }).allDay),
      status: (() => {
        const status = (item as { status?: string }).status;
        if (status === '进行中' || status === '已完成' || status === '未开始') {
          return status;
        }
        return '未开始' as const;
      })(),
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
    } satisfies ScheduleEntry;
  });
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
  const formatDateTime = (value: string) => {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : value;
  };

  const requestBody = {
    ...payload,
    start: formatDateTime(payload.start),
    end: formatDateTime(payload.end),
    status: '未开始' as const,
  };

  const response = await httpClient.post<{ id: number | string }>('/api/learning/schedule', requestBody);
  const id = response.data?.id;
  return { id: id != null ? String(id) : '' };
};

export default {
  fetchCourses,
  createCourse,
  fetchSchedule,
  createScheduleEntry,
};
