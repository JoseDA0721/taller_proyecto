import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { getClienteDetails } from '@/services/clienteService';
import { fetchServicios, fetchProductos } from '@/services/catalogoApi';
import { FaTimes } from 'react-icons/fa';

// --- Interfaces para un tipado más claro ---

interface Detalle {
  servicio_id?: number | null;
  producto_id?: number | null;
  cantidad: number;
  precio: number;
  nombre: string; // Se usa para mostrar el nombre en la lista de detalles
}

interface Orden {
  cliente_cedula: string;
  placa: string;
  fecha: string;
  estado: string;
  ciudad_id: number;
  empleado_cedula: string;
  form_pago_id: number;
  detalles: Omit<Detalle, 'nombre'>[]; // 'nombre' no se envía al backend
}

interface VehiculoSimple {
  placa: string;
  marca: string;
  modelo: string;
}

interface Servicio {
    servicio_id: number;
    nombre: string;
    precio: number;
}

interface Producto {
    producto_id: number;
    nombre: string;
    precio: number;
}


export default function CrearOrdenModal({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    cliente_cedula: '',
    placa: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'Recibida', // El estado por defecto ahora es "Recibida"
    ciudad_id: 1,
    empleado_cedula: '0100000002', // Empleado por defecto
    form_pago_id: 1, // Pago por defecto
    detalles: [] as Detalle[]
  });

  // Estados para la validación del cliente
  const [cedulaInput, setCedulaInput] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [clientVehicles, setClientVehicles] = useState<VehiculoSimple[]>([]);
  const [validationMessage, setValidationMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para el catálogo y la selección de items
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedItem, setSelectedItem] = useState({ type: 'servicio', id: '' });
  const [quantity, setQuantity] = useState(1);
  
  // Carga el catálogo de servicios y productos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const loadCatalogs = async () => {
        setIsLoading(true);
        try {
          const [serviciosData, productosData] = await Promise.all([
            fetchServicios(),
            fetchProductos()
          ]);
          setServicios(serviciosData);
          setProductos(productosData);
        } catch (error) {
          console.error("No se pudo cargar el catálogo", error);
          setValidationMessage({ type: 'error', text: 'Error al cargar catálogo de items.' });
        }
        setIsLoading(false);
      };
      loadCatalogs();
    }
  }, [isOpen]);

  const handleValidateCedula = async () => {
    if (!cedulaInput) {
      setValidationMessage({ type: 'error', text: 'Por favor, ingrese una cédula.' });
      return;
    }

    setIsLoading(true);
    setIsValidated(false);
    setValidationMessage({ type: 'info', text: 'Validando...' });

    const result = await getClienteDetails(cedulaInput);

    if (result.success) {
      const { cliente, vehiculos } = result.data;
      setForm(prev => ({
        ...prev,
        cliente_cedula: cliente.cedula,
        ciudad_id: cliente.ciudad_id,
        placa: vehiculos.length > 0 ? vehiculos[0].placa : '',
      }));
      setClientVehicles(vehiculos);
      setIsValidated(true);
      setValidationMessage({ type: 'success', text: `Cliente: ${cliente.nombre}` });
    } else {
      setClientVehicles([]);
      setValidationMessage({ type: 'error', text: result.message || 'Cliente no encontrado.' });
    }
    setIsLoading(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: ['ciudad_id', 'form_pago_id'].includes(name) ? parseInt(value) : value
    }));
  };

  const handleAddItem = () => {
    if (!selectedItem.id) return;

    let newItem: Detalle | undefined;

    if (selectedItem.type === 'servicio') {
        const servicio = servicios.find(s => s.servicio_id === parseInt(selectedItem.id));
        if (servicio) {
            newItem = {
                servicio_id: servicio.servicio_id,
                producto_id: null,
                cantidad: quantity,
                precio: Number(servicio.precio),
                nombre: servicio.nombre,
            };
        }
    } else {
        const producto = productos.find(p => p.producto_id === parseInt(selectedItem.id));
        if (producto) {
            newItem = {
                servicio_id: null,
                producto_id: producto.producto_id,
                cantidad: quantity,
                precio: Number(producto.precio),
                nombre: producto.nombre,
            };
        }
    }

    if (newItem) {
        setForm(prevForm => ({
            ...prevForm,
            detalles: [...prevForm.detalles, newItem!],
        }));
    }
  };

  const handleRemoveItem = (index: number) => {
    setForm(prevForm => ({
        ...prevForm,
        detalles: prevForm.detalles.filter((_, i) => i !== index),
    }));
  };

  const totalOrden = useMemo(() => {
    return form.detalles.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }, [form.detalles]);

  const handleCrear = async () => {
    if (!isValidated) {
      alert("Por favor, valide la cédula del cliente antes de guardar.");
      return;
    }
    if (clientVehicles.length > 0 && !form.placa) {
      alert("Por favor, seleccione un vehículo para la orden.");
      return;
    }
    if (form.detalles.length === 0) {
      alert("Debe agregar al menos un producto o servicio a la orden.");
      return;
    }

    setIsLoading(true);

    const orderData: Orden = {
      ...form,
      detalles: form.detalles.map(({ nombre, ...rest }) => rest) // Excluye 'nombre' del objeto final
    };
    
    try {
      const res = await fetch('http://localhost:5000/api/orden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear la orden');
      }

      onSuccess();
      setIsOpen(false);
    } catch (error) {
      console.error('Error al crear orden:', error);
      setValidationMessage({ type: 'error', text: (error as Error).message });
    }
    setIsLoading(false);
  };

  const getMessageColor = () => {
    if (validationMessage.type === 'success') return 'text-green-600';
    if (validationMessage.type === 'error') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
      >
        Crear Orden
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
          <Dialog.Title className="text-2xl font-bold text-blue-700 mb-4">Nueva Orden</Dialog.Title>

          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <input
                value={cedulaInput}
                onChange={(e) => setCedulaInput(e.target.value)}
                placeholder="Cédula Cliente"
                className="border border-black p-2 w-full rounded text-black bg-white"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleValidateCedula}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold transition disabled:bg-gray-400"
              >
                {isLoading ? '...' : 'Validar'}
              </button>
            </div>

            {validationMessage.text && (
              <p className={`text-sm ${getMessageColor()}`}>{validationMessage.text}</p>
            )}

            {isValidated && (
              <>
                <label className="block text-sm font-medium text-gray-700">Vehículo</label>
                {clientVehicles.length > 0 ? (
                  <select
                    name="placa"
                    value={form.placa}
                    onChange={handleChange}
                    className="border border-black p-2 w-full rounded text-black bg-white"
                  >
                    {clientVehicles.map(v => (
                      <option key={v.placa} value={v.placa}>
                        {v.placa} ({v.marca} {v.modelo})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded">Este cliente no tiene vehículos registrados.</p>
                )}
                
                {/* --- SECCIÓN PARA AÑADIR PRODUCTOS/SERVICIOS --- */}
                <div className="mt-4 border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Añadir Items a la Orden</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <select
                        value={selectedItem.type}
                        onChange={(e) => setSelectedItem({ type: e.target.value as 'servicio' | 'producto', id: '' })}
                        className="col-span-1 border border-black p-2 rounded text-black bg-white"
                    >
                        <option value="servicio">Servicio</option>
                        <option value="producto">Producto</option>
                    </select>

                    <select
                        value={selectedItem.id}
                        onChange={(e) => setSelectedItem({ ...selectedItem, id: e.target.value })}
                        className="col-span-2 border border-black p-2 rounded text-black bg-white"
                    >
                        <option value="">-- Seleccione un item --</option>
                        {selectedItem.type === 'servicio'
                        ? servicios.map(s => <option key={s.servicio_id} value={s.servicio_id}>{s.nombre} (${Number(s.precio).toFixed(2)})</option>)
                        : productos.map(p => <option key={p.producto_id} value={p.producto_id}>{p.nombre} (${Number(p.precio).toFixed(2)})</option>)
                        }
                    </select>
                    
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="col-span-1 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
                    >
                        Añadir
                    </button>
                    </div>

                    <div className="mt-4">
                        <h5 className="font-semibold text-sm text-gray-70">Detalles:</h5>
                        {form.detalles.length === 0 ? (
                            <p className="text-sm text-gray-50 mt-2 p-2 bg-gray-50 rounded">No hay items en la orden.</p>
                        ) : (
                            <div className="mt-2 border rounded max-h-48 overflow-y-auto">
                                {form.detalles.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 border-b last:border-b-0">
                                        <span className="text-sm">{item.nombre} (x{item.cantidad})</span>
                                        <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold">${(item.precio * item.cantidad).toFixed(2)}</span>
                                        <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700">
                                                <FaTimes size={12}/>
                                        </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-end p-2 bg-gray-1 font-bold text-lg">
                                    Total: ${totalOrden.toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              </>
            )}

          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-black rounded font-semibold transition">
              Cancelar
            </button>
            <button
              onClick={handleCrear}
              disabled={!isValidated || isLoading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition disabled:bg-blue-300"
            >
              {isLoading ? 'Cargando...' : 'Guardar'}
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}