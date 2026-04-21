const mongoose = require('mongoose');

const sectorRiskSchema = new mongoose.Schema({
  sector: {
    type: String,
    required: true,
    enum: [
      'Banking & Finance',
      'Healthcare',
      'Government',
      'Technology',
      'Critical Infrastructure',
      'E-commerce',
      'Other'
    ]
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  date: {
    type: Date,
    default: Date.now
  },
  incident_count: {
    type: Number,
    default: 0
  },
  factors: {
    critical_count: Number,
    high_count: Number,
    avg_cvss: Number
  }
}, {
  timestamps: true
});

// Index for efficient querying of trends
sectorRiskSchema.index({ sector: 1, date: -1 });

module.exports = mongoose.model('SectorRisk', sectorRiskSchema);
