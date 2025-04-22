/**
 * Core types and interfaces for the Oh My CV Obsidian plugin
 */

/**
 * Settings for the Oh My CV plugin
 */
export interface OhMyCVSettings {
  /** Page size for CV export (A4 or US Letter) */
  defaultPageSize: 'A4' | 'LETTER';

  /** Default margins in mm */
  defaultMargins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  /** Default theme color in hex format */
  defaultThemeColor: string;

  /** Default font family */
  defaultFontFamily: string;

  /** Default font size in pt */
  defaultFontSize: number;

  /** Default line height */
  defaultLineHeight: number;

  /** Whether to enable custom CSS */
  enableCustomCss: boolean;

  /** Default custom CSS */
  defaultCustomCss: string;

  /** Whether to automatically correct casing of common terms */
  autoCasing: boolean;

  /** Whether to enable TeX/KaTeX support */
  texSupport: boolean;

  /** Whether to show page breaks in the preview */
  showPageBreaks: boolean;

  /** Whether to enable icon support */
  iconSupport: boolean;

  /** Optional Google Fonts API key */
  googleFontsApiKey?: string;

  /** Recently used fonts */
  recentlyUsedFonts: string[];

  /** CV templates */
  templates: CVTemplate[];
}

/**
 * Represents a CV theme
 */
export interface CVTheme {
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  linkColor?: string;
  backgroundColor?: string;
  headingFont?: string;
  bodyFont?: string;
  fontSize?: string;
  lineHeight?: string;
}

/**
 * CV template styling
 */
export interface CVTemplateStyle {
  theme: CVTheme;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  spacing: number; // Line spacing factor
  customCSS?: string;
}

/**
 * Represents a CV template
 */
export interface CVTemplate {
  /** Unique identifier for the template */
  id: string;

  /** Display name for the template */
  name: string;

  /** Brief description of the template */
  description: string;

  /** The markdown content of the template */
  content: string;
  
  /** Styling options for the template */
  style: CVTemplateStyle;
  
  /** Base64 or URL to preview image */
  previewImage?: string;
  
  /** E.g., 'Professional', 'Academic', 'Creative' */
  category?: string;
  
  /** E.g., 'minimal', 'modern', 'colorful' */
  tags?: string[];
}

/**
 * Represents CV metadata, stored in frontmatter
 */
export interface CVMetadata {
  /** CV title */
  title: string;

  /** Last modified timestamp */
  lastModified: number;

  /** Page size for this specific CV */
  pageSize: 'A4' | 'LETTER' | 'LEGAL' | 'TABLOID';
  
  /** Page orientation */
  orientation?: 'portrait' | 'landscape';

  /** Margins in mm */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  /** Theme color in hex format */
  themeColor: string;

  /** Font family */
  fontFamily: string;

  /** Font size in pt */
  fontSize: number;

  /** Line height */
  lineHeight: number;

  /** Custom CSS for this CV */
  customCss?: string;
  
  /** Tags for categorizing CVs */
  tags?: string[];
}

/**
 * Represents a CV document
 */
export interface CVDocument {
  /** Obsidian file path */
  path: string;

  /** CV metadata */
  metadata: CVMetadata;

  /** CV content in Markdown */
  content: string;
}

/**
 * PDF export options
 */
export interface PDFExportOptions {
  /** Output filename */
  filename: string;

  /** Page size (A4, Letter, Legal, Tabloid) */
  pageSize: 'A4' | 'LETTER' | 'LEGAL' | 'TABLOID';
  
  /** Page orientation (portrait or landscape) */
  orientation: 'portrait' | 'landscape';

  /** Margins in mm */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  /** Whether to include a header */
  includeHeader: boolean;

  /** Header content (if includeHeader is true) */
  headerContent?: string;

  /** Whether to include a footer */
  includeFooter: boolean;

  /** Footer content (if includeFooter is true) */
  footerContent?: string;

  /** Whether to include page numbers */
  includePageNumbers: boolean;
  
  /** Whether to embed fonts in the PDF */
  embedFonts?: boolean;
  
  /** Image quality (60-100) */
  imageQuality?: number;
}

/**
 * Icons provider options
 */
export interface IconOptions {
  /** Icon provider (e.g., 'iconify') */
  provider: string;

  /** Base URL for icon CDN */
  baseUrl?: string;

  /** Default icon size */
  defaultSize: number;
}
