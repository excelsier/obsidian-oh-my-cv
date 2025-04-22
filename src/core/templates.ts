/**
 * Default CV templates for Oh My CV Obsidian plugin
 * Based on the original Oh My CV project: https://github.com/Renovamen/oh-my-cv
 */

import { CVTemplate, CVTheme, CVTemplateStyle } from './types';

/**
 * Default theme colors
 */
export const DEFAULT_THEMES: Record<string, CVTheme> = {
  classic: {
    primaryColor: '#4051b5',
    secondaryColor: '#4051b580',
    textColor: '#333333',
    linkColor: '#4051b5',
    backgroundColor: '#ffffff',
    headingFont: 'Roboto',
    bodyFont: 'Roboto',
    fontSize: '11pt',
    lineHeight: '1.5',
  },
  modern: {
    primaryColor: '#2d3748',
    secondaryColor: '#4a5568',
    accentColor: '#3182ce',
    textColor: '#1a202c',
    linkColor: '#3182ce',
    backgroundColor: '#ffffff',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    fontSize: '11pt',
    lineHeight: '1.6',
  },
  minimal: {
    primaryColor: '#000000',
    secondaryColor: '#555555',
    textColor: '#000000',
    linkColor: '#000000',
    backgroundColor: '#ffffff',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    fontSize: '10.5pt',
    lineHeight: '1.4',
  },
  academic: {
    primaryColor: '#861f41',
    secondaryColor: '#861f4180',
    textColor: '#333333',
    linkColor: '#861f41',
    backgroundColor: '#ffffff',
    headingFont: 'Merriweather',
    bodyFont: 'Source Sans Pro',
    fontSize: '11pt',
    lineHeight: '1.5',
  },
  creative: {
    primaryColor: '#e53e3e',
    secondaryColor: '#e53e3e80',
    accentColor: '#38a169',
    textColor: '#2d3748',
    linkColor: '#e53e3e',
    backgroundColor: '#ffffff',
    headingFont: 'Poppins',
    bodyFont: 'Nunito',
    fontSize: '11pt',
    lineHeight: '1.6',
  },
};

/**
 * Default margin settings (in mm)
 */
export const DEFAULT_MARGINS = {
  standard: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  narrow: {
    top: 15,
    right: 15,
    bottom: 15,
    left: 15,
  },
  wide: {
    top: 25,
    right: 25,
    bottom: 25,
    left: 25,
  },
  academic: {
    top: 25,
    right: 25,
    bottom: 25,
    left: 25,
  },
};

/**
 * Classic Professional CV Template
 */
export const CLASSIC_PROFESSIONAL_TEMPLATE: CVTemplate = {
  id: 'classic-professional',
  name: 'Classic Professional',
  description: 'A clean, traditional CV template suitable for most professional fields',
  category: 'Professional',
  tags: ['classic', 'formal', 'traditional'],
  style: {
    theme: DEFAULT_THEMES.classic,
    margins: DEFAULT_MARGINS.standard,
    spacing: 1.15,
  },
  content: `# Your Name
## Professional Title

Experienced professional with a passion for excellence and a track record of delivering results. Skilled in [your key skills] with [X] years of experience in [your industry].

## Skills

- **Technical Skills:** Skill 1, Skill 2, Skill 3
- **Soft Skills:** Communication, Leadership, Problem-solving
- **Languages:** English (Fluent), [Other Languages]
- **Certifications:** [Your Certifications]

## Experience

### Job Title at Company Name
\\daterange{Month Year}{Present or End Month Year}

- Accomplishment 1 that demonstrates your skills and impact
- Accomplishment 2 with measurable results (e.g., increased efficiency by X%)
- Accomplishment 3 showing leadership or innovation

### Previous Job Title at Company Name
\\daterange{Month Year}{Month Year}

- Key responsibility or achievement with specific examples
- Notable project or initiative you led or contributed to
- Relevant accomplishment with quantifiable results

## Education

### Degree Name
\\daterange{Year}{Year}
University Name, Location

- Relevant coursework: Course 1, Course 2
- GPA: X.X/4.0 (if applicable and impressive)
- Academic awards or honors (if applicable)

## Projects

### Project Name
- Brief description of the project and your role
- Technologies or methodologies used
- Outcome or impact of the project

## Contact Information

- Email: your.email@example.com
- Phone: (123) 456-7890
- LinkedIn: linkedin.com/in/yourprofile
- Portfolio: yourportfolio.com`,
};

