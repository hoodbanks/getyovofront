import { describe, expect, it } from 'vitest';
import { actorLabel, auditFilterError, auditListPath, presentSnapshot } from './auditEventUtils';

describe('audit event helpers', () => {
    it('builds server filters without snapshot or outcome parameters', () => {
        const path = auditListPath({
            q: 'vendor',
            action: 'vendor.suspended',
            targetType: 'vendor',
            targetId: 'vendor_1',
            actorAdminId: 'admin_1',
            from: '2026-11-01T00:00',
            to: '2026-11-04T00:00',
            limit: 20,
        }, 2);
        const params = new URLSearchParams(path.split('?')[1]);
        expect(path.startsWith('/superadmin/audit-events?')).toBe(true);
        expect(params.get('page')).toBe('2');
        expect(params.get('limit')).toBe('20');
        expect(params.get('q')).toBe('vendor');
        expect(params.get('action')).toBe('vendor.suspended');
        expect(params.get('targetType')).toBe('vendor');
        expect(params.get('targetId')).toBe('vendor_1');
        expect(params.get('actorAdminId')).toBe('admin_1');
        expect(params.get('from')).toBe(new Date('2026-11-01T00:00').toISOString());
        expect(params.get('to')).toBe(new Date('2026-11-04T00:00').toISOString());
        expect(params.get('outcome')).toBeNull();
        expect(params.get('before')).toBeNull();
    });

    it('rejects a reversed date range and names null actors by kind', () => {
        expect(auditFilterError({ from: '2026-11-05T00:00', to: '2026-11-01T00:00', limit: 20 })).toContain('less than or equal');
        expect(actorLabel({ actor: null, actorKind: 'BOOTSTRAP', actorAdminId: null })).toBe('Bootstrap setup');
        expect(actorLabel({ actor: null, actorKind: 'RESET_TOKEN' })).toBe('Password reset');
        expect(actorLabel({ actor: null, actorKind: 'SYSTEM' })).toBe('System');
        expect(actorLabel({ actor: { firstname: 'Ada', lastname: 'Okonkwo' }, actorKind: 'AUTHENTICATED_ADMIN' })).toBe('Ada Okonkwo');
    });

    it('restricts secret snapshot values and keeps the last four account digits', () => {
        const view = presentSnapshot({ accountLast4: '6789', otpCode: '012345', accountNumber: '0123456789' });
        expect(view.entries.find((entry) => entry.key === 'accountLast4').value).toEqual({ kind: 'text', text: '6789' });
        expect(view.entries.find((entry) => entry.key === 'otpCode').value.kind).toBe('restricted');
        expect(view.entries.find((entry) => entry.key === 'accountNumber').value.kind).toBe('restricted');
        expect(presentSnapshot(null).kind).toBe('empty');
    });
});
