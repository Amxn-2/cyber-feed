const Incident = require('../models/Incident');
const SectorRisk = require('../models/SectorRisk');
const logger = require('../utils/logger');

class RiskScoringService {
  /**
   * Calculate risk scores for all sectors for the last 24 hours
   */
  async calculateDailyScores() {
    try {
      const sectors = [
        'Banking & Finance',
        'Healthcare',
        'Government',
        'Technology',
        'Critical Infrastructure',
        'E-commerce'
      ];

      const lookbackDate = new Date();
      lookbackDate.setDate(lookbackDate.getDate() - 7); // 7-day lookback for richer data

      logger.info('Starting weighted sector risk score calculation (7d window)...');

      for (const sector of sectors) {
        // Find incidents for this sector in the lookback window
        // Use regex for flexible matching (e.g., matches "Banking" or "FINANCE" if they are in the string)
        const incidents = await Incident.find({
          sector_tags: { $regex: new RegExp(sector.split(' & ')[0].split(' ')[0], 'i') },
          published_date: { $gte: lookbackDate }
        });

        const scoreData = this.computeScore(incidents);
        
        await SectorRisk.create({
          sector,
          score: scoreData.score,
          incident_count: incidents.length,
          factors: scoreData.factors,
          date: new Date()
        });

        logger.info(`Calculated score for ${sector}: ${scoreData.score}`);
      }

      logger.info('Daily risk score calculation completed.');
    } catch (error) {
      logger.error('Failed to calculate daily risk scores:', error);
    }
  }

  /**
   * Logic to compute a risk score (0-100) based on incidents
   */
  computeScore(incidents) {
    if (incidents.length === 0) {
      return { score: 10, factors: { critical_count: 0, high_count: 0, avg_cvss: 0 } };
    }

    let rawScore = 0;
    let criticalCount = 0;
    let highCount = 0;
    let cvssSum = 0;
    let cvssCount = 0;

    incidents.forEach(inc => {
      // Weight by severity
      if (inc.severity === 'Critical') {
        rawScore += 40;
        criticalCount++;
      } else if (inc.severity === 'High') {
        rawScore += 20;
        highCount++;
      } else if (inc.severity === 'Medium') {
        rawScore += 10;
      } else {
        rawScore += 5;
      }

      // Weight by CVSS if available
      if (inc.cvss_score > 0) {
        rawScore += inc.cvss_score; // 0-10 added
        cvssSum += inc.cvss_score;
        cvssCount++;
      }
    });

    // Cap at 100
    const finalScore = Math.min(Math.round(rawScore + 10), 100);

    return {
      score: finalScore,
      factors: {
        critical_count: criticalCount,
        high_count: highCount,
        avg_cvss: cvssCount > 0 ? cvssSum / cvssCount : 0
      }
    };
  }
}

module.exports = new RiskScoringService();
