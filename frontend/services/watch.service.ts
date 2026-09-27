const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const MOCK_WATCHES = [
  { id: '1', name: 'Nautilus 5711', description: 'Automatic Movement', price: 125000, imageUrl: 'placeholder', category: 'original' },
  { id: '2', name: 'Royal Oak', description: 'Self-winding Chronograph', price: 85000, imageUrl: 'placeholder', category: 'highcopy' },
  { id: '3', name: 'Daytona Cosmograph', description: 'Oyster Perpetual', price: 35000, imageUrl: 'placeholder', category: 'original' },
  { id: '4', name: 'Santos de Cartier', description: 'Mechanical Automatic', price: 7500, imageUrl: 'placeholder', category: 'original' },
  { id: '5', name: 'Lange 1', description: 'Manual Winding', price: 42000, imageUrl: 'placeholder', category: 'custom' },
  { id: '6', name: 'Submariner Date', description: 'Waterproof Diver', price: 15000, imageUrl: 'placeholder', category: 'highcopy' }
];

// Helper to use absolute URLs on the server, and relative or NEXT_PUBLIC on client
const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://backend:4000';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

export const watchService = {
  async getAll() {
    try {
      const res = await fetch(`${getBaseUrl()}/api/watches`, { cache: 'no-store' });
      if (!res.ok) return MOCK_WATCHES;
      const data = await res.json();
      return data.length > 0 ? data : MOCK_WATCHES;
    } catch (error) {
      console.error("Failed to fetch watches:", error);
      return MOCK_WATCHES;
    }
  },
  
  async getById(id: string) {
    try {
      const res = await fetch(`${getBaseUrl()}/api/watches/${id}`, { cache: 'no-store' });
      if (!res.ok) return MOCK_WATCHES.find(w => w.id === id) || null;
      return await res.json();
    } catch (error) {
      console.error(`Failed to fetch watch ${id}:`, error);
      return MOCK_WATCHES.find(w => w.id === id) || null;
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
