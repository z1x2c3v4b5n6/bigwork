import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h3" fontWeight={700}>
        404
      </Typography>
      <Typography variant="h6">页面走丢了</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        未找到对应内容，返回首页继续你的高效备考之旅。
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>回到首页</Button>
    </Box>
  );
};

export default NotFound;
