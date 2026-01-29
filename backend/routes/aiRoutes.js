const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');
const { indexUserData, indexInsights, chat, clearSessionMemory, clearUserData, debugUserData } = require('../utils/aiService');

// @route   POST /api/ai/index
// @desc    Index user's uploaded data for AI analysis
// @access  Private
router.post('/index', protect, async (req, res) => {
  try {
    const { analysisData, analyticsResults, insights } = req.body;
    const userId = req.user._id.toString();

    if (!analysisData || !analysisData.data) {
      return res.status(400).json({ 
        success: false,
        message: 'No analysis data provided or data is empty' 
      });
    }

    console.log(`\n📊 [AI INDEX API] Request received for user: ${userId}`);
    console.log(`   File: ${analysisData.fileName}`);
    console.log(`   Rows: ${analysisData.data?.length || 0}`);
    console.log(`   Fields: ${analysisData.fields?.length || 0}`);
    console.log(`   Has Analytics Results: ${!!analyticsResults}`);
    console.log(`   Has Insights: ${insights?.length || 0}`);

    // Index the data with analytics results
    const chunksCount = indexUserData(userId, analysisData, analyticsResults);

    // Index additional insights if provided separately
    if (insights && insights.length > 0 && !analyticsResults?.insights) {
      indexInsights(userId, insights);
    }

    res.json({
      success: true,
      message: 'Data indexed successfully for AI analysis',
      chunksIndexed: chunksCount,
      rowsIndexed: analysisData.data?.length || 0,
      fieldsIndexed: analysisData.fields?.length || 0
    });

  } catch (error) {
    console.error('AI Index error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   GET /api/ai/debug
// @desc    Debug endpoint to check indexed data
// @access  Private
router.get('/debug', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    console.log(`\n🔍 [AI DEBUG] Checking data for user: ${userId}`);
    const debug = debugUserData(userId);
    console.log(`   Result:`, debug);
    res.json({ userId, ...debug });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/chat
// @desc    Chat with AI about the user's data
// @access  Private
router.post('/chat', protect, async (req, res) => {
  try {
    const { query, sessionId } = req.body;
    const userId = req.user._id.toString();

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide a question' });
    }

    if (query.length > 1000) {
      return res.status(400).json({ message: 'Question is too long. Please keep it under 1000 characters.' });
    }

    // Generate session ID if not provided
    const session = sessionId || `session_${Date.now()}`;

    console.log(`\n💬 [AI CHAT] Processing query for user: ${userId}`);
    logger.logAIUsage(userId, query);

    const result = await chat(userId, session, query.trim());

    logger.info('AI query completed', {
      userId,
      queryLength: query.length,
      success: result.success,
      quota: req.aiQuota,
    });

    res.json({
      success: result.success,
      response: result.response,
      sessionId: session,
      source: result.source,
      calculations: result.calculations,
      quota: req.aiQuota, // Include quota info in response
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    logger.logError(error, req);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process your question',
      error: error.message 
    });
  }
});

// @route   POST /api/ai/clear-session
// @desc    Clear conversation history for a session
// @access  Private
router.post('/clear-session', protect, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id.toString();

    if (sessionId) {
      clearSessionMemory(userId, sessionId);
    }

    res.json({
      success: true,
      message: 'Session cleared successfully'
    });

  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/ai/clear-all
// @desc    Clear all AI data for user (called on logout/session end)
// @access  Private
router.delete('/clear-all', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    clearUserData(userId);

    res.json({
      success: true,
      message: 'All AI data cleared successfully'
    });

  } catch (error) {
    console.error('Clear all AI data error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
