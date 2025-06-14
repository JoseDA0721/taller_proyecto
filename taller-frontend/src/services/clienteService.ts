const BASE_URL = 'http://localhost:5000/api';

export async function getClientes(ciudad?: string) {
  try {
    const url = ciudad ? `${BASE_URL}/clientes?ciudad=${ciudad}` : `${BASE_URL}/clientes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener los clientes');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createCliente(cliente: any) {
  try {
    const res = await fetch(`${BASE_URL}/cliente`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente),
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: 'Error de conexión' };
  }
}