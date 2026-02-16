import { describe, it, beforeEach, afterEach } from 'vitest';
import { expectDataBeacon } from './helpers/beacon-validator.js';
import { setupTestWindow, teardownTestWindow, loadTrackingLibrary } from './helpers/test-setup.js';

/**
 * Cart Tracking Specification Validation
 *
 * Validates that the cart/commerce tracking implementation matches the
 * developer specification for each purchase funnel step.
 *
 * Funnel steps tested:
 *   1. Shopping Cart page load  (purchaseStep: 'cart')
 *   2. Add to Cart click        (cartAdd event)
 *   3. Remove from Cart click   (cartRemove event)
 *   4. Checkout – login          (purchaseStep: 'login')
 *   5. Checkout – shipping       (purchaseStep: 'shipping')
 *   6. Checkout – payment        (purchaseStep: 'payment')
 *   7. Order Confirmation page   (purchaseStep: 'purchase' + order object)
 *   8. Purchase Complete event   (purchaseComplete trackEvent)
 */
describe('Cart Tracking Specification', () => {

    beforeEach(() => {
        setupTestWindow();
    });

    afterEach(() => {
        teardownTestWindow();
    });

    // ─── 1. Shopping Cart Page Load ────────────────────────────────────
    it('should track Shopping Cart page load with scView, scOpen, content and currencyCode', async () => {
        await loadTrackingLibrary();

        window.pageData = {
            content: [{
                id: 'CART-ITEM-001',
                price: '10.00',
                quantity: '1'
            }],
            page: {
                businessUnit: 'els:rp:bau',
                currencyCode: 'USD',
                environment: 'dev',
                language: 'en',
                loadTimestamp: '1416850731729',
                name: 'shopping-cart',
                productName: 'sb',
                purchaseStep: 'cart',
                type: 'checkout'
            }
        };

        window.appData.push({ event: 'pageLoad' });

        expectDataBeacon({
            v11: 'sb:shopping-cart',
            currencyCode: 'USD',
            commerceEvents: ['scView', 'scOpen'],
            productItems: [{
                sku: 'sb:CART-ITEM-001'
            }]
        });
    });

    // ─── 2. Add to Cart Click ──────────────────────────────────────────
    it('should track Add to Cart with scAdd, scOpen, event20 and product revenue', async () => {
        await loadTrackingLibrary();

        window.pageData = {
            page: {
                name: 'product-detail',
                productName: 'sb',
                businessUnit: 'els:rp:bau',
                currencyCode: 'USD',
                environment: 'dev'
            }
        };
        window.appData.push({ event: 'pageLoad' });

        // Consume the page-load beacon
        expectDataBeacon({ v11: 'sb:product-detail' });

        // Fire the cartAdd event
        window.appData.push({
            event: 'cartAdd',
            content: [{
                id: 'PROD-001',
                price: '10.00',
                quantity: '1'
            }]
        });

        expectDataBeacon({
            commerceEvents: ['scAdd', 'scOpen', 'event20'],
            productItems: [{
                sku: 'sb:PROD-001',
                events: ['event20=10']
            }]
        });
    });

    // ─── 3. Remove from Cart Click ─────────────────────────────────────
    it('should track Remove from Cart with scRemove and product', async () => {
        await loadTrackingLibrary();

        window.pageData = {
            page: {
                name: 'shopping-cart',
                productName: 'sb',
                businessUnit: 'els:rp:bau',
                currencyCode: 'USD',
                environment: 'dev'
            }
        };
        window.appData.push({ event: 'pageLoad' });

        // Consume the page-load beacon
        expectDataBeacon({ v11: 'sb:shopping-cart' });

        // Fire the cartRemove event
        window.appData.push({
            event: 'cartRemove',
            content: [{
                id: 'PROD-001',
                price: '10.00',
                quantity: '1'
            }]
        });

        expectDataBeacon({
            commerceEvents: ['scRemove'],
            productItems: [{
                sku: 'sb:PROD-001'
            }]
        });
    });

    // ─── 4. Checkout – Login Step ──────────────────────────────────────
    it('should track Checkout login step with scCheckout', async () => {
        await loadTrackingLibrary();

        window.pageData = {
            content: [{
                id: 'PROD-001',
                price: '10.00',
                quantity: '1'
            }],
            page: {
                businessUnit: 'els:rp:bau',
                currencyCode: 'USD',
                environment: 'dev',
                loadTimestamp: '1416850731729',
                name: 'checkout-login',
                productName: 'sb',
                purchaseStep: 'login',
                type: 'checkout'
            }
        };

        window.appData.push({ event: 'pageLoad' });

        expectDataBeacon({
            commerceEvents: ['scCheckout'],
            productItems: [{
                sku: 'sb:PROD-001'
            }]
        });
    });

    // ─── 5. Checkout – Shipping Step ───────────────────────────────────
    it('should track Checkout shipping step with scCheckout', async () => {
        await loadTrackingLibrary();

        window.pageData = {
            content: [{
                id: 'PROD-001',
                price: '10.00',
                quantity: '1'
            }],
            page: {
                businessUnit: 'els:rp:bau',
                currencyCode: 'USD',
                environment: 'dev',
                loadTimestamp: '1416850731729',
                name: 'checkout-shipping',
                productName: 'sb',
                purchaseStep: 'shipping',
                type: 'checkout'
            }
        };

        window.appData.push({ event: 'pageLoad' });

        expectDataBeacon({
            commerceEvents: ['scCheckout']
        });
    });

    // ─── 6. Checkout – Payment Step ────────────────────────────────────
    it('should track Checkout payment step with scCheckout', async () => {
        await loadTrackingLibrary();

        window.pageData = {
            content: [{
                id: 'PROD-001',
                price: '10.00',
                quantity: '1'
            }],
            page: {
                businessUnit: 'els:rp:bau',
                currencyCode: 'USD',
                environment: 'dev',
                loadTimestamp: '1416850731729',
                name: 'checkout-payment',
                productName: 'sb',
                purchaseStep: 'payment',
                type: 'checkout'
            }
        };

        window.appData.push({ event: 'pageLoad' });

        expectDataBeacon({
            commerceEvents: ['scCheckout']
        });
    });

    // ─── 7. Order Confirmation Page Load ───────────────────────────────
    it('should track Order Confirmation page with purchase event, order ID, payment and promo', async () => {
        await loadTrackingLibrary();

        window.pageData = {
            content: [{
                id: 'PROD-001',
                price: '10.00',
                quantity: '1'
            }],
            order: {
                id: 'ORD-12345',
                paymentMethod: 'visa,mastercard',
                promoCode: 'SAVE10,WELCOME'
            },
            page: {
                businessUnit: 'els:rp:bau',
                currencyCode: 'USD',
                environment: 'dev',
                loadTimestamp: '1416850731729',
                name: 'order-confirmation',
                productName: 'sb',
                purchaseStep: 'purchase',
                type: 'checkout'
            }
        };

        window.appData.push({ event: 'pageLoad' });

        expectDataBeacon({
            v34: 'SAVE10,WELCOME',
            v39: 'visa,mastercard',
            purchaseID: 'ORD-12345',
            currencyCode: 'USD',
            commerceEvents: ['purchase'],
            productItems: [{
                sku: 'sb:PROD-001'
            }]
        });
    });

    // ─── 8. Purchase Complete Event (trackEvent) ───────────────────────
    it('should track purchaseComplete event with purchase, order ID, payment, promo and currency', async () => {
        await loadTrackingLibrary();

        window.pageData = {
            page: {
                name: 'order-confirmation',
                productName: 'sb',
                businessUnit: 'els:rp:bau',
                environment: 'dev'
            }
        };
        window.appData.push({ event: 'pageLoad' });

        // Consume the page-load beacon
        expectDataBeacon({ v11: 'sb:order-confirmation' });

        // Fire purchaseComplete as a trackEvent
        window.appData.push({
            event: 'purchaseComplete',
            content: [{
                id: 'PROD-001',
                price: '10.00',
                quantity: '1'
            }],
            order: {
                id: 'ORD-67890',
                paymentMethod: 'paypal',
                promoCode: 'DISCOUNT20'
            },
            page: {
                currencyCode: 'USD',
                purchaseStep: 'purchase'
            }
        });

        expectDataBeacon({
            v34: 'DISCOUNT20',
            v39: 'paypal',
            purchaseID: 'ORD-67890',
            currencyCode: 'USD',
            commerceEvents: ['purchase'],
            productItems: [{
                sku: 'sb:PROD-001'
            }]
        });
    });
});
