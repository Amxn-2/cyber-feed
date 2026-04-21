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
  },
  // ML and Intelligence Fields
  entities: {
    organizations: [String],
    locations: [String],
    technologies: [String],
    threat_actors: [String]
  },
  mitre_techniques: [{
    id: String,
    name: String,
    tactic: String,
    url: String
  }],
  cve_ids: [String],
  cvss_score: {
    type: Number,
    default: 0
  },
  ml_severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  ml_confidence: Number,
  sector_tags: [String]
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

      // New Intelligence Filters
      if (filters.mitre_tactic) {
        query['mitre_techniques.tactic'] = filters.mitre_tactic;
      }
      
      if (filters.sector) {
        query.sector_tags = filters.sector;
      }
      
      if (filters.has_cve === 'true') {
        query.cve_ids = { $exists: true, $not: { $size: 0 } };
      }
      
      if (filters.ml_severity) {
        query.ml_severity = filters.ml_severity;
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
        recentCount,
        sectorStats,
        mitreStats,
        topActors,
        cvssStats
      ] = await Promise.all([
        // Total incidents (India only)
        IncidentModel.countDocuments(indiaQuery),
        
        // Today's incidents (India only)
        IncidentModel.countDocuments({
          ...indiaQuery,
          published_date: {
            $gte: new Date(new Date().setUTCHours(0, 0, 0, 0))
          }
        }),
        
        // By source
        IncidentModel.aggregate([
          { $match: indiaQuery },
          { $group: { _id: '$source', count: { $sum: 1 } } },
          { $project: { source: '$_id', count: 1, _id: 0 } }
        ]),
        
        // By severity
        IncidentModel.aggregate([
          { $match: indiaQuery },
          { $group: { _id: '$severity', count: { $sum: 1 } } },
          { $project: { severity: '$_id', count: 1, _id: 0 } }
        ]),
        
        // Recent (7 days)
        IncidentModel.countDocuments({
          ...indiaQuery,
          published_date: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }),

        // By Sector
        IncidentModel.aggregate([
          { $match: indiaQuery },
          { $unwind: '$sector_tags' },
          { $group: { _id: '$sector_tags', count: { $sum: 1 } } },
          { $project: { sector: '$_id', count: 1, _id: 0 } }
        ]),

        // By MITRE Tactic
        IncidentModel.aggregate([
          { $match: indiaQuery },
          { $unwind: '$mitre_techniques' },
          { $group: { _id: '$mitre_techniques.tactic', count: { $sum: 1 } } },
          { $project: { tactic: '$_id', count: 1, _id: 0 } }
        ]),

        // Top Threat Actors
        IncidentModel.aggregate([
          { $match: indiaQuery },
          { $unwind: '$entities.threat_actors' },
          { $group: { _id: '$entities.threat_actors', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { actor: '$_id', count: 1, _id: 0 } }
        ]),

        // CVSS Distribution
        IncidentModel.aggregate([
          { $match: { ...indiaQuery, cvss_score: { $gt: 0 } } },
          {
            $bucket: {
              groupBy: "$cvss_score",
              boundaries: [0, 4, 7, 9, 10.1],
              default: "Unknown",
              output: { count: { $sum: 1 } }
            }
          }
        ])
      ]);

      return {
        total: totalCount,
        today: todayCount,
        bySource: sourceStats,
        bySeverity: severityStats,
        recent: recentCount,
        bySector: sectorStats,
        byMitreTactic: mitreStats,
        topThreatActors: topActors,
        cvssDistribution: cvssStats
      };
    } catch (error) {
      logger.error('Failed to get stats:', error);
      throw error;
    }
  }

  static async getDailyStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      return await IncidentModel.aggregate([
        {
          $match: {
            location: 'India',
            published_date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$published_date" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", count: 1, _id: 0 } }
      ]);
    } catch (error) {
      logger.error('Failed to get daily stats:', error);
      return [];
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

// Attach methods to the model so existing code doesn't break
IncidentModel.customCreate = Incident.create;
IncidentModel.findAll = Incident.findAll;
IncidentModel.getStats = Incident.getStats;
IncidentModel.getDailyStats = Incident.getDailyStats;
IncidentModel.search = Incident.search;

module.exports = IncidentModel;
