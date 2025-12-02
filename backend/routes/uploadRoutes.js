const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Upload = require('../models/Upload');
const { protect } = require('../middleware/auth');
const {
  parseCSV,
  parseExcel,
  parsePDF,
  generateSummary,
  generateStatistics,
  generateInsights,
} = require('../utils/fileParser');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV, Excel, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// @route   POST /api/upload
// @desc    Upload and process file
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const fileType = path.extname(req.file.originalname).toLowerCase().slice(1);
    let parsedData;

    // Create upload record
    const uploadRecord = await Upload.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileType: fileType === 'xlsx' || fileType === 'xls' ? 'excel' : fileType,
      fileSize: req.file.size,
      filePath: req.file.path,
      status: 'processing',
    });

    try {
      // Parse file based on type
      if (fileType === 'csv') {
        parsedData = await parseCSV(req.file.path);
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        parsedData = parseExcel(req.file.path);
      } else if (fileType === 'pdf') {
        parsedData = await parsePDF(req.file.path);
      }

      // Generate analytics for CSV and Excel files
      if (fileType === 'csv' || fileType === 'xlsx' || fileType === 'xls') {
        const summary = generateSummary(parsedData);
        const statistics = generateStatistics(parsedData);
        const insights = generateInsights(parsedData);

        uploadRecord.summary = summary;
        uploadRecord.statistics = statistics;
        uploadRecord.insights = insights;
      } else if (fileType === 'pdf') {
        uploadRecord.summary = {
          totalPages: parsedData.pages,
          textLength: parsedData.text.length,
        };
      }

      uploadRecord.status = 'completed';
      await uploadRecord.save();

      res.status(201).json({
        message: 'File uploaded and processed successfully',
        upload: uploadRecord,
      });
    } catch (parseError) {
      uploadRecord.status = 'failed';
      uploadRecord.errorMessage = parseError.message;
      await uploadRecord.save();
      
      res.status(500).json({
        message: 'File uploaded but processing failed',
        error: parseError.message,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/upload
// @desc    Get all uploads for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/upload/:id
// @desc    Get single upload by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Check if upload belongs to user
    if (upload.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this upload' });
    }

    res.json(upload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/upload/:id
// @desc    Delete upload
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Check if upload belongs to user
    if (upload.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this upload' });
    }

    // Delete file from filesystem
    if (fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    }

    await upload.deleteOne();
    res.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/upload/session/clear
// @desc    Clear all session data for current user (called on logout)
// @access  Private
router.delete('/session/clear', protect, async (req, res) => {
  try {
    // Delete all uploads for this user
    const uploads = await Upload.find({ user: req.user._id });
    
    // Delete files from filesystem
    for (const upload of uploads) {
      if (fs.existsSync(upload.filePath)) {
        fs.unlinkSync(upload.filePath);
      }
    }
    
    // Delete all upload records
    await Upload.deleteMany({ user: req.user._id });
    
    res.json({ 
      message: 'Session data cleared successfully',
      deletedCount: uploads.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
