const Topic = require('../models/Topic');

const topicController = {
  // Get all topics
  getAllTopics: async (req, res) => {
    try {
      const topics = await Topic.getAll();
      res.json(topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get a specific topic by ID
  getTopicById: async (req, res) => {
    try {
      const topicId = req.params.id;
      const topic = await Topic.findById(topicId);
      
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      
      res.json(topic);
    } catch (error) {
      console.error('Error fetching topic:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create a new topic (admin only)
  createTopic: async (req, res) => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Topic name is required' });
      }
      
      // Check if user is a moderator
      if (!req.user || !req.user.is_moderator) {
        return res.status(403).json({ error: 'Only moderators can create topics' });
      }
      
      const topicId = await Topic.create(name, description);
      res.status(201).json({ id: topicId, message: 'Topic created successfully' });
    } catch (error) {
      console.error('Error creating topic:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update a topic (admin only)
  updateTopic: async (req, res) => {
    try {
      const topicId = req.params.id;
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Topic name is required' });
      }
      
      // Check if user is a moderator
      if (!req.user || !req.user.is_moderator) {
        return res.status(403).json({ error: 'Only moderators can update topics' });
      }
      
      const topic = await Topic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      
      await Topic.update(topicId, name, description);
      res.json({ message: 'Topic updated successfully' });
    } catch (error) {
      console.error('Error updating topic:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete a topic (admin only)
  deleteTopic: async (req, res) => {
    try {
      const topicId = req.params.id;
      
      // Check if user is a moderator
      if (!req.user || !req.user.is_moderator) {
        return res.status(403).json({ error: 'Only moderators can delete topics' });
      }
      
      const topic = await Topic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      
      await Topic.delete(topicId);
      res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
      console.error('Error deleting topic:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = topicController;
