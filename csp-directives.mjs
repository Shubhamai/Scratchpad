const rootDomain = process.env.VITE_DOMAIN;;

const cspDirectives = {
  'base-uri': ["'self'"],
  'child-src': ["'self'"],
  'connect-src': ["'self'", 'http://127.0.0.1:8090/api/', 'http://127.0.0.1:8090/_/'], // NOTE: Change here for pocketbase db
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
  // TODO : unsafe-inline seems to be needed for the codemirror editor, fix it to improve security
  'style-src': ["'self'","'unsafe-inline'", 'https://fonts.googleapis.com'],
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