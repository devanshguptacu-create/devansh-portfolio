// =====================================================================
// EDIT YOUR DETAILS HERE. Used as the default content; once you add
// items in the admin dashboard, the database content takes over.
// =====================================================================
export const profile = {
  name: 'Devansh Gupta',
  headline: 'Building Intelligent Solutions Through Code.',
  intro: 'B.Tech CSE (AI & ML) student at Chandigarh University. I enjoy building practical software, learning emerging technologies and exploring AI applications.',
  roles: ['AI/ML Enthusiast', 'Software Developer', 'Technology Explorer', 'Open-source Learner'],
  location: 'India',
  about: [
    'I am a B.Tech CSE student specializing in Artificial Intelligence and Machine Learning at Chandigarh University.',
    'I am interested in developing practical software solutions, learning emerging technologies, exploring AI applications and contributing to open-source projects.',
    'I learn best through hands-on development, experimentation and collaborative projects.',
  ],
  status: { show: true, text: 'Open to internships and learning opportunities' }, // set show:false to hide
  useAvatar: false,          // true = illustrated avatar, false = your photo
  avatarPath: 'avatar.svg', // file inside /public
  photoPath: 'photo.jpg',   // put your photo in /public (falls back to avatar if missing)
  resumePath: 'resume.pdf', // put your resume in /public
  github: 'https://github.com/devanshguptacu-create',
  linkedin: '',             // PASTE your LinkedIn URL here
  email: '',                // PASTE your email here
}

export const skills = [
  { category: 'Programming', name: 'C', level_label: 'Learning' },
  { category: 'Programming', name: 'Python', level_label: 'Learning' },
  { category: 'Programming', name: 'JavaScript', level_label: 'Learning' },
  { category: 'Frontend', name: 'HTML5', level_label: 'Comfortable' },
  { category: 'Frontend', name: 'CSS3', level_label: 'Comfortable' },
  { category: 'AI/ML', name: 'AI fundamentals', level_label: 'Learning' },
  { category: 'AI/ML', name: 'ML fundamentals', level_label: 'Learning' },
  { category: 'AI/ML', name: 'Data analysis', level_label: 'Learning' },
  { category: 'Tools', name: 'Git & GitHub', level_label: 'Comfortable' },
  { category: 'Tools', name: 'VS Code', level_label: 'Comfortable' },
  { category: 'Tools', name: 'Azure fundamentals', level_label: 'Learning' },
]

export const projects = [
  { id: 'medisaathi', title: 'MediSaathi AI', status: 'In Progress',
    description: 'An AI-powered personal health copilot concept to make medical documents and health information easier to understand.',
    details: 'Planned/in-development features: medical document upload, PDF text extraction with PDF.js, English and Hindi accessibility, a healthcare-focused dashboard and simplified medical information. This is a concept project and not all features are finished.',
    tech: ['HTML', 'CSS', 'JavaScript', 'PDF.js'],
    github_url: 'https://github.com/devanshguptacu-create/MediSaathi-AI', demo_url: '' },
  { id: 'touchgrass', title: 'TouchGrass AI', status: 'Completed',
    description: 'A personal/open-source challenge project developed during my Hacktoberfest journey.',
    details: '', tech: [],
    github_url: 'https://github.com/devanshguptacu-create/TouchGrass-AI', demo_url: '' },
  { id: 'sidehustle', title: 'SideHustleStudio', status: 'Completed',
    description: 'A web development project created during my Hacktoberfest learning journey.',
    details: '', tech: [], github_url: '', demo_url: '' }, // ADD repo URL after verifying
  { id: 'azure', title: 'Azure Save Forest', status: 'Completed',
    description: 'An academic cloud computing project using Azure virtual networking, a virtual machine and website hosting.',
    details: '', tech: ['Microsoft Azure', 'Virtual Machines', 'Networking', 'HTML'], github_url: '', demo_url: '' },
]

export const learning = [
  'Python', 'Data Structures and Algorithms', 'Machine Learning',
  'AI application development', 'Software engineering', 'Open-source contribution',
]
