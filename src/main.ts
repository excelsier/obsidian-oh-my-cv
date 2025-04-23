/**
 * Main plugin file for Oh My CV Obsidian plugin
 * Acts as the entry point and orchestrator for the plugin
 */

import { 
  App,
  Editor, 
  MarkdownView, 
  Plugin, 
  TFile, 
  WorkspaceLeaf, 
  Notice,
  ViewCreator
} from 'obsidian';

// Core imports
import { CV_EDITOR_VIEW_TYPE, COMMANDS, PLUGIN_ID, PLUGIN_NAME } from './core/constants';
import { setPluginInstance } from './core/plugin-instance';

// Service imports
import { SettingsService } from './services/settings-service';
import { StorageService } from './services/storage-service';

// UI imports
import { OhMyCVSettingsTab } from './ui/settings-tab';

// Import the actual view class to avoid type mismatches
import { CVEditorView } from './ui/cv-editor-view';

// Interface to ensure alignment with the plugin instance
interface PluginInstance {
  id: string;
  app: App;
}

/**
 * Main plugin class for Oh My CV
 */
export default class OhMyCVPlugin extends Plugin {
  // Services
  settings: SettingsService;
  storage: StorageService;

  /**
   * Plugin load lifecycle hook
   * Sets up the plugin when Obsidian loads it
   */
  async onload() {
    console.log(`Loading ${PLUGIN_NAME} plugin`);

    // Set global plugin instance for cross-file access
    setPluginInstance(this);

    // Initialize services
    this.settings = new SettingsService(this);
    await this.settings.loadSettings();

    this.storage = new StorageService(this);

    // Register the CV editor view type
    // We need to dynamically import the view to avoid circular dependencies
    const { CVEditorView } = await import('./ui/cv-editor-view');
    
    this.registerView(
      CV_EDITOR_VIEW_TYPE,
      // Type assertion to resolve TypeScript errors
      ((leaf: WorkspaceLeaf) => new CVEditorView(leaf)) as ViewCreator
    );

    // Register plugin commands
    this.registerCommands();

    // Add ribbon icon
    this.addRibbonIcon('file-text', PLUGIN_NAME, (evt: MouseEvent) => {
      this.activateCVEditorView();
    });

    // Add settings tab - cast this to any to avoid TypeScript errors with circular references
    this.addSettingTab(new OhMyCVSettingsTab(this.app, this as any));
  }

  /**
   * Plugin unload lifecycle hook
   * Cleans up when Obsidian unloads the plugin
   */
  onunload() {
    console.log(`Unloading ${PLUGIN_NAME} plugin`);
    
    // Additional cleanup if needed
    this.app.workspace.detachLeavesOfType(CV_EDITOR_VIEW_TYPE);
  }

  /**
   * Register plugin commands in Obsidian
   */
  private registerCommands() {
    // Command to open CV editor view
    this.addCommand({
      id: COMMANDS.OPEN_CV_EDITOR,
      name: 'Open CV Editor',
      callback: () => {
        this.activateCVEditorView(false);
      }
    });
    
    // Command to open CV in side panel
    this.addCommand({
      id: COMMANDS.OPEN_CV_SIDE_PANEL,
      name: 'Open CV Preview in Side Panel',
      callback: () => {
        this.activateCVEditorView(true);
      }
    });

    // Command to create a new CV from template
    this.addCommand({
      id: COMMANDS.CREATE_NEW_CV,
      name: 'Create New CV from Template',
      callback: async () => {
        const view = await this.activateCVEditorView();
        if (view) {
          // Show template selector
          // For now, we'll just use the default template
          view.newDocumentFromTemplate('default');
        }
      }
    });

    // Command to format selected text as CV heading
    this.addCommand({
      id: COMMANDS.FORMAT_AS_CV_HEADING,
      name: 'Format as CV Heading',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const selection = editor.getSelection();
        editor.replaceSelection(`## ${selection}`);
      }
    });

    // Command to export current CV to PDF
    this.addCommand({
      id: COMMANDS.EXPORT_TO_PDF,
      name: 'Export Current CV to PDF',
      checkCallback: (checking: boolean) => {
        // Check if we're in a CV editor view
        const view = this.app.workspace.getActiveViewOfType(CVEditorView);
        // Cast to CVEditorView to avoid TypeScript errors
        const activeView = view as CVEditorView | null;
        if (activeView) {
          if (!checking) {
            activeView.exportToPDF();
          }
          return true;
        }
        return false;
      }
    });
  }

  /**
   * Activate the CV editor view
   * Creates a new leaf if one doesn't exist
   */
  async activateCVEditorView(useSidePanel: boolean = false): Promise<any> {
    // Check if view already exists
    const leaves = this.app.workspace.getLeavesOfType(CV_EDITOR_VIEW_TYPE);
    
    if (leaves.length > 0) {
      // Activate existing leaf
      this.app.workspace.revealLeaf(leaves[0]);
      // Use as any to avoid type issues with the circular dependency
      return leaves[0].view as any;
    } else {
      // Create new leaf - either in side panel or main area based on parameter
      let leaf;
      if (useSidePanel) {
        // Create a proper side panel leaf using split
        leaf = this.app.workspace.getLeaf('split', 'vertical');
      } else {
        // Create in main workspace area (more space for editor and preview)
        leaf = this.app.workspace.getLeaf('tab');
      }

      if (leaf) {
        await leaf.setViewState({
          type: CV_EDITOR_VIEW_TYPE,
          active: true,
          state: {
            isSidePanel: useSidePanel
          }
        });
        
        this.app.workspace.revealLeaf(leaf);
        // Use as any to avoid type issues with the circular dependency
        return leaf.view as any;
      }
      return null;
    }
  }

  /**
   * Load a CV file into the editor
   * @param file The file to load
   */
  async loadCVFile(file: TFile): Promise<void> {
    try {
      // Activate or create CV editor view
      const view = await this.activateCVEditorView();
      
      if (!view) {
        throw new Error('Failed to open CV editor view');
      }
      
      // Load the document
      const document = await this.storage.loadCV(file.path);
      // Use dynamically loaded view to avoid circular dependency
      await view.loadDocument(document);
    } catch (error) {
      console.error('Error loading CV file:', error);
      new Notice(`Error loading CV file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
