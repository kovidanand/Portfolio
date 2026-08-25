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
    greeting: "Hi! I'm Kovid's AI Assistant. Ask me about Kovid's background, skills, projects, experience, publications, or how to get in touch.",
    about: "Kovid is a Data Science undergraduate at SRM Institute of Science and Technology with a 9.80 CGPA and department rank-holder recognition. He focuses on data analytics, SQL, and machine learning while transitioning into AI Product Management.",
    education: "Kovid is pursuing a BCA in Data Science at SRM University from June 2024 to May 2027, with a 9.80 CGPA. His coursework includes SQL and PL/SQL, data analytics, machine learning, database management, AI, Python, statistics and probability, and big data analytics.",
    experience: "<strong>Bluestock Fintech</strong> - Data Analyst Intern, May-July 2026, remote from Pune. Kovid analyzed financial datasets statistically and from an IT business perspective, modeled trends, and improved reporting accuracy.<br><br><strong>National Institute of Advanced Manufacturing Technology (formerly NIFFT)</strong> - Project Intern, June-July 2026, Ranchi. He worked on PLC logic for standard gates and a NE555 timer square-wave generator circuit.<br><br><strong>Acmegrade</strong> - Data Science Intern, March-June 2025, remote from Bengaluru. He performed preprocessing, EDA, and data modeling with Python and Jupyter.",
    skills: "Kovid works with Python, SQL, Jupyter, MySQL, Git/GitHub, PostHog, Pandas, NumPy, scikit-learn, Power BI, and DAX. His product toolkit includes Linear, Jira, Notion, ChatPRD, Perplexity AI, and NotebookLM. For no-code and prototyping, he uses Lovable, Vercel, Bolt.new, Cursor, Figma, Airtable, Zapier, n8n, Bubble, and Make.",
    projects: "Kovid's projects include <a href=\"https://github.com/kovidanand/SQL-Monday_Coffee_Analysis_P3\" target=\"_blank\" rel=\"noopener\"><strong>Monday Coffee Expansion Analysis</strong></a> for city-level SQL analysis; <a href=\"https://github.com/kovidanand/SQL-Netflix_Analysis_P4\" target=\"_blank\" rel=\"noopener\"><strong>Netflix Content Analytics</strong></a> for catalog and business intelligence analysis; <a href=\"https://github.com/kovidanand/Blinkit-Data-Analysis\" target=\"_blank\" rel=\"noopener\"><strong>Blinkit Grocery Sales Analysis</strong></a> using Pandas, NumPy, and Matplotlib; and <a href=\"https://github.com/kovidanand/SQL-Spotify_Analysis_P5\" target=\"_blank\" rel=\"noopener\"><strong>Spotify Streaming Intelligence</strong></a> using advanced SQL analytics.",
    publications: "Kovid co-authored <strong>Unified AI-Driven Sports Intelligence Framework (UASIF)</strong> for the 3rd International Conference on Advanced Sports Science (ICASSIPT-2026). It combines ETL, LSTM-XGBoost, and Random Survival Forests in a four-layer architecture and reached 85.5% model accuracy. He also co-authored <strong>Progress In Natural Language Processing: Implications, Challenges and Future Directions</strong> in IJBER in 2025.",
    contact: "You can reach Kovid at <a href=\"mailto:kovidanand05@gmail.com\">kovidanand05@gmail.com</a>.<br><br><a href=\"https://www.linkedin.com/in/kovidanand05/\" target=\"_blank\" rel=\"noopener\">LinkedIn</a> · <a href=\"https://github.com/kovidanand\" target=\"_blank\" rel=\"noopener\">GitHub</a>",
    linkedin: "Kovid's LinkedIn profile is available at <a href=\"https://www.linkedin.com/in/kovidanand05/\" target=\"_blank\" rel=\"noopener\">linkedin.com/in/kovidanand05</a>. LinkedIn profile details are kept as a reference link here; the public page does not expose enough readable content in this site environment to safely add unverified headline or endorsement claims.",
    github: "Kovid's GitHub profile is <a href=\"https://github.com/kovidanand\" target=\"_blank\" rel=\"noopener\">github.com/kovidanand</a>. Public repositories include <a href=\"https://github.com/kovidanand/SQL-Monday_Coffee_Analysis_P3\" target=\"_blank\" rel=\"noopener\">Monday Coffee Analysis</a>, <a href=\"https://github.com/kovidanand/SQL-Netflix_Analysis_P4\" target=\"_blank\" rel=\"noopener\">Netflix Analysis</a>, <a href=\"https://github.com/kovidanand/SQL-Spotify_Analysis_P5\" target=\"_blank\" rel=\"noopener\">Spotify Analysis</a>, <a href=\"https://github.com/kovidanand/SQL-Retail_Sales_Analysis_P1\" target=\"_blank\" rel=\"noopener\">Retail Sales Analysis</a>, <a href=\"https://github.com/kovidanand/Blinkit-Data-Analysis\" target=\"_blank\" rel=\"noopener\">Blinkit Data Analysis</a>, and <a href=\"https://github.com/kovidanand/PBi-EcomExpress_sales_dashboard\" target=\"_blank\" rel=\"noopener\">EcomExpress Dashboard</a>.",
    portfolio: "You are viewing Kovid's portfolio. It presents his data-focused background, skills, projects, internships, certifications, publications, and contact links. Ask me about any section for a concise summary.",
    resume: "Kovid's resume covers his education, internships, projects, technical skills, and publications. <a href=\"https://drive.google.com/file/d/1K-1pu7f1o-23fwB0GyP1M63fQtQr-4cg/view\" target=\"_blank\" rel=\"noopener\">Open Kovid's resume</a>, or contact him at <a href=\"mailto:kovidanand05@gmail.com\">kovidanand05@gmail.com</a> to request a copy.",
    certifications: "The portfolio lists Google Analytics, SQL on HackerRank, Databricks Academy, Product Roadmap and Business Analysis on Coursera, TATA Forage Data Analysis, Excel and Dashboarding on Coursera, and Machine Learning Foundations from AWS.",
    goal: "Kovid is aspiring to become an AI Product Manager, combining data, technology, and strategy to build impactful, scalable products and solve real business problems.",
    fallback: "I'm not sure about that yet. Try one of the buttons below, or ask about Kovid's skills, experience, projects, publications, or contact details."
  };

  const ROUTES = [
    { keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'], key: 'greeting' },
    { keywords: ['who is', 'about', 'background', 'bio', 'introduce', 'tell me about'], key: 'about' },
    { keywords: ['education', 'degree', 'university', 'college', 'coursework', 'cgpa'], key: 'education' },
    { keywords: ['experience', 'internship', 'intern', 'work history', 'bluestock', 'acmegrade', 'niamt', 'nifft'], key: 'experience' },
    { keywords: ['skill', 'skills', 'tech stack', 'technology', 'tools', 'python', 'sql'], key: 'skills' },
    { keywords: ['project', 'projects', 'built', 'portfolio work', 'netflix', 'spotify', 'blinkit', 'coffee'], key: 'projects' },
    { keywords: ['publication', 'publications', 'paper', 'research', 'uasif', 'nlp'], key: 'publications' },
    { keywords: ['linkedin profile', 'linkedin account', 'linkedin page'], key: 'linkedin' },
    { keywords: ['github profile', 'github account', 'github repositories', 'github repo'], key: 'github' },
    { keywords: ['portfolio site', 'portfolio website', 'this portfolio'], key: 'portfolio' },
    { keywords: ['contact', 'email', 'reach', 'hire', 'connect', 'linkedin', 'github'], key: 'contact' },
    { keywords: ['resume', 'cv', 'curriculum vitae'], key: 'resume' },
    { keywords: ['certificate', 'certification', 'certified', 'credential'], key: 'certifications' },
    { keywords: ['goal', 'aspir', 'career', 'ai product', 'product manager', 'future'], key: 'goal' }
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
    const delay = instant ? 500 : 700 + Math.floor(Math.random() * 701);
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

  window.setTimeout(() => {
    if (!opened && !panel.classList.contains('is-open')) teaser.classList.add('is-visible');
  }, 2500);
})();
