import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf, MarkdownRenderer } from 'obsidian';
import html2pdf from 'html2pdf.js';

// Remember to rename these classes and interfaces!

interface OhMyCVSettings {
	pageSize: 'A4' | 'LETTER';
	margins: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
	themeColor: string;
	fontFamily: string;
	fontSize: number;
	lineHeight: number;
	enableCustomCss: boolean;
	customCss: string;
	autoCasing: boolean;
	texSupport: boolean;
	showPageBreaks: boolean;
}

const DEFAULT_SETTINGS: OhMyCVSettings = {
	pageSize: 'A4',
	margins: {
		top: 20,
		right: 20,
		bottom: 20,
		left: 20
	},
	themeColor: '#4051b5',
	fontFamily: 'Inter, sans-serif',
	fontSize: 10, // in pt
	lineHeight: 1.5,
	enableCustomCss: false,
	customCss: '',
	autoCasing: true,
	texSupport: true,
	showPageBreaks: true
}

export default class OhMyCVPlugin extends Plugin {
	settings: OhMyCVSettings;

	async onload() {
		await this.loadSettings();

		// Add the CV icon to the left ribbon
		const ribbonIconEl = this.addRibbonIcon('file-text', 'Oh My CV', (evt: MouseEvent) => {
			// Open the CV editor when icon is clicked
			new CVEditorModal(this.app, this).open();
		});
		// Add CSS class to the ribbon icon
		ribbonIconEl.addClass('oh-my-cv-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// Command to open the Oh My CV editor
		this.addCommand({
			id: 'open-cv-editor',
			name: 'Open CV Editor',
			callback: () => {
				new CVEditorModal(this.app, this).open();
			}
		});

		// This adds an editor command to format selected text as a CV heading
		this.addCommand({
			id: 'format-as-cv-heading',
			name: 'Format as CV Heading',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				editor.replaceSelection(`## ${selection}`);
			}
		});

		// This adds a command to create a new CV from template
		this.addCommand({
			id: 'create-new-cv',
			name: 'Create New CV from Template',
			checkCallback: (checking: boolean) => {
				// This command can be run from anywhere
				if (!checking) {
					// Create and open the editor with a template
					const modal = new CVEditorModal(this.app, this);
					modal.open();
				}
				return true;
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new OhMyCVSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// CV Editor Modal - Main interface for editing resumes
class CVEditorModal extends Modal {
	plugin: OhMyCVPlugin;
	editor: HTMLTextAreaElement;
	preview: HTMLDivElement;
	markdownContent: string = '';

	constructor(app: App, plugin: OhMyCVPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const {contentEl} = this;
		
		// Set up modal styling
		contentEl.addClass('oh-my-cv-modal');
		
		// Create header section with title and buttons
		const headerEl = contentEl.createDiv({cls: 'oh-my-cv-header'});
		headerEl.createEl('h2', {text: 'Oh My CV Editor'});
		
		const buttonContainer = headerEl.createDiv({cls: 'oh-my-cv-buttons'});
		
		// Add PDF export button
		const exportButton = buttonContainer.createEl('button', {
			text: 'Export to PDF',
			cls: 'oh-my-cv-button'
		});
		exportButton.addEventListener('click', () => this.exportPDF());
		
		// Add Save button
		const saveButton = buttonContainer.createEl('button', {
			text: 'Save CV',
			cls: 'oh-my-cv-button'
		});
		saveButton.addEventListener('click', () => this.saveCV());
		
		// Create main content area with split view
		const mainContainer = contentEl.createDiv({cls: 'oh-my-cv-main-container'});
		
		// Left side: Markdown editor
		const editorContainer = mainContainer.createDiv({cls: 'oh-my-cv-editor-container'});
		editorContainer.createEl('h3', {text: 'Markdown Editor'});
		
		// Create the editor
		this.editor = editorContainer.createEl('textarea', {
			cls: 'oh-my-cv-editor',
			attr: {
				placeholder: 'Write your CV in Markdown format...'
			}
		});
		
		// Load sample CV content or existing content
		this.loadCV();
		
		// Set up editor event listeners
		this.editor.addEventListener('input', () => {
			this.markdownContent = this.editor.value;
			this.updatePreview();
		});
		
		// Right side: Preview
		const previewContainer = mainContainer.createDiv({cls: 'oh-my-cv-preview-container'});
		previewContainer.createEl('h3', {text: 'Live Preview'});
		
		// Create the preview pane
		this.preview = previewContainer.createDiv({
			cls: 'oh-my-cv-preview'
		});
		
		// Initial preview update
		this.updatePreview();
		
		// Add toolbar with formatting buttons
		this.addToolbar(editorContainer);
	}

	// Load the CV content
	async loadCV() {
		// Try to load existing CV data or use sample template
		const savedCV = await this.plugin.loadData();
		
		if (savedCV && savedCV.cvContent) {
			this.markdownContent = savedCV.cvContent;
		} else {
			// Load sample CV template
			this.markdownContent = this.getSampleTemplate();
		}
		
		this.editor.value = this.markdownContent;
	}

	// Save the CV content
	async saveCV() {
		try {
			await this.plugin.saveData({
				cvContent: this.markdownContent,
				lastSaved: new Date().toISOString()
			});
			new Notice('CV saved successfully!');
		} catch (error) {
			new Notice('Error saving CV: ' + error);
		}
	}

	// Export to PDF
	exportPDF() {
		new Notice('PDF Export is being prepared...');
		
		// Create a clone of the preview element to avoid modifying the original
		const previewClone = this.preview.cloneNode(true) as HTMLElement;
		
		// Apply specific styling for PDF output
		const { settings } = this.plugin;
		
		// Set up html2pdf options based on plugin settings
		const options = {
			margin: [
				settings.margins.top,
				settings.margins.right,
				settings.margins.bottom,
				settings.margins.left
			],
			filename: 'my-cv.pdf',
			image: { type: 'jpeg', quality: 0.98 },
			html2canvas: { scale: 2 },
			jsPDF: { 
				unit: 'mm', 
				format: settings.pageSize,
				orientation: 'portrait' as 'portrait'
			}
		};
		
		try {
			// Generate PDF from the preview content
			html2pdf()
				.set(options)
				.from(previewClone)
				.save()
				.then(() => {
					new Notice('PDF export successful!');
				})
				.catch((error: Error) => {
					console.error('PDF export error:', error);
					new Notice(`PDF export failed: ${error.message}`);
				});
		} catch (error) {
			console.error('PDF export error:', error);
			new Notice(`PDF export failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	// Update the preview pane with rendered markdown
	updatePreview() {
		// Apply auto-casing if enabled
		let content = this.markdownContent;
		if (this.plugin.settings.autoCasing) {
			content = this.applyCasingRules(content);
		}
		
		// Clear the preview
		this.preview.empty();
		
		// Create the styled preview container with settings applied
		const previewStyles = this.createPreviewStyles();
		this.preview.setAttribute('style', previewStyles);
		
		// Render the markdown to HTML
		try {
			// Use a safer approach to render markdown
			this.preview.innerHTML = '';
			this.app.workspace.trigger('markdown:preview', content, this.preview);
		} catch (error) {
			// Fallback option if the trigger doesn't work
			const div = document.createElement('div');
			div.innerHTML = this.convertMarkdownToHtml(content);
			this.preview.appendChild(div);
		}
		
		// If page breaks are enabled, visualize them
		if (this.plugin.settings.showPageBreaks) {
			this.visualizePageBreaks();
		}
	}

	// Create CSS styles based on plugin settings
	createPreviewStyles(): string {
		const { settings } = this.plugin;
		
		// Convert settings to CSS
		return `
			font-family: ${settings.fontFamily};
			font-size: ${settings.fontSize}pt;
			line-height: ${settings.lineHeight};
			--theme-color: ${settings.themeColor};
			padding: ${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm;
			width: ${settings.pageSize === 'A4' ? '210mm' : '215.9mm'};
			min-height: ${settings.pageSize === 'A4' ? '297mm' : '279.4mm'};
			background-color: white;
			color: black;
			box-sizing: border-box;
		`;
	}

	// Apply auto-casing rules to the content
	applyCasingRules(content: string): string {
		// Common terms with proper casing
		const casingRules: Record<string, string> = {
			'github': 'GitHub',
			'linkedin': 'LinkedIn',
			'javascript': 'JavaScript',
			'typescript': 'TypeScript',
			'react.js': 'React.js',
			'node.js': 'Node.js',
			'vue.js': 'Vue.js',
			'angularjs': 'AngularJS',
			'mongodb': 'MongoDB',
			'postgresql': 'PostgreSQL',
			'mysql': 'MySQL',
			'css3': 'CSS3',
			'html5': 'HTML5',
			'api': 'API',
			'apis': 'APIs',
			'json': 'JSON',
			'php': 'PHP',
			'sql': 'SQL',
			'nosql': 'NoSQL',
			'jquery': 'jQuery',
		};
		
		// Replace all occurrences of terms
		let result = content;
		Object.entries(casingRules).forEach(([incorrect, correct]) => {
			// Create regex that matches word boundaries
			const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
			result = result.replace(regex, correct);
		});
		
		return result;
	}

	// Visualize page breaks in the preview
	visualizePageBreaks() {
		// Implementation would calculate page breaks based on content height
		// and add visual indicators in the preview
		console.log('Page break visualization would be implemented here');
	}

	// Simple markdown to HTML converter as a fallback
	convertMarkdownToHtml(markdown: string): string {
		// This is a very basic implementation
		// In a full implementation, you'd use a proper Markdown parser
		let html = markdown;
		
		// Handle headings
		html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
		html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
		html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
		
		// Handle bold
		html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
		
		// Handle italic
		html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
		
		// Handle links
		html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
		
		// Handle lists
		html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
		html = html.replace(/(<li>.+<\/li>\n)+/g, '<ul>$&</ul>');
		
		// Handle paragraphs
		html = html.replace(/^([^<].+)$/gm, '<p>$1</p>');
		
		// Handle line breaks
		html = html.replace(/\n/g, '<br>');
		
		return html;
	}

	// Add a formatting toolbar to the editor
	addToolbar(container: HTMLElement) {
		const toolbarEl = container.createDiv({cls: 'oh-my-cv-toolbar'});
		
		// Helper function to create toolbar buttons
		const addButton = (text: string, action: () => void) => {
			const button = toolbarEl.createEl('button', {
				text: text,
				cls: 'oh-my-cv-toolbar-button'
			});
			button.addEventListener('click', action);
			return button;
		};
		
		// Add formatting buttons
		addButton('H1', () => this.insertTextAtCursor('# ', ''));
		addButton('H2', () => this.insertTextAtCursor('## ', ''));
		addButton('H3', () => this.insertTextAtCursor('### ', ''));
		addButton('B', () => this.insertTextAtCursor('**', '**'));
		addButton('I', () => this.insertTextAtCursor('*', '*'));
		addButton('Link', () => this.insertTextAtCursor('[', '](url)'));
		addButton('List', () => this.insertTextAtCursor('- ', ''));
		addButton('Table', () => this.insertTable());
		addButton('Page Break', () => this.insertTextAtCursor('\\newpage\n', ''));
	}

	// Insert text at the current cursor position
	insertTextAtCursor(before: string, after: string) {
		const editor = this.editor;
		const start = editor.selectionStart;
		const end = editor.selectionEnd;
		const selectedText = editor.value.substring(start, end);
		
		const newText = before + selectedText + after;
		editor.setRangeText(newText, start, end, 'select');
		editor.focus();
		
		// Update the preview
		this.markdownContent = editor.value;
		this.updatePreview();
	}

	// Insert a markdown table template
	insertTable() {
		const tableTemplate = '| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |\n| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |\n';
		this.insertTextAtCursor(tableTemplate, '');
	}

	// Get a sample CV template for new users
	getSampleTemplate(): string {
		return `# John Doe

**Software Engineer** | [john@example.com](mailto:john@example.com) | [LinkedIn](https://linkedin.com/in/johndoe) | [GitHub](https://github.com/johndoe)

## Summary

Experienced software engineer with a passion for building scalable applications and solving complex problems. Over 5 years of professional experience working with JavaScript, TypeScript, and modern web frameworks.

## Skills

- **Programming Languages**: JavaScript, TypeScript, Python, SQL
- **Frontend**: React.js, Vue.js, HTML5, CSS3
- **Backend**: Node.js, Express, MongoDB, PostgreSQL
- **Tools**: Git, Docker, AWS, CI/CD pipelines

## Experience

### Senior Software Engineer | ABC Tech | Jan 2020 - Present

- Led development of a microservices architecture serving 1M+ users
- Implemented CI/CD pipelines reducing deployment time by 70%
- Mentored junior developers through code reviews and pair programming

### Software Developer | XYZ Solutions | Mar 2018 - Dec 2019

- Developed responsive web applications using React.js and Redux
- Optimized database queries resulting in 40% performance improvement
- Collaborated with design team to implement intuitive user interfaces

## Education

### Bachelor of Science in Computer Science | University of Technology | 2013 - 2017

- GPA: 3.8/4.0
- Relevant Coursework: Data Structures, Algorithms, Database Systems

## Projects

### Personal Portfolio Website
- Designed and developed a personal website using React.js and Tailwind CSS
- Implemented responsive design and accessibility features
- [View project](https://johndoe.com)

## Certifications

- AWS Certified Developer Associate (2022)
- MongoDB Certified Developer (2021)
`;
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class OhMyCVSettingTab extends PluginSettingTab {
	plugin: OhMyCVPlugin;

	constructor(app: App, plugin: OhMyCVPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Oh My CV Settings'});

		new Setting(containerEl)
			.setName('Page Size')
			.setDesc('Choose between A4 or US Letter')
			.addDropdown(dropdown => dropdown
				.addOption('A4', 'A4')
				.addOption('LETTER', 'US Letter')
				.setValue(this.plugin.settings.pageSize)
				.onChange(async (value: 'A4' | 'LETTER') => {
					this.plugin.settings.pageSize = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', {text: 'Margins (mm)'});

		new Setting(containerEl)
			.setName('Top Margin')
			.addSlider(slider => slider
				.setLimits(5, 50, 5)
				.setValue(this.plugin.settings.margins.top)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.margins.top = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Bottom Margin')
			.addSlider(slider => slider
				.setLimits(5, 50, 5)
				.setValue(this.plugin.settings.margins.bottom)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.margins.bottom = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Left Margin')
			.addSlider(slider => slider
				.setLimits(5, 50, 5)
				.setValue(this.plugin.settings.margins.left)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.margins.left = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Right Margin')
			.addSlider(slider => slider
				.setLimits(5, 50, 5)
				.setValue(this.plugin.settings.margins.right)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.margins.right = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', {text: 'Appearance'});
		
		new Setting(containerEl)
			.setName('Theme Color')
			.addColorPicker(color => color
				.setValue(this.plugin.settings.themeColor)
				.onChange(async (value) => {
					this.plugin.settings.themeColor = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Font Family')
			.setDesc('Specify a valid font family name')
			.addText(text => text
				.setPlaceholder('Inter, sans-serif')
				.setValue(this.plugin.settings.fontFamily)
				.onChange(async (value) => {
					this.plugin.settings.fontFamily = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Font Size (pt)')
			.addSlider(slider => slider
				.setLimits(8, 16, 1)
				.setValue(this.plugin.settings.fontSize)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.fontSize = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Line Height')
			.addSlider(slider => slider
				.setLimits(1, 2, 0.1)
				.setValue(this.plugin.settings.lineHeight)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.lineHeight = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', {text: 'Features'});
		
		new Setting(containerEl)
			.setName('Auto Casing Correction')
			.setDesc('Automatically correct casing of common terms (e.g., GitHub, LinkedIn)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoCasing)
				.onChange(async (value) => {
					this.plugin.settings.autoCasing = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('TeX Support')
			.setDesc('Enable LaTeX-style mathematical expressions')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.texSupport)
				.onChange(async (value) => {
					this.plugin.settings.texSupport = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show Page Breaks')
			.setDesc('Visualize page breaks in the editor')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showPageBreaks)
				.onChange(async (value) => {
					this.plugin.settings.showPageBreaks = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', {text: 'Advanced'});
		
		new Setting(containerEl)
			.setName('Custom CSS')
			.setDesc('Enable custom CSS styling for your CV')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableCustomCss)
				.onChange(async (value) => {
					this.plugin.settings.enableCustomCss = value;
					await this.plugin.saveSettings();
				}));

		if (this.plugin.settings.enableCustomCss) {
			new Setting(containerEl)
				.setName('CSS Code')
				.setDesc('Add custom CSS to style your CV')
				.addTextArea(text => text
					.setPlaceholder('/* Your custom CSS here */')
					.setValue(this.plugin.settings.customCss)
					.onChange(async (value) => {
						this.plugin.settings.customCss = value;
						await this.plugin.saveSettings();
					}));
		}
	}
}
