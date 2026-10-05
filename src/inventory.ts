import { createClient } from '@supabase/supabase-js';
import { GridProfileAuthority, type GridPlayerInventoryItem } from './social/GridProfileAuthority';
import './inventory.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const client = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const authority = client ? new GridProfileAuthority(client) : null;
const root = document.querySelector<HTMLElement>('#grid-inventory-app');

const types = [
  { id: 'avatars', label: 'Avatars & Companions', icon: '✦' },
  { id: 'wearables', label: 'Wearables & Looks', icon: '◈' },
  { id: 'builds', label: 'Builds & Objects', icon: '⬡' },
  { id: 'tools', label: 'Tools & Materials', icon: '⌘' },
  { id: 'landmarks', label: 'Landmarks & Routes', icon: '⌖' },
  { id: 'media', label: 'Media & Creations', icon: '▧' },
  { id: 'scripts', label: 'Scripts & Blueprints', icon: '⌬' },
  { id: 'consumables', label: 'Consumables', icon: '✧' },
] as const;

type Folder = { id: string; name: string };
type LocalOrganization = {
  folders: Folder[];
  itemFolders: Record<string, string>;
  favorites: string[];
};
const emptyOrganization = (): LocalOrganization => ({ folders: [], itemFolders: {}, favorites: [] });
let accountId = '';
let inventory: GridPlayerInventoryItem[] = [];
let organization = emptyOrganization();
let activeFolder = 'all';
let query = '';

function storageKey(userId: string) {
  return 'grid-world:inventory-layout:' + encodeURIComponent(userId);
}

function loadOrganization(userId: string): LocalOrganization {
  try {
    const saved = localStorage.getItem(storageKey(userId));
    if (!saved) return emptyOrganization();
    const parsed = JSON.parse(saved) as Partial<LocalOrganization>;
    return {
      folders: Array.isArray(parsed.folders) ? parsed.folders.filter(folder => typeof folder?.id === 'string' && typeof folder?.name === 'string') : [],
      itemFolders: parsed.itemFolders && typeof parsed.itemFolders === 'object' ? parsed.itemFolders : {},
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites.filter(id => typeof id === 'string') : [],
    };
  } catch {
    return emptyOrganization();
  }
}

function saveOrganization() {
  if (!accountId) return;
  localStorage.setItem(storageKey(accountId), JSON.stringify(organization));
}

function setMessage(title: string, detail: string, action?: { label: string; href: string }) {
  if (!root) return;
  root.replaceChildren();
  const section = document.createElement('section');
  section.className = 'gw-inventory-gate';
  const eyebrow = document.createElement('div');
  eyebrow.className = 'gw-inventory-eyebrow';
  eyebrow.textContent = 'GRID WORLD // ACCOUNT INVENTORY';
  const heading = document.createElement('h1');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = detail;
  section.append(eyebrow, heading, copy);
  if (action) {
    const link = document.createElement('a');
    link.href = action.href;
    link.className = 'gw-inventory-primary';
    link.textContent = action.label;
    section.append(link);
  }
  root.append(section);
}

function folders() {
  return [
    { id: 'all', name: 'All Items', icon: '◉' },
    ...types.map(type => ({ id: type.id, name: type.label, icon: type.icon })),
    { id: 'unsorted', name: 'Unsorted', icon: '◇' },
    ...organization.folders.map(folder => ({ id: folder.id, name: folder.name, icon: '✧' })),
  ];
}

function render() {
  if (!root) return;
  root.replaceChildren();

  const shell = document.createElement('section');
  shell.className = 'gw-inventory-shell';
  const header = document.createElement('header');
  header.className = 'gw-inventory-header';
  const headingBlock = document.createElement('div');
  const eyebrow = document.createElement('div');
  eyebrow.className = 'gw-inventory-eyebrow';
  eyebrow.textContent = 'GRID WORLD // PERSONAL COLLECTION';
  const title = document.createElement('h1');
  title.textContent = 'Inventory';
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Your collection, available outside the world.';
  headingBlock.append(eyebrow, title, subtitle);

  const actions = document.createElement('div');
  actions.className = 'gw-inventory-actions';
  const createFolder = document.createElement('button');
  createFolder.type = 'button';
  createFolder.className = 'gw-inventory-primary';
  createFolder.textContent = '＋ NEW FOLDER';
  createFolder.addEventListener('click', () => {
    const name = window.prompt('Name your personal folder');
    const clean = name?.trim().slice(0, 40);
    if (!clean) return;
    const folder = { id: 'custom-' + crypto.randomUUID(), name: clean };
    organization.folders.push(folder);
    activeFolder = folder.id;
    saveOrganization();
    render();
  });
  const refresh = document.createElement('button');
  refresh.type = 'button';
  refresh.className = 'gw-inventory-quiet';
  refresh.textContent = '↻ REFRESH';
  refresh.addEventListener('click', () => { void loadInventory(); });
  actions.append(createFolder, refresh);
  header.append(headingBlock, actions);

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'gw-inventory-search';
  search.placeholder = 'Search item IDs…';
  search.setAttribute('aria-label', 'Search your inventory');
  search.value = query;
  search.addEventListener('input', () => { query = search.value; renderItems(); });

  const content = document.createElement('div');
  content.className = 'gw-inventory-content';
  const sidebar = document.createElement('nav');
  sidebar.className = 'gw-inventory-folders';
  sidebar.setAttribute('aria-label', 'Inventory folders');
  const list = document.createElement('div');
  list.className = 'gw-inventory-items';
  list.id = 'gw-inventory-items';
  for (const folder of folders()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gw-inventory-folder' + (activeFolder === folder.id ? ' active' : '');
    button.setAttribute('aria-current', activeFolder === folder.id ? 'page' : 'false');
    const name = document.createElement('span');
    name.className = 'gw-inventory-folder-name';
    name.textContent = folder.icon + '  ' + folder.name;
    const count = document.createElement('small');
    count.textContent = String(countFor(folder.id));
    button.append(name, count);
    button.addEventListener('click', () => { activeFolder = folder.id; render(); });
    sidebar.append(button);
  }
  content.append(sidebar, list);

  const note = document.createElement('p');
  note.className = 'gw-inventory-note';
  note.textContent = 'Items are read from your signed-in account. Folder assignments and favorites are saved only in this browser on this device. Item type metadata and cross-device folder sync are not yet part of the inventory service.';
  shell.append(header, search, content, note);
  root.append(shell);
  renderItems();
}

