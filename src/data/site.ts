import type { DeepWiden, Lang } from '../lib/types';

export const personal = {
  name: 'Angel Cánovas',
  fullName: 'Angel Cánovas Mula',
  email: 'aca_dev@hotmail.com',
  github: 'https://github.com/AngelCanovas',
  githubHandle: 'AngelCanovas',
  linkedin: 'https://www.linkedin.com/in/angel-c%C3%A1novas-mula-5a49a72a9',
  address: {
    locality: 'Murcia',
    region: 'Murcia',
    country: 'ES',
  },
  companyUrls: {
    Capgemini: 'https://www.capgemini.com',
  },
} as const;

export const siteMeta: Record<
  Lang,
  { htmlLang: string; title: string; description: string; ogLocale: string }
> = {
  en: {
    htmlLang: 'en',
    title: 'Angel Cánovas Mula — CV',
    description:
      'Full-Stack Java Engineer, 5+ years at Capgemini building secure enterprise apps for the French Ministry of Education. Spring Boot, Angular.',
    ogLocale: 'en_US',
  },
  es: {
    htmlLang: 'es',
    title: 'Angel Cánovas Mula — CV',
    description:
      'Ingeniero Full-Stack Java: 5+ años en Capgemini con aplicaciones seguras para el Ministerio de Educación francés. Spring Boot, Angular.',
    ogLocale: 'es_ES',
  },
};

