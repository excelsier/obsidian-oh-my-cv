/**
 * Mock Obsidian API
 * This file provides mock implementations of Obsidian APIs needed for testing
 */
import { jest } from '@jest/globals';

// Helper type for mocking functions
type MockFunction<T extends (...args: any) => any> = jest.MockedFunction<T>;

// For any functions where we don't care about the signature - with improved typing
const mockFn = <T = any, R = any>(): MockFunction<(...args: T[]) => R> => jest.fn();


// App and Plugin mocks
export class App {
  vault = new Vault();
  workspace = new Workspace();
  metadataCache = new MetadataCache();
  setting = {
    open: jest.fn(),
    openTabById: jest.fn(),
  };
  commands = {
    executeCommandById: jest.fn(),
  };
}

export class Plugin {
  app: App;
  manifest: any;
  id: string;

  constructor(app: App, manifest: any) {
    this.app = app;
    this.manifest = manifest;
    this.id = manifest.id;
  }

  loadData = jest.fn<() => Promise<any>>().mockResolvedValue({});
  saveData = jest.fn<(data: any) => Promise<void>>().mockResolvedValue(undefined);
  registerView = jest.fn<(type: string, viewCreator: any) => void>();
  addRibbonIcon = jest.fn<(icon: string, title: string, callback: () => void) => HTMLElement>();
  addCommand = jest.fn<(command: any) => void>();
  registerEvent = jest.fn<(event: any) => void>();
}

// Forward declaration to break circular dependency
let mockTFile: any;

// File system mocks
export class Vault {
  adapter = {
    exists: jest.fn<(path: string) => Promise<boolean>>().mockResolvedValue(true),
    read: jest.fn<(path: string) => Promise<string>>().mockResolvedValue(''),
    write: jest.fn<(path: string, data: string) => Promise<void>>().mockResolvedValue(undefined),
    readBinary: jest.fn<(path: string) => Promise<ArrayBuffer>>().mockResolvedValue(new ArrayBuffer(0)),
    writeBinary: jest.fn<(path: string, data: ArrayBuffer) => Promise<void>>().mockResolvedValue(undefined),
    getResourcePath: jest.fn<(path: string) => string>().mockReturnValue(''),
    mkdir: jest.fn<(path: string) => Promise<void>>().mockResolvedValue(undefined),
  };

  create = jest.fn<(path: string, data: string) => Promise<any>>().mockImplementation(() => Promise.resolve(mockTFile));
  createBinary = jest.fn<(path: string, data: ArrayBuffer) => Promise<any>>().mockImplementation(() => Promise.resolve(mockTFile));
  delete = jest.fn<(file: any) => Promise<void>>().mockResolvedValue(undefined);
  read = jest.fn<(file: any) => Promise<string>>().mockResolvedValue('');
  cachedRead = jest.fn<(file: any) => Promise<string>>().mockResolvedValue('');
  getFiles = jest.fn<() => any[]>().mockReturnValue([]);
  getMarkdownFiles = jest.fn<() => any[]>().mockReturnValue([]);
}

// Workspace mocks
export class Workspace {
  activeLeaf: WorkspaceLeaf | null = null;
  leftSplit = { collapsed: false };
  rightSplit = { collapsed: false };
  
  getActiveViewOfType = jest.fn().mockReturnValue(null);
  getActiveFile = jest.fn().mockReturnValue(null);
  getLeaf = jest.fn().mockReturnValue(new WorkspaceLeaf());
  createLeafInParent = jest.fn().mockReturnValue(new WorkspaceLeaf());
  getUnpinnedLeaf = jest.fn().mockReturnValue(new WorkspaceLeaf());
  registerHoverLinkSource = jest.fn();
  onLayoutReady = jest.fn();
  on = jest.fn();
}

// File and cache mocks
export class TFile {
  path = 'test-file.md';
  name = 'test-file.md';
  basename = 'test-file';
  extension = 'md';
  stat = { ctime: Date.now(), mtime: Date.now(), size: 0 };
  parent = null;
  vault: Vault;

  constructor() {
    // Create a simplified Vault instance to avoid circular dependency
    this.vault = {
      adapter: {
        exists: jest.fn(),
        read: jest.fn(),
        write: jest.fn(),
        readBinary: jest.fn(),
        writeBinary: jest.fn(),
        getResourcePath: jest.fn(),
        mkdir: jest.fn(),
      },
      read: jest.fn(),
      getFiles: jest.fn().mockReturnValue([]),
    } as unknown as Vault;
  }
}

// Initialize mockTFile after TFile is defined
mockTFile = new TFile();

export class MetadataCache {
  getFileCache = jest.fn().mockReturnValue({
    frontmatter: {},
    headings: [],
    links: [],
    embeds: [],
    tags: [],
  });
  getCache = jest.fn().mockReturnValue({});
  on = jest.fn();
}

// UI mocks
export class WorkspaceLeaf {
  view: any = null;

