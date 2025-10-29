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
import type { ScheduleItem } from '../data/dashboard';

dayjs.locale('zh-cn');

const timelineIconMap: Partial<Record<ScheduleItem['type'], JSX.Element>> = {
  直播课: <EventIcon />,
  自习: <SelfImprovementIcon />,
  模拟考试: <QuizIcon />,
  教练辅导: <SupportAgentIcon />,
};

interface ScheduleTimelineProps {
  items: ScheduleItem[];
}

const ScheduleTimeline = ({ items }: ScheduleTimelineProps) => {
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" mb={2}>
        本周重点安排
      </Typography>
      <Timeline position="alternate">
        {items.map((item) => (
          <TimelineItem key={item.id}>
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
        ))}
      </Timeline>
    </Paper>
  );
};

export default ScheduleTimeline;