const en = {
  nav: {
    home: 'Home',
    about: 'About',
    skills: 'Skills',
    resume: 'Resume',
    portfolio: 'Portfolio',
    services: 'Services',
    notes: 'Notes',
    contact: 'Contact',
    toggleLabel: 'Toggle navigation',
    languageLabel: 'Language',
    themeToLight: 'Switch to light theme',
    themeToDark: 'Switch to dark theme',
  },
  hero: {
    eyebrow: "Hello, I'm",
    availability: 'Available for remote roles',
    roles: [
      'Full-Stack Java Engineer',
      'Secure Software Engineer',
      'Cybersecurity-Trained Developer',
    ],
    headline:
      'Spring Boot · Spring Security · Angular · Secure enterprise applications · Cybersecurity-trained',
    ctaContact: 'Get in touch',
    ctaResume: 'View resume',
    ctaCv: 'Download CV',
  },
  stats: {
    items: [
      { value: 5, suffix: '+', label: 'Years of experience', decimals: 0 },
      { value: 10000, suffix: '+', label: 'Students impacted', decimals: 0 },
      { value: 4.23, suffix: '/5', label: 'Client satisfaction', decimals: 2 },
      { value: 2, suffix: '', label: 'National platforms', decimals: 0 },
    ],
  },
  about: {
    title: 'About',
    summary:
      'Full-stack Java engineer with 5+ years at Capgemini on enterprise web applications for the French Ministry of National Education — notably Livret de Parcours Inclusif (LPI) and Faits Établissement — used nationwide by teaching staff and administration. Day to day: Java, Spring Boot, Spring Security, JPA/Hibernate, Thymeleaf and Angular, on IBM DB2, with the full application lifecycle (new features, corrective maintenance, MCO/application support, hotfixes, releases, database migrations, batch processes and document generation).',
    secureSummary:
      'Over the last year I have moved my profile towards secure software development: authentication with SAML2, role-based access control, CSRF protection, secure cookies, session management, code hardening and vulnerability remediation following a technical security audit of an application used by the French Ministry of National Education. In 2025 I completed the official Specialisation Course (Máster de FP) in Cybersecurity for IT Environments, with a grade of 8.83/10.',
    languages:
      'I work in English and French on a daily basis (English C1, French B1) and I am looking for a 100 % remote role in backend/full-stack Java or secure enterprise applications, in an international team.',
    meta: {
      location: 'Location',
      workModel: 'Work model',
      email: 'Email',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      linkedinValue: 'Angel Cánovas Mula on LinkedIn',
    },
    role: 'Full-Stack Java Engineer',
    location: 'Murcia, Spain',
    workModel: '100% remote (CET)',
    homeLab: {
      title: 'Home Lab / Self-hosted Systems',
      intro: 'I also practise on my own infrastructure what I do not get to touch at work:',
      points: [
        'I provision and operate my own Linux servers — cloud instances and hardware at home — with containers, VPN and SSH tunnelling, security hardening and resource tuning on deliberately small machines.',
        'I run self-hosted network services and have experimented with local language models, which has given me practical judgement on operations rather than only on development.',
        'Happy to go into the specifics in an interview.',
      ],
    },
  },
  skills: {
    title: 'Skills',
    subtitle: 'Skills and technologies from the CV, grouped by area of expertise.',
    groups: [
      {
        icon: 'code-slash',
        title: 'Core',
        description: 'Languages, frameworks and tooling I use every day.',
        skills: [
          'Java',
          'Spring Boot',
          'Spring Security',
          'JPA/Hibernate',
          'REST APIs',
          'Angular',
          'TypeScript',
          'JavaScript',
          'HTML5',
          'CSS3',
          'SQL',
          'IBM DB2',
          'MySQL',
          'PostgreSQL',
          'MariaDB',
          'Git',
          'GitLab',
          'Maven',
          'Docker',
          'Linux',
          'Scrum',
          'SAFe',
        ],
      },
      {
        icon: 'shield-lock',
        title: 'Secure development',
        description: 'Hardening enterprise applications against real-world threats.',
        skills: [
          'SAML2',
          'Access control',
          'CSRF',
          'Secure cookies',
          'Session management',
          'Code hardening',
          'Vulnerability remediation',
          'Secure deployment',
          'Network security',
        ],
      },
      {
        icon: 'headset',
        title: 'Testing & support',
        description: 'Keeping critical systems stable in production.',
        skills: [
          'Postman',
          'API testing',
          'Spock tooling',
          'Production monitoring',
          'Incident troubleshooting',
          'Jira',
          'Confluence',
        ],
      },
      {
        icon: 'robot',
        title: 'AI-assisted engineering',
        description: 'AI tools that speed up delivery, always reviewed by hand.',
        skills: [
          'OpenCode',
          'GitHub Copilot',
          'Code analysis',
          'Documentation',
          'Test preparation',
          'Manual review',
        ],
      },
      {
        icon: 'tools',
        title: 'Also used',
        description: 'Additional technologies from the CV.',
        skills: [
          'Thymeleaf',
          'JSP',
          'JBoss',
          'Tomcat',
          'Elasticsearch',
          'Node.js',
          'PHP',
          'Laravel',
          'Python',
          'Vue.js',
          'Liquibase',
          'Microservices',
          'Hexagonal architecture',
          'UML',
          'Unit testing',
          '.NET / C#',
          'PowerShell',
          'Bash',
          'Jenkins',
        ],
      },
    ],
  },
  resume: {
    title: 'Resume',
    subtitle:
      'Full-stack Java engineer with a recent specialisation in cybersecurity, focused on secure enterprise applications and international delivery.',
    experienceTitle: 'Professional Experience',
    educationTitle: 'Education',
    certificationsTitle: 'Certifications',
    languagesTitle: 'Languages',
    downloadCv: 'Download CV (PDF)',
    onlineCv: 'Online CV',
    experience: [
      {
        title: 'Software Engineer',
        company: 'Capgemini',
        location: 'Murcia, Spain',
        period: 'Jun 2021 — present',
        context:
          'Full-stack Java developer · French Ministry of National Education · Livret de Parcours Inclusif, Faits Établissement',
        highlights: [
          'Main developer of several features on a key educational platform, one of them directly improving accessibility for students with special needs across France.',
          'Took part in the migration of the production database from MySQL to IBM DB2, improving efficiency, reliability and scalability, with changes managed through Liquibase.',
          'Security remediation on findings from a technical audit of a Ministry of National Education application: access control, session management, secure cookies, CSRF and code hardening.',
          'Helped raise customer satisfaction from 3.5 to 4.23 / 5 in the first year through proactive issue resolution and consistent delivery quality.',
          'Onboarded and mentored 2 new team members with functional and technical training and troubleshooting support.',
          'Resolved 1-2 production blockers per month in a team of about 10 people serving thousands of active users.',
        ],
        stack: [
          'Java',
          'Spring Boot',
          'Spring Security',
          'JPA/Hibernate',
          'Thymeleaf',
          'Angular',
          'TypeScript',
          'IBM DB2',
          'MySQL',
          'Liquibase',
          'GitLab',
          'Jira/Confluence',
          'Scrum / SAFe',
        ],
        assignments: [
          {
            title: 'API testing & production support · Telia Sweden / Finland',
            details: [
              "API testing with Postman and with the client's internal Spock-based test tooling.",
              'Production monitoring and B2B incident troubleshooting to keep critical telecom services running and stable.',
            ],
          },
        ],
      },
      {
        title: 'Junior Java Programmer (internship)',
        company: 'Capgemini',
        location: 'Murcia, Spain',
        period: 'Mar 2021 — May 2021',
        context: 'French Ministry of Culture',
        highlights: [
          "Delivered enhancements to the ministry's cultural-events reporting application, improving data accuracy and report generation.",
        ],
        stack: [],
        assignments: [],
      },
    ],
    education: [
      {
        degree: 'Specialisation Course in Cybersecurity for IT Environments',
        school: 'IES Ingeniero de la Cierva',
        period: '2024 — 2025',
        detail: 'Official vocational-education postgraduate qualification · Grade: 8.83 / 10',
      },
      {
        degree: 'Higher Vocational Diploma in Multiplatform Application Development (EQF 5)',
        school: 'IES Ingeniero de la Cierva',
        period: '2020 — 2021',
        detail:
          'First year credited from the Web Development diploma, as both were studied consecutively',
      },
      {
        degree: 'Higher Vocational Diploma in Web Application Development (EQF 5)',
        school: 'IES Ingeniero de la Cierva',
        period: '2018 — 2020',
        detail: '',
      },
      {
        degree: 'English C1',
        school: 'EOI Cartagena',
        period: '2022 — 2023',
        detail: '',
      },
    ],
    certifications: [
      'AWS Academy Cloud Foundations — Amazon Web Services',
      'Generative AI on AWS Essentials (Discover IaaS Products) — AWS / Capgemini',
      'ACTIVATE AI Foundation Badge — Capgemini',
    ],
    languages: [
      { language: 'Spanish', level: 'Native' },
      {
        language: 'English',
        level: 'C1 — daily working language for 5 years; interviews in English',
      },
      {
        language: 'French',
        level: 'B1 — daily written and spoken work with French public-sector clients',
      },
    ],
  },
  portfolio: {
    title: 'Portfolio',
    subtitle:
      'A selection of projects and initiatives I have contributed to across public-sector platforms, security hardening and personal learning.',
    filtersLabel: 'Filter projects',
    allLabel: 'All',
    categories: [
      { key: 'app', label: 'Applications' },
      { key: 'security', label: 'Security' },
      { key: 'infra', label: 'Infrastructure' },
      { key: 'web', label: 'Web' },
    ],
    categoryLabels: {
      app: 'Application',
      security: 'Security',
      infra: 'Infrastructure',
      web: 'Web',
    } as Record<string, string>,
    featuredLabel: 'Featured',
    viewProject: 'View project',
    empty: 'No projects in this category yet.',
    filterStatus: '{shown} of {total} projects shown',
    caseStudyLabel: 'Case study',
    caseStudyProblem: 'Problem',
    caseStudyApproach: 'Approach',
    caseStudyImpact: 'Impact',
    projects: [
      {
        title: 'Livret de Parcours Inclusif (LPI)',
        category: 'app',
        featured: true,
        description:
          'French Ministry of National Education application used nationwide by teaching staff to support students with special needs.',
        tags: ['Java', 'Spring Boot', 'Thymeleaf', 'IBM DB2'],
        caseStudy: {
          problem:
            'Teachers needed a faster, consistent way to document and share support plans for students with special needs.',
          approach:
            'Built new Spring Boot and Thymeleaf features on the national platform, working from functional specifications with the ministry and the product team.',
          impact:
            'The main feature I delivered improved accessibility for students with special needs across France.',
        },
        link: '',
      },
      {
        title: 'Faits Établissement',
        category: 'app',
        featured: false,
        description:
          'National-scope incident-reporting platform for French schools and administration.',
        tags: ['Java', 'Spring Boot', 'Angular'],
        caseStudy: {
          problem:
            'Schools and administration needed one reliable national channel to report and track incidents.',
          approach:
            'Full-stack Java and Angular development, plus corrective maintenance and production support on a national-scope application.',
          impact:
            'Incident reporting became consistent, traceable and stable for schools nationwide.',
        },
        link: '',
      },
      {
        title: 'MySQL to IBM DB2 Migration',
        category: 'infra',
        featured: true,
        description:
          'Production database migration for a Ministry application, improving efficiency, reliability and scalability with Liquibase-managed changes.',
        tags: ['IBM DB2', 'MySQL', 'Liquibase'],
        caseStudy: {
          problem:
            'Move a live national service from MySQL to IBM DB2 without interrupting its users.',
          approach:
            'Migrated the schema and data with Liquibase-managed changes, adapting queries and verifying behaviour on DB2.',
          impact:
            'Better efficiency, reliability and scalability, with database changes versioned and repeatable.',
        },
        link: '',
      },
      {
        title: 'Security Audit Remediation',
        category: 'security',
        featured: true,
        description:
          'Vulnerability remediation after a technical security audit: access control, session management, secure cookies, CSRF and code hardening.',
        tags: ['Spring Security', 'SAML2', 'CSRF'],
        caseStudy: {
          problem: 'A technical security audit flagged weaknesses in an application in production.',
          approach:
            'Fixed access control, session management, secure cookies and CSRF issues, and hardened the codebase together with the team.',
          impact: 'Findings remediated and secure patterns applied across the application.',
        },
        link: '',
      },
      {
        title: 'Self-hosted Home Lab',
        category: 'infra',
        featured: false,
        description:
          'Linux servers, containers, VPN, SSH tunnelling, security hardening and local language models for continuous learning.',
        tags: ['Linux', 'Docker', 'VPN'],
        caseStudy: {
          problem: 'I wanted hands-on operations experience beyond day-to-day development work.',
          approach:
            'Provision and operate Linux servers on cloud and home hardware with containers, VPN, SSH tunnelling and security hardening.',
          impact:
            'Practical judgement on operations, monitoring and security on deliberately constrained machines.',
        },
        link: personal.github,
      },
      {
        title: 'Portfolio Website',
        category: 'web',
        featured: false,
        description:
          'This Astro-built personal portfolio: fast, static, SEO-friendly and accessibility-aware.',
        tags: ['Astro', 'TypeScript', 'Bootstrap'],
        caseStudy: {
          problem:
            'Build a static portfolio that stays fast and accessible without framework bloat.',
          approach:
            'Astro with a layered architecture (pure lib + typed client modules), hashed CSP, WCAG AA contrast and automated unit/E2E tests.',
          impact:
            'Lighthouse 100 in accessibility, best practices and SEO, with zero CSP violations.',
        },
        link: `${personal.github}/AngelCanovas.github.io`,
      },
    ],
  },
  quote: {
    ariaLabel: 'Quote of the moment',
    heading: 'Quote of the moment',
    pause: 'Pause quote rotation',
    resume: 'Resume quote rotation',
  },
  ui: {
    skipLink: 'Skip to main content',
    scrollTop: 'Scroll to top',
    photoAlt: 'professional photo',
    avatarAlt: 'profile photo',
    ogImageAlt: 'portrait and professional role as a preview card',
    toastCopied: 'Email copied: {email}',
    newTab: '(opens in a new tab)',
  },
  cv: {
    summary: 'Professional summary',
    download: 'Download CV (PDF)',
    generate: 'Print / Save as PDF',
    back: 'Back to portfolio',
    switchLabel: 'Ver en español',
    updated: 'Generated from the live portfolio',
    stack: 'Stack',
    assignment: 'Assignment',
  },
  services: {
    title: 'Services',
    subtitle:
      'Ways I can help your team deliver secure, maintainable software and keep critical systems running.',
    items: [
      {
        icon: 'code-slash',
        number: '01',
        title: 'Full-Stack Java Development',
        description:
          'Enterprise web applications with Java, Spring Boot, Spring Security, JPA/Hibernate, Thymeleaf and Angular.',
        points: [
          'Java & Spring Boot applications',
          'Angular front-ends + REST APIs',
          'JPA/Hibernate & relational databases',
        ],
      },
      {
        icon: 'shield-check',
        number: '02',
        title: 'Secure Software Engineering',
        description:
          'Building security into the application lifecycle, from authentication to deployment.',
        points: [
          'SAML2 & role-based access control',
          'CSRF, secure cookies & sessions',
          'Vulnerability remediation & hardening',
        ],
      },
      {
        icon: 'life-preserver',
        number: '03',
        title: 'Application Support & MCO',
        description:
          'Keeping critical systems running with reliable maintenance and fast incident resolution.',
        points: [
          'Production monitoring & hotfixes',
          'Releases & database migrations',
          'Batch processes & document generation',
        ],
      },
      {
        icon: 'cloud',
        number: '04',
        title: 'DevOps, Cloud & Home Lab',
        description:
          'Operational experience with containers, CI/CD, cloud foundations and self-hosted systems.',
        points: ['Docker, Linux & CI/CD', 'AWS Cloud Foundations', 'Self-hosted infra & hardening'],
      },
      {
        icon: 'robot',
        number: '05',
        title: 'AI-Assisted Engineering',
        description:
          'Using AI tools to move faster without giving up quality, security or code ownership.',
        points: [
          'OpenCode & GitHub Copilot',
          'Code analysis & documentation',
          'Manual review & security awareness',
        ],
      },
      {
        icon: 'translate',
        number: '06',
        title: 'International Collaboration',
        description:
          'Comfortable in distributed teams and multilingual, public-sector environments.',
        points: [
          'English C1 · French B1',
          'Agile Scrum / SAFe teams',
          'French public-sector clients',
        ],
      },
    ],
  },
  notes: {
    enabled: false,
    title: 'Technical notes',
    subtitle: 'Occasional notes on secure development and enterprise engineering.',
    readingTimeLabel: 'min read',
    items: [] as readonly { title: string; tags: readonly string[]; body: readonly string[] }[],
  },
  contact: {
    title: 'Contact',
    subtitle: 'First contact by LinkedIn or email. References available on request.',
    cta: 'Email me',
    copyEmail: 'Copy email address',
    channels: {
      email: 'Email',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      location: 'Location',
      locationValue: 'Murcia, Spain · 100% remote (CET)',
    },
  },
  footer: {
    rights: 'All rights reserved.',
    creditsPrefix: 'Built with',
    noticesLabel: 'Third-party licenses',
  },
  fun: {
    htmlComment:
      "Psst — reading the source? We'd probably get along. There's a hidden message in the console and a Konami code waiting: ↑ ↑ ↓ ↓ ← → ← → B A",
    consoleMessage:
      "Hey, curious developer! You found the hidden message. If you read source code for fun, you're exactly the kind of person I like working with.",
  },
} as const;

