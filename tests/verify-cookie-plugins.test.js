import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { expectDataBeacon } from './helpers/beacon-validator.js';
import { setupTestWindow, teardownTestWindow, loadTrackingLibrary } from './helpers/test-setup.js';

describe('Cookie and Plugins - getPreviousValue', () => {

    beforeEach(() => {
        setupTestWindow();
        window.document.cookie = ''; // Clear cookies natively
    });

    afterEach(() => {
        teardownTestWindow();
    });


    it('starts apex domain discovery at the eTLD level (.co.uk)', async () => {
        // 1. Reset cache and mock URL
        window.happyDOM.setURL('https://shop.complex-domain.co.uk/checkout');

        // 2. Fresh import to re-evaluate cachedApexDomain
        await loadTrackingLibrary();

        // 3. Setup standard _satellite mock
        window._satellite.cookie = { get: vi.fn().mockReturnValue(""), set: vi.fn() };

        // 4. Act
        s.c_w('test_key', 'val');

        // 5. Assert
        // If the loop started at length - 2, the first test was .co.uk. 
        // Since happy-dom accepts it blindly, the final domain should be .co.uk (not .uk).
        expect(window._satellite.cookie.set).toHaveBeenCalledWith(
            's_sess',
            expect.any(String),
            expect.objectContaining({
                domain: '.co.uk'
            })
        );

        // Teardown
        delete window._satellite;
    });


    it('should natively handle cookies via happy-dom in vitest', () => {
        // Native document.cookie test
        window.document.cookie = "test_cookie=test_value; path=/";
        expect(window.document.cookie).toContain("test_cookie=test_value");
    });

    it('writes and reads a session cookie combined into s_sess', async () => {
        await loadTrackingLibrary();

        s.c_w('my_session_key', 'session_val');

        // Assert: It should exist in the combined s_sess cookie string
        expect(document.cookie).toContain('s_sess=');

        const rawSessCookie = decodeURIComponent(document.cookie);
        expect(rawSessCookie).toContain(' my_session_key=session_val;');

        // Assert: Read works
        expect(s.c_r('my_session_key')).toBe('session_val');
    });

    it('writes and reads a persistent cookie combined into s_pers with timestamp', async () => {
        await loadTrackingLibrary();

        // Act: Write with expiration (e=1 means 5 years in your logic)
        s.c_w('my_pers_key', 'pers_val', 1);

        // Assert: It should exist in the combined s_pers cookie string
        expect(document.cookie).toContain('s_pers=');

        const rawPersCookie = decodeURIComponent(document.cookie);
        // Matches format: " my_pers_key=pers_val|TIMESTAMP;"
        expect(rawPersCookie).toMatch(/my_pers_key=pers_val\|\d+;/);

        // Assert: Read works
        expect(s.c_r('my_pers_key')).toBe('pers_val');
    });

    it('should set prop19 to the previous pageName on the second page view', async () => {
        await loadTrackingLibrary();

        // Scenario: First Page Load
        window.pageData = {
            page: {
                name: 'first-page',
                productName: 'sb',
                businessUnit: 'els:rp:bau'
            }
        };

        window.appData.push({ event: 'pageLoad' });

        // Verify first page view mapped name (v11) to 'sb:first-page' correctly
        // and check if alloy was triggered
        expect(window.alloy).toHaveBeenCalled();
        expectDataBeacon({
            v11: 'sb:first-page'
        });

        // Clear tracking calls for the next beacon
        window.alloy.mockClear();

        // Scenario: Second Page Load
        window.appData.push({ event: 'newPage', page: { name: 'second-page' } });

        // Verify second beacon
        expect(window.alloy).toHaveBeenCalled();
        expectDataBeacon({
            v11: 'sb:second-page',
            p19: 'sb:first-page' // We expect prop19 to be the previous page's mapped name (sb:first-page)
        });
    });
});
