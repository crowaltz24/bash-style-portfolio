export const PROFILE = {
  name: 'Abhay Tyagi',
  title: 'Aspiring Full-Stack & ML Engineer',
  location: 'Noida, Uttar Pradesh, India',
  email: 'abhay.tyagi [at] hotmail.com',
  github: 'github.com/crowaltz24',
  linkedin: 'linkedin.com/in/abhay-tyagi-61329a28a/',
  birthdate: '2005-11-24', // YYYY-MM-DD
    shellUser: 'abhay',
    host: 'portfolio',
  skills: {
    languages: ['Python', 'C/C++', 'JavaScript', 'TypeScript', 'SQL', 'Java'],
    frontend: ['React', 'Vite', 'TailwindCSS'],
    backend: ['Node.js', 'Express', 'Flask'],
    ml: ['PyTorch', 'TensorFlow', 'scikit-learn', 'Keras', 'RAG', 'LlamaIndex', 'NLTK', 'SpaCy', 'OpenCV'],
    data: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'PowerBI'],
    databases: ['MySQL', 'PostgreSQL (Prisma/Supabase)', 'NoSQL', 'ChromaDB'],
    devops: ['Docker', 'AWS', 'Virtual Machines'],
    tools: ['Git', 'Electron', 'REST APIs', 'Prompt Engineering'],
    other: ['MLOps', 'Web Scraping (Selenium, Requests, BeautifulSoup)', 'Audio APIs'],
    soft: ['Communication', 'Agile', 'Teamwork']
  },
  experience: [
    { role: 'Task Lead', company: 'VITB AI Innovators Hub', period:'2025', note: 'Worked on Darzi - AI Resume Tailor Suite.' },
    { role: 'AI Club Member', company: 'University AI Club', period: '2024', note: 'Organized & participated in ML workshops and hackathons; contributed to community technical projects.' }
  ],
  education: [
    { degree: 'B.Tech Computer Science (AI/ML)', school: 'VIT Bhopal University (2023–2027)', period: '2023–2027' },
    { degree: 'Higher Secondary (Science)', school: 'Senior School (Graduated 2023)', period: 'Up to 2023' }
  ],
  projects: [
    { name: 'Serenade', desc: 'Open-source music player & visualizer; multi-service backend; hackathon prize winner.', url: 'https://github.com/crowaltz24/serenade' },
    { name: 'Pathwise', desc: 'AI edtech platform for learning roadmaps, notes & chatbot (LLM backend).', url: 'https://github.com/crowaltz24/pathwise' },
    { name: 'DepoIndex', desc: 'Automated, AI-powered workflow that reads deposition transcripts, detects every distinct subject discussed, and produces a Table of Contents (TOC).', url: 'https://github.com/crowaltz24/depoindex' },
    { name: 'Legal Annotator', desc: 'NLP clause classification & PDF annotation using BERT family models.', url: 'https://colab.research.google.com/drive/1MM1i2BvdT9rKPwWMdlE1F-xw7EHGBc2L' }
  ],
  certifications: [
    'IBM DevOps, Agile & Design Thinking',
    'Cisco Networking Basics',
    'Python Fundamentals'
  ],
  summary: 'Aspiring full-stack & ML engineer with hands-on builds in web, modern AI/LLM frameworks, and applied NLP. Hackathon winner with end-to-end project delivery across edtech and legal tech domains.' ,
  languages: ['English', 'Hindi'],
  hobbies: ['Guitar', 'Music Production', 'Table Tennis', 'Reading', 'Creative Writing']
} as const;

export type Profile = typeof PROFILE;