const es = {
  nav: {
    home: 'Inicio',
    about: 'Sobre mí',
    skills: 'Habilidades',
    resume: 'Currículum',
    portfolio: 'Portafolio',
    services: 'Servicios',
    notes: 'Notas',
    contact: 'Contacto',
    toggleLabel: 'Abrir menú de navegación',
    languageLabel: 'Idioma',
    themeToLight: 'Cambiar a tema claro',
    themeToDark: 'Cambiar a tema oscuro',
  },
  hero: {
    eyebrow: 'Hola, soy',
    availability: 'Disponible para puestos en remoto',
    roles: [
      'Ingeniero Full-Stack Java',
      'Ingeniero de Software Seguro',
      'Desarrollador con Formación en Ciberseguridad',
    ],
    headline:
      'Spring Boot · Spring Security · Angular · Aplicaciones empresariales seguras · Formación en ciberseguridad',
    ctaContact: 'Contacta conmigo',
    ctaResume: 'Ver currículum',
    ctaCv: 'Descargar CV',
  },
  stats: {
    items: [
      { value: 5, suffix: '+', label: 'Años de experiencia', decimals: 0 },
      { value: 10000, suffix: '+', label: 'Alumnos impactados', decimals: 0 },
      { value: 4.23, suffix: '/5', label: 'Satisfacción del cliente', decimals: 2 },
      { value: 2, suffix: '', label: 'Plataformas nacionales', decimals: 0 },
    ],
  },
  about: {
    title: 'Sobre mí',
    summary:
      'Ingeniero Full-Stack Java con más de 5 años en Capgemini desarrollando aplicaciones web empresariales para el Ministerio de Educación Nacional de Francia — en particular Livret de Parcours Inclusif (LPI) y Faits Établissement — usadas a nivel nacional por personal docente y administrativo. En el día a día: Java, Spring Boot, Spring Security, JPA/Hibernate, Thymeleaf y Angular, sobre IBM DB2, con todo el ciclo de vida de la aplicación (nuevas funcionalidades, mantenimiento correctivo, MCO/soporte, hotfixes, releases, migraciones de base de datos, procesos batch y generación de documentos).',
    secureSummary:
      'Durante el último año he orientado mi perfil hacia el desarrollo seguro: autenticación con SAML2, control de acceso basado en roles, protección CSRF, cookies seguras, gestión de sesiones, endurecimiento de código y remediación de vulnerabilidades tras una auditoría técnica de seguridad de una aplicación del Ministerio de Educación Nacional de Francia. En 2025 completé el Curso de Especialización (Máster de FP) oficial en Ciberseguridad en Entornos de las Tecnologías de la Información, con una nota de 8,83/10.',
    languages:
      'Trabajo en inglés y francés a diario (inglés C1, francés B1) y busco un puesto 100 % en remoto en backend/full-stack Java o aplicaciones empresariales seguras, en un equipo internacional.',
    meta: {
      location: 'Ubicación',
      workModel: 'Modalidad',
      email: 'Email',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      linkedinValue: 'Angel Cánovas Mula en LinkedIn',
    },
    role: 'Ingeniero Full-Stack Java',
    location: 'Murcia, España',
    workModel: '100 % en remoto (CET)',
    homeLab: {
      title: 'Laboratorio propio / Sistemas autoalojados',
      intro: 'También practico en mi propia infraestructura lo que no llego a tocar en el trabajo:',
      points: [
        'Aprovisiono y opero mis propios servidores Linux — instancias cloud y hardware en casa — con contenedores, VPN y túneles SSH, endurecimiento de seguridad y ajuste de recursos en máquinas deliberadamente modestas.',
        'Ejecuto servicios de red autoalojados y he experimentado con modelos de lenguaje locales, lo que me ha dado criterio práctico sobre operación, no solo sobre desarrollo.',
        'Encantado de entrar en detalles en una entrevista.',
      ],
    },
  },
  skills: {
    title: 'Habilidades',
    subtitle: 'Habilidades y tecnologías del CV, agrupadas por área de especialización.',
    groups: [
      {
        icon: 'code-slash',
        title: 'Principal',
        description: 'Lenguajes, frameworks y herramientas que uso a diario.',
        skills: [
          'Java',
          'Spring Boot',
          'Spring Security',
          'JPA/Hibernate',
          'REST APIs',
          'Angular',
          'TypeScript',
          'JavaScript',
          'HTML5',
          'CSS3',
          'SQL',
          'IBM DB2',
          'MySQL',
          'PostgreSQL',
          'MariaDB',
          'Git',
          'GitLab',
          'Maven',
          'Docker',
          'Linux',
          'Scrum',
          'SAFe',
        ],
      },
      {
        icon: 'shield-lock',
        title: 'Desarrollo seguro',
        description: 'Endurecer aplicaciones empresariales frente a amenazas reales.',
        skills: [
          'SAML2',
          'Control de acceso',
          'CSRF',
          'Cookies seguras',
          'Gestión de sesiones',
          'Endurecimiento de código',
          'Remediación de vulnerabilidades',
          'Despliegue seguro',
          'Seguridad de red',
        ],
      },
      {
        icon: 'headset',
        title: 'Testing y soporte',
        description: 'Mantener sistemas críticos estables en producción.',
        skills: [
          'Postman',
          'Pruebas de API',
          'Herramientas Spock',
          'Monitorización en producción',
          'Resolución de incidentes',
          'Jira',
          'Confluence',
        ],
      },
      {
        icon: 'robot',
        title: 'Ingeniería asistida por IA',
        description: 'Herramientas de IA que aceleran la entrega, siempre revisadas a mano.',
        skills: [
          'OpenCode',
          'GitHub Copilot',
          'Análisis de código',
          'Documentación',
          'Preparación de tests',
          'Revisión manual',
        ],
      },
      {
        icon: 'tools',
        title: 'También usado',
        description: 'Tecnologías adicionales del CV.',
        skills: [
          'Thymeleaf',
          'JSP',
          'JBoss',
          'Tomcat',
          'Elasticsearch',
          'Node.js',
          'PHP',
          'Laravel',
          'Python',
          'Vue.js',
          'Liquibase',
          'Microservicios',
          'Arquitectura hexagonal',
          'UML',
          'Testing unitario',
          '.NET / C#',
          'PowerShell',
          'Bash',
          'Jenkins',
        ],
      },
    ],
  },
  resume: {
    title: 'Currículum',
    subtitle:
      'Ingeniero Full-Stack Java con una especialización reciente en ciberseguridad, centrado en aplicaciones empresariales seguras y entrega internacional.',
    experienceTitle: 'Experiencia profesional',
    educationTitle: 'Formación',
    certificationsTitle: 'Certificaciones',
    languagesTitle: 'Idiomas',
    downloadCv: 'Descargar CV (PDF)',
    onlineCv: 'CV online',
    experience: [
      {
        title: 'Ingeniero de Software',
        company: 'Capgemini',
        location: 'Murcia, España',
        period: 'Jun 2021 — actualidad',
        context:
          'Desarrollador Full-Stack Java · Ministerio de Educación Nacional de Francia · Livret de Parcours Inclusif, Faits Établissement',
        highlights: [
          'Desarrollador principal de varias funcionalidades en una plataforma educativa clave, una de ellas mejorando directamente la accesibilidad para alumnado con necesidades especiales en toda Francia.',
          'Participé en la migración de la base de datos de producción de MySQL a IBM DB2, mejorando eficiencia, fiabilidad y escalabilidad, con cambios gestionados mediante Liquibase.',
          'Remediación de seguridad sobre los hallazgos de una auditoría técnica de una aplicación del Ministerio de Educación Nacional: control de acceso, gestión de sesiones, cookies seguras, CSRF y endurecimiento de código.',
          'Contribuí a elevar la satisfacción del cliente de 3,5 a 4,23 / 5 en el primer año mediante una resolución proactiva de incidencias y una entrega constante.',
          'Incorporé y mentoré a 2 nuevos miembros del equipo con formación funcional y técnica y apoyo en la resolución de problemas.',
          'Resolví 1-2 bloqueos de producción al mes en un equipo de unas 10 personas con miles de usuarios activos.',
        ],
        stack: [
          'Java',
          'Spring Boot',
          'Spring Security',
          'JPA/Hibernate',
          'Thymeleaf',
          'Angular',
          'TypeScript',
          'IBM DB2',
          'MySQL',
          'Liquibase',
          'GitLab',
          'Jira/Confluence',
          'Scrum / SAFe',
        ],
        assignments: [
          {
            title: 'Pruebas de API y soporte en producción · Telia Suecia / Finlandia',
            details: [
              'Pruebas de API con Postman y con la herramienta interna de testing basada en Spock del cliente.',
              'Monitorización en producción y resolución de incidentes B2B para mantener servicios de telecomunicaciones críticos estables.',
            ],
          },
        ],
      },
      {
        title: 'Programador Java Junior (prácticas)',
        company: 'Capgemini',
        location: 'Murcia, España',
        period: 'Mar 2021 — May 2021',
        context: 'Ministerio de Cultura de Francia',
        highlights: [
          'Entregué mejoras en la aplicación de informes de eventos culturales del ministerio, mejorando la precisión de los datos y la generación de informes.',
        ],
        stack: [],
        assignments: [],
      },
    ],
    education: [
      {
        degree:
          'Curso de Especialización en Ciberseguridad en Entornos de las Tecnologías de la Información (Máster de FP)',
        school: 'IES Ingeniero de la Cierva',
        period: '2024 — 2025',
        detail: 'Titulación oficial de posgrado de FP · Nota: 8,83 / 10',
      },
      {
        degree: 'Técnico Superior en Desarrollo de Aplicaciones Multiplataforma (EQF 5)',
        school: 'IES Ingeniero de la Cierva',
        period: '2020 — 2021',
        detail:
          'Primer curso convalidado desde el ciclo de Desarrollo de Aplicaciones Web, al cursarse de forma consecutiva',
      },
      {
        degree: 'Técnico Superior en Desarrollo de Aplicaciones Web (EQF 5)',
        school: 'IES Ingeniero de la Cierva',
        period: '2018 — 2020',
        detail: '',
      },
      {
        degree: 'Inglés C1',
        school: 'EOI Cartagena',
        period: '2022 — 2023',
        detail: '',
      },
    ],
    certifications: [
      'AWS Academy Cloud Foundations — Amazon Web Services',
      'Generative AI on AWS Essentials (Discover IaaS Products) — AWS / Capgemini',
      'ACTIVATE AI Foundation Badge — Capgemini',
    ],
    languages: [
      { language: 'Español', level: 'Nativo' },
      {
        language: 'Inglés',
        level: 'C1 — lengua de trabajo diaria durante 5 años; entrevistas en inglés',
      },
      {
        language: 'Francés',
        level: 'B1 — trabajo escrito y hablado diario con clientes del sector público francés',
      },
    ],
  },
  portfolio: {
    title: 'Portafolio',
    subtitle:
      'Una selección de proyectos e iniciativas en las que he participado: plataformas del sector público, endurecimiento de seguridad y aprendizaje personal.',
    filtersLabel: 'Filtrar proyectos',
    allLabel: 'Todos',
    categories: [
      { key: 'app', label: 'Aplicaciones' },
      { key: 'security', label: 'Seguridad' },
      { key: 'infra', label: 'Infraestructura' },
      { key: 'web', label: 'Web' },
    ],
    categoryLabels: {
      app: 'Aplicación',
      security: 'Seguridad',
      infra: 'Infraestructura',
      web: 'Web',
    } as Record<string, string>,
    featuredLabel: 'Destacado',
    viewProject: 'Ver proyecto',
    empty: 'Aún no hay proyectos en esta categoría.',
    filterStatus: '{shown} de {total} proyectos mostrados',
    caseStudyLabel: 'Caso de estudio',
    caseStudyProblem: 'Problema',
    caseStudyApproach: 'Enfoque',
    caseStudyImpact: 'Impacto',
    projects: [
      {
        title: 'Livret de Parcours Inclusif (LPI)',
        category: 'app',
        featured: true,
        description:
          'Aplicación del Ministerio de Educación Nacional de Francia usada a nivel nacional por el profesorado para apoyar al alumnado con necesidades especiales.',
        tags: ['Java', 'Spring Boot', 'Thymeleaf', 'IBM DB2'],
        caseStudy: {
          problem:
            'El profesorado necesitaba una forma más rápida y consistente de documentar y compartir los planes de apoyo del alumnado con necesidades especiales.',
          approach:
            'Desarrollé nuevas funcionalidades con Spring Boot y Thymeleaf en la plataforma nacional, a partir de especificaciones funcionales con el ministerio y el equipo de producto.',
          impact:
            'La funcionalidad principal que entregué mejoró la accesibilidad del alumnado con necesidades especiales en toda Francia.',
        },
        link: '',
      },
      {
        title: 'Faits Établissement',
        category: 'app',
        featured: false,
        description:
          'Plataforma nacional de reporte de incidencias para centros educativos y administración franceses.',
        tags: ['Java', 'Spring Boot', 'Angular'],
        caseStudy: {
          problem:
            'Los centros y la administración necesitaban un canal nacional fiable para reportar y hacer seguimiento de incidencias.',
          approach:
            'Desarrollo full-stack en Java y Angular, además de mantenimiento correctivo y soporte en producción de una aplicación de ámbito nacional.',
          impact:
            'El reporte de incidencias pasó a ser consistente, trazable y estable para los centros de todo el país.',
        },
        link: '',
      },
      {
        title: 'Migración de MySQL a IBM DB2',
        category: 'infra',
        featured: true,
        description:
          'Migración de la base de datos de producción de una aplicación ministerial, mejorando eficiencia, fiabilidad y escalabilidad con cambios gestionados por Liquibase.',
        tags: ['IBM DB2', 'MySQL', 'Liquibase'],
        caseStudy: {
          problem:
            'Migrar un servicio nacional en producción de MySQL a IBM DB2 sin interrumpir a sus usuarios.',
          approach:
            'Migré el esquema y los datos con cambios gestionados por Liquibase, adaptando consultas y verificando el comportamiento en DB2.',
          impact:
            'Mayor eficiencia, fiabilidad y escalabilidad, con cambios de base de datos versionados y repetibles.',
        },
        link: '',
      },
      {
        title: 'Remediación de auditoría de seguridad',
        category: 'security',
        featured: true,
        description:
          'Remediación de vulnerabilidades tras una auditoría técnica de seguridad: control de acceso, gestión de sesiones, cookies seguras, CSRF y endurecimiento de código.',
        tags: ['Spring Security', 'SAML2', 'CSRF'],
        caseStudy: {
          problem:
            'Una auditoría técnica de seguridad señaló debilidades en una aplicación en producción.',
          approach:
            'Corregí control de acceso, gestión de sesiones, cookies seguras y CSRF, y endurecí el código junto al equipo.',
          impact: 'Hallazgos remediados y patrones seguros aplicados en toda la aplicación.',
        },
        link: '',
      },
      {
        title: 'Laboratorio propio autoalojado',
        category: 'infra',
        featured: false,
        description:
          'Servidores Linux, contenedores, VPN, túneles SSH, endurecimiento de seguridad y modelos de lenguaje locales para aprendizaje continuo.',
        tags: ['Linux', 'Docker', 'VPN'],
        caseStudy: {
          problem:
            'Quería experiencia práctica de operación más allá del desarrollo del día a día.',
          approach:
            'Aprovisiono y opero servidores Linux en cloud y hardware propio con contenedores, VPN, túneles SSH y endurecimiento de seguridad.',
          impact:
            'Criterio práctico sobre operación, monitorización y seguridad en máquinas deliberadamente limitadas.',
        },
        link: personal.github,
      },
      {
        title: 'Web de portafolio',
        category: 'web',
        featured: false,
        description:
          'Este portafolio personal hecho con Astro: rápido, estático, accesible y optimizado para SEO.',
        tags: ['Astro', 'TypeScript', 'Bootstrap'],
        caseStudy: {
          problem:
            'Construir un portafolio estático que siguiera siendo rápido y accesible sin lastre de frameworks.',
          approach:
            'Astro con arquitectura por capas (lib pura + módulos de cliente tipados), CSP con hashes, contraste WCAG AA y tests unitarios/E2E automatizados.',
          impact:
            'Lighthouse 100 en accesibilidad, buenas prácticas y SEO, con cero violaciones de CSP.',
        },
        link: `${personal.github}/AngelCanovas.github.io`,
      },
    ],
  },
  quote: {
    ariaLabel: 'Cita del momento',
    heading: 'Cita del momento',
    pause: 'Pausar la rotación de citas',
    resume: 'Reanudar la rotación de citas',
  },
  ui: {
    skipLink: 'Saltar al contenido principal',
    scrollTop: 'Volver arriba',
    photoAlt: 'foto profesional',
    avatarAlt: 'foto de perfil',
    ogImageAlt: 'retrato y perfil profesional como tarjeta de vista previa',
    toastCopied: 'Email copiado: {email}',
    newTab: '(se abre en una pestaña nueva)',
  },
  cv: {
    summary: 'Resumen profesional',
    download: 'Descargar CV (PDF)',
    generate: 'Imprimir / Guardar como PDF',
    back: 'Volver al portfolio',
    switchLabel: 'Ver en inglés',
    updated: 'Documento generado desde el portfolio',
    stack: 'Tecnologías',
    assignment: 'Asignación',
  },
  services: {
    title: 'Servicios',
    subtitle:
      'Formas en las que puedo ayudar a tu equipo a entregar software seguro y mantenible y a mantener sistemas críticos en funcionamiento.',
    items: [
      {
        icon: 'code-slash',
        number: '01',
        title: 'Desarrollo Full-Stack Java',
        description:
          'Aplicaciones web empresariales con Java, Spring Boot, Spring Security, JPA/Hibernate, Thymeleaf y Angular.',
        points: [
          'Aplicaciones Java y Spring Boot',
          'Front-ends Angular + APIs REST',
          'JPA/Hibernate y bases de datos relacionales',
        ],
      },
      {
        icon: 'shield-check',
        number: '02',
        title: 'Ingeniería de software seguro',
        description:
          'Seguridad integrada en el ciclo de vida de la aplicación, de la autenticación al despliegue.',
        points: [
          'SAML2 y control de acceso por roles',
          'CSRF, cookies seguras y sesiones',
          'Remediación de vulnerabilidades y endurecimiento',
        ],
      },
      {
        icon: 'life-preserver',
        number: '03',
        title: 'Soporte de aplicaciones y MCO',
        description:
          'Mantener sistemas críticos en marcha con un mantenimiento fiable y rápida resolución de incidencias.',
        points: [
          'Monitorización en producción y hotfixes',
          'Releases y migraciones de base de datos',
          'Procesos batch y generación de documentos',
        ],
      },
      {
        icon: 'cloud',
        number: '04',
        title: 'DevOps, Cloud y laboratorio propio',
        description:
          'Experiencia operativa con contenedores, CI/CD, fundamentos de cloud y sistemas autoalojados.',
        points: [
          'Docker, Linux y CI/CD',
          'AWS Cloud Foundations',
          'Infra autoalojada y endurecimiento',
        ],
      },
      {
        icon: 'robot',
        number: '05',
        title: 'Ingeniería asistida por IA',
        description:
          'Uso de herramientas de IA para ir más rápido sin renunciar a calidad, seguridad ni control del código.',
        points: [
          'OpenCode y GitHub Copilot',
          'Análisis de código y documentación',
          'Revisión manual y conciencia de seguridad',
        ],
      },
      {
        icon: 'translate',
        number: '06',
        title: 'Colaboración internacional',
        description: 'Cómodo en equipos distribuidos y entornos multilingües del sector público.',
        points: [
          'Inglés C1 · Francés B1',
          'Equipos ágiles Scrum / SAFe',
          'Clientes del sector público francés',
        ],
      },
    ],
  },
  notes: {
    enabled: false,
    title: 'Notas técnicas',
    subtitle: 'Notas ocasionales sobre desarrollo seguro e ingeniería empresarial.',
    readingTimeLabel: 'min de lectura',
    items: [] as readonly { title: string; tags: readonly string[]; body: readonly string[] }[],
  },
  contact: {
    title: 'Contacto',
    subtitle: 'Primer contacto por LinkedIn o email. Referencias disponibles bajo petición.',
    cta: 'Escríbeme',
    copyEmail: 'Copiar dirección de email',
    channels: {
      email: 'Email',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      location: 'Ubicación',
      locationValue: 'Murcia, España · 100 % en remoto (CET)',
    },
  },
  footer: {
    rights: 'Todos los derechos reservados.',
    creditsPrefix: 'Hecho con',
    noticesLabel: 'Licencias de terceros',
  },
  fun: {
    htmlComment:
      '¿Leyendo el código fuente? Probablemente nos llevaríamos bien. Hay un mensaje oculto en la consola y un código Konami esperando: ↑ ↑ ↓ ↓ ← → ← → B A',
    consoleMessage:
      '¡Hola, desarrollador curioso! Has encontrado el mensaje oculto. Si lees código fuente por diversión, eres justo el tipo de persona con la que me gusta trabajar.',
  },
} as const satisfies DeepWiden<typeof en>;

