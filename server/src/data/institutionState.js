const { randomUUID } = require('crypto');
const catalog = require('./institutionCatalog');

const followMap = new Map(); // userId -> Set<institutionId>
const followerDeltaMap = new Map(); // institutionId -> number
const dynamicInstitutionMap = new Map(); // institutionId -> profile
const institutionByUserMap = new Map(); // userId -> institutionId
const brochureOverrideMap = new Map(); // institutionId -> brochure[]
const pushMessageMap = new Map(); // userId -> message[]

const clone = (value) => JSON.parse(JSON.stringify(value));

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const normalizeId = (value) => {
  if (!value) {
    return '';
  }
  return String(value).trim();
};

const getBaseInstitution = (id) => catalog.find((item) => item.id === id) || null;

const listBaseInstitutions = () => catalog.map((item) => clone(item));

const getAllInstitutions = () => {
  const base = listBaseInstitutions();
  const dynamic = Array.from(dynamicInstitutionMap.values()).map((item) => clone(item));
  return [...base, ...dynamic];
};

const getInstitutionProfile = (institutionId) => {
  const normalized = normalizeId(institutionId);
  if (!normalized) {
    return null;
  }
  const dynamic = dynamicInstitutionMap.get(normalized);
  if (dynamic) {
    return clone(dynamic);
  }
  const base = getBaseInstitution(normalized);
  return base ? clone(base) : null;
};

