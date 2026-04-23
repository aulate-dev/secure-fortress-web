export interface ApiErrorBody {
  error?: string
  message?: string
}

export const extractApiErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response
  ) {
    const body = error.response.data as ApiErrorBody
    return body.error ?? body.message ?? 'No se pudo completar la solicitud.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'No se pudo completar la solicitud.'
}
