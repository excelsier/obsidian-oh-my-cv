/**
 * Constants for the Oh My CV Obsidian plugin
 */
import { OhMyCVSettings, CVTemplate, CVTemplateStyle, CVTheme } from './types';

/** Plugin ID */
export const PLUGIN_ID = 'obsidian-oh-my-cv';

/** Plugin name */
export const PLUGIN_NAME = 'Oh My CV';

/** CV Editor view type identifier */
export const CV_EDITOR_VIEW_TYPE = 'oh-my-cv-editor-view';

// Default settings will be exported at the end of file

/** Default file extension for CV files */
export const CV_FILE_EXTENSION = '.cv.md';

/** Folder name for CV files */
export const DEFAULT_CV_FOLDER = 'CVs';

/** Common terms for auto-casing */
export const CASING_RULES: Record<string, string> = {
  'github': 'GitHub',
  'linkedin': 'LinkedIn',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'react.js': 'React.js',
  'vue.js': 'Vue.js',
  'node.js': 'Node.js',
  'html5': 'HTML5',
  'css3': 'CSS3',
  'api': 'API',
  'apis': 'APIs',
  'ui': 'UI',
  'ux': 'UX',
  'cli': 'CLI',
  'sql': 'SQL',
  'nosql': 'NoSQL',
  'php': 'PHP',
  'graphql': 'GraphQL',
  'restful': 'RESTful',
  'oauth': 'OAuth',
  'sass': 'Sass',
  'scss': 'SCSS',
  'redux': 'Redux',
  'webpack': 'Webpack',
  'tailwindcss': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'json': 'JSON',
  'saas': 'SaaS',
  'paas': 'PaaS',
  'iaas': 'IaaS',
  'iot': 'IoT',
  'ai': 'AI',
  'ml': 'ML',
  'ar': 'AR',
  'vr': 'VR',
  'aws': 'AWS',
  'gcp': 'GCP',
  'azure': 'Azure',
  'git': 'Git',
  'npm': 'npm',
  'mysql': 'MySQL',
  'css': 'CSS',
  'html': 'HTML',
  'angularjs': 'AngularJS',
  'angular': 'Angular',
  'react': 'React',
  'nodejs': 'Node.js',
  'vue': 'Vue',
};

/**
 * Default template styles
 */
export const DEFAULT_TEMPLATE_STYLES: Record<string, CVTemplateStyle> = {
  default: {
    theme: {
      primaryColor: '#4051b5',
      secondaryColor: '#4051b580',
      textColor: '#333333',
      linkColor: '#4051b5',
      backgroundColor: '#ffffff',
      headingFont: 'Roboto, sans-serif',
      bodyFont: 'Roboto, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.5',
    },
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    spacing: 1.15,
    customCSS: ''
  },
  academic: {
    theme: {
      primaryColor: '#861f41',
      secondaryColor: '#861f4180',
      textColor: '#333333',
      linkColor: '#861f41',
      backgroundColor: '#ffffff',
      headingFont: 'Garamond, serif',
      bodyFont: 'Garamond, serif',
      fontSize: '11pt',
      lineHeight: '1.5',
    },
    margins: {
      top: 25,
      right: 20,
      bottom: 25,
      left: 20
    },
    spacing: 1.2,
    customCSS: ''
  },
  minimal: {
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#555555',
      textColor: '#000000',
      linkColor: '#000000',
      backgroundColor: '#ffffff',
      headingFont: 'Inter, sans-serif',
      bodyFont: 'Inter, sans-serif',
      fontSize: '10.5pt',
      lineHeight: '1.4',
    },
    margins: {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15
    },
    spacing: 1.1,
    customCSS: ''
  },
};

/**
 * Get default CV templates
 */
