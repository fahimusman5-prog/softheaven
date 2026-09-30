import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSettings } from '../lib/admin/settings';
import { formatPrice } from '../lib/format';
import { allowed, resources } from '../lib/admin/resources';

test('customer and spoofed roles never obtain admin access', () => {
  for (const area of [
    'products',
    'orders',
    'users',
    'settings',
    'content',
    'rewards',
  ]) {
    assert.equal(allowed('customer', area), false);
    assert.equal(allowed('SUPER_ADMIN ', area), false);
  }
});
test('roles respect commerce/content/system boundaries', () => {
  assert.equal(allowed('CONTENT_EDITOR', 'content'), true);
  assert.equal(allowed('CONTENT_EDITOR', 'orders'), false);
  assert.equal(allowed('PRODUCT_MANAGER', 'inventory'), true);
  assert.equal(allowed('ORDER_MANAGER', 'users'), false);
  assert.equal(allowed('ADMIN', 'users'), false);
  assert.equal(allowed('SUPER_ADMIN', 'users'), true);
});
test('product input rejects browser stock and unauthorized fields', () => {
  assert.throws(() =>
    resources.products.schema.parse({
      name: 'Bear',
      slug: 'bear',
      price: 1,
      stock: 100,
    }),
  );
  assert.throws(() =>
    resources.products.schema.parse({ name: 'Bear', slug: 'bear', price: -1 }),
  );
});
test('navigation rejects executable/protocol-relative URLs', () => {
  for (const url of [
    'javascript:alert(1)',
    '//evil.example',
    'data:text/html,hi',
  ])
    assert.throws(() =>
      resources.navigation.schema.parse({
        label: 'Unsafe',
        url,
        placement: 'header',
      }),
    );
  assert.doesNotThrow(() =>
    resources.navigation.schema.parse({
      label: 'Shop',
      url: '/shop',
      placement: 'header',
    }),
  );
});
test('variant writes cannot set stock outside the ledger', () => {
  assert.throws(() =>
    resources.variants.schema.parse({
      product_id: 'bear',
      color: 'Rose',
      stock: 50,
    }),
  );
  assert.doesNotThrow(() =>
    resources.variants.schema.parse({
      product_id: 'bear',
      color: 'Rose',
      low_stock_threshold: 3,
    }),
  );
});
test('review moderation allows only defined states', () => {
  assert.throws(() => resources.reviews.schema.parse({ status: 'published' }));
  assert.doesNotThrow(() =>
    resources.reviews.schema.parse({ status: 'approved' }),
  );
});
test('coupons reject client-selected arbitrary values', () => {
  assert.throws(() =>
    resources.coupons.schema.parse({ code: 'abc', kind: 'fixed', value: 1 }),
  );
  assert.throws(() =>
    resources.coupons.schema.parse({ code: 'SAVE', kind: 'fixed', value: -50 }),
  );
});

test('required product prices reject empty form values', () => {
  assert.throws(() =>
    resources.products.schema.parse({ name: 'Bear', slug: 'bear', price: '' }),
  );
});

test('currency display preserves commerce decimals', () => {
  assert.equal(formatPrice(348.4), 'Rs. 348.4');
});
test('social settings reject executable links', () => {
  assert.throws(() =>
    validateSettings('social', {
      whatsapp: 'javascript:alert(1)',
      instagram: '',
      facebook: '',
      tiktok: '',
    }),
  );
});
