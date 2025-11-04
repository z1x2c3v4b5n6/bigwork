import {
  Box,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InsightsIcon from '@mui/icons-material/Insights';
import SchoolIcon from '@mui/icons-material/School';
import { useMemo, useState } from 'react';
import { majorRecommendations, scoreBandGuides } from '../data/postgraduateResources';

const lowBandMessage = '建议暂停复试，先梳理错题与经历，积累实习或科研后再战。';

const PostgraduateSubjectTopics = () => {
  const [selectedMajor, setSelectedMajor] = useState<string>('all');

  const filteredRecommendations = useMemo(() => {
    if (selectedMajor === 'all') {
      return majorRecommendations;
    }
    return majorRecommendations.filter((item) => item.major === selectedMajor);
  }, [selectedMajor]);

  const focusedMajor = useMemo(
    () => (selectedMajor === 'all' ? undefined : majorRecommendations.find((item) => item.major === selectedMajor)),
    [selectedMajor],
  );

  const handleMajorChange = (event: SelectChangeEvent<string>) => {
    setSelectedMajor(event.target.value);
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          复试专业课高频题整理表
        </Typography>
        <Typography variant="body1" color="text.secondary">
          基于近三年热门院校的复试要求，将 20 个热门专业的核心考点、追问角度与练习任务整合成一张“复盘表”。按照分数段选择备考策略，360 分以上聚焦深度与创新，国家线至 360 分强调全面覆盖，国家线以下建议暂停冲刺，补齐知识与经历再战。
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <TrendingUpIcon color="primary" fontSize="large" />
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  分数段策略与院校推荐
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  仅对 360 分以上与国家线-360 分提供目标院校组合，国家线以下提供“暂停冲刺”提醒，避免盲目投入复试。
                </Typography>
              </Box>
            </Stack>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 240 } }}>
              <InputLabel id="major-filter-label">筛选热门专业</InputLabel>
              <Select
                labelId="major-filter-label"
                value={selectedMajor}
                label="筛选热门专业"
                onChange={handleMajorChange}
              >
                <MenuItem value="all">全部热门专业</MenuItem>
                {majorRecommendations.map((item) => (
                  <MenuItem key={item.major} value={item.major}>
                    {item.major}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {scoreBandGuides.map((guide) => (
              <Paper
                key={guide.key}
                elevation={0}
                sx={{
                  flex: 1,
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: guide.key === 'low' ? 'warning.light' : 'divider',
                  bgcolor: guide.key === 'low' ? 'warning.50' : 'background.paper',
                }}
              >
                <Stack spacing={1.5}>
                  <Chip
                    label={guide.title}
                    color={guide.key === 'low' ? 'warning' : 'primary'}
                    variant="outlined"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {guide.subtitle}
                  </Typography>
                  <Divider sx={{ borderStyle: 'dotted' }} />
                  <Typography variant="body2" color="text.secondary">
                    {guide.key === 'low'
                      ? '建议暂缓复试，梳理错题与经历，积累实习或科研，再以更扎实的底气回归。'
                      : '建议从下方表格中锁定与你专业匹配的院校组合，提前研究导师方向。'}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width="12%">热门专业</TableCell>
              <TableCell width="20%">高频考点</TableCell>
              <TableCell width="16%">追问角度</TableCell>
              <TableCell width="18%">冲刺练习任务</TableCell>
              <TableCell width="14%">360 分以上推荐院校</TableCell>
              <TableCell width="14%">国家线-360 分推荐院校</TableCell>
              <TableCell width="12%">国家线以下提醒</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecommendations.map((item) => (
              <TableRow key={item.major} hover>
                <TableCell>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {item.major}
                    </Typography>
                    <Chip label="热门" color="secondary" size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {item.coreTopics.map((topic) => (
                      <Typography key={topic} variant="body2" color="text.secondary">
                        • {topic}
                      </Typography>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {item.questionAngles.map((question) => (
                      <Typography key={question} variant="body2" color="text.secondary">
                        • {question}
                      </Typography>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {item.practiceTasks.map((task) => (
                      <Typography key={task} variant="body2" color="text.secondary">
                        • {task}
                      </Typography>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {item.recommendedSchools.high.map((school) => (
                      <Typography key={school} variant="body2" color="text.secondary">
                        <SchoolIcon fontSize="inherit" color="primary" sx={{ mr: 0.5 }} />
                        {school}
                      </Typography>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {item.recommendedSchools.mid.map((school) => (
                      <Typography key={school} variant="body2" color="text.secondary">
                        <SchoolIcon fontSize="inherit" color="success" sx={{ mr: 0.5 }} />
                        {school}
                      </Typography>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {lowBandMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {focusedMajor && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px dashed', borderColor: 'primary.light' }}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={600}>
              {focusedMajor.major} · 快速聚焦清单
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  高频考点
                </Typography>
                <Stack spacing={0.75}>
                  {focusedMajor.coreTopics.map((topic) => (
                    <Typography key={topic} variant="body2">
                      • {topic}
                    </Typography>
                  ))}
                </Stack>
              </Box>
              <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  常见追问
                </Typography>
                <Stack spacing={0.75}>
                  {focusedMajor.questionAngles.map((angle) => (
                    <Typography key={angle} variant="body2">
                      • {angle}
                    </Typography>
                  ))}
                </Stack>
              </Box>
              <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  冲刺任务
                </Typography>
                <Stack spacing={0.75}>
                  {focusedMajor.practiceTasks.map((task) => (
                    <Typography key={task} variant="body2">
                      • {task}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <InsightsIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                如何使用这张表
              </Typography>
              <Typography variant="body2" color="text.secondary">
                结合目标院校导师方向，挑选 3-5 个最契合的考点，制作“知识点-案例-英文关键词”三栏卡片，复试前每天滚动复盘。
              </Typography>
            </Box>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            建议将表格导出成电子笔记或打印成 A3 尺寸，面试当天携带。每完成一次模拟面试，就在对应专业的练习任务后打勾，并补充导师反馈。对于跨专业考生，可以先完成核心考点的自测，再补充本科背景能承接的跨界案例。
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default PostgraduateSubjectTopics;
