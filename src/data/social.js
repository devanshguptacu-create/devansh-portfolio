// EDIT HERE: sirf wahi links dikhte hain jinka url khali nahi hai.
export const contact = {
  email: 'kdevanshgupta@gmail.com',
  phone: '+91 8318830276',
  whatsapp: '918318830276',
  showPhone: true, // false karoge to phone number site par nahi dikhega
}

export const socials = [
  { key: 'linkedin', label: 'LinkedIn', icon: 'in', url: 'https://www.linkedin.com/in/devansh-gupta-ab3990415' },
  { key: 'github', label: 'GitHub', icon: 'GH', url: 'https://github.com/devanshguptacu-create' },
  { key: 'instagram', label: 'Instagram', icon: 'IG', url: 'https://www.instagram.com/devanshgupta.01' },
  { key: 'x', label: 'X (Twitter)', icon: 'X', url: '' },
  { key: 'youtube', label: 'YouTube', icon: 'YT', url: '' },
  { key: 'discord', label: 'Discord', icon: 'DC', url: '' },
]

export const activeSocials = socials.filter((s) => s.url && s.url.trim())
export const linkedinUrl = socials.find((s) => s.key === 'linkedin')?.url || ''