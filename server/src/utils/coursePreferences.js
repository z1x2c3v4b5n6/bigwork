const { resolveMajorSubjects } = require('../data/majorSubjects');
const { enrichCourseWithMetadata } = require('../data/courseMetadata');

const normalizeTag = (value) => {
  if (!value) {
    return '';
  }
  return String(value).trim().toLowerCase().replace(/[\s·\-_/]+/g, '');
};

const hasTagIntersection = (courseTags = [], majorTags = []) => {
  if (courseTags.length === 0 || majorTags.length === 0) {
    return false;
  }
  const normalizedCourseTags = courseTags.map(normalizeTag).filter(Boolean);
  const normalizedMajorTags = majorTags.map(normalizeTag).filter(Boolean);
  return normalizedCourseTags.some((courseTag) =>
    normalizedMajorTags.some(
      (majorTag) => courseTag.includes(majorTag) || majorTag.includes(courseTag),
    ),
  );
};

const filterCoursesByProfile = (courses = [], { examProfile = null, sessionUser = null } = {}) => {
  const examMajorId = examProfile?.majorId || null;
  const examMajorName = examProfile?.targetMajor || null;
  const examMajorTags = Array.isArray(examProfile?.majorTags)
    ? examProfile.majorTags.filter(Boolean)
    : [];

  const sessionMajorId = sessionUser?.majorId || null;
  const sessionMajorName = sessionUser?.majorName || null;

  const resolvedMajor = resolveMajorSubjects({
    majorId: examMajorId || sessionMajorId || null,
    majorName: examMajorName || sessionMajorName || null,
  });

  const mergedMajorTags = (
    examMajorTags.length > 0 ? examMajorTags : resolvedMajor.tags || []
  ).filter(Boolean);
  const normalizedMajorId = resolvedMajor.id || examMajorId || sessionMajorId || null;

  const fallbackMajorName = examMajorName || sessionMajorName || resolvedMajor.name || '';

  return courses
    .map((course) => enrichCourseWithMetadata(course))
    .filter(({ course, subjectMeta }) => {
      const suitability = course.suitability || null;

      if (suitability) {
        if (Array.isArray(suitability.mathSubjects) && suitability.mathSubjects.length > 0) {
          const mathSubject = examProfile?.mathSubject ? String(examProfile.mathSubject).trim() : '';
          if (!mathSubject || !suitability.mathSubjects.includes(mathSubject)) {
            return false;
          }
        }

        if (Array.isArray(suitability.englishSubjects) && suitability.englishSubjects.length > 0) {
          const englishSubject = examProfile?.englishSubject ? String(examProfile.englishSubject).trim() : '';
          if (!englishSubject || !suitability.englishSubjects.includes(englishSubject)) {
            return false;
          }
        }

        if (Array.isArray(suitability.majorIds) && suitability.majorIds.length > 0) {
          if (!normalizedMajorId) {
            return false;
          }
          if (!suitability.majorIds.includes(normalizedMajorId)) {
            return false;
          }
        }

        if (Array.isArray(suitability.majors) && suitability.majors.length > 0) {
          const allowOther = suitability.majors.includes('其他专业');
          if (!allowOther) {
            const normalizedMajorName = normalizeTag(fallbackMajorName);
            if (!normalizedMajorName) {
              return false;
            }
            const normalizedAllowed = suitability.majors.map(normalizeTag).filter(Boolean);
            if (
              normalizedAllowed.length > 0 &&
              !normalizedAllowed.some(
                (allowed) => normalizedMajorName.includes(allowed) || allowed.includes(normalizedMajorName),
              )
            ) {
              return false;
            }
          }
        }

        const scoreMin = suitability.scoreMin;
        const scoreMax = suitability.scoreMax;
        if (scoreMin !== undefined || scoreMax !== undefined) {
          const totalScore = examProfile?.totalScore;
          if (totalScore != null && Number.isFinite(Number(totalScore))) {
            const numericScore = Number(totalScore);
            if (scoreMin !== undefined && numericScore < scoreMin) {
              return false;
            }
            if (scoreMax !== undefined && numericScore > scoreMax) {
              return false;
            }
          }
        }
      }

      const category = typeof course.category === 'string' ? course.category : '';
      const isProfessionalCourse = category.includes('专业');

      if (!isProfessionalCourse) {
        return true;
      }

      if (!subjectMeta) {
        // 未识别的专业课不强制过滤，交由前端根据课程画像处理
        return true;
      }

      if (subjectMeta.general) {
        return true;
      }

      if (subjectMeta.majorIds && subjectMeta.majorIds.length > 0) {
        if (normalizedMajorId && subjectMeta.majorIds.includes(normalizedMajorId)) {
          return true;
        }
        if (!normalizedMajorId) {
          return false;
        }
      }

      if (hasTagIntersection(subjectMeta.tags || [], mergedMajorTags)) {
        return true;
      }

      return false;
    })
    .map(({ course }) => course);
};

module.exports = {
  filterCoursesByProfile,
  normalizeTag,
};

