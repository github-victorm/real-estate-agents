import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Contract {
  id: string
  title: string
  description: string
  value: string
  duration: string
  status: string
  createdAt: string
}

interface ContractPreviewProps {
  contract: Contract
}

export function ContractPreview({ contract }: ContractPreviewProps) {
  const getStatusColor = (status: string) => {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{contract.title}</CardTitle>
          <span className={`font-medium ${getStatusColor(contract.status)}`}>
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Created on {new Date(contract.createdAt).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-1">Description</h4>
          <p className="text-gray-600">{contract.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-1">Contract Value</h4>
            <p className="text-gray-600">{contract.value}</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Duration</h4>
            <p className="text-gray-600">{contract.duration}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
