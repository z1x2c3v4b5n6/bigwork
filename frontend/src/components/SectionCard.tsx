import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  spacing?: number;
}

const SectionCard = ({ title, subtitle, action, children, spacing = 3 }: SectionCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,248,255,0.88))',
        backdropFilter: 'blur(14px)',
        p: { xs: 3, md: 4 },
        boxShadow: '0 28px 80px rgba(15, 23, 42, 0.08)',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 220,
          height: 220,
          top: -120,
          right: -60,
          background: 'radial-gradient(circle, rgba(25,118,210,0.24), transparent 65%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 160,
          height: 160,
          bottom: -80,
          left: -60,
          background: 'radial-gradient(circle, rgba(156,39,176,0.18), transparent 60%)',
        },
      }}
    >
      <Stack spacing={spacing} sx={{ position: 'relative' }}>
        {(title || subtitle || action) && (
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ md: 'center' }}
          >
            <Box>
              {title && (
                <Typography variant="h6" fontWeight={700} sx={{ mb: subtitle ? 0.5 : 0 }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            {action && <Box sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}>{action}</Box>}
          </Stack>
        )}
        <Box>{children}</Box>
      </Stack>
    </Paper>
  );
};

export default SectionCard;
