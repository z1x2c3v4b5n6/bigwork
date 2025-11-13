const express = require('express');
const { query, getTableColumns, tableExists } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const resolveColumn = (columns, candidates) => candidates.find((column) => columns.has(column)) || null;

router.get('/', requireAuth, async (req, res) => {
  try {
    if (!(await tableExists('majors'))) {
      return res.json([]);
    }

    const columns = await getTableColumns('majors');

    const idColumn = resolveColumn(columns, ['id', 'major_id']);
    const nameColumn = resolveColumn(columns, ['name', 'major_name', 'title']);
    const descriptionColumn = resolveColumn(columns, ['description', 'intro', 'summary']);
    const subjectTagsColumn = resolveColumn(columns, ['subject_tags', 'tags', 'tag_list']);

    const selectFragments = [
      idColumn ? `m.\`${idColumn}\` AS id` : 'NULL AS id',
      nameColumn ? `m.\`${nameColumn}\` AS name` : 'NULL AS name',
      descriptionColumn ? `m.\`${descriptionColumn}\` AS description` : 'NULL AS description',
      subjectTagsColumn ? `m.\`${subjectTagsColumn}\` AS subject_tags` : 'NULL AS subject_tags',
    ];

    const rows = await query(
      `SELECT ${selectFragments.join(', ')} FROM majors m ORDER BY ${nameColumn ? `m.\`${nameColumn}\`` : 'm.id'} ASC`,
    );

    const majors = rows.map((row) => {
      const rawTags = row.subject_tags;
      const tags = Array.isArray(rawTags)
        ? rawTags
        : typeof rawTags === 'string'
        ? rawTags
            .split(/[,，;；\s]+/)
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : [];

      return {
        id: row.id != null ? String(row.id) : '',
        name: row.name || '未命名专业',
        description: row.description || null,
        subjectTags: tags,
      };
    });

    return res.json(majors);
  } catch (error) {
    console.error('加载专业列表失败', error);
    return res.status(500).json({ message: '无法加载专业信息，请稍后重试' });
  }
});

module.exports = router;
