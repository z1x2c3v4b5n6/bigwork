import { Chip, Paper, Stack, Typography } from '@mui/material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@mui/lab';
import EventIcon from '@mui/icons-material/Event';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import QuizIcon from '@mui/icons-material/Quiz';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

type TimelineEntry = {
  id: string;
  title: string;
  type: string;
  start: string;
  end: string;
  focus?: string;
  location?: string;
  tags?: string[];
};

const timelineIconMap: Partial<Record<string, JSX.Element>> = {
  直播课: <EventIcon />,
  自习: <SelfImprovementIcon />,
  模拟考试: <QuizIcon />,
  教练辅导: <SupportAgentIcon />,
};

interface ScheduleTimelineProps {
  items: TimelineEntry[];
}

const ScheduleTimeline = ({ items }: ScheduleTimelineProps) => {
  if (!items || items.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" mb={2}>
          本周重点安排
        </Typography>
        <Typography variant="body2" color="text.secondary">
          暂无日程安排，添加日程后将自动展示最近的学习任务。
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" mb={2}>
        本周重点安排
      </Typography>
      <Timeline position="alternate">
        {items.map((item, index) => {
          const key = item.id || `timeline-${index}-${item.start}-${item.title}`;
          return (
            <TimelineItem key={key}>
            <TimelineOppositeContent color="text.secondary">
              {dayjs(item.start).format('MM月DD日 ddd')}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary">{timelineIconMap[item.type] ?? <EventIcon />}</TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {item.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={item.type} size="small" color="primary" variant="outlined" />
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(item.start).format('HH:mm')} - {dayjs(item.end).format('HH:mm')}
                  </Typography>
                </Stack>
                {item.focus && (
                  <Typography variant="body2" color="text.secondary">
                    重点：{item.focus}
                  </Typography>
                )}
                {item.location && (
                  <Typography variant="body2" color="text.secondary">
                    地点：{item.location}
                  </Typography>
                )}
                {item.tags && item.tags.length > 0 && (
                  <Stack direction="row" spacing={1}>
                    {item.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                )}
              </Stack>
            </TimelineContent>
          </TimelineItem>
          );
        })}
      </Timeline>
    </Paper>
  );
};

export default ScheduleTimeline;
