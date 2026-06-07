import { CscService } from '../types';

export const INITIAL_SERVICES: CscService[] = [
  {
    id: 'pan-card',
    name: 'New PAN Card or Correction',
    category: 'Identity & Certificates',
    fee: 150,
    processingTime: '10-12 Working Days',
    requiredDocuments: ['Aadhaar Card', 'Passport Size Photo', 'Address Proof'],
    description: 'Apply for a Permanent Account Number (PAN) card for tax filing, banking, and identity verification, or update/correct name and date of birth in your existing PAN.',
    isActive: true
  },
  {
    id: 'aadhaar-correction',
    name: 'Aadhaar Demographic Update',
    category: 'Identity & Certificates',
    fee: 100,
    processingTime: '5-7 Working Days',
    requiredDocuments: ['Identity Proof (Aadhaar/Voter)', 'Date of Birth Proof', 'Address Proof (Gas/Electricity)'],
    description: 'Update your address, name, phone number, or date of birth in the UIDAI Aadhaar registry. Requires digital submission of verification documents.',
    isActive: true
  },
  {
    id: 'income-certificate',
    name: 'Income Certificate Issuance',
    category: 'Taxes & Revenue',
    fee: 60,
    processingTime: '7-10 Working Days',
    requiredDocuments: ['Salary Slip / Income Declaration', 'Land Revenue Receipt', 'Aadhaar Card', 'Ration Card'],
    description: 'Obtain an official certificate proving family income issued by state revenue authorities, crucial for scholarships and subsidized welfare programs.',
    isActive: true
  },
  {
    id: 'caste-certificate',
    name: 'Community/Caste Certificate',
    category: 'Taxes & Revenue',
    fee: 60,
    processingTime: '10-15 Working Days',
    requiredDocuments: ['Self Declaration Form', 'Parent Caste Proof / School Leaving Cert', 'Aadhaar Card'],
    description: 'Apply for a Scheduled Caste (SC), Scheduled Tribe (ST) or Other Backward Class (OBC) certificate to fulfill reservation or benefit rules.',
    isActive: true
  },
  {
    id: 'utility-bill',
    name: 'Electricity & Water Bill Payment',
    category: 'Utility Bills',
    fee: 30,
    processingTime: '1 Working Day',
    requiredDocuments: ['Recent Utility Bill Copy', 'Consumer ID/Account Number'],
    description: 'Instant settlement of electricity, water, municipal, or LPG cooking gas bills via the Bharat Bill Payment System (BBPS) with official receipts.',
    isActive: true
  },
  {
    id: 'pension-enroll',
    name: 'PM Pension Schemes Enrollment',
    category: 'Welfare & Pensions',
    fee: 120,
    processingTime: '3-5 Working Days',
    requiredDocuments: ['Aadhaar Card', 'Bank Account Passbook', 'Consent Verification Form'],
    description: 'Enroll in national welfare pensions such as PM Shram Yogi Maan-dhan (PM-SYM) or Atal Pension Yojana (APY) to secure post-retirement income.',
    isActive: true
  },
  {
    id: 'passport-apply',
    name: 'Fresh Passport Registration',
    category: 'Travel & Passports',
    fee: 1500,
    processingTime: '15-20 Working Days',
    requiredDocuments: ['Aadhaar Card', '10th Class Certificate (ECNR Proof)', 'Two Address Proofs', 'PAN Card'],
    description: 'Apply for a fresh regular Indian Passport (36 Pages) or passport reissue, including administrative portal fee payment and scheduled appointment booking at PSK.',
    isActive: true
  },
  {
    id: 'driving-license',
    name: 'Driving License Renewal',
    category: 'Travel & Passports',
    fee: 450,
    processingTime: '7-10 Working Days',
    requiredDocuments: ['Current Physical Driving License', 'Medical Certificate (Form 1A)', 'Identity Proof'],
    description: 'Renew your expiring non-transport or transport Driving License with RTO state transport departments including biometric confirmation booking.',
    isActive: true
  }
];
