// src/queue.js
// NOTE: This code is intended to be run in an environment where `default_api` is available.
// The `uuid` package is assumed to be installed via `npm install uuid`.

const { v4: uuidv4 } = require('uuid');

const QUEUE_FILE_PATH = 'queue.json';

/**
 * Loads the queue from the queue.json file using the 'read' tool.
 * If the file doesn't exist or is invalid, it returns an empty array.
 * @returns {Promise<Array<object>>} The array of posts from the queue.
 */
async function loadQueue() {
  try {
    const fileContent = await default_api.read({ path: QUEUE_FILE_PATH });
    if (!fileContent) {
      return [];
    }
    return JSON.parse(fileContent);
  } catch (error) {
    // If file not found or parsing error, return empty queue.
    console.warn(`Queue file not found or invalid JSON. Starting with empty queue. Error: ${error.message}`);
    return [];
  }
}

/**
 * Saves the current queue data to the queue.json file using the 'write' tool.
 * @param {Array<object>} queueData - The array of posts to save.
 */
async function saveQueue(queueData) {
  const contentToSave = JSON.stringify(queueData, null, 2);
  await default_api.write({ path: QUEUE_FILE_PATH, content: contentToSave });
}

/**
 * Adds a new post object to the queue.
 * @param {object} postDetails - Details of the post to add (platform, content, scheduled_at).
 * @returns {Promise<object>} The complete post object that was added.
 */
async function addPostToQueue(postDetails) {
  const queue = await loadQueue();

  const newPost = {
    id: uuidv4(),
    platform: postDetails.platform,
    content: postDetails.content,
    status: 'queued',
    scheduled_at: postDetails.scheduled_at,
    created_at: new Date().toISOString(),
  };

  queue.push(newPost);
  await saveQueue(queue);
  return newPost;
}

/**
 * Retrieves all posts that are currently queued.
 * @returns {Promise<Array<object>>} An array of queued posts.
 */
async function getQueuedPosts() {
  const queue = await loadQueue();
  return queue.filter(post => post.status === 'queued');
}

/**
 * Updates the status of a post in the queue.
 * @param {string} postId - The ID of the post to update.
 * @param {string} newStatus - The new status ('processing', 'sent', 'failed').
 * @returns {Promise<boolean>} True if the post was found and updated, false otherwise.
 */
async function updatePostStatus(postId, newStatus) {
  const queue = await loadQueue();
  const postIndex = queue.findIndex(post => post.id === postId);

  if (postIndex !== -1) {
    queue[postIndex].status = newStatus;
    await saveQueue(queue);
    return true;
  }
  return false;
}

module.exports = {
  loadQueue,
  saveQueue,
  addPostToQueue,
  getQueuedPosts,
  updatePostStatus,
};