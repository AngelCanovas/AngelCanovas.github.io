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
    title: 'Full-Stack Java Engineer, Spring Boot | Angel Cánovas Mula',
    description:
      'Java full-stack engineer focused on secure enterprise applications with Spring Boot, Spring Security and Angular. Experience, projects, CV and contact.',
    ogLocale: 'en_US',
  },
  es: {
    htmlLang: 'es',
    title: 'Ingeniero Full-Stack Java, Spring Boot | Angel Cánovas Mula',
    description:
      'Ingeniero Java full-stack centrado en aplicaciones empresariales seguras con Spring Boot, Spring Security y Angular. Experiencia, proyectos, CV y contacto.',
    ogLocale: 'es_ES',
  },
  fr: {
    htmlLang: 'fr',
    title: 'Ingénieur Full-Stack Java, Spring Boot | Angel Cánovas Mula',
    description:
      "Ingénieur Java full-stack spécialisé dans les applications d'entreprise sécurisées avec Spring Boot, Spring Security et Angular. Expérience, projets, CV et contact.",
    ogLocale: 'fr_FR',
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
    valueProp:
      'I build secure enterprise applications for the French Ministry of Education — 10,000+ students supported and most of a security audit remediated.',
    ctaContact: 'Email me',
    ctaResume: 'View resume',
    ctaWork: 'See selected work',
    ctaCv: 'Download CV',
  },
  stats: {
    items: [
      { value: 5, suffix: '+', label: 'Years of experience', decimals: 0 },
      { value: 10000, suffix: '+', label: 'Students supported', decimals: 0 },
      { value: 4.23, suffix: '/5', label: 'Client satisfaction', decimals: 2 },
      { value: 8.83, suffix: '/10', label: 'Cybersecurity grade', decimals: 2 },
    ],
  },
  about: {
    title: 'About',
    summary:
      'Full-stack Java engineer with 5+ years at Capgemini building enterprise web applications for the French Ministry of National Education, including Livret de Parcours Inclusif (LPI) and Faits Établissement. I work across the full lifecycle with Java, Spring Boot, Spring Security, JPA/Hibernate, Thymeleaf and Angular on IBM DB2: new features, corrective maintenance, production support, releases, database migrations and batch processes.',
    secureSummary:
      'Over the last year I have specialised in secure software development. During the remediation of a technical security audit I implemented most of the fixes myself as part of the team: SAML2 authentication, role-based access control, secure cookie and session handling and a stronger cryptographic PIN generation algorithm. I also worked on CSRF protection, code hardening and vulnerability remediation. In 2025 I completed the Official Specialisation Course in Cybersecurity for IT Environments with a grade of 8.83/10.',
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
          'Cryptographic PIN generation',
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
          'Laravel',
          'JSP',
          'JBoss',
          'Tomcat',
          'Elasticsearch',
          'Node.js',
          'Python',
          'Liquibase',
          'Microservices',
          'Hexagonal architecture',
          'UML',
          'Unit testing',
          'Bash',
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
          'Developed accessibility features for LPI, an internal Ministry platform that digitises support plans and processes for students with special educational needs across France, used by teaching staff nationwide.',
          'Contributed to the migration of the production database from MySQL to IBM DB2: schema changes and Liquibase changesets, data migration support and resolution of production incidents.',
          'Implemented most of the security audit remediation myself as part of the team: SAML2 authentication, role-based access control, secure cookie and session handling and a stronger cryptographic PIN generation algorithm; also worked on CSRF protection, code hardening and vulnerability remediation.',
          'Contributed to raising customer satisfaction from 3.5 to 4.23 / 5 in the first year through proactive issue resolution and consistent delivery quality.',
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
              "Tested APIs with Postman and the client's internal Spock-based tooling.",
              'Monitored production and resolved B2B incidents to keep critical telecom services stable.',
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
          "Supported the ministry's cultural-events reporting application, improving data accuracy and report generation.",
        ],
        stack: [],
        assignments: [],
      },
    ],
    education: [
      {
        degree: 'Specialisation Course in Cybersecurity for IT Environments',
        school: 'IES Ingeniero de la Cierva',
        period: '',
        detail: 'Official vocational-education postgraduate qualification · Grade: 8.83 / 10',
      },
      {
        degree: 'Higher Vocational Diploma in Multiplatform Application Development (EQF 5)',
        school: 'IES Ingeniero de la Cierva',
        period: '',
        detail:
          'First year credited from the Web Development diploma, as both were studied consecutively',
      },
      {
        degree: 'Higher Vocational Diploma in Web Application Development (EQF 5)',
        school: 'IES Ingeniero de la Cierva',
        period: '',
        detail: '',
      },
      {
        degree: 'English C1',
        school: 'EOI Cartagena',
        period: '',
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
  selectedWork: {
    title: 'Selected work',
    subtitle:
      'Three projects that show the responsibility, security work and delivery I bring to a team.',
    cta: 'View full portfolio',
    badgeLpi: 'Most responsibility',
    badgeSecurity: 'Security & cybersecurity',
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
    copy: 'Copy CV text',
    copied: 'CV copied to clipboard',
    copyFailed: 'Could not copy the CV',
    highlightsTitle: 'Selected highlights',
    highlights: [
      'LPI: delivered accessibility features used by teaching staff across France, supporting 10,000+ students.',
      'Security audit: implemented most of the remediation myself — SAML2, role-based access control, secure sessions and cookies, cryptographic PIN generation.',
    ],
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
    valueProp:
      'Construyo aplicaciones empresariales seguras para el Ministerio de Educación francés: más de 10.000 alumnos atendidos y la mayor parte de una auditoría de seguridad corregida.',
    ctaContact: 'Escríbeme',
    ctaResume: 'Ver currículum',
    ctaWork: 'Ver proyectos destacados',
    ctaCv: 'Descargar CV',
  },
  stats: {
    items: [
      { value: 5, suffix: '+', label: 'Años de experiencia', decimals: 0 },
      { value: 10000, suffix: '+', label: 'Alumnado atendido', decimals: 0 },
      { value: 4.23, suffix: '/5', label: 'Satisfacción del cliente', decimals: 2 },
      { value: 8.83, suffix: '/10', label: 'Nota en ciberseguridad', decimals: 2 },
    ],
  },
  about: {
    title: 'Sobre mí',
    summary:
      'Ingeniero Full-Stack Java con más de 5 años en Capgemini desarrollando aplicaciones web empresariales para el Ministerio de Educación Nacional de Francia, en particular Livret de Parcours Inclusif (LPI) y Faits Établissement. Cubro todo el ciclo de vida con Java, Spring Boot, Spring Security, JPA/Hibernate, Thymeleaf y Angular sobre IBM DB2: nuevas funcionalidades, mantenimiento correctivo, soporte en producción, releases, migraciones de base de datos y procesos batch.',
    secureSummary:
      'Durante el último año me he especializado en desarrollo seguro. En la remediación de una auditoría técnica de seguridad implementé personalmente la mayor parte de las correcciones dentro del equipo: autenticación SAML2, control de acceso basado en roles, gestión segura de cookies y sesiones y un algoritmo criptográfico más fuerte de generación de PIN. También trabajé en protección CSRF, hardening de código y corrección de vulnerabilidades. En 2025 completé el Curso Oficial de Especialización en Ciberseguridad en Entornos de las Tecnologías de la Información con una nota de 8,83/10.',
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
          'Generación criptográfica de PIN',
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
          'Laravel',
          'JSP',
          'JBoss',
          'Tomcat',
          'Elasticsearch',
          'Node.js',
          'Python',
          'Liquibase',
          'Microservicios',
          'Arquitectura hexagonal',
          'UML',
          'Testing unitario',
          'Bash',
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
          'Desarrollé funcionalidades de accesibilidad para LPI, una plataforma interna del Ministerio que digitaliza los planes y procesos de apoyo al alumnado con necesidades educativas especiales en toda Francia, usada por personal docente a nivel nacional.',
          'Contribuí a la migración de la base de datos de producción de MySQL a IBM DB2: cambios de esquema y changesets con Liquibase, apoyo a la migración de datos y resolución de incidencias en producción.',
          'Implementé personalmente la mayor parte de las correcciones de la auditoría de seguridad dentro del equipo: autenticación SAML2, control de acceso basado en roles, gestión segura de cookies y sesiones y un algoritmo criptográfico más fuerte de generación de PIN; también trabajé en protección CSRF, hardening de código y corrección de vulnerabilidades.',
          'Contribuí a subir la satisfacción del cliente de 3,5 a 4,23 / 5 en el primer año mediante resolución proactiva de incidencias y una entrega constante.',
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
              'Probé APIs con Postman y con la herramienta interna de testing basada en Spock del cliente.',
              'Monitoricé producción y resolví incidentes B2B para mantener estables los servicios de telecomunicaciones críticos.',
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
          'Presté soporte a la aplicación de informes de eventos culturales del ministerio, mejorando la precisión de los datos y la generación de informes.',
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
        period: '',
        detail: 'Titulación oficial de posgrado de FP · Nota: 8,83 / 10',
      },
      {
        degree: 'Técnico Superior en Desarrollo de Aplicaciones Multiplataforma (EQF 5)',
        school: 'IES Ingeniero de la Cierva',
        period: '',
        detail:
          'Primer curso convalidado desde el ciclo de Desarrollo de Aplicaciones Web, al cursarse de forma consecutiva',
      },
      {
        degree: 'Técnico Superior en Desarrollo de Aplicaciones Web (EQF 5)',
        school: 'IES Ingeniero de la Cierva',
        period: '',
        detail: '',
      },
      {
        degree: 'Inglés C1',
        school: 'EOI Cartagena',
        period: '',
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
  selectedWork: {
    title: 'Proyectos destacados',
    subtitle:
      'Tres proyectos que muestran la responsabilidad, el trabajo de seguridad y la entrega que aporto a un equipo.',
    cta: 'Ver portfolio completo',
    badgeLpi: 'Más responsabilidad',
    badgeSecurity: 'Seguridad y ciberseguridad',
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
    copy: 'Copiar texto del CV',
    copied: 'CV copiado al portapapeles',
    copyFailed: 'No se pudo copiar el CV',
    highlightsTitle: 'Aspectos destacados',
    highlights: [
      'LPI: funcionalidades de accesibilidad usadas por profesorado de toda Francia, con más de 10.000 alumnos atendidos.',
      'Auditoría de seguridad: implementé personalmente la mayor parte de la remediación — SAML2, control de acceso por roles, sesiones y cookies seguras, generación criptográfica de PIN.',
    ],
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

const fr = {
  nav: {
    home: 'Accueil',
    about: 'À propos',
    skills: 'Compétences',
    resume: 'CV',
    portfolio: 'Portfolio',
    services: 'Services',
    notes: 'Notes',
    contact: 'Contact',
    toggleLabel: 'Ouvrir la navigation',
    languageLabel: 'Langue',
    themeToLight: 'Passer au thème clair',
    themeToDark: 'Passer au thème sombre',
  },
  hero: {
    eyebrow: 'Bonjour, je suis',
    availability: 'Disponible pour des postes en télétravail',
    roles: [
      'Ingénieur Full-Stack Java',
      'Ingénieur logiciel sécurisé',
      'Développeur formé à la cybersécurité',
    ],
    headline:
      "Spring Boot · Spring Security · Angular · Applications d'entreprise sécurisées · Cybersécurité",
    valueProp:
      "Je construis des applications d'entreprise sécurisées pour le ministère français de l'Éducation — plus de 10 000 élèves accompagnés et l'essentiel d'un audit de sécurité corrigé.",
    ctaContact: 'M’écrire',
    ctaResume: 'Voir le CV',
    ctaWork: 'Voir les projets phares',
    ctaCv: 'Télécharger le CV',
  },
  stats: {
    items: [
      { value: 5, suffix: '+', label: "Années d'expérience", decimals: 0 },
      { value: 10000, suffix: '+', label: 'Étudiants accompagnés', decimals: 0 },
      { value: 4.23, suffix: '/5', label: 'Satisfaction client', decimals: 2 },
      { value: 8.83, suffix: '/10', label: 'Note en cybersécurité', decimals: 2 },
    ],
  },
  about: {
    title: 'À propos',
    summary:
      "Ingénieur Full-Stack Java avec plus de 5 ans d'expérience chez Capgemini, où je développe des applications web d'entreprise pour le ministère français de l'Éducation nationale, notamment Livret de Parcours Inclusif (LPI) et Faits Établissement. J'interviens sur tout le cycle de vie avec Java, Spring Boot, Spring Security, JPA/Hibernate, Thymeleaf et Angular sur IBM DB2 : nouvelles fonctionnalités, maintenance corrective, support de production, mises en production, migrations de bases de données et traitements batch.",
    secureSummary:
      "Depuis un an, je me suis spécialisé dans le développement logiciel sécurisé. Lors de la remédiation d'un audit de sécurité technique, j'ai implémenté moi-même la plupart des correctifs au sein de l'équipe : authentification SAML2, contrôle d'accès basé sur les rôles, gestion sécurisée des cookies et des sessions, et algorithme de génération de PIN cryptographique plus robuste. J'ai également travaillé sur la protection CSRF, le durcissement du code et la remédiation des vulnérabilités. En 2025, j'ai obtenu le cours officiel de spécialisation en cybersécurité pour les environnements informatiques avec une note de 8,83/10.",
    languages:
      "Je travaille quotidiennement en anglais et en français (anglais C1, français B1) et je recherche un poste 100 % en télétravail en Java backend/full-stack ou en applications d'entreprise sécurisées, au sein d'une équipe internationale.",
    meta: {
      location: 'Localisation',
      workModel: 'Mode de travail',
      email: 'E-mail',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      linkedinValue: 'Angel Cánovas Mula sur LinkedIn',
    },
    role: 'Ingénieur Full-Stack Java',
    location: 'Murcie, Espagne',
    workModel: '100 % télétravail (CET)',
    homeLab: {
      title: 'Laboratoire domestique / systèmes auto-hébergés',
      intro:
        'Je mets aussi en pratique sur ma propre infrastructure ce que je ne touche pas au travail :',
      points: [
        "Je provisionne et j'exploite mes propres serveurs Linux — instances cloud et matériel à domicile — avec des conteneurs, un VPN, des tunnels SSH, du durcissement de sécurité et de l'optimisation de ressources sur des machines volontairement limitées.",
        "J'exploite des services réseau auto-hébergés et j'ai expérimenté des modèles de langage locaux, ce qui m'a donné un jugement pratique sur l'exploitation et pas seulement sur le développement.",
        "Je peux entrer dans les détails lors d'un entretien.",
      ],
    },
  },
  skills: {
    title: 'Compétences',
    subtitle: 'Compétences et technologies issues du CV, regroupées par domaine d’expertise.',
    groups: [
      {
        icon: 'code-slash',
        title: 'Cœur',
        description: 'Langages, frameworks et outils que j’utilise au quotidien.',
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
        title: 'Développement sécurisé',
        description: 'Durcir les applications d’entreprise face aux menaces réelles.',
        skills: [
          'SAML2',
          'Contrôle d’accès',
          'CSRF',
          'Cookies sécurisés',
          'Gestion de session',
          'Durcissement du code',
          'Remédiation des vulnérabilités',
          'Génération cryptographique de PIN',
          'Déploiement sécurisé',
          'Sécurité réseau',
        ],
      },
      {
        icon: 'headset',
        title: 'Tests et support',
        description: 'Maintenir la stabilité des systèmes critiques en production.',
        skills: [
          'Postman',
          'Tests API',
          'Outils Spock',
          'Surveillance de production',
          'Résolution d’incidents',
          'Jira',
          'Confluence',
        ],
      },
      {
        icon: 'robot',
        title: 'Ingénierie assistée par IA',
        description: 'Des outils IA qui accélèrent la livraison, toujours revus à la main.',
        skills: [
          'OpenCode',
          'GitHub Copilot',
          'Analyse de code',
          'Documentation',
          'Préparation de tests',
          'Revue manuelle',
        ],
      },
      {
        icon: 'tools',
        title: 'Également utilisé',
        description: 'Technologies complémentaires issues du CV.',
        skills: [
          'Thymeleaf',
          'Laravel',
          'JSP',
          'JBoss',
          'Tomcat',
          'Elasticsearch',
          'Node.js',
          'Python',
          'Liquibase',
          'Microservices',
          'Architecture hexagonale',
          'UML',
          'Tests unitaires',
          'Bash',
        ],
      },
    ],
  },
  resume: {
    title: 'CV',
    subtitle:
      "Ingénieur Full-Stack Java avec une spécialisation récente en cybersécurité, orienté applications d'entreprise sécurisées et delivery international.",
    experienceTitle: 'Expérience professionnelle',
    educationTitle: 'Formation',
    certificationsTitle: 'Certifications',
    languagesTitle: 'Langues',
    downloadCv: 'Télécharger le CV (PDF)',
    onlineCv: 'CV en ligne',
    experience: [
      {
        title: 'Ingénieur logiciel',
        company: 'Capgemini',
        location: 'Murcie, Espagne',
        period: 'Juin 2021 — aujourd’hui',
        context:
          "Développeur Full-Stack Java · Ministère français de l'Éducation nationale · Livret de Parcours Inclusif, Faits Établissement",
        highlights: [
          "Développement de fonctionnalités d'accessibilité pour LPI, une plateforme interne du ministère qui numérise les plans et processus d'accompagnement des élèves à besoins éducatifs particuliers partout en France, utilisée par les enseignants au niveau national.",
          "Participation à la migration de la base de données de production de MySQL vers IBM DB2 : modifications de schéma et changesets Liquibase, support à la migration des données et résolution d'incidents de production.",
          "J'ai implémenté moi-même la plupart des correctifs de l'audit de sécurité au sein de l'équipe : authentification SAML2, contrôle d'accès basé sur les rôles, gestion sécurisée des cookies et sessions, et algorithme de génération de PIN cryptographique plus robuste ; travail également sur la protection CSRF, le durcissement du code et la remédiation des vulnérabilités.",
          "Contribution à l'augmentation de la satisfaction client de 3,5 à 4,23/5 la première année, grâce à une résolution proactive des incidents et une qualité de livraison constante.",
          "Accompagnement et mentorat de 2 nouveaux membres de l'équipe, avec formation fonctionnelle et technique et support au dépannage.",
          "Résolution de 1 à 2 blocages de production par mois dans une équipe d'environ 10 personnes servant des milliers d'utilisateurs actifs.",
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
            title: 'Tests API et support de production · Telia Suède / Finlande',
            details: [
              "Tests d'API avec Postman et les outils internes du client basés sur Spock.",
              'Surveillance de la production et résolution d’incidents B2B pour maintenir la stabilité des services télécom critiques.',
            ],
          },
        ],
      },
      {
        title: 'Développeur Java junior (stage)',
        company: 'Capgemini',
        location: 'Murcie, Espagne',
        period: 'Mars 2021 — Mai 2021',
        context: 'Ministère français de la Culture',
        highlights: [
          "Support de l'application de reporting des événements culturels du ministère, amélioration de la précision des données et de la génération de rapports.",
        ],
        stack: [],
        assignments: [],
      },
    ],
    education: [
      {
        degree: 'Cours de spécialisation en cybersécurité pour les environnements informatiques',
        school: 'IES Ingeniero de la Cierva',
        period: '',
        detail: 'Diplôme officiel de l’enseignement professionnel supérieur · Note : 8,83 / 10',
      },
      {
        degree: 'Diplôme supérieur en développement d’applications multiplateformes (EQF 5)',
        school: 'IES Ingeniero de la Cierva',
        period: '',
        detail:
          'Première année validée depuis le diplôme de développement web, les deux formations ayant été suivies consécutivement',
      },
      {
        degree: 'Diplôme supérieur en développement d’applications web (EQF 5)',
        school: 'IES Ingeniero de la Cierva',
        period: '',
        detail: '',
      },
      {
        degree: 'Anglais C1',
        school: 'EOI Cartagena',
        period: '',
        detail: '',
      },
    ],
    certifications: [
      'AWS Academy Cloud Foundations — Amazon Web Services',
      'Generative AI on AWS Essentials (Discover IaaS Products) — AWS / Capgemini',
      'ACTIVATE AI Foundation Badge — Capgemini',
    ],
    languages: [
      { language: 'Espagnol', level: 'Langue maternelle' },
      {
        language: 'Anglais',
        level: 'C1 — langue de travail quotidienne depuis 5 ans ; entretiens en anglais',
      },
      {
        language: 'Français',
        level: 'B1 — travail écrit et oral quotidien avec des clients du secteur public français',
      },
    ],
  },
  portfolio: {
    title: 'Portfolio',
    subtitle:
      "Une sélection de projets et d'initiatives auxquels j'ai contribué : plateformes publiques, durcissement de la sécurité et apprentissage personnel.",
    filtersLabel: 'Filtrer les projets',
    allLabel: 'Tous',
    categories: [
      { key: 'app', label: 'Applications' },
      { key: 'security', label: 'Sécurité' },
      { key: 'infra', label: 'Infrastructure' },
      { key: 'web', label: 'Web' },
    ],
    categoryLabels: {
      app: 'Application',
      security: 'Sécurité',
      infra: 'Infrastructure',
      web: 'Web',
    } as Record<string, string>,
    featuredLabel: 'À la une',
    viewProject: 'Voir le projet',
    empty: 'Aucun projet dans cette catégorie pour le moment.',
    filterStatus: '{shown} projets affichés sur {total}',
    caseStudyLabel: 'Étude de cas',
    caseStudyProblem: 'Problème',
    caseStudyApproach: 'Approche',
    caseStudyImpact: 'Impact',
    projects: [
      {
        title: 'Livret de Parcours Inclusif (LPI)',
        category: 'app',
        featured: true,
        description:
          "Application du ministère français de l'Éducation nationale utilisée au niveau national par les enseignants pour accompagner les élèves à besoins particuliers.",
        tags: ['Java', 'Spring Boot', 'Thymeleaf', 'IBM DB2'],
        caseStudy: {
          problem:
            "Les enseignants avaient besoin d'un moyen plus rapide et homogène de documenter et partager les plans d'accompagnement des élèves à besoins particuliers.",
          approach:
            'Développement de nouvelles fonctionnalités Spring Boot et Thymeleaf sur la plateforme nationale, à partir des spécifications fonctionnelles du ministère et de l’équipe produit.',
          impact:
            "La fonctionnalité principale que j'ai livrée a amélioré l'accessibilité pour les élèves à besoins particuliers partout en France.",
        },
        link: '',
      },
      {
        title: 'Faits Établissement',
        category: 'app',
        featured: false,
        description:
          "Plateforme nationale de signalement d'incidents pour les écoles et l'administration françaises.",
        tags: ['Java', 'Spring Boot', 'Angular'],
        caseStudy: {
          problem:
            "Les écoles et l'administration avaient besoin d'un canal national fiable pour signaler et suivre les incidents.",
          approach:
            'Développement Full-Stack Java et Angular, maintenance corrective et support de production sur une application à portée nationale.',
          impact:
            'Le signalement des incidents est devenu cohérent, traçable et stable pour les écoles dans toute la France.',
        },
        link: '',
      },
      {
        title: 'Migration MySQL vers IBM DB2',
        category: 'infra',
        featured: true,
        description:
          "Migration de la base de données de production d'une application du ministère, avec des changements gérés par Liquibase pour améliorer l'efficacité, la fiabilité et l'évolutivité.",
        tags: ['IBM DB2', 'MySQL', 'Liquibase'],
        caseStudy: {
          problem:
            'Migrer un service national en production de MySQL vers IBM DB2 sans interrompre ses utilisateurs.',
          approach:
            'Migration du schéma et des données avec des changements gérés par Liquibase, adaptation des requêtes et vérification du comportement sur DB2.',
          impact:
            'Meilleure efficacité, fiabilité et évolutivité, avec des changements de base versionnés et reproductibles.',
        },
        link: '',
      },
      {
        title: 'Remédiation d’audit de sécurité',
        category: 'security',
        featured: true,
        description:
          "Remédiation des vulnérabilités après un audit de sécurité technique : contrôle d'accès, gestion de session, cookies sécurisés, CSRF et durcissement du code.",
        tags: ['Spring Security', 'SAML2', 'CSRF'],
        caseStudy: {
          problem:
            'Un audit de sécurité technique a signalé des faiblesses dans une application en production.',
          approach:
            "Correction du contrôle d'accès, de la gestion de session, des cookies sécurisés et des problèmes CSRF, et durcissement du code avec l'équipe.",
          impact:
            "Constats corrigés et bonnes pratiques de sécurité appliquées sur toute l'application.",
        },
        link: '',
      },
      {
        title: 'Home lab auto-hébergé',
        category: 'infra',
        featured: false,
        description:
          'Serveurs Linux, conteneurs, VPN, tunnels SSH, durcissement de sécurité et modèles de langage locaux pour apprendre en continu.',
        tags: ['Linux', 'Docker', 'VPN'],
        caseStudy: {
          problem:
            "Je voulais une expérience pratique de l'exploitation au-delà du développement quotidien.",
          approach:
            'Provisionner et exploiter des serveurs Linux sur cloud et matériel domestique, avec conteneurs, VPN, tunnels SSH et durcissement de sécurité.',
          impact:
            "Jugement pratique sur l'exploitation, la supervision et la sécurité sur des machines volontairement contraintes.",
        },
        link: personal.github,
      },
      {
        title: 'Site portfolio',
        category: 'web',
        featured: false,
        description:
          'Ce portfolio personnel construit avec Astro : rapide, statique, SEO-friendly et accessible.',
        tags: ['Astro', 'TypeScript', 'Bootstrap'],
        caseStudy: {
          problem:
            'Construire un portfolio statique qui reste rapide et accessible sans surcharge de framework.',
          approach:
            'Astro avec une architecture en couches (bibliothèque pure + modules client typés), CSP hachée, contraste WCAG AA et tests unitaires/E2E automatisés.',
          impact: 'Lighthouse 100 en accessibilité, bonnes pratiques et SEO, sans violation CSP.',
        },
        link: `${personal.github}/AngelCanovas.github.io`,
      },
    ],
  },
  selectedWork: {
    title: 'Projets phares',
    subtitle:
      'Trois projets qui montrent la responsabilité, le travail de sécurité et la livraison que j’apporte à une équipe.',
    cta: 'Voir le portfolio complet',
    badgeLpi: 'Plus de responsabilité',
    badgeSecurity: 'Sécurité et cybersécurité',
  },
  quote: {
    ariaLabel: 'Citation du moment',
    heading: 'Citation du moment',
    pause: 'Mettre en pause la rotation des citations',
    resume: 'Reprendre la rotation des citations',
  },
  ui: {
    skipLink: 'Aller au contenu principal',
    scrollTop: 'Remonter en haut',
    photoAlt: 'photo professionnelle',
    avatarAlt: 'photo de profil',
    ogImageAlt: 'portrait et rôle professionnel en carte d’aperçu',
    toastCopied: 'E-mail copié : {email}',
    newTab: '(s’ouvre dans un nouvel onglet)',
  },
  cv: {
    summary: 'Résumé professionnel',
    download: 'Télécharger le CV (PDF)',
    generate: 'Imprimer / Enregistrer en PDF',
    back: 'Retour au portfolio',
    switchLabel: 'Voir en anglais',
    updated: 'Généré depuis le portfolio en ligne',
    stack: 'Stack',
    assignment: 'Mission',
    copy: 'Copier le texte du CV',
    copied: 'CV copié dans le presse-papiers',
    copyFailed: 'Impossible de copier le CV',
    highlightsTitle: 'Points forts',
    highlights: [
      "LPI : fonctionnalités d'accessibilité utilisées par les enseignants partout en France, avec plus de 10 000 élèves accompagnés.",
      "Audit de sécurité : j'ai implémenté moi-même l'essentiel de la remédiation — SAML2, contrôle d'accès par rôles, sessions et cookies sécurisés, génération cryptographique de PIN.",
    ],
  },
  services: {
    title: 'Services',
    subtitle:
      'Différentes façons d’aider votre équipe à livrer des logiciels sécurisés et maintenables, et à maintenir les systèmes critiques en fonctionnement.',
    items: [
      {
        icon: 'code-slash',
        number: '01',
        title: 'Développement Full-Stack Java',
        description:
          'Applications web d’entreprise avec Java, Spring Boot, Spring Security, JPA/Hibernate, Thymeleaf et Angular.',
        points: [
          'Applications Java & Spring Boot',
          'Front-ends Angular + API REST',
          'JPA/Hibernate et bases relationnelles',
        ],
      },
      {
        icon: 'shield-check',
        number: '02',
        title: 'Ingénierie logicielle sécurisée',
        description:
          'Intégrer la sécurité dans tout le cycle de vie, de l’authentification au déploiement.',
        points: [
          'SAML2 et contrôle d’accès basé sur les rôles',
          'CSRF, cookies et sessions sécurisés',
          'Remédiation des vulnérabilités et durcissement',
        ],
      },
      {
        icon: 'life-preserver',
        number: '03',
        title: 'Support applicatif & MCO',
        description:
          'Maintenir les systèmes critiques en fonctionnement avec une maintenance fiable et une résolution rapide des incidents.',
        points: [
          'Surveillance de production et hotfixes',
          'Mises en production et migrations de bases',
          'Traitements batch et génération de documents',
        ],
      },
      {
        icon: 'cloud',
        number: '04',
        title: 'DevOps, cloud & home lab',
        description:
          'Expérience opérationnelle avec conteneurs, CI/CD, fondamentaux cloud et systèmes auto-hébergés.',
        points: [
          'Docker, Linux et CI/CD',
          'AWS Cloud Foundations',
          'Infrastructure auto-hébergée et durcissement',
        ],
      },
      {
        icon: 'robot',
        number: '05',
        title: 'Ingénierie assistée par IA',
        description:
          'Utiliser des outils IA pour aller plus vite sans sacrifier la qualité, la sécurité ou la maîtrise du code.',
        points: [
          'OpenCode et GitHub Copilot',
          'Analyse de code et documentation',
          'Revue manuelle et sensibilisation à la sécurité',
        ],
      },
      {
        icon: 'translate',
        number: '06',
        title: 'Collaboration internationale',
        description:
          'À l’aise dans des équipes distribuées et des environnements multilingues du secteur public.',
        points: [
          'Anglais C1 · Français B1',
          'Équipes Agile Scrum / SAFe',
          'Clients du secteur public français',
        ],
      },
    ],
  },
  notes: {
    enabled: false,
    title: 'Notes techniques',
    subtitle: 'Notes occasionnelles sur le développement sécurisé et l’ingénierie d’entreprise.',
    readingTimeLabel: 'min de lecture',
    items: [] as readonly { title: string; tags: readonly string[]; body: readonly string[] }[],
  },
  contact: {
    title: 'Contact',
    subtitle: 'Premier contact par LinkedIn ou e-mail. Références disponibles sur demande.',
    cta: 'M’écrire',
    copyEmail: 'Copier l’adresse e-mail',
    channels: {
      email: 'E-mail',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      location: 'Localisation',
      locationValue: 'Murcie, Espagne · 100 % télétravail (CET)',
    },
  },
  footer: {
    rights: 'Tous droits réservés.',
    creditsPrefix: 'Construit avec',
    noticesLabel: 'Licences tierces',
  },
  fun: {
    htmlComment:
      "Psst — tu lis le code source ? On s'entendrait probablement. Il y a un message caché dans la console et un code Konami qui attend : ↑ ↑ ↓ ↓ ← → ← → B A",
    consoleMessage:
      "Salut, développeur curieux ! Tu as trouvé le message caché. Si tu lis du code source pour le plaisir, tu es exactement le genre de personne avec qui j'aime travailler.",
  },
} as const satisfies DeepWiden<typeof en>;

export const content = { en, es, fr } as const;

export const quotes = [
  {
    text: {
      en: 'The important thing is not to stop questioning. Curiosity has its own reason for existing.',
      es: 'Lo importante es no dejar de hacerse preguntas. La curiosidad tiene su propia razón de ser.',
      fr: "L'important est de ne pas cesser de se poser des questions. La curiosité a sa raison d'être.",
    },
    author: 'Albert Einstein',
  },
  {
    text: {
      en: 'Somewhere, something incredible is waiting to be known.',
      es: 'En algún lugar, algo increíble está esperando a ser descubierto.',
      fr: "Quelque part, quelque chose d'incroyable attend d'être connu.",
    },
    author: 'Carl Sagan',
  },
  {
    text: {
      en: 'We are a way for the cosmos to know itself.',
      es: 'Somos una forma que tiene el cosmos de conocerse a sí mismo.',
      fr: 'Nous sommes une façon pour le cosmos de se connaître lui-même.',
    },
    author: 'Carl Sagan',
  },
  {
    text: {
      en: 'Any sufficiently advanced technology is indistinguishable from magic.',
      es: 'Cualquier tecnología lo suficientemente avanzada es indistinguible de la magia.',
      fr: 'Toute technologie suffisamment avancée est indiscernable de la magie.',
    },
    author: 'Arthur C. Clarke',
  },
  {
    text: {
      en: 'Security is not a product, but a process.',
      es: 'La seguridad no es un producto, sino un proceso.',
      fr: "La sécurité n'est pas un produit, mais un processus.",
    },
    author: 'Bruce Schneier',
  },
  {
    text: {
      en: "The good thing about science is that it's true whether or not you believe in it.",
      es: 'Lo bueno de la ciencia es que es verdad tanto si crees en ella como si no.',
      fr: "Ce qui est bien avec la science, c'est qu'elle est vraie que vous y croyiez ou non.",
    },
    author: 'Neil deGrasse Tyson',
  },
  {
    text: {
      en: 'Programs must be written for people to read, and only incidentally for machines to execute.',
      es: 'Los programas deben escribirse para que las personas los lean, y solo de forma circunstancial para que las máquinas los ejecuten.',
      fr: 'Les programmes doivent être écrits pour être lus par des personnes, et seulement accessoirement pour être exécutés par des machines.',
    },
    author: 'Harold Abelson',
  },
  {
    text: {
      en: 'Nothing in life is to be feared, it is only to be understood.',
      es: 'En la vida nada debe temerse, solo debe comprenderse.',
      fr: 'Rien dans la vie ne doit être craint, il faut seulement le comprendre.',
    },
    author: 'Marie Curie',
  },
  {
    text: {
      en: 'What I cannot create, I do not understand.',
      es: 'Lo que no puedo crear, no lo entiendo.',
      fr: 'Ce que je ne peux pas créer, je ne le comprends pas.',
    },
    author: 'Richard Feynman',
  },
  {
    text: {
      en: "The most exciting phrase to hear in science is not 'Eureka!' but 'That's funny...'",
      es: 'La frase más emocionante que se puede oír en la ciencia no es «¡Eureka!», sino «Qué curioso...».',
      fr: "La phrase la plus excitante à entendre en science n'est pas « Eurêka ! » mais « C'est curieux... »",
    },
    author: 'Isaac Asimov',
  },
] as const;
