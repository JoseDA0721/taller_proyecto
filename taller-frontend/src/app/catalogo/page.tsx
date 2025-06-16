'use client'

import React, { useEffect, useState } from 'react'

interface Servicio {
  servicio_id: number
  nombre: string
  precio: number | string
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
  precio: number | string
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
          fetch('http://localhost:5000/api/servicios'),
fetch('http://localhost:5000/api/ciudades'),
fetch('http://localhost:5000/api/tipos-vehiculo'),
fetch('http://localhost:5000/api/productos')

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
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-bold text-[#001A30]">Catálogo</h2>

      {[
        {
          title: 'Servicios',
          data: servicios,
          columns: ['ID', 'Nombre', 'Precio'],
          rows: (s: Servicio) => [
            s.servicio_id,
            s.nombre,
            `$${Number(s.precio).toFixed(2)}`
          ],
        },
        {
          title: 'Ciudades',
          data: ciudades,
          columns: ['ID', 'Nombre'],
          rows: (c: Ciudad) => [c.ciudad_id, c.nombre],
        },
        {
          title: 'Tipos de Vehículo',
          data: tipos,
          columns: ['ID', 'Nombre'],
          rows: (t: TipoVehiculo) => [t.tipo_id, t.nombre],
        },
        {
          title: 'Productos',
          data: productos,
          columns: ['ID', 'Nombre', 'Precio', 'Stock'],
          rows: (p: Producto) => [
            p.producto_id,
            p.nombre,
            `$${Number(p.precio).toFixed(2)}`,
            p.stock
          ],
        },
      ].map((section, idx) => (
        <div key={idx}>
          <h3 className="text-xl font-semibold text-[#001A30] mb-2">{section.title}</h3>
          <div className="overflow-x-auto rounded-lg shadow bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-blue-100 text-blue-900 font-medium">
                <tr>
                  {section.columns.map((col, i) => (
                    <th key={i} className="p-3 text-left">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.data.map((item: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    {section.rows(item).map((cell: string | number, j: number) => (
                      <td key={j} className="p-3 text-[#1a1a1a]">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
