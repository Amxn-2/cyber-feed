// src/models/Incident.js
const mongoose = require('mongoose');
const { createHash } = require('crypto');
const logger = require('../utils/logger');

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    unique: true,
    sparse: true
  },
  published_date: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    required: true,
    enum: ['CERT-In', 'Economic Times CISO', 'Business Standard', 'The Hacker News', 'Other']
  },
  category: {
    type: String,
    required: true,
    enum: ['Advisory', 'News', 'Alert', 'Report']
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical', 'Unknown'],
    default: 'Unknown'
  },
  location: {
    type: String,
    default: 'India'
  },
  hash: {
    type: String,
    unique: true,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  is_verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  indexes: [
    { source: 1 },
    { published_date: -1 },
    { severity: 1 },
    { category: 1 },
    { createdAt: -1 }
  ]
});

// Create hash before saving
incidentSchema.pre('save', function(next) {
  if (this.isNew && !this.hash) {
    this.hash = createHash('md5')
      .update(this.title + this.source + (this.url || ''))
      .digest('hex');
  }
  next();
});

class Incident {
  static async create(incidentData) {
    try {
      // Generate hash if not provided
      if (!incidentData.hash) {
        incidentData.hash = createHash('md5')
          .update(incidentData.title + incidentData.source + (incidentData.url || ''))
          .digest('hex');
      }
      
      const incident = new IncidentModel(incidentData);
      const savedIncident = await incident.save();
      logger.info(`New incident created: ${savedIncident.title}`);
      return savedIncident._id;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error - incident already exists
        logger.debug(`Duplicate incident ignored: ${incidentData.title}`);
        return null;
      }
      logger.error('Failed to create incident:', error);
      throw error;
    }
  }

  static async findAll(filters = {}) {
    try {
      const query = {};
      
      // Always filter for India-only incidents
      query.location = 'India';
      
      // Apply filters
      if (filters.source && filters.source !== 'all') {
        query.source = filters.source;
      }
      
      if (filters.severity && filters.severity !== 'all') {
        query.severity = filters.severity;
      }
      
      if (filters.category && filters.category !== 'all') {
        query.category = filters.category;
      }
      
      if (filters.from_date) {
        query.published_date = { $gte: new Date(filters.from_date) };
      }
      
      if (filters.to_date) {
        query.published_date = { 
          ...query.published_date, 
          $lte: new Date(filters.to_date) 
        };
      }
      
      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      const limit = parseInt(filters.limit) || 50;
      const page = parseInt(filters.page) || 1;
      const skip = (page - 1) * limit;

      const incidents = await IncidentModel
        .find(query)
        .sort({ published_date: -1 })
        .limit(limit)
        .skip(skip)
        .lean(); // Returns plain JavaScript objects instead of Mongoose documents

      return incidents;
    } catch (error) {
      logger.error('Failed to fetch incidents:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      // Base query for India-only incidents
      const indiaQuery = { location: 'India' };
      
      const [
        totalCount,
        todayCount,
        sourceStats,
        severityStats,
        recentCount
      ] = await Promise.all([
        // Total incidents (India only)
        IncidentModel.countDocuments(indiaQuery),
        
        // Today's incidents (India only)
        IncidentModel.countDocuments({
          ...indiaQuery,
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }),
        
        // By source (India only)
        IncidentModel.aggregate([
          { $match: indiaQuery },
          { $group: { _id: '$source', count: { $sum: 1 } } },
          { $project: { source: '$_id', count: 1, _id: 0 } }
        ]),
        
        // By severity (India only)
        IncidentModel.aggregate([
          { $match: indiaQuery },
          { $group: { _id: '$severity', count: { $sum: 1 } } },
          { $project: { severity: '$_id', count: 1, _id: 0 } }
        ]),
        
        // Recent (last 7 days, India only)
        IncidentModel.countDocuments({
          ...indiaQuery,
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        })
      ]);

      return {
        total: totalCount,
        today: todayCount,
        bySource: sourceStats,
        bySeverity: severityStats,
        recent: recentCount
      };
    } catch (error) {
      logger.error('Failed to get stats:', error);
      throw error;
    }
  }

  static async search(searchTerm, limit = 20) {
    try {
      const incidents = await IncidentModel
        .find({
          location: 'India', // India-only search
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } }
          ]
        })
        .sort({ published_date: -1 })
        .limit(limit)
        .lean();
      
      return incidents;
    } catch (error) {
      logger.error('Search failed:', error);
      throw error;
    }
  }
}

const IncidentModel = mongoose.model('Incident', incidentSchema);

module.exports = Incident;
