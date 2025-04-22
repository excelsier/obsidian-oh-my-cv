/**
 * Storage service for the Oh My CV plugin
 * Handles file operations and CV document management
 */

import { TFile, TFolder, Notice, Vault, Plugin } from 'obsidian';
import { CVDocument, CVMetadata } from '../core/types';
import { DEFAULT_CV_FOLDER, CV_FILE_EXTENSION, FRONTMATTER_REGEX } from '../core/constants';
import * as YAML from 'yaml';

// Use type declaration to avoid circular dependencies
declare class OhMyCVPlugin extends Plugin {
  settings: any;
}

/**
 * Service for managing CV document storage in the Obsidian vault
 */
export class StorageService {
  private plugin: OhMyCVPlugin;
  private vault: Vault;

  /**
   * Create a new storage service
   * @param plugin The Oh My CV plugin instance
   */
  constructor(plugin: OhMyCVPlugin) {
    this.plugin = plugin;
    this.vault = plugin.app.vault;
  }

  /**
   * Ensure the CV folder exists in the vault
   * @param folderPath Optional custom folder path
   * @returns The folder path
   */
  async ensureCVFolder(folderPath: string = DEFAULT_CV_FOLDER): Promise<string> {
    if (!this.vault.getAbstractFileByPath(folderPath)) {
      try {
        await this.vault.createFolder(folderPath);
        console.log(`Created CV folder at ${folderPath}`);
      } catch (error) {
        console.error(`Failed to create CV folder: ${error}`);
        new Notice(`Failed to create CV folder: ${error}`);
        throw error;
      }
    }
    return folderPath;
  }

