import assert from 'node:assert/strict';
import test from 'node:test';
import { confirmedText, confirmedUrl, resolveBusiness } from '../lib/business';
test('missing merchant details stay absent', () => {
  const business = resolveBusiness();
  assert.equal(business.supportEmail, null);
  assert.equal(business.businessAddress, null);
  assert.equal(business.returnEligibilityPeriod, null);
});
test('developer placeholder settings cannot become public contact details', () => {
  const business = resolveBusiness({ general: { email: '[SUPPORT EMAIL REQUIRED]', address: 'TODO business information', phone: '[PHONE NUMBER REQUIRED]' } });
  assert.equal(business.supportEmail, null);
  assert.equal(business.businessAddress, null);
  assert.equal(business.supportPhone, null);
  assert.equal(confirmedText('placeholder business information'), null);
});
test('confirmed contacts are preserved and unsafe social links excluded', () => {
  assert.equal(resolveBusiness({general:{email:' team@example.com '}}).supportEmail,'team@example.com');
  assert.equal(confirmedUrl('javascript:alert(1)'),null);
  assert.equal(confirmedUrl('https://example.com/profile'),'https://example.com/profile');
});
