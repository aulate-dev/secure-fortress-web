import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'
import { extractApiErrorMessage } from '../lib/http-error'
import { type ProductFormData, type ProductFormInput, productSchema } from '../schemas/product.schema'
import type { Product } from '../types/product'

type ModalMode = 'create' | 'edit'

export const ProductsPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const canManageProducts = user?.role === 'SuperAdmin' || user?.role === 'Registrador'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get<{ products: Product[] }>('/products')
      setProducts(data.products)
    } catch (error) {
      showToast(extractApiErrorMessage(error), 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProducts()
  }, [fetchProducts])

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedProduct(null)
    reset({
      sku_alfanumerico: '',
      nombre: '',
      descripcion: '',
      cantidad: 0,
      precio: 0,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setModalMode('edit')
    setSelectedProduct(product)
    reset({
      sku_alfanumerico: product.sku_alfanumerico,
      nombre: product.nombre,
      descripcion: product.descripcion,
      cantidad: product.cantidad,
      precio: product.precio,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const handleDelete = async (product: Product) => {
    if (!canManageProducts) {
      showToast('No tienes permisos para eliminar productos.', 'error')
      return
    }

    try {
      await api.delete(`/products/${product.id}`)
      showToast('Producto eliminado correctamente.', 'success')
      await fetchProducts()
    } catch (error) {
      const message = extractApiErrorMessage(error)
      if (message.toLowerCase().includes('access denied')) {
        showToast('Error de permisos: no puedes eliminar productos.', 'error')
        return
      }
      showToast(message, 'error')
    }
  }

  const onSubmit = async (values: ProductFormData) => {
    if (!canManageProducts) {
      showToast('No tienes permisos para gestionar productos.', 'error')
      return
    }

    try {
      if (modalMode === 'create') {
        await api.post('/products', values)
        showToast('Producto creado correctamente.', 'success')
      } else if (selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, values)
        showToast('Producto actualizado correctamente.', 'success')
      }
      closeModal()
      await fetchProducts()
    } catch (error) {
      const message = extractApiErrorMessage(error)
      if (message.toLowerCase().includes('access denied')) {
        showToast('Error de permisos: no puedes gestionar productos.', 'error')
        return
      }
      showToast(message, 'error')
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Gestion de productos</h2>
          <p className="text-sm text-slate-600">Inventario central de Secure Fortress.</p>
        </div>
        {canManageProducts && (
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Crear producto
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Codigo</th>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Cantidad</th>
              <th className="px-4 py-3 font-semibold">Precio</th>
              {canManageProducts && <th className="px-4 py-3 font-semibold">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={canManageProducts ? 5 : 4}>
                  Cargando productos...
                </td>
              </tr>
            )}
            {!isLoading && products.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={canManageProducts ? 5 : 4}>
                  No hay productos registrados.
                </td>
              </tr>
            )}
            {!isLoading &&
              products.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{product.sku_alfanumerico}</td>
                  <td className="px-4 py-3">{product.nombre}</td>
                  <td className="px-4 py-3">{product.cantidad}</td>
                  <td className="px-4 py-3">${Number(product.precio).toFixed(2)}</td>
                  {canManageProducts && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(product)}
                          className="rounded border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">
              {modalMode === 'create' ? 'Crear producto' : 'Editar producto'}
            </h3>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="sku">
                  Codigo
                </label>
                <input
                  id="sku"
                  {...register('sku_alfanumerico')}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
                {errors.sku_alfanumerico && (
                  <p className="mt-1 text-xs text-red-600">{errors.sku_alfanumerico.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="nombre">
                  Nombre
                </label>
                <input
                  id="nombre"
                  {...register('nombre')}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="descripcion">
                  Descripcion
                </label>
                <textarea
                  id="descripcion"
                  {...register('descripcion')}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
                {errors.descripcion && (
                  <p className="mt-1 text-xs text-red-600">{errors.descripcion.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="cantidad">
                    Cantidad
                  </label>
                  <input
                    id="cantidad"
                    type="number"
                    min={0}
                    step="1"
                    {...register('cantidad')}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  {errors.cantidad && (
                    <p className="mt-1 text-xs text-red-600">{errors.cantidad.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="precio">
                    Precio
                  </label>
                  <input
                    id="precio"
                    type="number"
                    min={0}
                    step="0.01"
                    {...register('precio')}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  {errors.precio && <p className="mt-1 text-xs text-red-600">{errors.precio.message}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {isSubmitting ? 'Guardando...' : modalMode === 'create' ? 'Crear' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