export const content = { en, es } as const;

export const quotes = [
  {
    text: {
      en: 'The important thing is not to stop questioning. Curiosity has its own reason for existing.',
      es: 'Lo importante es no dejar de hacerse preguntas. La curiosidad tiene su propia razón de ser.',
    },
    author: 'Albert Einstein',
  },
  {
    text: {
      en: 'Somewhere, something incredible is waiting to be known.',
      es: 'En algún lugar, algo increíble está esperando a ser descubierto.',
    },
    author: 'Carl Sagan',
  },
  {
    text: {
      en: 'We are a way for the cosmos to know itself.',
      es: 'Somos una forma que tiene el cosmos de conocerse a sí mismo.',
    },
    author: 'Carl Sagan',
  },
  {
    text: {
      en: 'Any sufficiently advanced technology is indistinguishable from magic.',
      es: 'Cualquier tecnología lo suficientemente avanzada es indistinguible de la magia.',
    },
    author: 'Arthur C. Clarke',
  },
  {
    text: {
      en: 'Security is not a product, but a process.',
      es: 'La seguridad no es un producto, sino un proceso.',
    },
    author: 'Bruce Schneier',
  },
  {
    text: {
      en: "The good thing about science is that it's true whether or not you believe in it.",
      es: 'Lo bueno de la ciencia es que es verdad tanto si crees en ella como si no.',
    },
    author: 'Neil deGrasse Tyson',
  },
  {
    text: {
      en: 'Programs must be written for people to read, and only incidentally for machines to execute.',
      es: 'Los programas deben escribirse para que las personas los lean, y solo de forma circunstancial para que las máquinas los ejecuten.',
    },
    author: 'Harold Abelson',
  },
  {
    text: {
      en: 'Nothing in life is to be feared, it is only to be understood.',
      es: 'En la vida nada debe temerse, solo debe comprenderse.',
    },
    author: 'Marie Curie',
  },
  {
    text: {
      en: 'What I cannot create, I do not understand.',
      es: 'Lo que no puedo crear, no lo entiendo.',
    },
    author: 'Richard Feynman',
  },
  {
    text: {
      en: "The most exciting phrase to hear in science is not 'Eureka!' but 'That's funny...'",
      es: 'La frase más emocionante que se puede oír en la ciencia no es «¡Eureka!», sino «Qué curioso...».',
    },
    author: 'Isaac Asimov',
  },
] as const;
