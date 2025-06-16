'use client'

import React, { useState } from 'react'
import { FaTimes } from 'react-icons/fa'

interface Props {
  onClose: () => void
  onCreated: () => void
  ciudadIdSeleccionada: number
}

const ciudades = [
  { id: 1, nombre: 'Quito' },
  { id: 2, nombre: 'Guayaquil' },
  { id: 3, nombre: 'Cuenca' }
]

export default function VehiculoFormModal({ onClose, onCreated, ciudadIdSeleccionada }: Props) {
  const [form, setForm] = useState({
    placa: '',
    marca: '',
    modelo: '',
    tipo: '',
    cedula_dueno: '',
    ciudad_id: ciudadIdSeleccionada,
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: name === 'ciudad_id' ? Number(value) : value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { placa, marca, modelo, tipo, cedula_dueno, ciudad_id } = form
    if (!placa || !marca || !modelo || !tipo || !cedula_dueno || !ciudad_id) {
      setError('Todos los campos son requeridos.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/vehiculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (res.ok) {
        onCreated()
        onClose()
      } else {
        setError(data.message || 'Error al registrar vehículo')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
          <FaTimes />
        </button>
        <h3 className="text-lg font-bold text-blue-800 mb-4">Registrar Vehículo</h3>

        {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="placa" placeholder="Placa" className="w-full border p-2 rounded" value={form.placa} onChange={handleChange} />
          <input name="marca" placeholder="Marca" className="w-full border p-2 rounded" value={form.marca} onChange={handleChange} />
          <input name="modelo" placeholder="Modelo" className="w-full border p-2 rounded" value={form.modelo} onChange={handleChange} />
          <input name="tipo" placeholder="Tipo" className="w-full border p-2 rounded" value={form.tipo} onChange={handleChange} />
          <input name="cedula_dueno" placeholder="Cédula del Dueño" className="w-full border p-2 rounded" value={form.cedula_dueno} onChange={handleChange} />

          <select name="ciudad_id" value={form.ciudad_id} onChange={handleChange} className="w-full border p-2 rounded">
            {ciudades.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  )
}
