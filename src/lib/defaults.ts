/**
 * Default system settings — used as fallback when TiDB has no row yet.
 * Never hardcode secrets here. adminPassword comes from TiDB only.
 */
import { SystemSettings } from './types';

export const DEFAULT_SETTINGS: SystemSettings = {
  candidateName: 'Elisha Adera',
  position: 'Super Delegate',
  department: 'Department of Management Science',
  institution: 'Technical University of Mombasa (TUM)',
  campaignPeriod: '2026/2027',
  allianceName: 'CPA – Comrades Project Alliance',
  allianceMotto: 'For Comrades by Comrades',
  slogan: 'Competent Leader',
  availableCourses: [
    'Bachelor of Business and Information Technology',
    'Bachelor of Science in Supply Chain Management',
    'Diploma in Logistics and Transport Management',
    'Diploma in Procurement',
    'Diploma in Supply Chain Management',
    'International Diploma in Logistics and Transport Management',
    'Certificate in Stores Management',
    'Certificate of Logistics and Transport Management',
    'Master of Business Information Systems',
    'Master of Science in Supply Chain Management',
    'Masters of Science in Procurement and Supply Chain Management',
    'Doctor of Philosophy in Supply Chain Management',
  ],
  academicYears: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
  // adminPassword intentionally omitted — always read from TiDB
  smsProvider: {
    enabled: false,
    providerName: 'africastalking',
    senderId: 'ELISHA2026',
    approvalStatus: 'pending_election_clearance',
  },
};
