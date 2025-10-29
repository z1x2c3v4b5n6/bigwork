import httpClient from './httpClient';
import type { ScheduleItem } from '../data/dashboard';

const scheduleEndpoint = import.meta.env.VITE_SCHEDULE_ENDPOINT ?? '/api/schedule';

export const fetchSchedule = async (userId: string): Promise<ScheduleItem[]> => {
  const response = await httpClient.get<ScheduleItem[]>(scheduleEndpoint, {
    params: { userId },
  });
  return response.data;
};

export interface CreateSchedulePayload {
  userId: string;
  title: string;
  type: ScheduleItem['type'];
  start: string;
  end: string;
  location?: string;
  focus?: string;
  tags?: string[];
}

export const createScheduleItem = async (payload: CreateSchedulePayload): Promise<ScheduleItem> => {
  const response = await httpClient.post<ScheduleItem>(scheduleEndpoint, payload);
  return response.data;
};
