import {
  Box,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InsightsIcon from '@mui/icons-material/Insights';
import DataUsageIcon from '@mui/icons-material/DataUsage';

const Analytics = () => {
  const subjectStats = [
    { name: '数学一', mastery: 0.72, trend: '+6.4%', focus: '线性代数、概率统计' },
    { name: '政治', mastery: 0.58, trend: '+3.1%', focus: '毛中特第二章、时政题' },
    { name: '英语一', mastery: 0.81, trend: '+4.8%', focus: '阅读理解、写作素材积累' },
    { name: '计算机 408', mastery: 0.66, trend: '+5.5%', focus: '数据结构-图、操作系统-进程管理' },
  ];

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          学习分析
        </Typography>
        <Typography variant="body1" color="text.secondary">
          汇总各科目掌握度、模考表现与学习行为数据，帮助你精准识别薄弱点并制定提升策略。
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <TrendingUpIcon color="primary" fontSize="large" />
              <Typography variant="subtitle1" fontWeight={600}>
                模考趋势
              </Typography>
              <Typography variant="body2" color="text.secondary">
                最近 3 次模考成绩：358 → 368 → 379，已连续两周保持上升趋势。
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <InsightsIcon color="secondary" fontSize="large" />
              <Typography variant="subtitle1" fontWeight={600}>
                时间分配
              </Typography>
              <Typography variant="body2" color="text.secondary">
                工作日平均每日学习 4.5 小时，周末 7 小时。建议将政治复习时间提升 30%。
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <DataUsageIcon color="success" fontSize="large" />
              <Typography variant="subtitle1" fontWeight={600}>
                学习行为
              </Typography>
              <Typography variant="body2" color="text.secondary">
                上周平均专注时长 42min/番茄钟，错题回顾完成率 86%，夜间复盘坚持 5/7 天。
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          科目掌握度雷达
        </Typography>
        <Grid container spacing={3}>
          {subjectStats.map((subject) => (
            <Grid item xs={12} sm={6} key={subject.name}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {subject.name}
                  </Typography>
                  <LinearProgress variant="determinate" value={subject.mastery * 100} sx={{ borderRadius: 999 }} />
                  <Typography variant="body2" color="text.secondary">
                    掌握度 {(subject.mastery * 100).toFixed(0)}% · 环比 {subject.trend}
                  </Typography>
                  <Typography variant="body2">本周重点：{subject.focus}</Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          错题知识图谱（Top 5）
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>知识点</TableCell>
              <TableCell>错误率</TableCell>
              <TableCell>建议操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>线性代数 · 特征值与特征向量</TableCell>
              <TableCell>32%</TableCell>
              <TableCell>回看第 5-6 讲并完成配套训练营</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>政治 · 马原哲学部分</TableCell>
              <TableCell>28%</TableCell>
              <TableCell>整理错题思维导图，参加周五直播答疑</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>英语 · 长难句理解</TableCell>
              <TableCell>25%</TableCell>
              <TableCell>每日精读一篇外刊，积累结构</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>计组 · Cache 一致性协议</TableCell>
              <TableCell>24%</TableCell>
              <TableCell>完成专项题单并观看讲解视频</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>数据结构 · 图的遍历</TableCell>
              <TableCell>21%</TableCell>
              <TableCell>整理 DFS/BFS 思维流程图，强化练习</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
};

export default Analytics;
