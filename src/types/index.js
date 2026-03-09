/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 */

/**
 * @typedef {Object} AuthResponse
 * @property {User} user
 * @property {string} token
 */

/**
 * @typedef {Object} Plan
 * @property {string} id
 * @property {string} title
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} progress
 * @property {string[]} platforms
 * @property {string} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {boolean} completed
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Inspiration
 * @property {string} id
 * @property {string} content
 * @property {string[]} tags
 * @property {boolean} pinned
 * @property {string} createdAt
 */

/**
 * @typedef {Object} DataResponse
 * @property {Plan[]} plans
 * @property {Task[]} tasks
 * @property {Inspiration[]} inspirations
 */

export {};
