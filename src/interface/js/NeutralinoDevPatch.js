
/**
 * Patch missing Neutralino globals
 * @returns {boolean}
 */
export const runPatch = (nlGlobals) => {
  console.info('Patching Neutralino...');
  try {
    if (nlGlobals) {
      const {accessToken, port} = nlGlobals;
      window.NL_PORT = port;
      window.NL_TOKEN = accessToken;
      window.NL_ARGS = [
        'bin\\neutralino-win_x64.exe',
        '--load-dir-res',
        '--path=.',
        '--export-auth-info',
        '--neu-dev-extension',
        '--neu-dev-auto-reload',
        '--window-enable-inspector'
      ];
      window.NL_OS = 'Windows';
      window.NL_MODE = nlGlobals.defaultMode;
      window.NL_VERSION = nlGlobals.version;
    }
    return true;
  } catch(e) {
    console.warn('authInfo not found.');
    return false;
  }
}