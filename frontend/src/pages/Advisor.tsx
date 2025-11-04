import { Box, Container, Stack, Typography } from '@mui/material';
import SectionCard from '../components/SectionCard';
import UniversityAdvisorPanel from '../components/UniversityAdvisorPanel';

const Advisor = () => (
  <Box
    sx={{
      position: 'relative',
      flexGrow: 1,
      py: { xs: 4, md: 6 },
      background: 'linear-gradient(180deg, rgba(227,242,253,0.6) 0%, #ffffff 55%)',
    }}
  >
    <Container maxWidth="lg" sx={{ position: 'relative' }}>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            院校智选
          </Typography>
          <Typography variant="body1" color="text.secondary">
            根据初试总分与目标专业，智能匹配冲刺、稳妥、保底院校组合，并生成复试准备路线图与资料清单，帮助你快速明确下一步行动。
          </Typography>
        </Stack>

        <SectionCard
          title="智能院校推荐"
          subtitle="输入初试总分，系统将结合院校分数线与专业特点，提供差异化院校组合与复试策略建议。"
        >
          <UniversityAdvisorPanel />
        </SectionCard>
      </Stack>
    </Container>
  </Box>
);

export default Advisor;
