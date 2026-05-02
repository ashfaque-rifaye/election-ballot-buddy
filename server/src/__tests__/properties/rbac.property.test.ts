/**
 * Property Test: Role-Based Access Control
 * Built with Google Antigravity & Vertex AI
 *
 * Property 7: For any user/role/endpoint combination,
 * authorization grants access iff the role is authorized.
 * Voters access public endpoints; admins access all.
 *
 * **Validates: Requirements 5.2, 5.3, 5.4**
 */
import * as fc from 'fast-check';
import { isAuthorized, ROUTE_PERMISSIONS } from '../../middleware/authMiddleware';
import { UserRole } from '../../../shared/types';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const roleArb: fc.Arbitrary<UserRole> = fc.constantFrom('voter', 'administrator');

const publicEndpoints = [
  { method: 'POST', path: '/api/chat' },
  { method: 'GET', path: '/api/timeline' },
  { method: 'GET', path: '/api/polling-stations' },
  { method: 'POST', path: '/api/calendar/reminder' },
];

const adminEndpoints = [
  { method: 'PUT', path: '/api/datasets' },
  { method: 'DELETE', path: '/api/datasets' },
  { method: 'GET', path: '/api/admin' },
];

const endpointArb = fc.constantFrom(...publicEndpoints, ...adminEndpoints);

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property 7: Role-based access control', () => {
  it('administrators have access to all endpoints', () => {
    fc.assert(
      fc.property(endpointArb, (endpoint) => {
        expect(isAuthorized('administrator', endpoint.method, endpoint.path)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('voters have access to public endpoints only', () => {
    fc.assert(
      fc.property(fc.constantFrom(...publicEndpoints), (endpoint) => {
        expect(isAuthorized('voter', endpoint.method, endpoint.path)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('voters are denied access to admin endpoints', () => {
    fc.assert(
      fc.property(fc.constantFrom(...adminEndpoints), (endpoint) => {
        expect(isAuthorized('voter', endpoint.method, endpoint.path)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