function countFor(folderId: string) {
  if (folderId === 'all') return inventory.length;
  if (folderId === 'unsorted') return inventory.filter(item => !organization.itemFolders[item.item_id]).length;
  return inventory.filter(item => organization.itemFolders[item.item_id] === folderId).length;
}

function renderItems() {
  const list = document.querySelector<HTMLElement>('#gw-inventory-items');
  if (!list) return;
  list.replaceChildren();
  const visible = inventory.filter(item => {
    const assigned = organization.itemFolders[item.item_id];
    const inFolder = activeFolder === 'all' ||
      (activeFolder === 'unsorted' && !assigned) ||
      assigned === activeFolder;
    return inFolder && item.item_id.toLowerCase().includes(query.trim().toLowerCase());
  });

  if (!visible.length) {
    const empty = document.createElement('div');
    empty.className = 'gw-inventory-empty';
    const icon = document.createElement('span');
    icon.textContent = inventory.length ? '⌕' : '✧';
    const title = document.createElement('strong');
    title.textContent = inventory.length ? 'No items in this view' : 'Your collection is waiting';
    const copy = document.createElement('p');
    copy.textContent = inventory.length
      ? 'Try another folder or search.'
      : 'Items earned or collected in Grid World will appear here.';
    empty.append(icon, title, copy);
    list.append(empty);
    return;
  }

  for (const item of visible) {
    const card = document.createElement('article');
    card.className = 'gw-inventory-card';
    const symbol = document.createElement('span');
    symbol.className = 'gw-inventory-item-icon';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = '◇';
    const itemInfo = document.createElement('div');
    itemInfo.className = 'gw-inventory-item-info';
    const name = document.createElement('strong');
    name.textContent = item.item_id;
    const metadata = document.createElement('small');
    metadata.textContent = 'QUANTITY ' + item.quantity + ' · UPDATED ' + new Date(item.updated_at).toLocaleDateString();
    itemInfo.append(name, metadata);

    const controls = document.createElement('div');
    controls.className = 'gw-inventory-card-actions';
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Organize ' + item.item_id);
    for (const folder of folders().filter(folder => folder.id !== 'all' && folder.id !== 'unsorted')) {
      const option = document.createElement('option');
      option.value = folder.id;
      option.textContent = folder.name;
      option.selected = organization.itemFolders[item.item_id] === folder.id;
      select.append(option);
    }
    const unsortedOption = document.createElement('option');
    unsortedOption.value = '';
    unsortedOption.textContent = 'Unsorted';
    unsortedOption.selected = !organization.itemFolders[item.item_id];
    select.append(unsortedOption);
    select.addEventListener('change', () => {
      if (select.value) organization.itemFolders[item.item_id] = select.value;
      else delete organization.itemFolders[item.item_id];
      saveOrganization();
      render();
    });

    const favorite = document.createElement('button');
    favorite.type = 'button';
    const isFavorite = organization.favorites.includes(item.item_id);
    favorite.className = 'gw-inventory-favorite' + (isFavorite ? ' active' : '');
    favorite.setAttribute('aria-label', (isFavorite ? 'Remove favorite ' : 'Favorite ') + item.item_id);
    favorite.setAttribute('aria-pressed', String(isFavorite));
    favorite.textContent = isFavorite ? '★' : '☆';
    favorite.addEventListener('click', () => {
      organization.favorites = isFavorite
        ? organization.favorites.filter(id => id !== item.item_id)
        : [...organization.favorites, item.item_id];
      saveOrganization();
      render();
    });
    controls.append(select, favorite);
    card.append(symbol, itemInfo, controls);
    list.append(card);
  }
}

async function loadInventory() {
  if (!root || !client || !authority) {
    setMessage('Inventory needs account setup', 'The account service is not configured on this site yet.', { label: 'ACCOUNT', href: '/join.html' });
    return;
  }
  try {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) {
      accountId = '';
      setMessage('Sign in to view your Inventory', 'Your collection is private and only loads for the signed-in account.', { label: 'SIGN IN', href: '/join.html' });
      return;
    }
    accountId = user.id;
    organization = loadOrganization(accountId);
    inventory = await authority.inventory(accountId);
    render();
  } catch (error) {
    console.error('Grid World Inventory could not load.', error);
    setMessage('Inventory is temporarily unavailable', 'We could not securely load this account’s collection. Please try again later.');
  }
}

if (client) {
  client.auth.onAuthStateChange((_event, session) => {
    const nextUserId = session?.user.id ?? '';
    if (nextUserId !== accountId) {
      accountId = '';
      inventory = [];
      organization = emptyOrganization();
      activeFolder = 'all';
      void loadInventory();
    }
  });
}
void loadInventory();
