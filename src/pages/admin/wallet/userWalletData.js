const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const userWalletTransactions = [
    { id: 'UTX-720184', user: 'Alexandra Johnson', walletId: 'UWL-000451', type: 'Top-Up', amount: 50000, status: 'Successful', createdAt: hoursAgo(1) },
    { id: 'UTX-720179', user: 'Samuel Okafor', walletId: 'UWL-000392', type: 'Order Payment', amount: -18500, status: 'Successful', createdAt: hoursAgo(2) },
    { id: 'UTX-720163', user: 'Alexandra Johnson', walletId: 'UWL-000451', type: 'Order Payment', amount: -12500, status: 'Successful', createdAt: hoursAgo(5) },
    { id: 'UTX-720151', user: 'Samuel Okafor', walletId: 'UWL-000392', type: 'Top-Up', amount: 25000, status: 'Pending', createdAt: hoursAgo(8) },
    { id: 'UTX-720140', user: 'Amara Eze', walletId: 'UWL-000287', type: 'Refund', amount: 7200, status: 'Successful', createdAt: hoursAgo(18) },
    { id: 'UTX-720128', user: 'Daniel Mensah', walletId: 'UWL-000206', type: 'Top-Up', amount: 30000, status: 'Failed', createdAt: hoursAgo(26) },
    { id: 'UTX-720109', user: 'Amara Eze', walletId: 'UWL-000287', type: 'Order Payment', amount: -9200, status: 'Successful', createdAt: hoursAgo(42) },
    { id: 'UTX-720088', user: 'Daniel Mensah', walletId: 'UWL-000206', type: 'Top-Up', amount: 40000, status: 'Successful', createdAt: hoursAgo(74) },
];

export const userWallets = {
    'Alexandra Johnson': { walletId: 'UWL-000451', balance: 85000, totalTopUps: 150000, totalSpending: 65000 },
    'Samuel Okafor': { walletId: 'UWL-000392', balance: 43500, totalTopUps: 80000, totalSpending: 36500 },
    'Amara Eze': { walletId: 'UWL-000287', balance: 28000, totalTopUps: 30000, totalSpending: 9200, totalRefunds: 7200 },
    'Daniel Mensah': { walletId: 'UWL-000206', balance: 62000, totalTopUps: 100000, totalSpending: 38000 },
};
