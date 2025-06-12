const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const { isLoggedIn } = require('../middleware/auth');

// Public routes
router.get('/', topicController.getAllTopics);
router.get('/:id', topicController.getTopicById);

// Protected admin routes
router.post('/', isLoggedIn, topicController.createTopic);
router.put('/:id', isLoggedIn, topicController.updateTopic);
router.delete('/:id', isLoggedIn, topicController.deleteTopic);

module.exports = router;