/**
 * Modern Minimal CV Template
 */
export const MODERN_MINIMAL_TEMPLATE: CVTemplate = {
  id: 'modern-minimal',
  name: 'Modern Minimal',
  description: 'A sleek, minimalist template with clean typography and streamlined layout',
  category: 'Professional',
  tags: ['minimal', 'modern', 'clean'],
  style: {
    theme: DEFAULT_THEMES.minimal,
    margins: DEFAULT_MARGINS.narrow,
    spacing: 1.2,
  },
  content: `# Your Name

\\cvtag{Email} \\cvtag{Phone} \\cvtag{Location} \\cvtag{LinkedIn} \\cvtag{Website}

Professional with expertise in [key skill areas]. Focused on [your value proposition or professional philosophy].

## Experience

### Senior Position · Company Name
\\daterange{2020}{Present}

- Key achievement with measurable impact
- Significant responsibility highlighting leadership
- Notable project demonstrating technical expertise

### Junior Position · Previous Company
\\daterange{2017}{2020}

- Relevant accomplishment showing growth
- Project or initiative that delivered results
- Skill development or recognition received

## Skills

\\cvskill{Skill Category 1}{90}
\\cvskill{Skill Category 2}{85}
\\cvskill{Skill Category 3}{75}
\\cvskill{Skill Category 4}{80}

## Education

### Degree · University
\\daterange{2013}{2017}

Relevant honors, focus areas, or thesis topic.

## Projects

### Key Project 1
Brief description highlighting your role and impact.

### Key Project 2
Technologies used and outcomes achieved.

\\textsc{References available upon request}`,
};

/**
 * Academic CV Template
 */
export const ACADEMIC_CV_TEMPLATE: CVTemplate = {
  id: 'academic',
  name: 'Academic CV',
  description: 'Comprehensive template for academic positions, research roles, and grant applications',
  category: 'Academic',
  tags: ['academic', 'research', 'formal'],
  style: {
    theme: DEFAULT_THEMES.academic,
    margins: DEFAULT_MARGINS.academic,
    spacing: 1.2,
  },
  content: `# Your Name, Ph.D.
## Research Area or Academic Position

\\cvtag{Department} \\cvtag{Institution} \\cvtag{Email} \\cvtag{Phone} \\cvtag{ORCID}

## Education

### Ph.D. in Field
\\daterange{Year}{Year}
University Name, Location
- Dissertation: "Title of Your Dissertation"
- Advisor: Professor Name
- Committee: Professor Names

### Master's in Field
\\daterange{Year}{Year}
University Name, Location
- Thesis: "Title of Your Thesis"

### Bachelor's in Field
\\daterange{Year}{Year}
University Name, Location

## Research Experience

### Position Title
\\daterange{Year}{Present or Year}
Institution, Department, Location
- Research focus and key contributions
- Methodologies developed or applied
- Significant findings or outcomes

## Publications

### Peer-Reviewed Journal Articles

1. Author, A., Author, B., & **Your Name**. (Year). Title of the article. *Journal Name*, Volume(Issue), Pages. doi:number
2. **Your Name**, Author, C., & Author, D. (Year). Title of the article. *Journal Name*, Volume(Issue), Pages. doi:number

### Conference Proceedings

1. **Your Name**, & Author, E. (Year). Title of the paper. In *Proceedings of Conference Name* (pp. Pages). Location: Publisher.

## Teaching Experience

### Course Title
\\daterange{Semester Year}{Semester Year}
Institution, Department
- Brief description of responsibilities and teaching methods
- Student evaluations or teaching achievements

## Grants and Funding

- Grant Name, Funding Agency, Amount, Year(s)
- Fellowship Name, Institution, Year(s)

## Professional Service

- Reviewer for Journal Names
- Committee memberships
- Conference organization roles

## Skills

- **Research Methods:** Method 1, Method 2, Method 3
- **Technical Skills:** Skill 1, Skill 2, Skill 3
- **Languages:** Language 1 (Proficiency), Language 2 (Proficiency)

\\newpage

## References

1. **Professor Name**  
   Position  
   Institution  
   Email  
   Phone

2. **Professor Name**  
   Position  
   Institution  
   Email  
   Phone`,
};

