const rootDomain = process.env.VITE_DOMAIN;;

const cspDirectives = {
  'base-uri': ["'self'"],
  'child-src': ["'self'"],
  'connect-src': ["'self'", 'https://notesdb.reddeadlabs.com'],
  'img-src': ["'self'"],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
  'frame-src': [
    "'self'",
  ],
  'manifest-src': ["'self'"],
  'media-src': ["'self'", 'data:'],
  'object-src': ["'none'"],
  'style-src': ["'self'", 'https://fonts.googleapis.com'],
  'default-src': [
    'self',
    ...(rootDomain ? [rootDomain, `ws://${rootDomain}`] : []),
  ],
  'script-src': [
    'self',
  ],
  'worker-src': ["'self'"],
};

export default cspDirectives;