import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { getClienteDetails } from '@/services/clienteService';

// Interfaces para tipado
interface Orden {
  cliente_cedula: string;
  placa: string;
  fecha: string;
  estado: string;
  ciudad_id: number;
  empleado_cedula: string;
  form_pago_id: number;
  detalles: {
    servicio_id?: number;
    producto_id?: number;
    cantidad: number;
    precio: number;
  }[];
}

interface VehiculoSimple {
  placa: string;
  marca: string;
  modelo: string;
}

export default function CrearOrdenModal({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Orden>({
    cliente_cedula: '',
    placa: '',
    fecha: new Date().toISOString(),
    estado: 'En Proceso',
    ciudad_id: 1, // Valor por defecto
    empleado_cedula: '0100000002', // Empleado por defecto
    form_pago_id: 1, // Pago por defecto
    detalles: [{ producto_id: 1, cantidad: 1, precio: 100.0 }]
  });

  // Nuevos estados para la validación
  const [cedulaInput, setCedulaInput] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [clientVehicles, setClientVehicles] = useState<VehiculoSimple[]>([]);
  const [validationMessage, setValidationMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

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
      setForm({
        ...form,
        cliente_cedula: cliente.cedula,
        ciudad_id: cliente.ciudad_id,
        placa: vehiculos.length > 0 ? vehiculos[0].placa : '', // Auto-selecciona el primer vehículo
      });
      setClientVehicles(vehiculos);
      setIsValidated(true);
      setValidationMessage({ type: 'success', text: `Cliente Encontrado: ${cliente.nombre}` });
    } else {
      setClientVehicles([]);
      setValidationMessage({ type: 'error', text: result.message || 'Cliente no encontrado.' });
    }
    setIsLoading(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: ['ciudad_id', 'form_pago_id'].includes(name) ? parseInt(value) : value
    });
  };

  const handleCrear = async () => {
    if (!isValidated) {
      alert("Por favor, valide la cédula del cliente antes de guardar.");
      return;
    }
    if (clientVehicles.length > 0 && !form.placa) {
      alert("Por favor, seleccione un vehículo para la orden.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
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
        <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
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
              </>
            )}

            <select name="estado" value={form.estado} onChange={handleChange} className="border border-black p-2 w-full rounded text-black bg-white">
              <option value="En Proceso">En Proceso</option>
              <option value="Finalizada">Finalizada</option>
              <option value="Recibida">Recibida</option>
            </select>
            <select name="ciudad_id" value={form.ciudad_id} onChange={handleChange} className="border border-black p-2 w-full rounded text-black bg-white" disabled>
              <option value={1}>Quito</option>
              <option value={2}>Guayaquil</option>
              <option value={3}>Cuenca</option>
            </select>
            <input name="empleado_cedula" value={form.empleado_cedula} onChange={handleChange} placeholder="Cédula del Empleado" className="border border-black p-2 w-full rounded text-black bg-white"/>
            <select name="form_pago_id" value={form.form_pago_id} onChange={handleChange} className="border border-black p-2 w-full rounded text-black bg-white">
              <option value={1}>Efectivo</option>
              <option value={2}>Crédito</option>
              <option value={3}>Transferencia</option>
            </select>
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