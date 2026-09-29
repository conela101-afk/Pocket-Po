// Loads the app's own JSON files and resolves copy keys.
let copy, toolsData, tags, defaults;

export async function loadData() {
  const get = (p) => fetch(p).then((r) => r.json());
  [copy, toolsData, tags, defaults] = await Promise.all([
    get('data/copy.json'), get('data/tools.json'), get('data/tags.json'), get('data/defaults.json')
  ]);
}

export function t(key) {
  return key.split('.').reduce((o, k) => (o == null ? o : o[k]), copy) ?? key;
}

export const tools = () => toolsData.tools;
export const categories = () => toolsData.categories;
export const getTool = (id) => toolsData.tools.find((x) => x.id === id);
export const getTags = () => tags;
export const getDefaults = () => defaults;
