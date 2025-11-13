const { resolveMajorSubjects } = require('../data/majorSubjects');
const { getCourseSubjectMeta } = require('../data/courseSubjects');

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

const enrichCourse = (course) => {
  const meta = getCourseSubjectMeta(course.id);
  if (!meta || !meta.tags || meta.tags.length === 0) {
    return { course, meta };
  }
  return {
    course: { ...course, subjectTags: meta.tags },
    meta,
  };
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

  return courses
    .map((course) => enrichCourse(course))
    .filter(({ course, meta }) => {
      const category = typeof course.category === 'string' ? course.category : '';
      const isProfessionalCourse = category.includes('专业');

      if (!isProfessionalCourse) {
        return true;
      }

      if (!meta) {
        // 未识别的专业课不强制过滤，交由前端根据课程画像处理
        return true;
      }

      if (meta.general) {
        return true;
      }

      if (meta.majorIds && meta.majorIds.length > 0) {
        if (normalizedMajorId && meta.majorIds.includes(normalizedMajorId)) {
          return true;
        }
        if (!normalizedMajorId) {
          return false;
        }
      }

      if (hasTagIntersection(meta.tags || [], mergedMajorTags)) {
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

