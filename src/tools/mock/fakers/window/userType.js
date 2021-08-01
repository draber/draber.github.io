const userType = options => {
    return {
        isLoggedIn: true,
        hasXwd: true,
        hasDigi: true,
        hasHd: false,
        isErsatzShortz: false,
        inShortzMode: false,
        entitlement: 'sub,cr'
    }
}

export default userType;