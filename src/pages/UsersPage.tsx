import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState, type ChangeEvent, type ClipboardEvent } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../components/ui/Button'
import {
  StandardTable,
  StandardTableBody,
  StandardTableCell,
  StandardTableHead,
  StandardTableHeaderCell,
} from '../components/ui/StandardTable'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'
import { extractApiErrorMessage } from '../lib/http-error'
import {
  type CreateUserFormData,
  type CreateUserFormInput,
  createUserFormSchema,
  type EditUserFormData,
  type EditUserFormInput,
  editUserFormSchema,
} from '../schemas/user-management.schema'
import type { ManagedUser } from '../types/admin'
import type { UserRole } from '../types/auth'

const ROLE_PERMISSIONS: Record<UserRole, string> = {
  SuperAdmin: 'Usuarios (CRUD), auditoria completa, productos (total), RBAC',
  Auditor: 'Consulta de productos, lectura de auditoria',
  Registrador: 'Alta y edicion de productos, inventario operativo',
}

const formatLastLogin = (value: string | null): string => {
  if (!value) {
    return 'Sin registro'
  }
  return new Date(value).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const sanitizeUsername = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '')

const sanitizeEmailInput = (value: string) =>
  value
    .replace(/[<>]/g, '')
    .replace(/[^\p{L}\p{N}@._+-]/gu, '')

type ModalMode = 'create' | 'edit'

