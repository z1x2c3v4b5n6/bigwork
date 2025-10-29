import { useMemo } from 'react';
import dayjs from 'dayjs';

const useGreeting = () => {
  return useMemo(() => {
    const hour = dayjs().hour();
    if (hour < 6) return '凌晨好，保持自律的你太棒了！';
    if (hour < 12) return '早上好，新的进步从今天开始。';
    if (hour < 18) return '下午好，坚持复习，收获稳步提升。';
    return '晚上好，别忘了复盘今日收获。';
  }, []);
};

export default useGreeting;
