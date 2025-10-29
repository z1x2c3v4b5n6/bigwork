import { Box, LinearProgress, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  helperText?: string;
  icon: ReactNode;
  progress?: number;
  accent?: string;
}

const StatCard = ({ title, value, helperText, icon, progress, accent }: StatCardProps) => {
  return (
    <Paper elevation={0} sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            bgcolor: accent ?? 'primary.light',
            color: 'primary.contrastText',
            fontSize: 24,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700} mt={0.5}>
            {value}
          </Typography>
        </Box>
      </Box>
      {helperText && (
        <Typography variant="body2" color="text.secondary" mt={2}>
          {helperText}
        </Typography>
      )}
      {progress !== undefined && (
        <Box mt={2}>
          <LinearProgress value={progress} variant="determinate" sx={{ borderRadius: 999 }} />
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            已完成 {progress}%
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default StatCard;