export const UsersPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalMode, setModalMode] = useState<ModalMode | null>(null)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [usernamePasteError, setUsernamePasteError] = useState(false)

  const canMutateUsers = user?.role === 'SuperAdmin'

  const createForm = useForm<CreateUserFormInput, unknown, CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      role: 'Registrador',
      password: '',
    },
  })

  const editForm = useForm<EditUserFormInput, unknown, EditUserFormData>({
    resolver: zodResolver(editUserFormSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      role: 'Registrador',
      password: '',
    },
  })

  const createUsernameRegister = createForm.register('username', {
    setValueAs: (value) => sanitizeUsername(String(value ?? '')),
  })

  const editUsernameRegister = editForm.register('username', {
    setValueAs: (value) => sanitizeUsername(String(value ?? '')),
  })

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get<{ users: ManagedUser[] }>('/users')
      setUsers(data.users)
    } catch (error) {
      showToast(extractApiErrorMessage(error), 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de usuarios
    void fetchUsers()
  }, [fetchUsers])

  const closeModal = () => {
    setModalMode(null)
    setEditingUser(null)
    setUsernamePasteError(false)
    createForm.reset()
    editForm.reset()
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setUsernamePasteError(false)
    createForm.reset({
      username: '',
      email: '',
      role: 'Registrador',
      password: '',
    })
    setModalMode('create')
  }

  const openEditModal = (managedUser: ManagedUser) => {
    setEditingUser(managedUser)
    setUsernamePasteError(false)
    editForm.reset({
      username: managedUser.username,
      email: managedUser.email,
      role: managedUser.role,
      password: '',
    })
    setModalMode('edit')
  }

  const handleUsernamePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text')
    if (pasted !== sanitizeUsername(pasted)) {
      setUsernamePasteError(true)
    }
  }

  const onCreateSubmit = async (values: CreateUserFormData) => {
    try {
      await api.post('/users', {
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
      })
      showToast('Usuario creado correctamente.', 'success')
      closeModal()
      await fetchUsers()
    } catch (error) {
      showToast(extractApiErrorMessage(error), 'error')
    }
  }

  const onEditSubmit = async (values: EditUserFormData) => {
    if (!editingUser) {
      return
    }
    try {
      const body: Record<string, string | UserRole> = {
        username: values.username,
        email: values.email,
        role: values.role,
      }
      if (values.password.length > 0) {
        body.password = values.password
      }
      await api.put(`/users/${editingUser.id}`, body)
      showToast('Usuario actualizado correctamente.', 'success')
      closeModal()
      await fetchUsers()
    } catch (error) {
      showToast(extractApiErrorMessage(error), 'error')
    }
  }

  const handleDelete = async (managedUser: ManagedUser) => {
    if (!canMutateUsers) {
      return
    }
    if (!window.confirm(`Eliminar al usuario ${managedUser.username}? Esta accion no se puede deshacer.`)) {
      return
    }
    try {
      await api.delete(`/users/${managedUser.id}`)
      showToast('Usuario eliminado.', 'success')
      await fetchUsers()
    } catch (error) {
      showToast(extractApiErrorMessage(error), 'error')
    }
  }

  const columnCount = canMutateUsers ? 6 : 5

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Gestion de usuarios</h2>
          <p className="text-sm text-slate-600">
            Inventario de cuentas con rol, permisos efectivos y ultimo acceso (RF-04 / RF-05).
          </p>
        </div>
        {canMutateUsers && (
          <Button type="button" onClick={openCreateModal}>
            Crear usuario
          </Button>
        )}
      </div>

      <StandardTable caption="Usuarios del sistema">
        <StandardTableHead>
          <tr>
            <StandardTableHeaderCell>Username</StandardTableHeaderCell>
            <StandardTableHeaderCell>Email</StandardTableHeaderCell>
            <StandardTableHeaderCell>Rol</StandardTableHeaderCell>
            <StandardTableHeaderCell>Permisos</StandardTableHeaderCell>
            <StandardTableHeaderCell>Último login</StandardTableHeaderCell>
            {canMutateUsers && <StandardTableHeaderCell>Acciones</StandardTableHeaderCell>}
          </tr>
        </StandardTableHead>
        <StandardTableBody>
          {isLoading && (
            <tr>
              <StandardTableCell muted colSpan={columnCount}>
                Cargando usuarios...
              </StandardTableCell>
            </tr>
          )}
          {!isLoading && users.length === 0 && (
            <tr>
              <StandardTableCell muted colSpan={columnCount}>
                No hay usuarios disponibles.
              </StandardTableCell>
            </tr>
          )}
          {!isLoading &&
            users.map((managedUser) => (
              <tr key={managedUser.id} className="transition-colors hover:bg-slate-50">
                <StandardTableCell className="font-medium text-slate-900">{managedUser.username}</StandardTableCell>
                <StandardTableCell>{managedUser.email}</StandardTableCell>
                <StandardTableCell>{managedUser.role}</StandardTableCell>
                <StandardTableCell className="max-w-xs text-sm text-slate-600">
                  {ROLE_PERMISSIONS[managedUser.role]}
                </StandardTableCell>
                <StandardTableCell>{formatLastLogin(managedUser.last_login)}</StandardTableCell>
                {canMutateUsers && (
                  <StandardTableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" type="button" onClick={() => openEditModal(managedUser)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        onClick={() => void handleDelete(managedUser)}
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

      {modalMode === 'create' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Crear usuario</h3>
            <p className="mt-1 text-sm text-slate-600">Validacion RF-03: correo, rol permitido y contrasena minima.</p>
            <form
              className="mt-4 space-y-4"
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              noValidate
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="create-username">
                  Username
                </label>
                <input
                  id="create-username"
                  autoComplete="off"
                  {...createUsernameRegister}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    createUsernameRegister.onChange(event)
                    setUsernamePasteError(false)
                  }}
                  onPaste={handleUsernamePaste}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {usernamePasteError && (
                  <p className="mt-1 text-xs text-red-600">Solo se permiten letras y números</p>
                )}
                {createForm.formState.errors.username && (
                  <p className="mt-1 text-xs text-red-600">{createForm.formState.errors.username.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="create-email">
                  Email
                </label>
                <input
                  id="create-email"
                  type="email"
                  autoComplete="email"
                  {...createForm.register('email', {
                    setValueAs: (value) => sanitizeEmailInput(String(value ?? '')),
                  })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {createForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">{createForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="create-role">
                  Rol
                </label>
                <select
                  id="create-role"
                  {...createForm.register('role')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="SuperAdmin">SuperAdmin</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Registrador">Registrador</option>
                </select>
                {createForm.formState.errors.role && (
                  <p className="mt-1 text-xs text-red-600">{createForm.formState.errors.role.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="create-password">
                  Contrasena
                </label>
                <input
                  id="create-password"
                  type="password"
                  autoComplete="new-password"
                  {...createForm.register('password')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {createForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">{createForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createForm.formState.isSubmitting}>
                  {createForm.formState.isSubmitting ? 'Guardando...' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMode === 'edit' && editingUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Editar usuario</h3>
            <p className="mt-1 text-sm text-slate-600">
              Deje la contrasena vacia para mantener la actual. Minimo 12 caracteres si la cambia.
            </p>
            <form className="mt-4 space-y-4" onSubmit={editForm.handleSubmit(onEditSubmit)} noValidate>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="edit-username">
                  Username
                </label>
                <input
                  id="edit-username"
                  autoComplete="off"
                  {...editUsernameRegister}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    editUsernameRegister.onChange(event)
                    setUsernamePasteError(false)
                  }}
                  onPaste={handleUsernamePaste}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {usernamePasteError && (
                  <p className="mt-1 text-xs text-red-600">Solo se permiten letras y números</p>
                )}
                {editForm.formState.errors.username && (
                  <p className="mt-1 text-xs text-red-600">{editForm.formState.errors.username.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="edit-email">
                  Email
                </label>
                <input
                  id="edit-email"
                  type="email"
                  autoComplete="email"
                  {...editForm.register('email', {
                    setValueAs: (value) => sanitizeEmailInput(String(value ?? '')),
                  })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {editForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">{editForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="edit-role">
                  Rol
                </label>
                <select
                  id="edit-role"
                  {...editForm.register('role')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="SuperAdmin">SuperAdmin</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Registrador">Registrador</option>
                </select>
                {editForm.formState.errors.role && (
                  <p className="mt-1 text-xs text-red-600">{editForm.formState.errors.role.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="edit-password">
                  Nueva contrasena (opcional)
                </label>
                <input
                  id="edit-password"
                  type="password"
                  autoComplete="new-password"
                  {...editForm.register('password')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {editForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">{editForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
