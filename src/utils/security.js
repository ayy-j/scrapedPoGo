/**
 * @fileoverview Security utilities for validating URLs and preventing SSRF.
 * @module utils/security
 */

/**
 * Validates a URL to prevent SSRF attacks.
 * Rejects non-HTTP/HTTPS protocols and private IP addresses/localhost.
 *
 * @param {string} urlString - The URL to validate
 * @returns {boolean} True if the URL is valid, false otherwise
 */
function validateUrl(urlString) {
    try {
        const url = new URL(urlString);

        // Protocol check
        if (!['http:', 'https:'].includes(url.protocol)) {
            if (process.env.DEBUG) console.error(`Invalid protocol: ${url.protocol}`);
            return false;
        }

        // Hostname check
        const hostname = url.hostname;

        // Block localhost
        if (hostname === 'localhost' || hostname === '::1' || hostname === '[::1]' || hostname === '0.0.0.0') {
            if (process.env.DEBUG) console.error(`Blocked local hostname: ${hostname}`);
            return false;
        }

        // Block private IP ranges (IPv4)
        // 10.0.0.0/8      -> ^10\.
        // 172.16.0.0/12   -> ^172\.(1[6-9]|2[0-9]|3[0-1])\.
        // 192.168.0.0/16  -> ^192\.168\.
        // 169.254.0.0/16  -> ^169\.254\.
        // 127.0.0.0/8     -> ^127\.
        const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.|127\.)/;
        if (privateIpRegex.test(hostname)) {
            if (process.env.DEBUG) console.error(`Blocked private IP: ${hostname}`);
            return false;
        }

        // Block IPv6 Unique Local Addresses (fc00::/7) and Link-local (fe80::/10)
        if (/^[fF][cCdD]/.test(hostname) || /^[fF][eE]80:/.test(hostname)) {
             if (process.env.DEBUG) console.error(`Blocked private IPv6: ${hostname}`);
             return false;
        }

        // NOTE: This check is vulnerable to DNS rebinding and bypasses via alternative IP formats (e.g. hex/octal).
        // A more robust solution would involve resolving DNS and validating the IP address, but this requires
        // more complex network logic or external libraries. This regex provides basic protection against common
        // localhost/private IP usage.

        return true;
    } catch (e) {
        if (process.env.DEBUG) console.error(`Invalid URL format: ${urlString}`);
        return false;
    }
}

module.exports = {
    validateUrl
};
