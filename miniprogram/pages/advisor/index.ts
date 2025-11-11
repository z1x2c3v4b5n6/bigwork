import {
  buildRecommendationResponse,
  type MatchLevel,
  type RecommendationPayload,
  type UniversityRecommendationResponse,
} from '../../utils/universityAdvisor';

type AdvisorPageData = {
  scoreInput: string;
  majorInput: string;
  mathOptions: string[];
  englishOptions: string[];
  mathIndex: number;
  englishIndex: number;
  loading: boolean;
  errorMessage: string;
  recommendation: AdvisorRecommendationView | null;
  focusPreview: string[];
};

type AdvisorRecommendationItemView = UniversityRecommendationResponse['recommendedUniversities'][number] & {
  matchLevelClass: string;
};

type AdvisorRecommendationView = Omit<UniversityRecommendationResponse, 'recommendedUniversities'> & {
  recommendedUniversities: AdvisorRecommendationItemView[];
};

const matchLevelClassMap: Record<MatchLevel, string> = {
  稳妥: 'stable',
  冲刺: 'sprint',
  保底: 'safe',
  高风险: 'risky',
};

Page<AdvisorPageData>({
  data: {
    scoreInput: '',
    majorInput: '',
    mathOptions: ['不限', '数学一', '数学二', '数学三', '不考数学'],
    englishOptions: ['不限', '英语一', '英语二'],
    mathIndex: 0,
    englishIndex: 0,
    loading: false,
    errorMessage: '',
    recommendation: null,
    focusPreview: [],
  } as AdvisorPageData,

  onScoreInput(event) {
    this.setData({ scoreInput: event.detail.value ?? '' });
  },

  onMajorInput(event) {
    this.setData({ majorInput: event.detail.value ?? '' });
  },

  onMathChange(event) {
    const value = Number(event.detail.value);
    this.setData({ mathIndex: Number.isNaN(value) ? 0 : value });
  },

  onEnglishChange(event) {
    const value = Number(event.detail.value);
    this.setData({ englishIndex: Number.isNaN(value) ? 0 : value });
  },

  onGenerate() {
    if (this.data.loading) {
      return;
    }

    const parsedScore = Number(this.data.scoreInput);
    if (!Number.isFinite(parsedScore) || parsedScore <= 0) {
      this.setData({
        errorMessage: '请输入有效的初试总分（大于 0 的数字）。',
        recommendation: null,
      });
      return;
    }

    const payload: RecommendationPayload = {
      totalScore: parsedScore,
    };

    const trimmedMajor = this.data.majorInput.trim();
    if (trimmedMajor) {
      payload.targetMajor = trimmedMajor;
    }

    const examPreferences: RecommendationPayload['examPreferences'] = {};
    const mathValue = this.data.mathOptions[this.data.mathIndex];
    const englishValue = this.data.englishOptions[this.data.englishIndex];
    if (this.data.mathIndex > 0 && mathValue) {
      examPreferences.math = mathValue;
    }
    if (this.data.englishIndex > 0 && englishValue) {
      examPreferences.english = englishValue;
    }

    if (examPreferences.math || examPreferences.english) {
      payload.examPreferences = examPreferences;
    }

    this.setData({
      loading: true,
      errorMessage: '',
      recommendation: null,
      focusPreview: [],
    });

    try {
      const recommendation = buildRecommendationResponse(payload);
      const focusPreview = recommendation.interviewPreparation.focusTopics.slice(0, 3);
      const sanitizedRecommendation: AdvisorRecommendationView = {
        ...recommendation,
        recommendedUniversities: recommendation.recommendedUniversities.map((item) => ({
          ...item,
          matchLevelClass: matchLevelClassMap[item.matchLevel] || 'stable',
        })),
      };
      this.setData({
        recommendation: sanitizedRecommendation,
        loading: false,
        focusPreview,
      });
    } catch (error) {
      const message = (error as Error)?.message || '暂时无法生成推荐，请稍后再试。';
      this.setData({
        loading: false,
        errorMessage: message,
      });
    }
  },
});
