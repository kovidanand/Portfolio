(() => {
  const panel = document.getElementById('chatbotPanel');
  const toggle = document.getElementById('chatbotToggle');
  const closeButton = document.getElementById('chatbotClose');
  const teaser = document.getElementById('chatbotTeaser');
  const teaserClose = document.getElementById('chatbotTeaserClose');
  const messages = document.getElementById('chatbotMessages');
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  const sendButton = document.getElementById('chatbotSend');
  const quickReplies = document.querySelectorAll('.chatbot-quick-reply');

  if (!panel || !toggle || !messages || !form || !input) return;

  const KB = {
    greeting: `
      <p>Hello! I am Kovid's virtual assistant.</p>
      <p>I can provide concise details on his data science background, product management experience, key projects, publications, or contact information.</p>
      <p>How may I assist you today?</p>
    `,

    about: `
      <p><strong>Kovid Anand</strong> is a Data Science undergraduate at <strong>SRM University</strong> (9.80 CGPA), preparing for an <strong>AI Product Management</strong> career.</p>
      <ul class="chatbot-list">
        <li><strong>Core Focus:</strong> Analytics, SQL, machine learning, and data-driven product strategy.</li>
        <li><strong>Background:</strong> Practical internships in fintech and manufacturing automation, complemented by published AI research.</li>
      </ul>
    `,

    education: `
      <p><strong>Academic Background:</strong></p>
      <ul class="chatbot-list">
        <li><strong>Degree:</strong> Bachelor of Computer Applications in Data Science</li>
        <li><strong>Institution:</strong> SRM University (June 2024 – May 2027)</li>
        <li><strong>Performance:</strong> 9.80 CGPA · Department Rank Holder</li>
        <li><strong>Key Coursework:</strong> SQL, Python, Machine Learning, Database Architecture, and Advanced Statistics.</li>
      </ul>
    `,

    experience: `
      <p><strong>Professional Experience:</strong></p>
      <ul class="chatbot-list">
        <li><strong>Bluestock Fintech</strong> (May – Jul 2026)<br><span>Data Analyst Intern · Financial dataset modeling, reporting workflows, and business insights.</span></li>
        <li><strong>NIAMT</strong> (Jun – Jul 2026)<br><span>Project Intern · Automated PLC logic and circuit signal analysis.</span></li>
        <li><strong>Acmegrade</strong> (Mar – Jun 2025)<br><span>Data Science Intern · Preprocessing, EDA, and predictive modeling using Python & Jupyter.</span></li>
      </ul>
    `,

    skills: `
      <p><strong>Key Skills & Tooling:</strong></p>
      <ul class="chatbot-list">
        <li><strong>Product Management:</strong> PRD Writing, KPI Tracking, User Stories, Market Analysis, Agile/Scrum</li>
        <li><strong>Data & Analytics:</strong> SQL, Python, PostgreSQL, MySQL, Excel, Power BI, Pandas, NumPy</li>
        <li><strong>Product Tools:</strong> Jira, Linear, Notion, Figma, ChatPRD, PostHog</li>
        <li><strong>AI & Automation:</strong> Cursor, Lovable, Bolt.new, n8n, Zapier, Make, Vercel</li>
      </ul>
    `,

    projects: `
      <p><strong>Featured Projects:</strong></p>
      <ul class="chatbot-list">
        <li><a href="https://github.com/kovidanand/SQL-Monday_Coffee_Analysis_P3" target="_blank" rel="noopener"><strong>Monday Coffee Analysis:</strong></a> City-level market expansion using advanced SQL CTEs.</li>
        <li><a href="https://github.com/kovidanand/SQL-Netflix_Analysis_P4" target="_blank" rel="noopener"><strong>Netflix Content Analytics:</strong></a> Catalog distribution and content strategy in PostgreSQL.</li>
        <li><a href="https://github.com/kovidanand/Blinkit-Data-Analysis" target="_blank" rel="noopener"><strong>Blinkit Grocery Analytics:</strong></a> Exploratory sales driver analysis on 8.5K+ records.</li>
        <li><a href="https://github.com/kovidanand/SQL-Spotify_Analysis_P5" target="_blank" rel="noopener"><strong>Spotify Streaming Analytics:</strong></a> SQL window functions evaluating engagement and licensing trends.</li>
      </ul>
    `,

    publications: `
      <p><strong>Research Publications:</strong></p>
      <ul class="chatbot-list">
        <li><strong>UASIF Framework (ICASSIPT-2026):</strong><br><span>Sports analytics framework combining ETL, LSTM-XGBoost, and Random Survival Forests (85.5% accuracy). ISSN: 3107-5924.</span></li>
        <li><strong>Progress in NLP (IJBER 2025):</strong><br><span>Co-authored review examining natural language processing advancements and future directions. ISSN: 2455-3921.</span></li>
      </ul>
    `,

    contact: `
      <p><strong>Get in Touch:</strong></p>
      <p>You can connect directly with Kovid through any of the channels below:</p>
      <div class="chatbot-actions-row">
        <a href="mailto:kovidanand05@gmail.com" class="chatbot-btn-link"><i class="fa-solid fa-envelope"></i> Email</a>
        <a href="https://www.linkedin.com/in/kovidanand05/" target="_blank" rel="noopener" class="chatbot-btn-link"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>
        <a href="https://github.com/kovidanand" target="_blank" rel="noopener" class="chatbot-btn-link"><i class="fa-brands fa-github"></i> GitHub</a>
      </div>
    `,

    linkedin: `
      <p><strong>LinkedIn Profile:</strong></p>
      <p>View Kovid's profile and professional network updates:</p>
      <div class="chatbot-actions-row">
        <a href="https://www.linkedin.com/in/kovidanand05/" target="_blank" rel="noopener" class="chatbot-btn-link">
          <i class="fa-brands fa-linkedin"></i> Open LinkedIn
        </a>
      </div>
    `,

    github: `
      <p><strong>GitHub Repositories:</strong></p>
      <p>Explore Kovid's SQL scripts, analytics pipelines, and project codebases:</p>
      <div class="chatbot-actions-row">
        <a href="https://github.com/kovidanand" target="_blank" rel="noopener" class="chatbot-btn-link">
          <i class="fa-brands fa-github"></i> View GitHub
        </a>
      </div>
    `,

    portfolio: `
      <p><strong>About This Portfolio:</strong></p>
      <p>This interactive site showcases Kovid's projects, industry internships, technical certifications, and published research. Feel free to explore any section or ask for specific details.</p>
    `,

    resume: `
      <p><strong>Kovid Anand's Updated Resume:</strong></p>
      <div class="chatbot-actions-row">
        <a href="https://drive.google.com/file/d/17s_HE8uJDhbuurHSi5dzsvgd8fnuTt3L/view?usp=sharing" target="_blank" rel="noopener" class="chatbot-btn-link">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Open in Google Drive
        </a>
        <button type="button" class="chatbot-btn-action" data-chatbot-action="open-resume">
          <i class="fa-solid fa-eye"></i> View on Screen
        </button>
        <a href="https://drive.google.com/uc?export=download&id=17s_HE8uJDhbuurHSi5dzsvgd8fnuTt3L" target="_blank" rel="noopener" class="chatbot-btn-link">
          <i class="fa-solid fa-download"></i> Direct Download
        </a>
      </div>
      <p class="chatbot-meta-note">Highlights: BCA in Data Science (9.80 CGPA), Bluestock & NIAMT internships, analytics projects, and published AI research.</p>
    `,

    certifications: `
      <p><strong>Verified Credentials:</strong></p>
      <ul class="chatbot-list">
        <li><strong>Analytics:</strong> Google Analytics, SQL (HackerRank), Databricks Academy, TATA Forage</li>
        <li><strong>Product & Strategy:</strong> Product Roadmap (Coursera), Business Analysis (Coursera)</li>
        <li><strong>AI & Cloud:</strong> AWS Machine Learning Foundations, Excel & Dashboarding</li>
      </ul>
      <p class="chatbot-meta-note">You can also click any certificate card in the Certifications section to preview credential documents.</p>
    `,

    goal: `
      <p><strong>Career Trajectory:</strong></p>
      <p>Kovid is focused on transitioning into <strong>AI Product Management</strong>—combining quantitative data acumen, system architecture thinking, and user empathy to build high-impact products.</p>
    `,

    fallback: `
      <p>I would be pleased to assist you with that. Please choose a topic below or type a query:</p>
      <ul class="chatbot-list">
        <li><strong>Resume:</strong> Access his latest CV</li>
        <li><strong>Projects:</strong> SQL & data analytics case studies</li>
        <li><strong>Experience:</strong> Internships & technical roles</li>
        <li><strong>Contact:</strong> Email and social profiles</li>
      </ul>
    `
  };

  const ROUTES = [
    { keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'greetings'], key: 'greeting' },
    { keywords: ['resume', 'cv', 'curriculum vitae', 'drive link', 'google drive', 'pdf', 'download resume'], key: 'resume' },
    { keywords: ['who is', 'about', 'background', 'bio', 'introduce', 'profile', 'summary'], key: 'about' },
    { keywords: ['education', 'degree', 'university', 'college', 'coursework', 'cgpa', 'srm', 'academics'], key: 'education' },
    { keywords: ['experience', 'internship', 'intern', 'work history', 'bluestock', 'acmegrade', 'niamt', 'nifft', 'job'], key: 'experience' },
    { keywords: ['skill', 'skills', 'tech stack', 'technology', 'tools', 'python', 'sql', 'tech'], key: 'skills' },
    { keywords: ['project', 'projects', 'built', 'portfolio work', 'netflix', 'spotify', 'blinkit', 'coffee'], key: 'projects' },
    { keywords: ['publication', 'publications', 'paper', 'research', 'uasif', 'nlp', 'journal'], key: 'publications' },
    { keywords: ['linkedin profile', 'linkedin account', 'linkedin page', 'linkedin'], key: 'linkedin' },
    { keywords: ['github profile', 'github account', 'github repo', 'github'], key: 'github' },
    { keywords: ['certificate', 'certification', 'certified', 'credential', 'certifications'], key: 'certifications' },
    { keywords: ['goal', 'aspir', 'career', 'ai product', 'product manager', 'future', 'vision'], key: 'goal' },
    { keywords: ['portfolio site', 'portfolio website', 'this portfolio', 'website'], key: 'portfolio' },
    { keywords: ['contact', 'email', 'reach', 'hire', 'connect', 'phone', 'mail'], key: 'contact' }
  ];

  let opened = false;

  const addMessage = (content, role) => {
    const message = document.createElement('div');
    message.className = `chatbot-message chatbot-message-${role}`;
    message.innerHTML = content;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  };

  const showTyping = () => {
    const typing = document.createElement('div');
    typing.className = 'chatbot-typing';
    typing.setAttribute('aria-label', 'Assistant is typing');
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  };

  const answerFor = (query) => {
    const route = ROUTES.find(({ keywords }) => keywords.some(keyword => query.includes(keyword)));
    return KB[route ? route.key : 'fallback'];
  };

  const reply = (query, instant = false) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    addMessage(cleanQuery, 'user');
    const typing = showTyping();
    const delay = instant ? 350 : 500 + Math.floor(Math.random() * 400);
    window.setTimeout(() => {
      typing.remove();
      addMessage(answerFor(cleanQuery.toLowerCase()), 'bot');
    }, delay);
  };

  const openChat = () => {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close chatbot');
    teaser.classList.remove('is-visible');
    if (!opened) {
      opened = true;
      addMessage(KB.greeting, 'bot');
    }
    input.focus();
  };

  const closeChat = () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open chatbot');
  };

  toggle.addEventListener('click', () => panel.classList.contains('is-open') ? closeChat() : openChat());
  closeButton.addEventListener('click', closeChat);
  teaser.addEventListener('click', (event) => {
    if (!event.target.closest('#chatbotTeaserClose')) openChat();
  });
  teaserClose.addEventListener('click', (event) => {
    event.stopPropagation();
    teaser.classList.remove('is-visible');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value;
    input.value = '';
    reply(query);
  });

  quickReplies.forEach((chip) => chip.addEventListener('click', () => {
    reply(chip.textContent, true);
    input.focus();
  }));

  // Handle in-chat action buttons (such as "View on Screen")
  messages.addEventListener('click', (event) => {
    const actionBtn = event.target.closest('[data-chatbot-action="open-resume"]');
    if (actionBtn) {
      (document.getElementById('resumeHeroOpen') || document.querySelector('[data-action="open-resume"]'))?.click();
    }
  });

  window.setTimeout(() => {
    if (!opened && !panel.classList.contains('is-open')) teaser.classList.add('is-visible');
  }, 2500);
})();