function getDefaultTemplates(): CVTemplate[] {
  return [
    {
      id: 'default',
      name: 'Default',
      description: 'A clean, professional CV template suitable for most job applications.',
      style: DEFAULT_TEMPLATE_STYLES.default,
      content: `---
title: Professional CV
lastModified: ${Date.now()}
pageSize: A4
margins:
  top: 20
  right: 20
  bottom: 20
  left: 20
themeColor: '#4051b5'
fontFamily: 'Inter, sans-serif'
fontSize: 10
lineHeight: 1.5
tags: [professional, default]
---

# John Doe

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
`
    },
    {
      id: 'academic',
      name: 'Academic CV',
      description: 'A formal template designed for academic and research positions.',
      style: DEFAULT_TEMPLATE_STYLES.academic,
      content: `---
title: Academic CV
lastModified: ${Date.now()}
pageSize: A4
margins:
  top: 25
  right: 20
  bottom: 25
  left: 20
themeColor: '#4051b5'
fontFamily: 'Georgia, serif'
fontSize: 10
lineHeight: 1.5
tags: [academic, research]
---

# Dr. Jane Smith

**Associate Professor of Computer Science** | [jane.smith@university.edu](mailto:jane.smith@university.edu) | [University Profile](https://university.edu/jsmith)

## Research Interests

Machine Learning, Computer Vision, Natural Language Processing, Human-Computer Interaction

## Education

### Ph.D. in Computer Science | Stanford University | 2010 - 2015
- Dissertation: "Deep Learning Approaches to Visual Recognition"
- Advisor: Prof. John Johnson

### M.S. in Computer Science | MIT | 2008 - 2010
- Thesis: "Algorithmic Approaches to Pattern Recognition"

### B.S. in Computer Science | UC Berkeley | 2004 - 2008
- Graduated with High Honors

## Academic Positions

### Associate Professor | University of Washington | 2020 - Present
- Department of Computer Science and Engineering
- Lead the Machine Learning Research Group

### Assistant Professor | Carnegie Mellon University | 2015 - 2020
- School of Computer Science
- Established the Vision and Language Lab

## Publications

### Journal Articles

1. Smith, J., & Johnson, A. (2023). "Transformers for Visual Recognition Tasks." *Journal of Machine Learning Research, 24*(3), 450-475.

2. Smith, J., Brown, B., & Davis, C. (2021). "Self-Supervised Learning for Computer Vision." *IEEE Transactions on Pattern Analysis and Machine Intelligence, 43*(8), 2654-2668.

3. Smith, J., & Wilson, E. (2019). "Attention Mechanisms in Neural Networks." *Neural Computation, 31*(7), 1356-1378.

### Conference Papers

1. Smith, J., & Lee, L. (2022). "Multi-Modal Learning for Document Understanding." In *Proceedings of the Conference on Computer Vision and Pattern Recognition (CVPR)*, 5678-5686.

2. Smith, J., Garcia, M., & Wang, W. (2020). "Efficient Transformers for NLP Tasks." In *Proceedings of the International Conference on Machine Learning (ICML)*, 345-354.

## Grants and Funding

- National Science Foundation, "Advanced Machine Learning for Scientific Discovery," Principal Investigator, $1.2M, 2022-2025
- Google Research Award, "Multimodal Learning," Principal Investigator, $150K, 2021
- Microsoft Research Grant, "Computer Vision Applications," Co-Principal Investigator, $200K, 2019-2021

## Teaching

### University of Washington
- CS 446: Machine Learning (Undergraduate), 2020-Present
- CS 546: Advanced Computer Vision (Graduate), 2021-Present

### Carnegie Mellon University
- 15-780: Graduate Artificial Intelligence, 2016-2020
- 15-462: Computer Vision, 2015-2020

## Professional Service

- Program Committee: CVPR (2018-Present), NeurIPS (2017-Present), ICML (2019-Present)
- Associate Editor: IEEE Transactions on Pattern Analysis and Machine Intelligence (2021-Present)
- Reviewer: Journal of Machine Learning Research, IEEE Transactions on Neural Networks
`
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'A minimalist template with clean typography and balanced whitespace.',
      style: DEFAULT_TEMPLATE_STYLES.minimal,
      content: `---
title: Minimal CV
lastModified: ${Date.now()}
pageSize: A4
margins:
  top: 25
  right: 25
  bottom: 25
  left: 25
themeColor: '#000000'
fontFamily: 'Helvetica, Arial, sans-serif'
fontSize: 10
lineHeight: 1.4
tags: [minimal, clean]
---

# Alex Johnson

[alex@example.com](mailto:alex@example.com) | 555-123-4567 | New York, NY

## Experience

**Senior Product Designer** | Acme Design Co | 2019 - Present
- Led the redesign of flagship product, increasing user engagement by 35%
- Managed a team of 4 designers, establishing design system and workflows
- Conducted user research to inform product decisions

**UX Designer** | Creative Solutions | 2016 - 2019
- Created wireframes, prototypes, and high-fidelity mockups for web and mobile applications
- Collaborated with development team to implement designs
- Improved conversion rates by 22% through iterative design process

## Education

**Bachelor of Fine Arts, Graphic Design** | Rhode Island School of Design | 2012 - 2016

## Skills

Product Design, User Research, Wireframing, Prototyping, Figma, Sketch, Adobe Creative Suite, HTML/CSS
`
    }
  ];
}

/**
 * Regular expressions for parsing CV files
 */
export const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;

/**
 * Initialize and export DEFAULT_SETTINGS after all dependencies are defined
 */
export const DEFAULT_SETTINGS: OhMyCVSettings = {
  defaultPageSize: 'A4',
  defaultMargins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  defaultThemeColor: '#4051b5',
  defaultFontFamily: 'Inter, sans-serif',
  defaultFontSize: 10,
  defaultLineHeight: 1.5,
  enableCustomCss: false,
  defaultCustomCss: '',
  autoCasing: true,
  texSupport: true,
  showPageBreaks: true,
  iconSupport: true,
  googleFontsApiKey: '',
  recentlyUsedFonts: ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'],
  templates: getDefaultTemplates()
};

/**
 * Command IDs
 */
export const COMMANDS = {
  OPEN_CV_EDITOR: 'open-cv-editor',
  OPEN_CV_SIDE_PANEL: 'open-cv-side-panel',
  CREATE_NEW_CV: 'create-new-cv',
  EXPORT_TO_PDF: 'export-to-pdf',
  FORMAT_AS_CV_HEADING: 'format-as-cv-heading'
};
