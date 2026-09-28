// Helper to use absolute URLs on the server, and relative or NEXT_PUBLIC on client
const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side context inside Docker network
    return process.env.INTERNAL_API_URL || 'http://backend:4000';
  }
  // Client-side browser context
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

export const watchService = {
  async getAll() {
    try {
      const res = await fetch(`${getBaseUrl()}/api/watches`, { cache: 'no-store' });
      if (!res.ok) return [];
      return await res.json();
    } catch (error) {
      console.error("Failed to fetch watches:", error);
      return [];
    }
  },
  
  async getById(id: string) {
    try {
      const res = await fetch(`${getBaseUrl()}/api/watches/${id}`, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error(`Failed to fetch watch ${id}:`, error);
      return null;
    }
  },

  async create(data: any) {
    const res = await fetch(`${getBaseUrl()}/api/watches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create watch');
    return await res.json();
  },

  async update(id: string, data: any) {
    const res = await fetch(`${getBaseUrl()}/api/watches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update watch');
    return await res.json();
  },

  async delete(id: string) {
    const res = await fetch(`${getBaseUrl()}/api/watches/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete watch');
    return true;
  }
};