  getViewState = jest.fn().mockReturnValue({
    type: 'markdown',
    state: {},
  });
  setViewState = jest.fn<(state: any) => Promise<void>>().mockResolvedValue(undefined);
  getEphemeralState = jest.fn<() => Record<string, any>>().mockReturnValue({});
  setEphemeralState = jest.fn<(state: Record<string, any>) => void>().mockReturnValue(undefined);
  openFile = jest.fn<(file: any) => Promise<void>>().mockResolvedValue(undefined);
  detach = jest.fn<() => void>();
  setRoot = jest.fn<(root: any) => void>();
}

export class ItemView {
  contentEl: HTMLElement = document.createElement('div');
  leaf: WorkspaceLeaf = new WorkspaceLeaf();
  navigation = true;
  app: App = new App();
  
  onload = jest.fn<() => void>();
  onunload = jest.fn<() => void>();
  getViewType = jest.fn<() => string>().mockReturnValue('');
  getDisplayText = jest.fn<() => string>().mockReturnValue('');
  getIcon = jest.fn<() => string>().mockReturnValue('');
  setState = jest.fn<(state: any) => Promise<void>>().mockResolvedValue(undefined);
  onPaneMenu = jest.fn<(menu: any) => void>();
  onHeaderMenu = jest.fn<(menu: any) => void>();
}

export class MarkdownView {
  file: TFile | null = null;
  editor: Editor = new Editor();
  previewMode = { 
    renderer: { 
      onRendered: jest.fn(),
      sections: [],
      rerender: jest.fn(),
    },
  };
  
  getMode = jest.fn().mockReturnValue('source');
  getViewType = jest.fn().mockReturnValue('markdown');
  getDisplayText = jest.fn().mockReturnValue('');
  getState = jest.fn().mockReturnValue({});
}

export class Editor {
  doc = { getValue: jest.fn().mockReturnValue(''), setValue: jest.fn() };
  getCursor = jest.fn().mockReturnValue({ line: 0, ch: 0 });
  setCursor = jest.fn();
  getLine = jest.fn().mockReturnValue('');
  replaceRange = jest.fn();
  getSelection = jest.fn().mockReturnValue('');
  focus = jest.fn();
}

// UI Component mocks
export class Setting {
  containerEl: HTMLElement = document.createElement('div');
  controlEl: HTMLElement = document.createElement('div');
  infoEl: HTMLElement = document.createElement('div');
  nameEl: HTMLElement = document.createElement('div');
  
  setName = jest.fn().mockReturnValue(this);
  setDesc = jest.fn().mockReturnValue(this);
  setClass = jest.fn().mockReturnValue(this);
  setTooltip = jest.fn().mockReturnValue(this);
  setHeading = jest.fn().mockReturnValue(this);
  setDisabled = jest.fn().mockReturnValue(this);
  addButton = jest.fn().mockReturnValue({
    setButtonText: jest.fn().mockReturnValue({}),
    setIcon: jest.fn().mockReturnValue({}),
    onClick: jest.fn().mockReturnValue({}),
    setDisabled: jest.fn().mockReturnValue({}),
  });
  addText = jest.fn().mockReturnValue({
    setPlaceholder: jest.fn().mockReturnValue({}),
    setValue: jest.fn().mockReturnValue({}),
    onChange: jest.fn().mockReturnValue({}),
  });
  addToggle = jest.fn().mockReturnValue({
    setValue: jest.fn().mockReturnValue({}),
    onChange: jest.fn().mockReturnValue({}),
  });
  addDropdown = jest.fn().mockReturnValue({
    addOption: jest.fn().mockReturnValue({}),
    setValue: jest.fn().mockReturnValue({}),
    onChange: jest.fn().mockReturnValue({}),
  });
  addSlider = jest.fn().mockReturnValue({
    setLimits: jest.fn().mockReturnValue({}),
    setValue: jest.fn().mockReturnValue({}),
    onChange: jest.fn().mockReturnValue({}),
    setDynamicTooltip: jest.fn().mockReturnValue({}),
  });
}

export class PluginSettingTab {
  app: App = new App();
  containerEl: HTMLElement = document.createElement('div');
  display = jest.fn();
  hide = jest.fn();
}

export class Notice {
  constructor(message: string, timeout?: number) {
    // Mock implementation
  }
}

// Utility Functions
export function setIcon(el: HTMLElement, iconId: string): void {
  // Mock implementation
}

export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

// Types
export interface EditorPosition {
  line: number;
  ch: number;
}

export interface EditorRange {
  from: EditorPosition;
  to: EditorPosition;
}

export interface EditorChange {
  from: EditorPosition;
  to: EditorPosition;
  text: string;
  removed: string;
  origin: string;
}

// Events
export class Events {
  on = jest.fn().mockReturnValue({ events: {} });
  off = jest.fn();
  trigger = jest.fn();
  tryTrigger = jest.fn();
}

// Modal
export class Modal {
  app: App = new App();
  contentEl: HTMLElement = document.createElement('div');
  
  open = jest.fn();
  close = jest.fn();
  onOpen = jest.fn();
  onClose = jest.fn();
}
