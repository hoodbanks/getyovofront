export const referralActivities = [
    { id: 'REF-900184', referrer: 'Adaeze James', referee: 'Cameron Williamson', code: 'ADEJAMES', status: 'Successful', createdAt: '2026-10-29T14:28:00', reward: 500 },
    { id: 'REF-900179', referrer: 'Adaeze James', referee: 'Wade Warren', code: 'ADEJAMES', status: 'Pending', createdAt: '2026-10-28T13:20:00', reward: 0 },
    { id: 'REF-900163', referrer: 'Fidelis Chilu', referee: 'Kathryn Murphy', code: 'FIDELIS', status: 'Successful', createdAt: '2026-10-27T10:28:00', reward: 200 },
    { id: 'REF-900151', referrer: 'Fidelis Chilu', referee: 'Darrell Steward', code: 'FIDELIS', status: 'Pending', createdAt: '2026-10-26T09:15:00', reward: 0 },
    { id: 'REF-900140', referrer: 'Jerome Bell', referee: 'Brooklyn Simmons', code: 'JEROMEB', status: 'Successful', createdAt: '2026-10-25T16:42:00', reward: 500 },
    { id: 'REF-900128', referrer: 'Jerome Bell', referee: 'Darlene Robertson', code: 'JEROMEB', status: 'Successful', createdAt: '2026-10-24T11:05:00', reward: 500 },
    { id: 'REF-900109', referrer: 'Fidelis Chilu', referee: 'Jerome Bell', code: 'FIDELIS', status: 'Successful', createdAt: '2026-10-23T08:28:00', reward: 200 },
];

export const referralLeaderboard = [
    { name: 'Fidelis Chilu', successfulReferrals: 18, rewards: 7200 },
    { name: 'Jerome Bell', successfulReferrals: 15, rewards: 6500 },
    { name: 'Adaeze James', successfulReferrals: 12, rewards: 5400 },
    { name: 'Kathryn Murphy', successfulReferrals: 10, rewards: 4200 },
    { name: 'Cameron Williamson', successfulReferrals: 8, rewards: 3600 },
    { name: 'Wade Warren', successfulReferrals: 7, rewards: 2800 },
    { name: 'Brooklyn Simmons', successfulReferrals: 6, rewards: 2400 },
    { name: 'Darlene Robertson', successfulReferrals: 5, rewards: 2000 },
    { name: 'Amara Eze', successfulReferrals: 4, rewards: 1600 },
    { name: 'Daniel Mensah', successfulReferrals: 3, rewards: 1200 },
];

export const sampleReferralCustomers = {
    'Adaeze James': { id: 'sample-ref-adaeze', firstname: 'Adaeze', lastname: 'James', email: 'adaeze.sample@getyovo.test', phonenumber: '+2348000000101' },
    'Fidelis Chilu': { id: 'sample-ref-fidelis', firstname: 'Fidelis', lastname: 'Chilu', email: 'fidelis.sample@getyovo.test', phonenumber: '+2348000000102' },
    'Jerome Bell': { id: 'sample-ref-jerome', firstname: 'Jerome', lastname: 'Bell', email: 'jerome.sample@getyovo.test', phonenumber: '+2348000000103' },
};

// Display-only values to shape the customer profile until the referral endpoints are supplied.
export const customerReferralPreview = {
    walletBalance: 22500,
    totalReferrals: 1,
    referralCode: 'ADEO2026',
    lastOrder: '20 Jan 2026, 1:00 PM',
};