  /**
   * Create a new CV document
   * @param title The CV title
   * @param content The markdown content
   * @param metadata Additional metadata
   * @param folderPath Optional folder path
   * @returns The created CV document
   */
  async createCV(
    title: string,
    content: string,
    metadata: Partial<CVMetadata>,
    folderPath: string = DEFAULT_CV_FOLDER
  ): Promise<CVDocument> {
    // Ensure the folder exists
    await this.ensureCVFolder(folderPath);

    // Prepare the metadata
    const fullMetadata: CVMetadata = {
      title,
      lastModified: Date.now(),
      pageSize: this.plugin.settings.getDefaultPageSize(),
      margins: this.plugin.settings.getDefaultMargins(),
      themeColor: this.plugin.settings.getDefaultThemeColor(),
      fontFamily: this.plugin.settings.getDefaultFontFamily(),
      fontSize: this.plugin.settings.getSettings().defaultFontSize,
      lineHeight: this.plugin.settings.getSettings().defaultLineHeight,
      ...metadata
    };

    // Create filename
    const sanitizedTitle = title.replace(/[\\/:*?"<>|]/g, '-');
    const filename = `${sanitizedTitle}${CV_FILE_EXTENSION}`;
    const filePath = `${folderPath}/${filename}`;

    // Check if file already exists
    if (this.vault.getAbstractFileByPath(filePath)) {
      throw new Error(`A CV with the title "${title}" already exists.`);
    }

    // Create the file content with frontmatter and markdown
    const frontmatter = YAML.stringify(fullMetadata);
    const fileContent = `---\n${frontmatter}---\n\n${content}`;

    try {
      // Create the file
      const file = await this.vault.create(filePath, fileContent);
      console.log(`Created CV at ${filePath}`);
      
      // Return the CV document
      return {
        path: filePath,
        metadata: fullMetadata,
        content
      };
    } catch (error) {
      console.error(`Failed to create CV: ${error}`);
      new Notice(`Failed to create CV: ${error}`);
      throw error;
    }
  }

  /**
   * Get all CV documents in the vault
   * @param folderPath Optional folder path to search in
   * @returns Array of CV documents
   */
  async getAllCVs(folderPath: string = DEFAULT_CV_FOLDER): Promise<CVDocument[]> {
    try {
      // Ensure the folder exists
      await this.ensureCVFolder(folderPath);

      // Get all CV files
      const folder = this.vault.getAbstractFileByPath(folderPath) as TFolder;
      const cvFiles = folder.children
        .filter(file => file instanceof TFile && file.path.endsWith(CV_FILE_EXTENSION))
        .map(file => file as TFile);

      // Parse each CV file
      const cvDocuments: CVDocument[] = [];
      for (const file of cvFiles) {
        try {
          const document = await this.loadCV(file.path);
          cvDocuments.push(document);
        } catch (error) {
          console.error(`Failed to load CV ${file.path}: ${error}`);
        }
      }

      return cvDocuments;
    } catch (error) {
      console.error(`Failed to get all CVs: ${error}`);
      new Notice(`Failed to get all CVs: ${error}`);
      return [];
    }
  }

  /**
   * Load a CV document from a file
   * @param filePath The file path
   * @returns The CV document
   */
  async loadCV(filePath: string): Promise<CVDocument> {
    try {
      // Get the file
      const file = this.vault.getAbstractFileByPath(filePath);
      if (!(file instanceof TFile)) {
        throw new Error(`File ${filePath} not found or is not a file.`);
      }

      // Read the file content
      const fileContent = await this.vault.read(file);

      // Parse the frontmatter
      const frontmatterMatch = fileContent.match(FRONTMATTER_REGEX);
      if (!frontmatterMatch) {
        throw new Error(`File ${filePath} does not contain valid frontmatter.`);
      }

      // Extract the frontmatter and content
      const frontmatter = frontmatterMatch[1];
      const content = fileContent.slice(frontmatterMatch[0].length).trim();

      // Parse the metadata
      let metadata: CVMetadata;
      try {
        metadata = YAML.parse(frontmatter) as CVMetadata;
      } catch (error) {
        console.error(`Failed to parse frontmatter in ${filePath}: ${error}`);
        throw new Error(`Failed to parse frontmatter in ${filePath}: ${error}`);
      }

      // Return the CV document
      return {
        path: filePath,
        metadata,
        content
      };
    } catch (error) {
      console.error(`Failed to load CV ${filePath}: ${error}`);
      new Notice(`Failed to load CV ${filePath}: ${error}`);
      throw error;
    }
  }

  /**
   * Save changes to a CV document
   * @param document The CV document to save
   * @returns The updated CV document
   */
  async saveCV(document: CVDocument): Promise<CVDocument> {
    try {
      // Update last modified timestamp
      document.metadata.lastModified = Date.now();

      // Create the file content with frontmatter and markdown
      const frontmatter = YAML.stringify(document.metadata);
      const fileContent = `---\n${frontmatter}---\n\n${document.content}`;

      // Save the file
      await this.vault.modify(
        this.vault.getAbstractFileByPath(document.path) as TFile,
        fileContent
      );
      console.log(`Saved CV at ${document.path}`);

      // Return the updated document
      return document;
    } catch (error) {
      console.error(`Failed to save CV: ${error}`);
      new Notice(`Failed to save CV: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a CV document
   * @param filePath The file path to delete
   */
  async deleteCV(filePath: string): Promise<void> {
    try {
      // Get the file
      const file = this.vault.getAbstractFileByPath(filePath);
      if (!(file instanceof TFile)) {
        throw new Error(`File ${filePath} not found or is not a file.`);
      }

      // Delete the file
      await this.vault.delete(file);
      console.log(`Deleted CV at ${filePath}`);
    } catch (error) {
      console.error(`Failed to delete CV: ${error}`);
      new Notice(`Failed to delete CV: ${error}`);
      throw error;
    }
  }

  /**
   * Rename a CV document
   * @param oldPath The current file path
   * @param newTitle The new title
   * @returns The updated CV document
   */
  async renameCV(oldPath: string, newTitle: string): Promise<CVDocument> {
    try {
      // Load the current document
      const document = await this.loadCV(oldPath);

      // Generate the new path
      const folder = oldPath.substring(0, oldPath.lastIndexOf('/'));
      const sanitizedTitle = newTitle.replace(/[\\/:*?"<>|]/g, '-');
      const newFilename = `${sanitizedTitle}${CV_FILE_EXTENSION}`;
      const newPath = `${folder}/${newFilename}`;

      // Check if the new path already exists
      if (this.vault.getAbstractFileByPath(newPath)) {
        throw new Error(`A CV with the title "${newTitle}" already exists.`);
      }

      // Update the document metadata
      document.metadata.title = newTitle;
      document.metadata.lastModified = Date.now();

      // Create the file content with frontmatter and markdown
      const frontmatter = YAML.stringify(document.metadata);
      const fileContent = `---\n${frontmatter}---\n\n${document.content}`;

      // Get the old file
      const oldFile = this.vault.getAbstractFileByPath(oldPath) as TFile;

      // Create the new file
      await this.vault.create(newPath, fileContent);

      // Delete the old file
      await this.vault.delete(oldFile);

      // Return the updated document with the new path
      return {
        ...document,
        path: newPath
      };
    } catch (error) {
      console.error(`Failed to rename CV: ${error}`);
      new Notice(`Failed to rename CV: ${error}`);
      throw error;
    }
  }
}