/**
 * Creative Professional Template
 */
export const CREATIVE_PROFESSIONAL_TEMPLATE: CVTemplate = {
  id: 'creative-professional',
  name: 'Creative Professional',
  description: 'A modern template with visual flair for creative industries',
  category: 'Creative',
  tags: ['creative', 'modern', 'colorful'],
  style: {
    theme: DEFAULT_THEMES.creative,
    margins: DEFAULT_MARGINS.standard,
    spacing: 1.3,
    customCSS: `.oh-my-cv-skill-level { 
      background: linear-gradient(90deg, #e53e3e 0%, #38a169 100%); 
      height: 6px;
      border-radius: 3px;
    }
    .oh-my-cv-tag {
      background-color: #e53e3e20;
      border-left: 3px solid #e53e3e;
    }`,
  },
  content: `# Your Name
## Creative Professional

\\cvtag{Design} \\cvtag{Branding} \\cvtag{Digital Media} \\cvtag{UI/UX} \\cvtag{Strategy}

Creative professional with a passion for innovative design and compelling storytelling. Experienced in translating client visions into impactful visual solutions.

## Professional Skills

\\cvskill{Design Software}{95}
\\cvskill{Visual Communication}{90}
\\cvskill{UI/UX Design}{85}
\\cvskill{Branding Strategy}{80}
\\cvskill{Client Management}{75}

## Experience

### Senior Designer at Creative Studio
\\daterange{2019}{Present}

- Led redesign projects for 5+ major brands, increasing client engagement by 40%
- Developed comprehensive brand identity systems for startups and established companies
- Collaborated with cross-functional teams to deliver integrated marketing campaigns
- Mentored junior designers and facilitated creative workshops

### Designer at Agency Name
\\daterange{2016}{2019}

- Created digital assets for web, social media, and advertising platforms
- Contributed to award-winning campaigns for national clients
- Improved production workflow, reducing turnaround time by 30%

## Education

### BFA in Graphic Design
\\daterange{2012}{2016}
Art Institute, Location

- Graduated with honors
- Specialization in Digital Media
- Senior Portfolio: "Project Title"

## Selected Projects

### Project Name
Client: Client Name
- Scope: Rebranding, Website Design, Collateral
- Role: Lead Designer
- Outcome: 35% increase in brand recognition metrics

### Project Name
Client: Client Name
- Comprehensive campaign across multiple platforms
- Collaborative project with marketing and development teams

## Awards & Recognition

- Design Award Name, Year
- Industry Recognition, Year
- Featured in Publication Name

## Contact

Portfolio: www.yourportfolio.com  
Email: your.email@example.com  
Instagram: @yourhandle`,
};

/**
 * All default templates
 */
export const DEFAULT_TEMPLATES: CVTemplate[] = [
  CLASSIC_PROFESSIONAL_TEMPLATE,
  MODERN_MINIMAL_TEMPLATE,
  ACADEMIC_CV_TEMPLATE,
  CREATIVE_PROFESSIONAL_TEMPLATE,
];

/**
 * Get a template by ID
 * @param id Template ID
 * @returns The template or undefined if not found
 */
export function getTemplateById(id: string): CVTemplate | undefined {
  return DEFAULT_TEMPLATES.find(template => template.id === id);
}

/**
 * Get templates by category
 * @param category Template category
 * @returns Array of templates in the category
 */
export function getTemplatesByCategory(category: string): CVTemplate[] {
  return DEFAULT_TEMPLATES.filter(template => template.category === category);
}

/**
 * Get templates by tag
 * @param tag Template tag
 * @returns Array of templates with the tag
 */
export function getTemplatesByTag(tag: string): CVTemplate[] {
  return DEFAULT_TEMPLATES.filter(template => template.tags?.includes(tag));
}