const getBrochures = (institutionId) => {
  const profile = getInstitutionProfile(institutionId);
  const overrides = brochureOverrideMap.get(institutionId) || [];
  const base = profile ? ensureArray(profile.brochures) : [];
  const items = [...overrides, ...base];
  return items
    .map((item) => ({
      ...item,
      publishedAt: item.publishedAt || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};

const getFollowerCount = (institutionId) => {
  const profile = getInstitutionProfile(institutionId);
  const base = profile?.followerBase ?? 0;
  const delta = followerDeltaMap.get(institutionId) ?? 0;
  return Math.max(0, base + delta);
};

const listPushMessages = (userId) => {
  const normalized = normalizeId(userId);
  if (!normalized) {
    return [];
  }
  const messages = pushMessageMap.get(normalized) || [];
  pushMessageMap.set(normalized, []);
  return messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const addPushMessage = (userId, message) => {
  const normalized = normalizeId(userId);
  if (!normalized) {
    return;
  }
  const existing = pushMessageMap.get(normalized) || [];
  existing.push({
    id: message.id || randomUUID(),
    type: message.type || 'institution-update',
    title: message.title,
    content: message.content,
    action: message.action || null,
    createdAt: message.createdAt || new Date().toISOString(),
  });
  pushMessageMap.set(normalized, existing);
};

const listFollowedInstitutions = (userId) => {
  const normalized = normalizeId(userId);
  if (!normalized) {
    return [];
  }
  const followSet = followMap.get(normalized) || new Set();
  const institutions = Array.from(followSet);
  return institutions
    .map((institutionId) => {
      const profile = getInstitutionProfile(institutionId);
      if (!profile) {
        return null;
      }
      const brochures = getBrochures(institutionId);
      return {
        id: profile.id,
        name: profile.name,
        shortName: profile.shortName || profile.name,
        location: profile.location || '全国',
        tags: ensureArray(profile.tags),
        officialWebsite: profile.officialWebsite || '',
        focus: profile.focus || '',
        followerCount: getFollowerCount(institutionId),
        historicalData: ensureArray(profile.historicalData),
        latestBrochure: brochures[0] || null,
        brochures: brochures.slice(0, 4),
        lastUpdatedAt: brochures[0]?.publishedAt || null,
      };
    })
    .filter(Boolean);
};

const listInstitutionsForUser = (userId) => {
  const normalized = normalizeId(userId);
  const followSet = normalized ? followMap.get(normalized) || new Set() : new Set();
  return getAllInstitutions().map((institution) => {
    const brochures = getBrochures(institution.id);
    return {
      id: institution.id,
      name: institution.name,
      shortName: institution.shortName || institution.name,
      location: institution.location || '全国',
      tags: ensureArray(institution.tags),
      focus: institution.focus || '',
      officialWebsite: institution.officialWebsite || '',
      followerCount: getFollowerCount(institution.id),
      isFollowed: followSet.has(institution.id),
      historicalData: ensureArray(institution.historicalData),
      brochures: brochures.slice(0, 5),
      latestBrochure: brochures[0] || null,
    };
  });
};

const toggleFollowInstitution = (userId, institutionId, follow) => {
  const normalizedUser = normalizeId(userId);
  const normalizedInstitution = normalizeId(institutionId);

  if (!normalizedUser || !normalizedInstitution) {
    return { isFollowed: false, followerCount: getFollowerCount(normalizedInstitution) };
  }

  const followSet = followMap.get(normalizedUser) || new Set();
  const alreadyFollowed = followSet.has(normalizedInstitution);
  const shouldFollow = follow ?? !alreadyFollowed;

  if (shouldFollow && !alreadyFollowed) {
    followSet.add(normalizedInstitution);
    followerDeltaMap.set(normalizedInstitution, (followerDeltaMap.get(normalizedInstitution) || 0) + 1);
  }

  if (!shouldFollow && alreadyFollowed) {
    followSet.delete(normalizedInstitution);
    followerDeltaMap.set(normalizedInstitution, (followerDeltaMap.get(normalizedInstitution) || 0) - 1);
  }

  followMap.set(normalizedUser, followSet);

  return { isFollowed: followSet.has(normalizedInstitution), followerCount: getFollowerCount(normalizedInstitution) };
};

const registerInstitutionAccount = ({
  userId,
  name,
  location,
  tags,
  officialWebsite,
  focus,
}) => {
  const normalizedUser = normalizeId(userId);
  if (!normalizedUser) {
    return null;
  }
  const institutionId = `inst-${normalizedUser}`;
  const profile = {
    id: institutionId,
    name: name || '院校账号',
    shortName: name || '院校账号',
    location: location || '全国',
    tags: ensureArray(tags).length ? ensureArray(tags) : ['官方入驻'],
    followerBase: 0,
    officialWebsite: officialWebsite || '',
    focus: focus || '欢迎考生咨询招生信息。',
    historicalData: [
      { year: new Date().getFullYear(), enrollment: null, scoreLine: null, note: '院校入驻，待发布历年数据。' },
    ],
    brochures: [],
  };
  dynamicInstitutionMap.set(institutionId, profile);
  institutionByUserMap.set(normalizedUser, institutionId);
  return clone(profile);
};

const updateInstitutionProfile = (userId, payload = {}) => {
  const institutionId = institutionByUserMap.get(normalizeId(userId));
  if (!institutionId) {
    return null;
  }
  const profile = dynamicInstitutionMap.get(institutionId);
  if (!profile) {
    return null;
  }
  if (payload.name) {
    profile.name = payload.name;
    profile.shortName = payload.name;
  }
  if (payload.location) {
    profile.location = payload.location;
  }
  if (payload.tags) {
    profile.tags = ensureArray(payload.tags);
  }
  if (payload.officialWebsite !== undefined) {
    profile.officialWebsite = payload.officialWebsite;
  }
  if (payload.focus) {
    profile.focus = payload.focus;
  }
  dynamicInstitutionMap.set(institutionId, profile);
  return clone(profile);
};

const publishBrochure = ({ institutionId, title, summary, link, publishedAt, publishedBy }) => {
  const normalizedInstitution = normalizeId(institutionId);
  if (!normalizedInstitution) {
    return null;
  }
  if (!title) {
    throw new Error('title is required');
  }
  const brochure = {
    id: `bro-${randomUUID()}`,
    title: title.trim(),
    summary: summary?.trim() || '院校发布了最新招生信息，建议及时查看官方说明。',
    link: link?.trim() || '',
    publishedAt: publishedAt || new Date().toISOString(),
    publishedBy: publishedBy || '院校官方',
  };
  const existing = brochureOverrideMap.get(normalizedInstitution) || [];
  existing.unshift(brochure);
  brochureOverrideMap.set(normalizedInstitution, existing);

  // notify followers
  Array.from(followMap.entries()).forEach(([userId, followSet]) => {
    if (followSet.has(normalizedInstitution)) {
      addPushMessage(userId, {
        title: `${getInstitutionProfile(normalizedInstitution)?.shortName || '院校'}发布新简章`,
        content: `${brochure.title}${brochure.summary ? `：${brochure.summary}` : ''}`,
        action: brochure.link
          ? { label: '查看详情', url: brochure.link }
          : null,
        createdAt: brochure.publishedAt,
      });
    }
  });

  return brochure;
};

const getInstitutionIdForUser = (userId) => institutionByUserMap.get(normalizeId(userId)) || null;

const getInstitutionProfileForUser = (userId) => {
  const institutionId = getInstitutionIdForUser(userId);
  if (!institutionId) {
    return null;
  }
  return getInstitutionProfile(institutionId);
};

module.exports = {
  listInstitutionsForUser,
  toggleFollowInstitution,
  listFollowedInstitutions,
  listPushMessages,
  addPushMessage,
  registerInstitutionAccount,
  updateInstitutionProfile,
  publishBrochure,
  getInstitutionIdForUser,
  getInstitutionProfileForUser,
  getBrochures,
  getFollowerCount,
};
