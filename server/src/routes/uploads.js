const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const uploadRoot = path.resolve(__dirname, '..', '..', 'uploads');

const ensureDirectory = async (targetPath) => {
  await fs.mkdir(targetPath, { recursive: true });
};

const decodeBase64File = (dataUri) => {
  if (typeof dataUri !== 'string') {
    throw Object.assign(new Error('INVALID_DATA_URI'), { code: 'INVALID_DATA_URI' });
  }

  const matches = dataUri.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw Object.assign(new Error('INVALID_DATA_URI'), { code: 'INVALID_DATA_URI' });
  }

  const [, mimeType, base64Payload] = matches;
  const buffer = Buffer.from(base64Payload, 'base64');
  return { buffer, mimeType };
};

const guessExtension = (filename, mimeType) => {
  const ext = path.extname(filename || '').toLowerCase();
  if (ext) {
    return ext;
  }

  if (!mimeType) {
    return '';
  }

  if (mimeType.includes('png')) return '.png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return '.jpg';
  if (mimeType.includes('gif')) return '.gif';
  if (mimeType.includes('pdf')) return '.pdf';
  if (mimeType.includes('msword')) return '.doc';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '.xlsx';
  if (mimeType.includes('plain')) return '.txt';

  return '';
};

const sanitizeBaseName = (name) => {
  if (!name) {
    return 'file';
  }

  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const saveBase64File = async ({ dataUri, filename, folder, maxBytes }) => {
  const { buffer, mimeType } = decodeBase64File(dataUri);

  if (maxBytes && buffer.length > maxBytes) {
    const error = new Error('FILE_TOO_LARGE');
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }

  const safeFolder = folder ? folder.replace(/\.\.+/g, '') : '';
  const destinationDir = path.join(uploadRoot, safeFolder);
  await ensureDirectory(destinationDir);

  const baseName = sanitizeBaseName(path.basename(filename || 'file', path.extname(filename || '')));
  const extension = guessExtension(filename, mimeType) || '.bin';
  const uniqueName = `${baseName}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}${extension}`;
  const absolutePath = path.join(destinationDir, uniqueName);

  await fs.writeFile(absolutePath, buffer);

  const relativePath = path
    .join('/uploads', safeFolder, uniqueName)
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/');

  return {
    url: relativePath,
    fileName: uniqueName,
    mimeType,
    size: buffer.length,
  };
};

router.post('/avatars', requireAuth, async (req, res) => {
  const { file, filename } = req.body || {};

  if (!file || !filename) {
    return res.status(400).json({ message: '缺少文件数据或文件名' });
  }

  try {
    const result = await saveBase64File({
      dataUri: file,
      filename,
      folder: 'avatars',
      maxBytes: 2 * 1024 * 1024,
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error.code === 'INVALID_DATA_URI') {
      return res.status(400).json({ message: '文件格式不正确，请重新选择文件' });
    }
    if (error.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({ message: '文件体积超过限制（2MB）' });
    }

    console.error('头像上传失败', error);
    return res.status(500).json({ message: '上传头像失败，请稍后重试' });
  }
});

router.post('/materials', requireAuth, requireAdmin, async (req, res) => {
  const { file, filename } = req.body || {};

  if (!file || !filename) {
    return res.status(400).json({ message: '缺少文件数据或文件名' });
  }

  try {
    const result = await saveBase64File({
      dataUri: file,
      filename,
      folder: path.join('materials', new Date().toISOString().slice(0, 10)),
      maxBytes: 10 * 1024 * 1024,
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error.code === 'INVALID_DATA_URI') {
      return res.status(400).json({ message: '文件格式不正确，请重新选择文件' });
    }
    if (error.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({ message: '文件体积超过限制（10MB）' });
    }

    console.error('资料上传失败', error);
    return res.status(500).json({ message: '上传失败，请稍后重试' });
  }
});

module.exports = router;
