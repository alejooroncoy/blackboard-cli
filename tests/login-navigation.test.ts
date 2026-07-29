import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isBlackboardUltraUrl } from '../src/providers/blackboard/auth/login.js';

test('Blackboard login completes only on the real Ultra destination', () => {
  assert.equal(isBlackboardUltraUrl('https://aulavirtual.upc.edu.pe/ultra'), true);
  assert.equal(isBlackboardUltraUrl('https://aulavirtual.upc.edu.pe/ultra/course'), true);
  assert.equal(isBlackboardUltraUrl('https://aulavirtual.upc.edu.pe/auth-saml/saml/login'), false);
  assert.equal(isBlackboardUltraUrl('https://aulavirtual.upc.edu.pe.attacker.test/ultra'), false);
  assert.equal(isBlackboardUltraUrl('http://aulavirtual.upc.edu.pe/ultra'), false);
});
