import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState, type ChangeEvent, type ClipboardEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import {
  StandardTable,
  StandardTableBody,
  StandardTableCell,
  StandardTableHead,
  StandardTableHeaderCell,
} from '../components/ui/StandardTable'
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
  const [apiError, setApiError] = useState<string | null>(null)
  const [pasteValidationError, setPasteValidationError] = useState({
    nombre: false,
    descripcion: false,
  })

  const canCreateProducts = user?.role === 'SuperAdmin'
  const canEditProducts = user?.role === 'SuperAdmin' || user?.role === 'Registrador'
  const canDeleteProducts = user?.role === 'SuperAdmin' || user?.role === 'Registrador'
  const isAuditorView = user?.role === 'Auditor'
  const isRestrictedEditForRegistrador = modalMode === 'edit' && user?.role === 'Registrador'

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  const sanitizeAlphanumeric = (value: string) => value.replace(/[^\p{L}\p{N}]/gu, '')

  const nombreRegister = register('nombre', {
    setValueAs: (value) => sanitizeAlphanumeric(String(value ?? '')),
  })

  const descripcionRegister = register('descripcion', {
    setValueAs: (value) => sanitizeAlphanumeric(String(value ?? '')),
  })

  const handleAlphanumericPaste = (
    event: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: 'nombre' | 'descripcion',
  ) => {
    const pastedText = event.clipboardData.getData('text')
    if (pastedText !== sanitizeAlphanumeric(pastedText)) {
      setPasteValidationError((previous) => ({ ...previous, [field]: true }))
      return
    }
    setPasteValidationError((previous) => ({ ...previous, [field]: false }))
  }

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
    setPasteValidationError({ nombre: false, descripcion: false })
    setApiError(null)
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
    setPasteValidationError({ nombre: false, descripcion: false })
    setApiError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
    setPasteValidationError({ nombre: false, descripcion: false })
    setApiError(null)
    clearErrors('cantidad')
  }

  const handleDelete = async (product: Product) => {
    if (!canDeleteProducts) {
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
    setApiError(null)
    if (!canEditProducts) {
      showToast('No tienes permisos para gestionar productos.', 'error')
      return
    }

    try {
      if (modalMode === 'create') {
        if (!canCreateProducts) {
          showToast('No tienes permisos para crear productos.', 'error')
          return
        }
        await api.post('/products', values)
        showToast('Producto creado correctamente.', 'success')
      } else if (selectedProduct) {
        const payload = user?.role === 'Registrador' ? { cantidad: values.cantidad } : values
        await api.put(`/products/${selectedProduct.id}`, payload)
        showToast('Producto actualizado correctamente.', 'success')
      }
      closeModal()
      await fetchProducts()
    } catch (error) {
      const status = Number((error as { response?: { status?: number } })?.response?.status ?? 0)
      const responseErrorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? ''
      const message = responseErrorMessage || extractApiErrorMessage(error)
      if (status === 403) {
        setApiError(message)
        setError('cantidad', { type: 'server', message })
        return
      }
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
        {canCreateProducts && (
          <Button onClick={openCreateModal}>
            Crear producto
          </Button>
        )}
      </div>

      <StandardTable caption="Inventario de productos">
        <StandardTableHead>
          <tr>
            <StandardTableHeaderCell>Codigo</StandardTableHeaderCell>
            <StandardTableHeaderCell>Nombre</StandardTableHeaderCell>
            <StandardTableHeaderCell>Cantidad</StandardTableHeaderCell>
            <StandardTableHeaderCell>Precio</StandardTableHeaderCell>
            {!isAuditorView && <StandardTableHeaderCell>Acciones</StandardTableHeaderCell>}
          </tr>
        </StandardTableHead>
        <StandardTableBody>
            {isLoading && (
              <tr>
                <StandardTableCell muted colSpan={!isAuditorView ? 5 : 4}>
                  Cargando productos...
                </StandardTableCell>
              </tr>
            )}
            {!isLoading && products.length === 0 && (
              <tr>
                <StandardTableCell muted colSpan={!isAuditorView ? 5 : 4}>
                  No hay productos registrados.
                </StandardTableCell>
              </tr>
            )}
            {!isLoading &&
              products.map((product) => (
                <tr key={product.id} className="transition-all hover:bg-slate-50">
                  <StandardTableCell>{product.sku_alfanumerico}</StandardTableCell>
                  <StandardTableCell>{product.nombre}</StandardTableCell>
                  <StandardTableCell>{product.cantidad}</StandardTableCell>
                  <StandardTableCell>${Number(product.precio).toFixed(2)}</StandardTableCell>
                  {!isAuditorView && (
                    <StandardTableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEditModal(product)}
                          disabled={!canEditProducts}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void handleDelete(product)}
                          disabled={!canDeleteProducts}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </StandardTableCell>
                  )}
                </tr>
              ))}
        </StandardTableBody>
      </StandardTable>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">
              {modalMode === 'create' ? 'Crear producto' : 'Editar producto'}
            </h3>
            <form
              className="mt-4 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
              onChangeCapture={() => {
                if (apiError) {
                  setApiError(null)
                }
              }}
              noValidate
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="sku">
                  Codigo
                </label>
                <input
                  id="sku"
                  {...register('sku_alfanumerico')}
                  disabled={isRestrictedEditForRegistrador}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  {...nombreRegister}
                  disabled={isRestrictedEditForRegistrador}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    nombreRegister.onChange(event)
                    setPasteValidationError((previous) => ({ ...previous, nombre: false }))
                  }}
                  onPaste={(event) => handleAlphanumericPaste(event, 'nombre')}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {pasteValidationError.nombre && (
                  <p className="mt-1 text-xs text-red-600">Solo se permiten letras y números</p>
                )}
                {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="descripcion">
                  Descripcion
                </label>
                <textarea
                  id="descripcion"
                  {...descripcionRegister}
                  disabled={isRestrictedEditForRegistrador}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                    descripcionRegister.onChange(event)
                    setPasteValidationError((previous) => ({ ...previous, descripcion: false }))
                  }}
                  onPaste={(event) => handleAlphanumericPaste(event, 'descripcion')}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {pasteValidationError.descripcion && (
                  <p className="mt-1 text-xs text-red-600">Solo se permiten letras y números</p>
                )}
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
                    max={isRestrictedEditForRegistrador ? selectedProduct?.cantidad : undefined}
                    {...register('cantidad', {
                      onChange: () => {
                        if (apiError) {
                          setApiError(null)
                          clearErrors('cantidad')
                        }
                      },
                    })}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {isRestrictedEditForRegistrador && selectedProduct && (
                    <p className="mt-1 text-xs text-amber-700">
                      Como Registrador no puedes subir la cantidad. Maximo permitido: {selectedProduct.cantidad}.
                    </p>
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
                    disabled={isRestrictedEditForRegistrador}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.precio && <p className="mt-1 text-xs text-red-600">{errors.precio.message}</p>}
                </div>
              </div>

              {apiError && (
                <Alert variant="destructive">
                  {apiError}
                </Alert>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : modalMode === 'create' ? 'Crear' : 'Actualizar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
