const mockLogs = [
  {
    timestamp: '2026-05-20 10:00:00',
    user: 'admin@example.com',
    actionType: 'UPDATE',
    resource: 'property',
    details: 'Updated property details',
    severity: 'Info',
  },
  {
    timestamp: '2026-05-20 10:05:00',
    user: 'manager@example.com',
    actionType: 'DELETE',
    resource: 'employee',
    details: 'Deleted employee record',
    severity: 'Warning',
  },
  {
    timestamp: '2026-05-20 10:10:00',
    user: 'owner@example.com',
    actionType: 'CREATE',
    resource: 'document',
    details: 'Created new document',
    severity: 'Info',
  },
  {
    timestamp: '2026-05-20 10:15:00',
    user: 'admin@example.com',
    actionType: 'LOGIN',
    resource: 'system',
    details: 'Admin logged in',
    severity: 'Critical',
  },
];

export default mockLogs;