'use client'

import React, { useEffect, useState } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import VehiculoFormModal from '@/components/VehiculoFormModal'
import { deleteVehiculo } from '@/services/vehiculoService';


interface Vehiculo {
  placa: string
  marca: string
  modelo: string
  tipo: string
  cedula_dueno: string
}

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [showModal, setShowModal] = useState(false)
  
  const handleDelete = async (placa: string) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este vehículo?');
    if (!confirmar) return;

    const result = await deleteVehiculo(placa);
    if (result.success) {
      setVehiculos(vehiculos.filter(v => v.placa !== placa));
    } else {
      alert(result.message || 'Error al eliminar vehículo');
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('http://localhost:5000/api/vehiculos') // ✅ Quito por defecto
        const data = await res.json()
        console.log('Vehículos recibidos:', data)
        if (Array.isArray(data)) {
          setVehiculos(data)
        } else {
          setVehiculos([])
        }
      } catch (error) {
        console.error('Error al obtener vehículos:', error)
        setVehiculos([])
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#001A30]">Listado de Vehículos (Global)</h2>
        <button
  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
  onClick={() => setShowModal(true)}
>
  <FaPlus />
  Nuevo Vehículo
</button>

      </div>

      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="p-3 text-left">Placa</th>
              <th className="p-3 text-left">Marca</th>
              <th className="p-3 text-left">Modelo</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Cédula Dueño</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((vehiculo) => (
              <tr key={vehiculo.placa} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-900 font-medium">{vehiculo.placa}</td>
                <td className="p-3 text-gray-900">{vehiculo.marca}</td>
                <td className="p-3 text-gray-900">{vehiculo.modelo}</td>
                <td className="p-3 text-gray-900">{vehiculo.tipo}</td>
                <td className="p-3 text-gray-900">{vehiculo.cedula_dueno}</td>
                <td className="p-3 flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800" title="Editar">
                    <FaEdit />
                  </button>
                  <button className="text-red-600 hover:text-red-800"
                    title="Eliminar"
                    onClick={() => handleDelete(vehiculo.placa)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showModal && (
  <VehiculoFormModal
    onClose={() => setShowModal(false)}
    onCreated={async () => {
  setShowModal(false)
  try {
    const res = await fetch('http://localhost:5000/api/vehiculos')
    const data = await res.json()
    if (Array.isArray(data)) {
      setVehiculos(data)
    } else {
      setVehiculos([])
    }
  } catch (error) {
    console.error('Error al refrescar vehículos:', error)
    setVehiculos([])
  }
}}
  />
)}

      </div>
    </div>
  )
}
