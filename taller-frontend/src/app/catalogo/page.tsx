'use client'

import React, { useEffect, useState } from 'react'

interface Servicio {
  servicio_id: number
  nombre: string
  precio: number
}

interface Ciudad {
  ciudad_id: number
  nombre: string
}

interface TipoVehiculo {
  tipo_id: number
  nombre: string
}

interface Producto {
  producto_id: number
  nombre: string
  precio: number
  stock: number
}

export default function CatalogoPage() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [tipos, setTipos] = useState<TipoVehiculo[]>([])
  const [productos, setProductos] = useState<Producto[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sRes, cRes, tRes, pRes] = await Promise.all([
          fetch('http://localhost:5000/api/catalogos/servicios'),
          fetch('http://localhost:5000/api/catalogos/ciudades'),
          fetch('http://localhost:5000/api/catalogos/tipos-vehiculo'),
          fetch('http://localhost:5000/api/catalogos/productos')
        ])

        const [sData, cData, tData, pData] = await Promise.all([
          sRes.json(),
          cRes.json(),
          tRes.json(),
          pRes.json()
        ])

        setServicios(sData)
        setCiudades(cData)
        setTipos(tData)
        setProductos(pData)
      } catch (error) {
        console.error('Error al cargar catálogo:', error)
      }
    }

    fetchAll()
  }, [])

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-[#001A30]">Catálogo</h2>

      {/* Servicios */}
      <div>
        <h3 className="text-xl font-semibold text-[#001A30] mb-2">Servicios</h3>
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Precio</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.servicio_id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-900">{s.servicio_id}</td>
                  <td className="p-3 text-gray-900">{s.nombre}</td>
                  <td className="p-3 text-gray-900">${s.precio.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ciudades */}
      <div>
        <h3 className="text-xl font-semibold text-[#001A30] mb-2">Ciudades</h3>
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Nombre</th>
              </tr>
            </thead>
            <tbody>
              {ciudades.map((c) => (
                <tr key={c.ciudad_id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-900">{c.ciudad_id}</td>
                  <td className="p-3 text-gray-900">{c.nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tipos de Vehículo */}
      <div>
        <h3 className="text-xl font-semibold text-[#001A30] mb-2">Tipos de Vehículo</h3>
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Nombre</th>
              </tr>
            </thead>
            <tbody>
              {tipos.map((t) => (
                <tr key={t.tipo_id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-900">{t.tipo_id}</td>
                  <td className="p-3 text-gray-900">{t.nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Productos */}
      <div>
        <h3 className="text-xl font-semibold text-[#001A30] mb-2">Productos</h3>
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Precio</th>
                <th className="p-3 text-left">Stock</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.producto_id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-900">{p.producto_id}</td>
                  <td className="p-3 text-gray-900">{p.nombre}</td>
                  <td className="p-3 text-gray-900">${p.precio.toFixed(2)}</td>
                  <td className="p-3 text-gray-900">{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
