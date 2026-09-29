// Tiny hash router: '#/tool/box' -> route 'tool', args ['box'].
const routes = new Map();

export function route(name, fn) { routes.set(name, fn); }

export function parse() {
  const [name = 'home', ...args] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { name: name || 'home', args: args.map(decodeURIComponent) };
}

export function go(path) { location.hash = path; }

export function start(onChange, afterRender, onError) {
  const render = async () => {
    const { name, args } = parse();
    const fn = routes.get(name) || routes.get('home');
    onChange(routes.has(name) ? name : 'home');
    try { await fn(...args); } catch { onError?.(); }
    afterRender?.(name);
  };
  addEventListener('hashchange', render);
  return render();
}
