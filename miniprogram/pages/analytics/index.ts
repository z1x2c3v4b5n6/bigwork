import { analyticsHighlights, knowledgeGraphSeed, subjectMasterySeed, type SubjectMastery } from '../../data/analytics';

Page({
  data: {
    highlights: analyticsHighlights,
    subjects: subjectMasterySeed.map((subject) => ({
      ...subject,
      masteryText: `${Math.round(subject.mastery * 100)}%`,
    })) as (SubjectMastery & { masteryText: string })[],
    knowledgeGraph: knowledgeGraphSeed,
  },
});
