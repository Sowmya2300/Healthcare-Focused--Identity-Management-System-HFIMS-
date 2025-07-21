// Global Token Blacklist Storage
let blacklistedTokens = new Set();

module.exports = {
    addToBlacklist: (token) => blacklistedTokens.add(token),
    isBlacklisted: (token) => blacklistedTokens.has(token),
};
