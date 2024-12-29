interface Contract {
  id: string
  title: string
  description: string
  value: string
  duration: string
  status: string
  createdAt: string
}

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-green-600'
    case 'pending':
      return 'text-yellow-600' 
    case 'completed':
      return 'text-blue-600'
    case 'cancelled':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
