const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  listInstitutionsForUser,
  toggleFollowInstitution,
  listFollowedInstitutions,
  listPushMessages,
  publishBrochure,
  getInstitutionIdForUser,
  getInstitutionProfileForUser,
  getBrochures,
  getFollowerCount,
} = require('../data/institutionState');
const { getExamProfile } = require('../data/userExtras');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  try {
    const userId = req.session?.user?.id || '';
    const institutions = listInstitutionsForUser(userId);
    res.json({ institutions });
  } catch (error) {
    console.error('加载院校列表失败', error);
    res.status(500).json({ message: '无法加载院校列表，请稍后再试。' });
  }
});

router.get('/followed', requireAuth, (req, res) => {
  try {
    const userId = req.session?.user?.id || '';
    const items = listFollowedInstitutions(userId);
    res.json({ institutions: items });
  } catch (error) {
    console.error('加载关注院校失败', error);
    res.status(500).json({ message: '无法加载关注院校，请稍后再试。' });
  }
});

router.get('/notifications', requireAuth, (req, res) => {
  try {
    const userId = req.session?.user?.id || '';
    const messages = listPushMessages(userId);
    res.json({ messages });
  } catch (error) {
    console.error('获取院校通知失败', error);
    res.status(500).json({ message: '无法获取院校通知，请稍后再试。' });
  }
});

router.post('/:id/follow', requireAuth, (req, res) => {
  const institutionId = req.params.id;
  const { follow } = req.body || {};
  try {
    const userId = req.session?.user?.id || '';
    const result = toggleFollowInstitution(userId, institutionId, follow);
    res.json({
      institutionId,
      ...result,
    });
  } catch (error) {
    console.error('更新关注状态失败', error);
    res.status(500).json({ message: '更新关注状态失败，请稍后再试。' });
  }
});

router.get('/mine', requireAuth, (req, res) => {
  const user = req.session?.user;
  if (!user || user.role !== 'institution') {
    return res.status(403).json({ message: '仅院校账号可访问此接口' });
  }

  try {
    const institutionId = getInstitutionIdForUser(user.id);
    const profile = getInstitutionProfileForUser(user.id);
    const brochures = institutionId ? getBrochures(institutionId) : [];
    const followerCount = institutionId ? getFollowerCount(institutionId) : 0;
    res.json({
      institutionId,
      profile,
      brochures,
      followerCount,
      examProfile: getExamProfile(user.id) || null,
    });
  } catch (error) {
    console.error('加载院校账号信息失败', error);
    res.status(500).json({ message: '无法加载院校账号信息，请稍后再试。' });
  }
});

router.post('/brochures', requireAuth, (req, res) => {
  const user = req.session?.user;
  if (!user || user.role !== 'institution') {
    return res.status(403).json({ message: '仅院校账号可以发布招生简章' });
  }

  const { title, summary, link, publishedAt } = req.body || {};

  if (!title) {
    return res.status(400).json({ message: '标题不能为空' });
  }

  try {
    const institutionId = getInstitutionIdForUser(user.id);
    if (!institutionId) {
      return res.status(400).json({ message: '尚未完成院校信息登记，无法发布内容' });
    }

    const brochure = publishBrochure({
      institutionId,
      title,
      summary,
      link,
      publishedAt,
      publishedBy: user.name,
    });

    res.status(201).json({ brochure });
  } catch (error) {
    console.error('发布招生简章失败', error);
    res.status(500).json({ message: '发布招生简章失败，请稍后再试。' });
  }
});

module.exports = router;
