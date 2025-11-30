const techColors: Record<string, string> = {
    'Go': 'bg-blue-200 text-blue-800',
    'macOS': 'bg-gray-200 text-gray-800',
    'TouchID': 'bg-green-200 text-green-800',
    'Svelte': 'bg-orange-200 text-orange-800',
    // TypeScript, JavaScript, Python, SQL stay gray (not in this list)
    'React': 'bg-cyan-200 text-cyan-800',
    'Vue': 'bg-emerald-200 text-emerald-800',
    'Node.js': 'bg-green-200 text-green-800',
    'Java': 'bg-red-200 text-red-800',
    'C#': 'bg-purple-200 text-purple-800',
    'Ruby': 'bg-red-200 text-red-800',
    // PHP, Docker stay gray (not in this list)
    'HTML': 'bg-orange-200 text-orange-800',
    'CSS': 'bg-blue-200 text-blue-800',
    // MongoDB stays gray (not in this list)
    'Kubernetes': 'bg-blue-200 text-blue-800',
    'AWS': 'bg-yellow-200 text-yellow-800',
    'Azure': 'bg-blue-200 text-blue-800',
    'GCP': 'bg-red-200 text-red-800',
  };
  
  const typeColors: Record<string, string> = {
    'library': 'bg-purple-200 text-purple-800',
    'application': 'bg-green-200 text-green-800',
    'framework': 'bg-blue-200 text-blue-800',
    'tool': 'bg-yellow-200 text-yellow-800',
  };
  
  export function getTagColor(tech: string): string {
    return techColors[tech] || 'bg-gray-200 text-gray-800';
  }
  
  export function getTypeColor(type: string): string {
    return typeColors[type.toLowerCase()] || 'bg-gray-200 text-gray-800';
  }

  const statusColors: Record<string, string> = {
    'completed': 'bg-green-200 text-green-800',
    'ongoing': 'bg-yellow-200 text-yellow-800',
    'confidential': 'bg-red-200 text-red-800',
  };

  export function getStatusColor(status: string): string {
    return statusColors[status.toLowerCase()] || 'bg-gray-200 text-gray-800';
  }