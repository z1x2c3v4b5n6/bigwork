import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import SchoolIcon from '@mui/icons-material/School';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import type { InstitutionDirectoryItem } from '../services/institutionService';
import {
  fetchInstitutionDirectory,
  toggleFollowInstitution,
} from '../services/institutionService';

const DIRECTORY_QUERY_KEY = ['institution-directory'];

const InstitutionDirectoryPanel = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: DIRECTORY_QUERY_KEY,
    queryFn: fetchInstitutionDirectory,
  });

  const followMutation = useMutation({
    mutationFn: ({ id, follow }: { id: string; follow: boolean }) => toggleFollowInstitution(id, follow),
    onSuccess: (result) => {
      queryClient.setQueryData<InstitutionDirectoryItem[] | undefined>(DIRECTORY_QUERY_KEY, (prev) => {
        if (!prev) {
          return prev;
        }
        return prev.map((item) =>
          item.id === result.institutionId
            ? { ...item, isFollowed: result.isFollowed, followerCount: result.followerCount }
            : item,
        );
      });
    },
  });

  const institutions = data ?? [];

  return (
    <Stack spacing={2.5}>
      {isLoading ? (
        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={32} />
        </Box>
      ) : null}

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={() => refetch()}>
              重新加载
            </Button>
          }
          sx={{ borderRadius: 3 }}
        >
          无法加载院校列表，请稍后重试。
        </Alert>
      ) : null}

      {institutions.length === 0 && !isLoading ? (
        <Typography variant="body2" color="text.secondary">
          暂无院校信息。
        </Typography>
      ) : null}

      <Grid container spacing={2.5}>
        {institutions.map((institution) => (
          <Grid item xs={12} md={6} key={institution.id}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                background: 'linear-gradient(140deg, rgba(255,255,255,0.95), rgba(227,242,253,0.6))',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(25,118,210,0.12)',
                    color: 'primary.main',
                  }}
                >
                  <SchoolIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {institution.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {institution.location} · {institution.followerCount} 人关注
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {institution.tags.slice(0, 4).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {institution.focus}
              </Typography>

              {institution.latestBrochure && (
                <Alert
                  severity="info"
                  sx={{ borderRadius: 2 }}
                  action={
                    institution.latestBrochure.link ? (
                      <Button
                        color="inherit"
                        size="small"
                        href={institution.latestBrochure.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        阅读简章
                      </Button>
                    ) : null
                  }
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    {institution.latestBrochure.title}
                  </Typography>
                  <Typography variant="body2">{institution.latestBrochure.summary}</Typography>
                </Alert>
              )}

              <Box sx={{ mt: 'auto', pt: 1 }}>
                <Button
                  variant={institution.isFollowed ? 'contained' : 'outlined'}
                  color={institution.isFollowed ? 'secondary' : 'primary'}
                  startIcon={institution.isFollowed ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  onClick={() =>
                    followMutation.mutate({
                      id: institution.id,
                      follow: !institution.isFollowed,
                    })
                  }
                  disabled={followMutation.isPending}
                >
                  {institution.isFollowed ? '已关注' : '关注院校'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {isFetching && !isLoading ? (
        <Box sx={{ py: 1, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={20} />
        </Box>
      ) : null}
    </Stack>
  );
};

export default InstitutionDirectoryPanel;
