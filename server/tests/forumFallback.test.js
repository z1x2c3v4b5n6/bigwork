const { describe, test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const forumFallback = require('../src/data/forumFallback');

describe('forumFallback helpers', () => {
  beforeEach(() => {
    forumFallback.__resetForumFallbackState();
  });

  test('listTopics returns cloned data', () => {
    const topics = forumFallback.listTopics();
    assert.ok(topics.length > 0);
    const originalTitle = topics[0].title;
    topics[0].title = 'mutated';
    const secondRead = forumFallback.listTopics();
    assert.equal(secondRead[0].title, originalTitle);
  });

  test('createTopic adds a new topic with clean post list', () => {
    const topic = forumFallback.createTopic({
      title: '全新讨论',
      description: '围绕复试流程的分享',
      tags: ['复试'],
      author: '管理员',
    });

    assert.match(topic.id, /^fallback-topic-/);
    const posts = forumFallback.listPosts(topic.id);
    assert.deepEqual(posts, []);
  });

  test('createPost records author name from session user', () => {
    const topic = forumFallback.createTopic({ title: '复试问答', description: '', tags: [], author: '管理员' });
    const post = forumFallback.createPost(topic.id, {
      content: '面试需要准备哪些资料？',
      sessionUser: { id: 101, display_name: '研路助教' },
    });

    assert.equal(post.author, '研路助教');
    const posts = forumFallback.listPosts(topic.id);
    assert.equal(posts.length, 1);
  });

  test('deletePost enforces ownership but allows admins', () => {
    const topic = forumFallback.createTopic({ title: '讨论区', description: '', tags: [], author: '管理员' });
    const post = forumFallback.createPost(topic.id, {
      content: '这是需要删除的帖子',
      sessionUser: { id: 8, display_name: '原作者' },
    });

    const failed = forumFallback.deletePost(topic.id, post.id, { id: 9, role: 'student' });
    assert.equal(failed, false);

    const succeeded = forumFallback.deletePost(topic.id, post.id, { id: 8, role: 'student' });
    assert.equal(succeeded, true);
    assert.equal(forumFallback.listPosts(topic.id).length, 0);
  });

  test('toggleLike switches state and summary reflects changes', () => {
    const [topic] = forumFallback.listTopics();
    const first = forumFallback.toggleLike(topic.id, 'guest-user');
    assert.equal(first.liked, true);
    const second = forumFallback.toggleLike(topic.id, 'guest-user');
    assert.equal(second.liked, false);

    const summary = forumFallback.getTopicSummary(topic.id, 'guest-user');
    assert.ok(summary.likes >= 0);
    assert.equal(summary.liked, false);
  });
});
